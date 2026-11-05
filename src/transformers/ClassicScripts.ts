// Transforms of classic scripts (with --classic-scripts), whose top-level
// declarations are their global's, as TypeScript sees them, so that the
// globals they define the ways TypeScript doesn't see are its declarations,
// at their top level:
//
// globalThis.name = value (or `this`, `self`, `window`, or an alias of the
// global: `var global = this`)
// into
// var name = value
//
// and not declaring what's the global's own already:
//
// var name = global.name (ex: `var Error = global.Error`)
// into
// global.name
//
// and `var undefined` (ex: `const undefined = void 0`, into `void 0`),
// leaving `global.name = name` as it is (whose property is the global's).

import ts from 'typescript'

const GLOBAL_NAMES = new Set(['globalThis', 'self', 'window'])

/**
 * Whether an expression is the global (`this` at a script's top level too),
 * or one of its aliases.
 */
function isGlobal(expression: ts.Expression, aliases: Set<string>): boolean {
  if (expression.kind === ts.SyntaxKind.ThisKeyword) {
    return true
  }
  if (!ts.isIdentifier(expression)) {
    return false
  }
  const name = ts.idText(expression)
  return GLOBAL_NAMES.has(name) || aliases.has(name)
}

/** `global.name`'s name, if it's a property of the global. */
function globalProperty(
  expression: ts.Expression,
  aliases: Set<string>
): ts.Identifier | undefined {
  return ts.isPropertyAccessExpression(expression) &&
    isGlobal(expression.expression, aliases) &&
    ts.isIdentifier(expression.name)
    ? expression.name
    : undefined
}

export const classicScriptGlobalsTransformer: ts.TransformerFactory<
  ts.SourceFile
> = () => sourceFile => {
  if (ts.isExternalModule(sourceFile)) {
    return sourceFile
  }
  const aliases = new Set<string>()
  let changed = false
  const statements = sourceFile.statements.flatMap(
    (statement): ts.Statement[] => {
      if (ts.isVariableStatement(statement)) {
        // (The global's own, ex: `var Error = global.Error`, as expressions,
        // whose uses are the global's, and `undefined`.)
        const own: ts.Statement[] = []
        const declarations = statement.declarationList.declarations.filter(
          declaration => {
            if (
              ts.isIdentifier(declaration.name) &&
              ts.idText(declaration.name) === 'undefined'
            ) {
              if (declaration.initializer) {
                own.push(
                  ts.factory.createExpressionStatement(declaration.initializer)
                )
              }
              return false
            }
            if (
              !ts.isIdentifier(declaration.name) ||
              !declaration.initializer
            ) {
              return true
            }
            const name = ts.idText(declaration.name)
            if (isGlobal(declaration.initializer, aliases)) {
              aliases.add(name)
              return true
            }
            const property = globalProperty(declaration.initializer, aliases)
            if (property && ts.idText(property) === name) {
              own.push(
                ts.factory.createExpressionStatement(declaration.initializer)
              )
              return false
            }
            return true
          }
        )
        if (
          declarations.length === statement.declarationList.declarations.length
        ) {
          return [statement]
        }
        changed = true
        return declarations.length === 0
          ? own
          : [
              ...own,
              ts.factory.updateVariableStatement(
                statement,
                statement.modifiers,
                ts.factory.updateVariableDeclarationList(
                  statement.declarationList,
                  declarations
                )
              ),
            ]
      }
      if (
        !ts.isExpressionStatement(statement) ||
        !ts.isBinaryExpression(statement.expression) ||
        statement.expression.operatorToken.kind !==
          ts.SyntaxKind.FirstAssignment
      ) {
        return [statement]
      }
      const { left, right } = statement.expression
      const name = globalProperty(left, aliases)
      if (
        !name ||
        (ts.isIdentifier(right) && ts.idText(right) === ts.idText(name))
      ) {
        return [statement]
      }
      changed = true
      return [
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                name,
                undefined,
                undefined,
                right
              ),
            ],
            ts.NodeFlags.None
          )
        ),
      ]
    }
  )
  return changed
    ? ts.factory.updateSourceFile(sourceFile, statements)
    : sourceFile
}
