import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { indexCommand } from './main'
import * as scip from './scip'

const PREFIX = 'scip-typescript npm hooks 1.0.0 '

// (A harness looking up its tests' functions by their names, in their shared
// global.)
test('hooks', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-hooks-'))
  try {
    const write = (file: string, text: string): void =>
      fs.writeFileSync(path.join(dir, file), text)
    write('package.json', '{"name": "hooks", "version": "1.0.0"}')
    write(
      'harness.js',
      'function runTest() {\n' +
        '  testSteps();\n' +
        '  if (typeof run_test == "function") {\n' +
        '    run_test();\n' +
        '  }\n' +
        '  harnessOwn();\n' +
        '  var obj = {};\n' +
        '  obj.testSteps;\n' +
        '  other_hook();\n' +
        '  options();\n' +
        '}\n' +
        'function harnessOwn() {}\n' +
        "// (The global's own, which it captures.)\n" +
        'var options = this.options;\n'
    )
    write(
      't1.js',
      'function testSteps() {}\nfunction own() {}\nvar options = {};\n'
    )
    write('t2.js', 'var run_test = function () {};\nfunction testSteps() {}\n')
    // (A module's own declarations aren't its global's.)
    write('t3.mjs', 'export function testSteps() {}\n')
    const project = path.join(dir, 'tsconfig.json')
    write(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: { allowJs: true, checkJs: false, noEmit: true },
        files: ['harness.js', 't1.js', 't2.js', 't3.mjs'],
        scipModuleFiles: ['t1.js', 't2.js', 't3.mjs'],
        scipHookNames: { 'harness.js': ['other_hook'] },
      })
    )
    const output = path.join(dir, 'project.scip')
    indexCommand([project], {
      cwd: dir,
      inferTsconfig: false,
      output,
      yarnWorkspaces: false,
      yarnBerryWorkspaces: false,
      pnpmWorkspaces: false,
      progressBar: false,
      indexedProjects: new Set(),
      globalCaches: true,
      stableTypeOrdering: true,
      classicScripts: true,
      hooks: true,
    })
    const documents = scip.scip.Index.deserializeBinary(
      fs.readFileSync(output)
    ).documents
    const document = (file: string): scip.scip.Document => {
      const found = documents.find(d => d.relative_path === file)
      assert.ok(found, file)
      return found
    }
    const occurrences = (file: string, symbol: string): string[] =>
      document(file)
        .occurrences.filter(o => o.symbol === symbol)
        .map(o => `${o.range.join(':')}${o.symbol_roles === 1 ? ' def' : ''}`)

    const testSteps = `${PREFIX}\`harness.js\`/testSteps:`
    const runTest = `${PREFIX}\`harness.js\`/run_test:`
    const otherHook = `${PREFIX}\`harness.js\`/other_hook:`
    // The harness's uses, but not of a property, or its own function.
    assert.equal(occurrences('harness.js', testSteps), ['1:2:11'])
    assert.equal(occurrences('harness.js', runTest), ['2:13:21', '3:4:12'])
    assert.equal(occurrences('harness.js', otherHook), ['8:2:12'])
    assert.ok(
      !document('harness.js').occurrences.some(o =>
        o.symbol.endsWith('/harnessOwn:')
      )
    )
    const information = document('harness.js').symbols.find(
      s => s.symbol === testSteps
    )
    assert.is(information?.signature_documentation.text, '(hook) testSteps')

    // The tests' definitions, whose own symbols have relationships to them.
    assert.equal(occurrences('t1.js', testSteps), ['0:9:18 def'])
    assert.equal(occurrences('t2.js', testSteps), ['1:9:18 def'])
    assert.equal(occurrences('t2.js', runTest), ['0:4:12 def'])
    const own = document('t1.js').symbols.find(
      s => s.symbol === `${PREFIX}\`t1.js\`/testSteps().`
    )
    assert.equal(
      own?.relationships.map(r => [r.symbol, r.is_definition]),
      [[testSteps, true]]
    )
    assert.equal(occurrences('t1.js', `${PREFIX}\`harness.js\`/own:`), [])
    assert.equal(
      occurrences('harness.js', `${PREFIX}\`harness.js\`/options:`),
      []
    )
    assert.equal(occurrences('t1.js', `${PREFIX}\`harness.js\`/options:`), [])
    assert.equal(occurrences('t3.mjs', testSteps), [])
  } finally {
    fs.rmSync(dir, { recursive: true })
  }
})

test.run()
