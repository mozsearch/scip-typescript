import ts from 'typescript'

function isEntityNameExpression(
  node: ts.Node
): node is ts.EntityNameExpression {
  return ts.isEntityName(node) && ts.isExpression(node)
}

// Like BindableObjectDefinePropertyCall in typescript
type ObjectDefinePropertyCall = ts.CallExpression & {
  arguments: [ts.EntityNameExpression, ts.Expression, ts.Expression]
}

export function isObjectDefinePropertyCall(
  node: ts.Node
): node is ObjectDefinePropertyCall {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    ts.idText(node.expression.expression) === 'Object' &&
    ts.idText(node.expression.name) === 'defineProperty' &&
    node.arguments.length === 3 &&
    isEntityNameExpression(node.arguments[0]) &&
    ts.isExpression(node.arguments[1]) &&
    ts.isExpression(node.arguments[2])
  )
}
