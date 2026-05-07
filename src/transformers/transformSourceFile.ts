import ts from 'typescript'

import { definePropertiesTransformer } from './DefineProperties'
import { objectAssignTransformer } from './ObjectAssign'

const TRANSFORMERS = [objectAssignTransformer, definePropertiesTransformer]

/// The transforms don't set Node.parent, don't propagate NodeFlags.JavaScriptFile and set NodeFlags.Synthesized which cause issues with some analyses.
///
/// FIXME: this is wrong in some cases because some nodes may be references multiple times in the tree,
/// for instance when transforming `Object.assign(obj, {prop0: 0, prop1: 1})` into
/// ```
/// obj["prop0"] = 0;
/// obj["prop1"] = 1;
/// ```
/// the same `obj` Node is use in both places.
/// I don't think this is currently an issue but if it becomes one those parts of the tree should be duplicated to be able to set parenting correctly.
function fixupNodeTree(node: ts.Node, parent?: ts.Node): void {
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
  ;(node as any).parent = parent
  if (parent && (parent.flags & ts.NodeFlags.JavaScriptFile) !== 0) {
    ;(node as any).flags |= ts.NodeFlags.JavaScriptFile
  }
  ;(node as any).flags &= ~ts.NodeFlags.Synthesized
  /* eslint-enable */
  ts.forEachChild(node, child => fixupNodeTree(child, node))
}

export function transformSourceFile(
  source: ts.SourceFile,
  compilerOptions: ts.CompilerOptions
): ts.SourceFile {
  const transformed = ts.transform(source, TRANSFORMERS, compilerOptions)
    .transformed[0]
  fixupNodeTree(transformed)
  return transformed
}
