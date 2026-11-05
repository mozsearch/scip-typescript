import { Command } from 'commander'
import ts from 'typescript'

import packageJson from '../package.json'

import { ExternalSymbols } from './ExternalSymbols'
import { parseHumanByteSizeIntoNumber } from './parseHumanByteSizeIntoNumber'
import * as scip from './scip'

/** Configuration options to index a multi-project workspace. */
export interface MultiProjectOptions {
  inferTsconfig: boolean
  progressBar: boolean
  yarnWorkspaces: boolean
  yarnBerryWorkspaces: boolean
  pnpmWorkspaces: boolean
  globalCaches: boolean
  maxFileByteSize?: string
  maxFileByteSizeNumber?: number
  cwd: string
  output: string
  indexedProjects: Set<string>
  /**
   * A file listing the only files to index, if set: their paths, relative to
   * `cwd`, one per line (see `--only-files`).
   */
  onlyFiles?: string
  /** The absolute paths of `onlyFiles`' files, once it's read. */
  onlyFileSet?: Set<string>
  /** With `onlyFiles`, the index's external symbols (see ExternalSymbols). */
  externalSymbols?: ExternalSymbols
  /** Whether to check with `stableTypeOrdering` (see `--stable-type-ordering`). */
  stableTypeOrdering?: boolean
  /** Whether classic scripts stay scripts (see `--classic-scripts`). */
  classicScripts?: boolean
}

/** Configuration options to index a single TypeScript project. */
export interface ProjectOptions extends MultiProjectOptions {
  projectRoot: string
  projectDisplayName: string
  writeIndex: (index: scip.scip.Index) => void
}

/** Cached values */
export interface GlobalCache {
  sources: Map<
    string,
    [ts.SourceFile | undefined, ts.ScriptTarget | ts.CreateSourceFileOptions]
  >
  parsedCommandLines: Map<string, ts.ParsedCommandLine>
  /** The projects' configurations, by their roots (undefined if missing). */
  projectConfigs: Map<string, ts.ParsedCommandLine | undefined>
}

export function mainCommand(
  indexAction: (projects: string[], options: MultiProjectOptions) => void
): Command {
  const command = new Command()
  command
    .name('scip-typescript')
    .version(packageJson.version)
    .description(
      'SCIP indexer for TypeScript and JavaScript\nFor usage examples, see https://github.com/sourcegraph/scip-typescript/blob/main/README.md'
    )
  command
    .command('index')
    .option('--cwd <path>', 'the working directory', process.cwd())
    .option('--pnpm-workspaces', 'whether to index all pnpm workspaces', false)
    .option('--yarn-workspaces', 'whether to index all yarn workspaces', false)
    .option(
      '--yarn-berry-workspaces',
      '(deprecated) use --yarn-workspaces instead',
      false
    )
    .option(
      '--infer-tsconfig',
      "whether to infer the tsconfig.json file, if it's missing",
      false
    )
    .option('--output <path>', 'path to the output file', 'index.scip')
    .option('--progress-bar', 'whether to enable a rich progress bar')
    .option('--no-progress-bar', 'whether to disable the rich progress bar')
    .option(
      '--no-global-caches',
      'whether to disable global caches between TypeScript projects'
    )
    .option(
      '--only-files <path>',
      "index only the files listed in this file (their paths relative to --cwd, one per line), as a full index would, loading only the projects that include them; an index of none of them is empty, which isn't an error"
    )
    .option(
      '--stable-type-ordering',
      "check with TypeScript's stableTypeOrdering, so that the types in documentation (ex: a union's) are in the same order whichever files are checked first (ex: with --only-files)",
      false
    )
    .option(
      '--classic-scripts',
      "keep classic scripts' ChromeUtils.importESModule() and defineESModuleGetters() calls from making them modules (as the require() calls they're otherwise transformed into would), so that their top-level declarations stay globals, getters defined on their global are globals, and so are their top-level assignments to their global's properties (ex: `globalThis.name = value`)",
      false
    )
    .option(
      '--max-file-byte-size <value>',
      'skip files that have a larger byte size than the provided value. Supported formats: 1kb, 1mb, 1gb.',
      '1mb'
    )
    .argument('[projects...]')
    .action((parsedProjects, parsedOptions) => {
      const options = parsedOptions as MultiProjectOptions

      // Parse and validate human-provided --max-file-byte-size value
      options.maxFileByteSizeNumber = parseHumanByteSizeIntoNumber(
        options.maxFileByteSize ?? '1mb'
      )
      if (isNaN(options.maxFileByteSizeNumber)) {
        console.error(
          `invalid byte size '${options.maxFileByteSize}'. To fix this problem, change the value of the flag --max-file-byte-size to use a valid byte size format: 1kb, 1mb, 1gb.`
        )
        process.exitCode = 1
        return
      }

      indexAction(parsedProjects as string[], options)
    })
  return command
}
