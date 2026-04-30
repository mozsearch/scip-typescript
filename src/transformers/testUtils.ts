import ts from 'typescript'
import * as assert from 'uvu/assert'

export function checkTransform(
  transforms: ts.TransformerFactory<ts.SourceFile>[],
  source: string,
  expected: string
): void {
  const sourceFile = ts.createSourceFile(
    'test.ts',
    source,
    ts.ScriptTarget.Latest,
    true
  )

  const transformed = ts.transform([sourceFile], transforms).transformed[0]
  const printer = ts.createPrinter()
  const actual = printer.printFile(transformed)

  assert.equal(actual.trim(), expected.trim())
}
