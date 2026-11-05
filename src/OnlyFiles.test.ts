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

function index(output: string, onlyFiles?: string[]): scip.scip.Document[] {
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
  return scip.scip.Index.deserializeBinary(fs.readFileSync(output)).documents
}

// (c.ts uses a.ts's type literal and object literal's properties, which a
// full index names when it indexes a.ts, before c.ts, but which c.ts named,
// by its own counters, when a.ts wasn't indexed.)
const onlyFiles = ['src/c.ts']

test('only-files documents are the full index’s', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-only-files-'))
  try {
    const full = index(path.join(dir, 'full.scip'))
    const only = index(path.join(dir, 'only.scip'), onlyFiles)
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
        Buffer.from(document.serializeBinary()).toString('base64'),
        Buffer.from(fullDocument.serializeBinary()).toString('base64'),
        document.relative_path
      )
    }
  } finally {
    fs.rmSync(dir, { recursive: true })
  }
})

test('only-files of none of the projects’ files is an empty index', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scip-only-files-'))
  const exitCode = process.exitCode
  try {
    const only = index(path.join(dir, 'only.scip'), ['README.md'])
    assert.is(only.length, 0)
    assert.is(process.exitCode, exitCode)
  } finally {
    process.exitCode = exitCode
    fs.rmSync(dir, { recursive: true })
  }
})

test.run()
