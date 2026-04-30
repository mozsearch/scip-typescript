import ts from 'typescript'

import { isEntityNameExpression } from '../utils'

import {
  createElementAccessor,
  createObjectDefinePropertyExpression,
} from './utils'

type ObjectDefinePropertiesCall = ts.CallExpression & {
  arguments: [ts.EntityNameExpression, ts.ObjectLiteralExpression]
}

export function isObjectDefinePropertiesCall(
  node: ts.Node
): node is ObjectDefinePropertiesCall {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    ts.idText(node.expression.expression) === 'Object' &&
    ts.idText(node.expression.name) === 'defineProperties' &&
    node.arguments.length === 2 &&
    isEntityNameExpression(node.arguments[0]) &&
    ts.isObjectLiteralExpression(node.arguments[1])
  )
}

/// Turns an Object.defineProperties call into multiple Object.defineProperty calls
export const definePropertiesTransformer: ts.TransformerFactory<
  ts.SourceFile
> = context => sourceFile => {
  // We want the original function call expressions to be indexed as well, we will juste write them to the file in toplevel ExpressionStatements.
  const miscExpressionsToIndex: ts.Expression[] = []

  const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
    if (
      ts.isExpressionStatement(node) &&
      isObjectDefinePropertiesCall(node.expression)
    ) {
      const definePropertiesCall = node.expression
      const [target, { properties }] = definePropertiesCall.arguments

      const expressions: ts.Expression[] = []
      for (const property of properties) {
        if (
          ts.isSpreadAssignment(property) ||
          ts.isAccessor(property) ||
          ts.isMethodDeclaration(property)
        ) {
          console.warn(
            "Object.defineProperties transform doesn't support spread, accessors not methods."
          )
          return node
        }

        if (ts.isPropertyAssignment(property)) {
          expressions.push(transformPropertyAssignement(target, property))
        } else if (ts.isShorthandPropertyAssignment(property)) {
          expressions.push(
            transformShorthandPropertyAssigment(target, property)
          )
        } else {
          property satisfies never
        }
      }

      miscExpressionsToIndex.push(definePropertiesCall.expression)

      return expressions.map(expression =>
        ts.factory.createExpressionStatement(expression)
      )
    }

    return ts.visitEachChild(node, visitor, context)
  }

  const transformed = ts.visitNode(sourceFile, visitor, ts.isSourceFile)
  if (transformed === sourceFile) {
    return sourceFile
  }

  const extraStatements = miscExpressionsToIndex.map(expr =>
    ts.factory.createExpressionStatement(expr)
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

function transformPropertyAssignement(
  target: ts.EntityNameExpression,
  property: ts.PropertyAssignment
): ts.CallExpression {
  const objectDefineProperty = createObjectDefinePropertyExpression()
  const propertyName = createElementAccessor(property.name)
  return ts.factory.createCallExpression(objectDefineProperty, undefined, [
    target,
    propertyName,
    property.initializer,
  ])
}

function transformShorthandPropertyAssigment(
  target: ts.EntityNameExpression,
  shorthand: ts.ShorthandPropertyAssignment
): ts.CallExpression {
  const objectDefineProperty = createObjectDefinePropertyExpression()
  const propertyName = createElementAccessor(shorthand.name)
  return ts.factory.createCallExpression(objectDefineProperty, undefined, [
    target,
    propertyName,
    shorthand.name,
  ])
}
