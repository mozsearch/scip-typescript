import * as path from 'path'

import ProgressBar from 'progress'
import * as ts from 'typescript'

import { GlobalCache, ProjectOptions } from './CommandLineOptions'
import { FileIndexer } from './FileIndexer'
import { Hooks } from './Hooks'
import { NodeOrdinals } from './NodeOrdinals'
import { Packages } from './Packages'
import * as scip from './scip'
import { ScipSymbol } from './ScipSymbol'
import { transformSourceFile } from './transformers/transformSourceFile'

function createCompilerHost(
  cache: GlobalCache,
  compilerOptions: ts.CompilerOptions,
  projectOptions: ProjectOptions,
  moduleFiles?: Set<string>,
  unwrapFiles?: Set<string>
): ts.CompilerHost {
  const host = ts.createCompilerHost(compilerOptions)
  if (!projectOptions.globalCaches) {
    return host
  }
  const hostCopy = { ...host }
  host.getCurrentDirectory = () => projectOptions.cwd
  host.getParsedCommandLine = (fileName: string) => {
    if (!hostCopy.getParsedCommandLine) {
      return undefined
    }
    const fromCache = cache.parsedCommandLines.get(fileName)
    if (fromCache !== undefined) {
      return fromCache
    }
    const result = hostCopy.getParsedCommandLine(fileName)
    if (result !== undefined) {
      // Don't cache undefined results even if they could be cached
      // theoretically. The big performance gains from this cache come from
      // caching non-undefined results.
      cache.parsedCommandLines.set(fileName, result)
    }
    return result
  }
  host.getSourceFile = (
    fileName,
    languageVersion,
    onError,
    shouldCreateNewSourceFile
  ) => {
    // (A module file, forced to be a module whatever its syntax, is cached
    // apart from the file as itself, which another project can have.)
    const forced = moduleFiles?.has(fileName) ?? false
    const unwrap = unwrapFiles?.has(fileName) ?? false
    const key = `${fileName}${forced ? '\0module' : ''}${unwrap ? '\0unwrap' : ''}`
    const fromCache = cache.sources.get(key)
    if (fromCache !== undefined) {
      const [sourceFile, cachedLanguageVersion] = fromCache
      if (isSameLanguageVersion(languageVersion, cachedLanguageVersion)) {
        return sourceFile
      }
    }

    const original = hostCopy.getSourceFile(
      fileName,
      forced ? forcedModule(languageVersion) : languageVersion,
      onError,
      shouldCreateNewSourceFile
    )
    if (original === undefined) {
      // Don't cache undefined results even if they could be cached
      // theoretically. The big performance gains from this cache come from
      // caching non-undefined results.
      return undefined
    }

    const transformed = transformSourceFile(
      original,
      compilerOptions,
      projectOptions.classicScripts,
      unwrap
    )
    cache.sources.set(key, [transformed, languageVersion])
    return transformed
  }
  return host
}

/** Source file options making a file a module, whatever its syntax. */
function forcedModule(
  languageVersion: ts.ScriptTarget | ts.CreateSourceFileOptions
): ts.CreateSourceFileOptions {
  const options: ts.CreateSourceFileOptions =
    typeof languageVersion === 'object'
      ? { ...languageVersion }
      : { languageVersion }
  options.setExternalModuleIndicator = file => {
    ;(file as { externalModuleIndicator?: unknown }).externalModuleIndicator =
      true
  }
  return options
}

/**
 * A project configuration's list of files (`key`: paths relative to it, or
 * absolute), if it has one, as TypeScript names them.
 */
function configFiles(
  config: ts.ParsedCommandLine,
  projectRoot: string,
  key: string
): Set<string> | undefined {
  const raw = config.raw as Record<string, unknown> | undefined
  const files = raw?.[key]
  if (!Array.isArray(files)) {
    return undefined
  }
  const configFile = projectRoot.endsWith('.json')
    ? path.resolve(projectRoot)
    : path.resolve(projectRoot, 'tsconfig.json')
  return new Set(
    files
      .filter((file): file is string => typeof file === 'string')
      .map(file =>
        path.resolve(path.dirname(configFile), file).replaceAll('\\', '/')
      )
  )
}

