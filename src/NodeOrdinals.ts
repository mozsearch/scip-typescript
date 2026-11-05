import * as ts from 'typescript'

/**
 * Nodes' ordinals in their own files, for the symbols named by them: a type
 * literal's among its file's type literals, and a property assignment's among
 * its file's property assignments of the same name.
 *
 * A symbol is computed once per project, for the first document that needs
 * it, which can be another file's (ex: a type literal of a `.d.ts` file which
 * a use's type refers to). Numbered by that document's counters, the symbol
 * depended on which documents had been indexed before it (and it took a
 * number from that document's locals, renumbering the rest of them), so that
 * the same node could have different symbols in different projects, or when
 * only some files are indexed (see `--only-files`).
 */
export class NodeOrdinals {
  private byFile: Map<ts.SourceFile, Map<ts.Node, number>> = new Map()

  /** The node's ordinal, or -1 if its file's walk didn't find it. */
  public of(node: ts.Node): number {
    const sourceFile = node.getSourceFile()
    let ordinals = this.byFile.get(sourceFile)
    if (ordinals === undefined) {
      ordinals = fileOrdinals(sourceFile)
      this.byFile.set(sourceFile, ordinals)
    }
    return ordinals.get(node) ?? -1
  }
}

/** The name of a property assignment, as the symbols name it. */
export function propertyName(
  node: ts.PropertyAssignment | ts.ShorthandPropertyAssignment
): string {
  try {
    return node.name.getText()
  } catch {
    // (A transformer's node can have no position.)
    return ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
      ? node.name.text
      : ''
  }
}

function fileOrdinals(sourceFile: ts.SourceFile): Map<ts.Node, number> {
  const ordinals = new Map<ts.Node, number>()
  let typeLiterals = 0
  const properties = new Map<string, number>()
  const visit = (node: ts.Node): void => {
    if (ordinals.has(node)) {
      // (A transformer's tree can have a node in more than one place.)
      return
    }
    if (ts.isTypeLiteralNode(node)) {
      ordinals.set(node, typeLiterals++)
    } else if (
      ts.isPropertyAssignment(node) ||
      ts.isShorthandPropertyAssignment(node)
    ) {
      const name = propertyName(node)
      const ordinal = properties.get(name) ?? 0
      ordinals.set(node, ordinal)
      properties.set(name, ordinal + 1)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return ordinals
}
