import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { MultiProjectOptions } from './CommandLineOptions'
import { indexCommand } from './main'
import * as scip from './scip'

// (Not one of the snapshot tests' inputs: its documents are compared with each
// other, not with snapshots.)
const inputRoot = path.join(process.cwd(), 'snapshots', 'only-files')

function index(output: string, onlyFiles?: string[]): scip.scip.Index {
  const options: MultiProjectOptions = {
    cwd: inputRoot,
    inferTsconfig: false,
    output,
    yarnWorkspaces: false,
    yarnBerryWorkspaces: false,
    pnpmWorkspaces: false,
    progressBar: false,
    indexedProjects: new Set(),
    globalCaches: true,
    stableTypeOrdering: true,
  }
  if (onlyFiles !== undefined) {
    options.onlyFiles = `${output}.lst`
    fs.writeFileSync(options.onlyFiles, onlyFiles.join('\n') + '\n')
  }
  indexCommand([], options)
  return scip.scip.Index.deserializeBinary(fs.readFileSync(output))
}

function serialized(message: { serializeBinary(): Uint8Array }): string {
  return Buffer.from(message.serializeBinary()).toString('base64')
}

// (c.ts uses a.ts's type literal and object literal's properties, which a
// full index names when it indexes a.ts, before c.ts, but which c.ts named,
// by its own counters, when a.ts wasn't indexed.)
const onlyFiles = ['src/c.ts']

test('only-files documents are the full index’s', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-only-files-'))
  try {
    const full = index(path.join(dir, 'full.scip')).documents
    const only = index(path.join(dir, 'only.scip'), onlyFiles).documents
    assert.equal(
      only.map(document => document.relative_path).toSorted(),
      onlyFiles.toSorted()
    )
    for (const document of only) {
      const fullDocument = full.find(
        candidate => candidate.relative_path === document.relative_path
      )
      assert.ok(fullDocument, document.relative_path)
      assert.equal(
        serialized(document),
        serialized(fullDocument),
        document.relative_path
      )
    }
  } finally {
    fs.rmSync(dir, { recursive: true })
  }
})

// (c.ts uses a.ts's symbols, whose symbol information a.ts's document has.)
test('only-files external symbols are their documents’ symbol information', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-only-files-'))
  try {
    const full = index(path.join(dir, 'full.scip'))
    const only = index(path.join(dir, 'only.scip'), onlyFiles)
    const fullSymbols = new Map(
      full.documents.flatMap(document =>
        document.symbols.map(information => [information.symbol, information])
      )
    )
    const external = new Set(
      only.external_symbols.map(information => information.symbol)
    )
    for (const symbol of [
      'scip-typescript npm only-files 1.0.0 src/`a.ts`/',
      'scip-typescript npm only-files 1.0.0 src/`a.ts`/Options#',
      'scip-typescript npm only-files 1.0.0 src/`a.ts`/defaults.',
      'scip-typescript npm only-files 1.0.0 src/`a.ts`/Options#typeLiteral0:level.',
      'scip-typescript npm only-files 1.0.0 src/`a.ts`/mode0:',
    ]) {
      assert.ok(external.has(symbol), symbol)
    }
    for (const information of only.external_symbols) {
      const fullInformation = fullSymbols.get(information.symbol)
      assert.ok(fullInformation, information.symbol)
      assert.equal(
        serialized(information),
        serialized(fullInformation),
        information.symbol
      )
    }
  } finally {
    fs.rmSync(dir, { recursive: true })
  }
})

// (A generated project's own only files: its tsconfig.json's
// `scipOnlyFiles`.)
test('a project’s scipOnlyFiles are its only documents', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-only-files-'))
  try {
    const project = path.join(dir, 'tsconfig.json')
    fs.writeFileSync(
      project,
      JSON.stringify({
        compilerOptions: { target: 'ES2020', strict: true },
        files: ['a.ts', 'b.ts', 'c.ts'].map(f =>
          path.join(inputRoot, 'src', f)
        ),
        scipOnlyFiles: [path.join(inputRoot, 'src', 'c.ts')],
      })
    )
    const output = path.join(dir, 'project.scip')
    indexCommand([project], {
      cwd: inputRoot,
      inferTsconfig: false,
      output,
      yarnWorkspaces: false,
      yarnBerryWorkspaces: false,
      pnpmWorkspaces: false,
      progressBar: false,
      indexedProjects: new Set(),
      globalCaches: true,
      stableTypeOrdering: true,
    })
    const documents = scip.scip.Index.deserializeBinary(
      fs.readFileSync(output)
    ).documents
    assert.equal(
      documents.map(document => document.relative_path),
      ['src/c.ts']
    )
  } finally {
    fs.rmSync(dir, { recursive: true })
  }
})