/**
 * A project configuration's map of files (`key`: paths relative to it, or
 * absolute) to names, if it has one, as TypeScript names the files.
 */
function configFileNames(
  config: ts.ParsedCommandLine,
  projectRoot: string,
  key: string
): Map<string, Set<string>> {
  const raw = config.raw as Record<string, unknown> | undefined
  const files = raw?.[key]
  const map = new Map<string, Set<string>>()
  if (!files || typeof files !== 'object' || Array.isArray(files)) {
    return map
  }
  const configFile = projectRoot.endsWith('.json')
    ? path.resolve(projectRoot)
    : path.resolve(projectRoot, 'tsconfig.json')
  for (const [file, names] of Object.entries(files)) {
    if (!Array.isArray(names)) {
      continue
    }
    map.set(
      path.resolve(path.dirname(configFile), file).replaceAll('\\', '/'),
      new Set(names.filter((name): name is string => typeof name === 'string'))
    )
  }
  return map
}

export class ProjectIndexer {
  private program: ts.Program
  private checker: ts.TypeChecker
  private symbolCache: Map<ts.Node, ScipSymbol> = new Map()
  private hasConstructor: Map<ts.ClassDeclaration, boolean> = new Map()
  private ordinals = new NodeOrdinals()
  private packages: Packages
  /**
   * The project's own only files, if its configuration lists them (its
   * `scipOnlyFiles`: paths relative to it, or absolute), as --only-files
   * does for every project (ex: a generated project of JS environments,
   * whose scripts other projects of the same environments' kind document).
   */
  private projectOnlyFiles: Set<string> | undefined
  /** Its hooks, with --hooks and module files (see Hooks.ts). */
  private hooks: Hooks | undefined
  constructor(
    public readonly config: ts.ParsedCommandLine,
    public readonly options: ProjectOptions,
    cache: GlobalCache
  ) {
    // (A union's types, ex, are otherwise in the order the checker made them,
    // which depends on which files were checked first.)
    const compilerOptions: ts.CompilerOptions = options.stableTypeOrdering
      ? { ...config.options, stableTypeOrdering: true }
      : config.options
    // (Its `scipModuleFiles` are modules whatever their syntax, ex: tests
    // sharing a project with their harness's scripts, whose top-level
    // declarations are each one's own.)
    const moduleFiles = configFiles(
      config,
      options.projectRoot,
      'scipModuleFiles'
    )
    // (And its `scipUnwrapFiles` are unwrapped, ex: web-platform-tests'
    // testharness.js; see ClassicScripts.ts.)
    const unwrapFiles = configFiles(
      config,
      options.projectRoot,
      'scipUnwrapFiles'
    )
    const host = createCompilerHost(
      cache,
      compilerOptions,
      options,
      moduleFiles,
      unwrapFiles
    )
    this.program = ts.createProgram(config.fileNames, compilerOptions, host)
    this.checker = this.program.getTypeChecker()
    this.packages = new Packages(options.projectRoot)
    this.projectOnlyFiles = configFiles(
      config,
      options.projectRoot,
      'scipOnlyFiles'
    )
    if (options.hooks && moduleFiles !== undefined && moduleFiles.size > 0) {
      const packages = this.packages
      this.hooks = new Hooks(
        this.program,
        this.checker,
        config.fileNames,
        moduleFiles,
        configFileNames(config, options.projectRoot, 'scipHookNames'),
        sourceFile => {
          const symbol = packages.symbol(sourceFile.fileName)
          return symbol.isEmpty() ? ScipSymbol.anonymousPackage() : symbol
        }
      )
    }
  }
  public index(): void {
    const startTimestamp = Date.now()
    const sourceFiles = this.program.getSourceFiles()

    const filesToIndex: ts.SourceFile[] = []
    // Visit every sourceFile in the program
    for (const sourceFile of sourceFiles) {
      const includes = this.config.fileNames.includes(sourceFile.fileName)
      if (!includes) {
        continue
      }
      if (
        this.options.onlyFileSet !== undefined &&
        !this.options.onlyFileSet.has(sourceFile.fileName)
      ) {
        continue
      }
      if (
        this.projectOnlyFiles !== undefined &&
        !this.projectOnlyFiles.has(sourceFile.fileName)
      ) {
        continue
      }
      filesToIndex.push(sourceFile)
    }

    if (filesToIndex.length === 0 && this.projectOnlyFiles !== undefined) {
      // (None of its own only files are its files, ex: they're too big.)
      return
    }
    if (filesToIndex.length === 0) {
      throw new Error(
        `no indexable files in project '${this.options.projectDisplayName}'`
      )
    }

    const jobs: ProgressBar | undefined = this.options.progressBar
      ? new ProgressBar(
          `  ${this.options.projectDisplayName} [:bar] :current/:total :title`,
          {
            total: filesToIndex.length,
            renderThrottle: 100,
            incomplete: '_',
            complete: '#',
            width: 20,
            clear: true,
            stream: process.stderr,
          }
        )
      : undefined
    let lastWrite = startTimestamp
    for (const [index, sourceFile] of filesToIndex.entries()) {
      const title = path.relative(this.options.cwd, sourceFile.fileName)
      jobs?.tick({ title })
      if (!this.options.progressBar) {
        const now = Date.now()
        const elapsed = now - lastWrite
        if (elapsed > 1000 && index > 2) {
          lastWrite = now
          process.stdout.write('.')
        }
      }
      const document = new scip.scip.Document({
        relative_path: path.relative(this.options.cwd, sourceFile.fileName),
        occurrences: [],
      })
      const visitor = new FileIndexer(
        this.checker,
        this.options,
        document,
        this.symbolCache,
        this.hasConstructor,
        this.packages,
        sourceFile,
        this.ordinals,
        this.options.externalSymbols,
        this.hooks
      )
      try {
        visitor.index()
      } catch (error) {
        console.error(
          `unexpected error indexing file '${sourceFile.fileName}' in project root '${this.options.cwd}'`,
          error
        )
      }
      if (visitor.document.occurrences.length > 0) {
        this.options.writeIndex(
          new scip.scip.Index({
            documents: [visitor.document],
          })
        )
      }
    }
    jobs?.terminate()
    const elapsed = Date.now() - startTimestamp
    if (!this.options.progressBar && lastWrite > startTimestamp) {
      process.stdout.write('\n')
    }
    console.log(
      `+ ${this.options.projectDisplayName} (${prettyMilliseconds(elapsed)})`
    )
  }
}

