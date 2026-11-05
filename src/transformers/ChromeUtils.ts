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
//
// But a classic script calling `require()` is a CommonJS module to
// TypeScript, whose top-level declarations aren't globals, though they are,
// ex: a test's head file's helpers, which the test uses. So with
// --classic-scripts (`chromeUtilsTransformerFor(true)`), in a classic script,
// ChromeUtils.importESModule(path) stays (Gecko's types map its paths to
// their modules), and
//
// ChromeUtils.defineESModuleGetters(obj, { imported: path })
// into
// obj["imported"] = ChromeUtils.importESModule(path)["imported"]
//
// or, for the global (`this` or `globalThis`, at its top level), into a global
//
// var imported = ChromeUtils.importESModule(path)["imported"]

import ts from 'typescript'

import { isEntityNameExpression } from '../utils'

import {
  createAccessExpression,
  createAssignment,
  createObjectDefinePropertyExpression,
} from './utils'

type DefineESModuleGettersArguments = [
  ts.EntityNameExpression | ts.ThisExpression,
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
    (isEntityNameExpression(node.arguments[0]) ||
      node.arguments[0].kind === ts.SyntaxKind.ThisKeyword) &&
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

export const chromeUtilsTransformer = chromeUtilsTransformerFor(false)

/** The transformer, keeping classic scripts' globals or not (see the top). */
export function chromeUtilsTransformerFor(
  classicScripts: boolean
): ts.TransformerFactory<ts.SourceFile> {
  return context => sourceFile => {
    // (Whether it's transformed as a module: by its own syntax, with
    // --classic-scripts; see the top.)
    const isModule = !classicScripts || ts.isExternalModule(sourceFile)
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
        // (A classic script's getters on its global are globals.)
        const globalTarget =
          !isModule &&
          node.parent === sourceFile &&
          (target.kind === ts.SyntaxKind.ThisKeyword ||
            (ts.isIdentifier(target) && ts.idText(target) === 'globalThis'))

        const statements: ts.Statement[] = []
        for (const property of properties) {
          if (!ts.isPropertyAssignment(property)) {
            console.warn(
              'Skipping non-PropertyAssignment member in defineESModuleGetters call.'
            )
            continue
          }

          if (globalTarget && ts.isIdentifier(property.name)) {
            statements.push(globalESModuleGetter(property))
            continue
          }
          const [expression, path] = transformESModuleGetter(
            target,
            property,
            isModule
          )
          statements.push(ts.factory.createExpressionStatement(expression))
          if (isModule) {
            importPaths.push(path)
          }
        }

        miscExpressionsToIndex.push(node.expression.expression)

        return statements
      }

      if (isImportESModuleCall(node) && isModule) {
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
}

/** `ChromeUtils.importESModule(path)`, for a classic script; see the top. */
function createImportESModuleCall(path: ts.Expression): ts.CallExpression {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier('ChromeUtils'),
      ts.factory.createIdentifier('importESModule')
    ),
    undefined,
    [path]
  )
}

/**
 * A classic script's getter on its global, as a global: `var imported =
 * ChromeUtils.importESModule(path)["imported"]`, defined at the property's
 * name.
 */
function globalESModuleGetter(property: ts.PropertyAssignment): ts.Statement {
  const name = property.name as ts.Identifier
  const value = createAccessExpression(
    createImportESModuleCall(property.initializer),
    name
  )
  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(name, undefined, undefined, value)],
      ts.NodeFlags.None
    )
  )
}

function transformESModuleGetter(
  target: ts.EntityNameExpression | ts.ThisExpression,
  property: ts.PropertyAssignment,
  isModule: boolean
): [ts.BinaryExpression, ts.Expression] {
  const accessExpression = createAccessExpression(target, property.name)
  const importCall = isModule
    ? ts.factory.createCallExpression(
        ts.factory.createIdentifier('require'),
        undefined,
        [property.initializer]
      )
    : createImportESModuleCall(property.initializer)
  const namedExportAccess = createAccessExpression(importCall, property.name)
  const assignment = createAssignment(accessExpression, namedExportAccess)
  return [assignment, property.initializer]
}
