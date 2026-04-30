import assert from 'assert'

import ts from 'typescript'

import { isEntityNameExpression } from '../utils'

import {
  createAccessExpression,
  createAssignment,
  createElementAccessor,
  createObjectDefinePropertyExpression,
} from './utils'

// Like BindableObjectDefinePropertyCall in typescript
type ObjectAssignArguments = [
  ts.EntityNameExpression,
  ...ts.ObjectLiteralExpression[],
]
type ObjectAssignCall = ts.CallExpression & { arguments: ObjectAssignArguments }

function isObjectAssignCall(node: ts.Node): node is ObjectAssignCall {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    ts.idText(node.expression.expression) === 'Object' &&
    ts.idText(node.expression.name) === 'assign' &&
    node.arguments.length >= 2 &&
    isEntityNameExpression(node.arguments[0]) &&
    node.arguments.slice(1).every(ts.isObjectLiteralExpression)
  )
}

/// Turns an Object.assign call into assigments (or Object.defineProperty calls for get/set accessors).
/// Spread assignments are not supported.
/// See the transform* helpers for details.
export const objectAssignTransformer: ts.TransformerFactory<ts.SourceFile> =
  context => sourceFile => {
    // We want the original function call expressions to be indexed as well, we will juste write them to the file in toplevel ExpressionStatements.
    const miscExpressionsToIndex: ts.Expression[] = []

    const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (
        ts.isExpressionStatement(node) &&
        isObjectAssignCall(node.expression)
      ) {
        const objectAssignCall = node.expression

        // While node.arguments provably satisfies ObjectAssignArguments, it needs to be casted to just that for TS to understand the type of sources
        objectAssignCall.arguments satisfies ObjectAssignArguments
        const [target, ...sources] =
          objectAssignCall.arguments as ObjectAssignArguments

        const propertiesWithAccessors: Map<
          string,
          {
            getter?: ts.GetAccessorDeclaration
            setter?: ts.SetAccessorDeclaration
          }
        > = new Map()
        const expressions: ts.Expression[] = []
        for (const source of sources) {
          const properties = source.properties

          for (const property of properties) {
            if (ts.isSpreadAssignment(property)) {
              console.warn(
                "Object.assign transform doesn't support spread assigments."
              )
              return node
            }

            if (ts.isPropertyAssignment(property)) {
              expressions.push(transformPropertyAssignement(target, property))
            } else if (ts.isShorthandPropertyAssignment(property)) {
              expressions.push(
                transformShorthandPropertyAssigment(target, property)
              )
            } else if (ts.isMethodDeclaration(property)) {
              expressions.push(transformMethodDeclaration(target, property))
            } else if (ts.isAccessor(property)) {
              let name: string
              if (ts.isMemberName(property.name)) {
                name = property.name.text
              } else if (ts.isExpression(property.name)) {
                name = property.name.text
              } else if (ts.isComputedPropertyName(property.name)) {
                console.warn(
                  "Object.assign transform doesn't support accessor with computed name."
                )
                return node
              } else {
                property.name satisfies never
                throw new Error('unreachable')
              }

              const accessors = propertiesWithAccessors.get(name) || {}
              if (ts.isGetAccessor(property)) {
                accessors.getter = property
              }
              if (ts.isSetAccessor(property)) {
                accessors.setter = property
              }
              propertiesWithAccessors.set(name, accessors)
            } else {
              property satisfies never
            }
          }
        }

        for (const { getter, setter } of propertiesWithAccessors.values()) {
          expressions.push(transformAccessor(target, getter, setter))

          // When we have both a getter and a setter, emit an expression using the setter's name to get it indexed.
          if (getter && setter) {
            const accessExpression = createAccessExpression(target, setter.name)
            const name =
              accessExpression.argumentExpression as ts.Expression & {
                forceDefinition?: boolean
              }
            name.forceDefinition = true
            miscExpressionsToIndex.push(accessExpression)
          }
        }

        miscExpressionsToIndex.push(objectAssignCall.expression)

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

/// Turns the property assigment to target from memberName: value, "expression": value or [computed]: value into target["memberName"] = value, target["expression"] = value or target[computed] = value
function transformPropertyAssignement(
  target: ts.EntityNameExpression,
  property: ts.PropertyAssignment
): ts.BinaryExpression {
  const accessExpression = createAccessExpression(target, property.name)
  return createAssignment(accessExpression, property.initializer)
}

/// Turns the shorthand property assigment in Object.assign(target, { shorthand }) into target.shorthand = shorthand
function transformShorthandPropertyAssigment(
  target: ts.EntityNameExpression,
  shorthand: ts.ShorthandPropertyAssignment
): ts.BinaryExpression {
  const accessExpression = createAccessExpression(target, shorthand.name)
  return createAssignment(accessExpression, shorthand.name)
}

/// Turns the method declaration in Object.assign(target, { method() {} }) into target.method = function() {}
function transformMethodDeclaration(
  target: ts.EntityNameExpression,
  method: ts.MethodDeclaration
): ts.BinaryExpression {
  const accessExpression = createAccessExpression(target, method.name)
  const modifiers = method.modifiers?.filter(ts.isModifier)
  const body = method.body || ts.factory.createBlock([])
  const functionExpression = ts.factory.createFunctionExpression(
    modifiers,
    method.asteriskToken,
    undefined,
    method.typeParameters,
    method.parameters,
    method.type,
    body
  )
  return createAssignment(accessExpression, functionExpression)
}

/// Turns the accessor declaration in Object.assign(target, { get prop() {}, set prop(val) {} }) into Object.defineProperty(target, "prop", {get() {}, set(val) {}})
function transformAccessor(
  target: ts.EntityNameExpression,
  getter?: ts.GetAccessorDeclaration,
  setter?: ts.SetAccessorDeclaration
): ts.CallExpression {
  const name = getter?.name || setter?.name
  assert.ok(name)

  const objectDefineProperty = createObjectDefinePropertyExpression()
  const propertyName = createElementAccessor(name)

  function accessorToMethod(
    accessor: ts.AccessorDeclaration,
    name: string
  ): ts.MethodDeclaration {
    return ts.factory.createMethodDeclaration(
      accessor.modifiers,
      accessor.asteriskToken,
      name,
      accessor.questionToken,
      accessor.typeParameters,
      accessor.parameters,
      accessor.type,
      accessor.body
    )
  }

  const methods = []
  if (getter) {
    methods.push(accessorToMethod(getter, 'get'))
  }
  if (setter) {
    methods.push(accessorToMethod(setter, 'set'))
  }

  const objectLiteral = ts.factory.createObjectLiteralExpression(methods)
  return ts.factory.createCallExpression(objectDefineProperty, undefined, [
    target,
    propertyName,
    objectLiteral,
  ])
}
