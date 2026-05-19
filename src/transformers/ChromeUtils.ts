// Transforms:
//
// ChromeUtils.defineLazyGetter(obj, "prop", getter)
// into
// Object.defineProperty(obj, "prop", { get: getter })
//
// ChromeUtils.defineESModuleGetters(obj, { imported: path })
// into
// obj["imported"] = require(path)["imported"]
//
// ChromeUtils.importESModule(path)
// into
// require(path)

import ts from 'typescript'

import { isEntityNameExpression } from '../utils'

import {
  createAccessExpression,
  createAssignment,
  createObjectDefinePropertyExpression,
} from './utils'

type DefineESModuleGettersArguments = [
  ts.EntityNameExpression,
  ts.ObjectLiteralExpression,
]
type DefineESModuleGettersCall = ts.CallExpression & {
  arguments: DefineESModuleGettersArguments
}

function isDefineESModuleGettersCall(
  node: ts.Node
): node is DefineESModuleGettersCall {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    ts.idText(node.expression.expression) === 'ChromeUtils' &&
    ts.idText(node.expression.name) === 'defineESModuleGetters' &&
    node.arguments.length >= 2 &&
    node.arguments.length <= 3 &&
    isEntityNameExpression(node.arguments[0]) &&
    ts.isObjectLiteralExpression(node.arguments[1])
  )
}

function isImportESModuleCall(node: ts.Node): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    ts.idText(node.expression.expression) === 'ChromeUtils' &&
    ts.idText(node.expression.name) === 'importESModule'
  )
}

type DefineLazyGetterArguments = [
  ts.EntityNameExpression,
  ts.StringLiteralLike,
  ts.Expression,
]
type DefineLazyGetterCall = ts.CallExpression & {
  arguments: DefineLazyGetterArguments
}

function isDefineLazyGetterCall(node: ts.Node): node is DefineLazyGetterCall {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    ts.idText(node.expression.expression) === 'ChromeUtils' &&
    ts.idText(node.expression.name) === 'defineLazyGetter' &&
    node.arguments.length === 3 &&
    isEntityNameExpression(node.arguments[0]) &&
    ts.isStringLiteralLike(node.arguments[1])
  )
}

export const chromeUtilsTransformer: ts.TransformerFactory<ts.SourceFile> =
  context => sourceFile => {
    // forEachDynamicImportOrRequireCall which is used by the Typescript compiler to collect the external modules the current file depends on doesn't traverse the AST but runs a RegExp over the source text, thus it doesn't pick up the synthetized require calls added here. We will append explicit toplevel imports for those.
    const importPaths: ts.Expression[] = []

    // We want the original function call expressions to be indexed as well, we will juste write them to the file in toplevel ExpressionStatements.
    const miscExpressionsToIndex: ts.Expression[] = []

    const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (
        ts.isExpressionStatement(node) &&
        isDefineESModuleGettersCall(node.expression)
      ) {
        const objectAssignCall = node.expression

        const [target, { properties }] = objectAssignCall.arguments

        const assignments: ts.BinaryExpression[] = []
        for (const property of properties) {
          if (!ts.isPropertyAssignment(property)) {
            console.warn(
              'Skipping non-PropertyAssignment member in defineESModuleGetters call.'
            )
            continue
          }

          const [expression, path] = transformESModuleGetter(target, property)
          assignments.push(expression)
          importPaths.push(path)
        }

        miscExpressionsToIndex.push(node.expression.expression)

        return assignments.map(expression =>
          ts.factory.createExpressionStatement(expression)
        )
      }

      if (isImportESModuleCall(node)) {
        miscExpressionsToIndex.push(node.expression)

        const [path] = node.arguments
        importPaths.push(path)

        const requireIdentifier = ts.factory.createIdentifier('require')
        return ts.factory.updateCallExpression(
          node,
          requireIdentifier,
          node.typeArguments,
          [path]
        )
      }

      if (isDefineLazyGetterCall(node)) {
        miscExpressionsToIndex.push(node.expression)

        const objectDefineProperty = createObjectDefinePropertyExpression()
        const getProperty = ts.factory.createPropertyAssignment(
          'get',
          node.arguments[2]
        )
        const propertyDefinition = ts.factory.createObjectLiteralExpression([
          getProperty,
        ])
        return ts.factory.createCallExpression(
          objectDefineProperty,
          undefined,
          [node.arguments[0], node.arguments[1], propertyDefinition]
        )
      }

      return ts.visitEachChild(node, visitor, context)
    }

    const transformed = ts.visitNode(sourceFile, visitor, ts.isSourceFile)
    if (transformed === sourceFile) {
      return sourceFile
    }

    let fakeImportIndex = 0
    const fakeImports = importPaths.map(path =>
      ts.factory.createImportEqualsDeclaration(
        undefined,
        false,
        `_fakeImport${fakeImportIndex++}`,
        ts.factory.createExternalModuleReference(path)
      )
    )

    const extraStatements = new Array<ts.Statement>().concat(
      fakeImports,
      miscExpressionsToIndex.map(expr =>
        ts.factory.createExpressionStatement(expr)
      )
    )

    return ts.factory.updateSourceFile(
      transformed,
      transformed.statements.concat(extraStatements),
      transformed.isDeclarationFile,
      transformed.referencedFiles,
      transformed.typeReferenceDirectives,
      transformed.hasNoDefaultLib,
      transformed.libReferenceDirectives
    )
  }

function transformESModuleGetter(
  target: ts.EntityNameExpression,
  property: ts.PropertyAssignment
): [ts.BinaryExpression, ts.Expression] {
  const accessExpression = createAccessExpression(target, property.name)
  const requireIdentifier = ts.factory.createIdentifier('require')
  const importCall = ts.factory.createCallExpression(
    requireIdentifier,
    undefined,
    [property.initializer]
  )
  const namedExportAccess = createAccessExpression(importCall, property.name)
  const assignment = createAssignment(accessExpression, namedExportAccess)
  return [assignment, property.initializer]
}