export function prettyMilliseconds(milliseconds: number): string {
  let ms = Math.floor(milliseconds)
  let result = ''
  if (ms >= 1000 * 60) {
    const minutes = Math.floor(ms / (1000 * 60))
    if (minutes !== 0) {
      result += `${minutes}m `
      ms -= minutes * 1000 * 60
    }
  }
  if (result !== '' || ms >= 1000) {
    const seconds = Math.floor(ms / 1000)
    result += `${seconds}s `
    ms -= seconds * 1000
  }
  result += `${ms}ms`
  return result.trim()
}

function isSameLanguageVersion(
  a: ts.ScriptTarget | ts.CreateSourceFileOptions,
  b: ts.ScriptTarget | ts.CreateSourceFileOptions
): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b
  }
  if (typeof a === 'number' || typeof b === 'number') {
    // Different shape: one is ts.ScriptTarget, the other is
    // ts.CreateSourceFileOptions
    return false
  }
  return (
    a.languageVersion === b.languageVersion &&
    a.impliedNodeFormat === b.impliedNodeFormat
    // Ignore setExternalModuleIndicator even if that increases the risk of a
    // false positive. A local experiment revealed that we never get a cache hit
    // if we compare setExternalModuleIndicator since it's function with a
    // unique reference on every `CompilerHost.getSourceFile` callback.
  )
}
