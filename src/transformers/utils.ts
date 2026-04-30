import ts from 'typescript'

export function createElementAccessor(name: ts.PropertyName): ts.Expression {
  if (ts.isMemberName(name)) {
    const literal = ts.factory.createStringLiteralFromNode(name)
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
    ;(literal as any).pos = name.pos
    ;(literal as any).end = name.end
    /* eslint-enable */
    return literal
  }

  if (ts.isExpression(name)) {
    return name
  }

  name satisfies ts.ComputedPropertyName
  return name.expression
}

export function createObjectDefinePropertyExpression(): ts.PropertyAccessExpression {
  return ts.factory.createPropertyAccessExpression(
    ts.factory.createIdentifier('Object'),
    ts.factory.createIdentifier('defineProperty')
  )
}

export function createAccessExpression(
  target: ts.Expression,
  name: ts.PropertyName
): ts.ElementAccessExpression {
  const accessor = createElementAccessor(name)
  return ts.factory.createElementAccessExpression(target, accessor)
}

export function createAssignment(
  lhs: ts.Expression,
  rhs: ts.Expression
): ts.BinaryExpression {
  const token = ts.factory.createToken(ts.SyntaxKind.FirstAssignment)
  return ts.factory.createBinaryExpression(lhs, token, rhs)
}