// (Tests sharing a project with the scripts they're loaded after: forced
// to be modules, their own declarations are each one's.)
test('a project’s scipModuleFiles are modules', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-module-files-'))
  try {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      '{"name": "modules", "version": "1.0.0"}'
    )
    fs.writeFileSync(path.join(dir, 'shared.js'), 'function shared() {}\n')
    for (const test of ['t1.js', 't2.js']) {
      fs.writeFileSync(
        path.join(dir, test),
        'function own() {}\nown();\nshared();\n'
      )
    }
    const project = path.join(dir, 'tsconfig.json')
    fs.writeFileSync(
      project,
      JSON.stringify({
        compilerOptions: { allowJs: true, checkJs: false, noEmit: true },
        files: ['shared.js', 't1.js', 't2.js'],
        scipModuleFiles: ['t1.js', 't2.js'],
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
    })
    const documents = scip.scip.Index.deserializeBinary(
      fs.readFileSync(output)
    ).documents
    for (const test of ['t1.js', 't2.js']) {
      const document = documents.find(d => d.relative_path === test)
      const symbols = new Set(document?.occurrences.map(o => o.symbol))
      assert.ok(
        symbols.has(`scip-typescript npm modules 1.0.0 \`${test}\`/own().`),
        test
      )
      assert.ok(
        symbols.has('scip-typescript npm modules 1.0.0 `shared.js`/shared().'),
        test
      )
      const other = test === 't1.js' ? 't2.js' : 't1.js'
      assert.ok(
        !symbols.has(`scip-typescript npm modules 1.0.0 \`${other}\`/own().`),
        test
      )
    }
  } finally {
    fs.rmSync(dir, { recursive: true })
  }
})

// (Classic scripts' globals they assign to their global's properties, and a
// harness's whose functions are in a function it calls at once.)
test('classic scripts’ assigned globals and scipUnwrapFiles', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-unwrap-files-'))
  try {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      '{"name": "unwrap", "version": "1.0.0"}'
    )
    fs.writeFileSync(
      path.join(dir, 'harness.js'),
      '(function (global_scope) {\n' +
        '    function promise_test() {}\n' +
        '    expose(promise_test, "promise_test");\n' +
        '})(self);\n'
    )
    fs.writeFileSync(
      path.join(dir, 'shell.js'),
      'globalThis.assertDeepEq = function () {};\n'
    )
    fs.writeFileSync(
      path.join(dir, 'test.js'),
      'promise_test();\nassertDeepEq();\n'
    )
    const project = path.join(dir, 'tsconfig.json')
    fs.writeFileSync(
      project,
      JSON.stringify({
        compilerOptions: { allowJs: true, checkJs: false, noEmit: true },
        files: ['harness.js', 'shell.js', 'test.js'],
        scipUnwrapFiles: ['harness.js'],
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
    })
    const documents = scip.scip.Index.deserializeBinary(
      fs.readFileSync(output)
    ).documents
    const document = documents.find(d => d.relative_path === 'test.js')
    const symbols = new Set(document?.occurrences.map(o => o.symbol))
    assert.ok(
      symbols.has(
        'scip-typescript npm unwrap 1.0.0 `harness.js`/promise_test().'
      ),
      [...symbols].join(', ')
    )
    assert.ok(
      symbols.has('scip-typescript npm unwrap 1.0.0 `shell.js`/assertDeepEq.'),
      [...symbols].join(', ')
    )
    // (Their definitions where they were.)
    const harness = documents.find(d => d.relative_path === 'harness.js')
    const definition = harness?.occurrences.find(
      o =>
        o.symbol ===
          'scip-typescript npm unwrap 1.0.0 `harness.js`/promise_test().' &&
        o.symbol_roles === 1
    )
    assert.equal(definition?.range, [1, 13, 25])
  } finally {
    fs.rmSync(dir, { recursive: true })
  }
})

test('only-files of none of the projects’ files is an empty index', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-only-files-'))
  const exitCode = process.exitCode
  try {
    const only = index(path.join(dir, 'only.scip'), ['README.md'])
    assert.is(only.documents.length, 0)
    assert.is(process.exitCode, exitCode)
  } finally {
    process.exitCode = exitCode
    fs.rmSync(dir, { recursive: true })
  }
})

test.run()
