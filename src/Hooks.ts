// A project's hooks (with --hooks): the names its scripts use but don't
// declare (TypeScript resolves no symbol for them), which its module files
// (its `scipModuleFiles`, classic scripts forced to be modules, but those
// which are modules by their syntax) declare at their top level, ex: a test
// harness's `testSteps()`, which each of its tests defines, as the harness
// looks it up by its name in their shared global.
//
// A hook is the using script's: its symbol is the script's, with a meta
// descriptor (`helpers.js/testSteps:`), as it's no declaration's.  Its uses
// are the script's occurrences of it, and a module file's top-level
// declaration of its name is one of its definitions (an occurrence of it, at
// the declaration's name), whose own symbol has a relationship to it
// (is_definition), as SCIP's relationships do for "symbols which do not have
// a definition of their own or could potentially have multiple definitions".
//
// A script's uses of a project's own module files' names are its hooks', and
// those of a project's `scipHookNames` (by script, the names it can use as
// hooks, ex: those of the module files of the other projects which it's the
// script of, when only one project documents it); but not those of the names
// it captures from its global (see `capturedGlobals`).

import * as ts from 'typescript'

import { metaDescriptor } from './Descriptor'
import * as scip from './scip'
import { ScipSymbol } from './ScipSymbol'
import { capturedGlobals } from './transformers/ClassicScripts'

/** A source file's free references (identifiers), by name, for each file. */
const freeReferencesCache = new WeakMap<
  ts.SourceFile,
  Map<string, ts.Identifier[]>
>()

/**
 * Whether an identifier is a reference to a variable by its name (not a
 * property's name, a declaration's, a label, ...).
 */
export function isFreeReference(node: ts.Identifier): boolean {
  const parent = node.parent
  if (!parent) {
    return false
  }
  if (ts.isPropertyAccessExpression(parent)) {
    return parent.expression === node
  }
  if (ts.isQualifiedName(parent)) {
    return parent.left === node
  }
  if (ts.isLabeledStatement(parent) || ts.isBreakOrContinueStatement(parent)) {
    return parent.label !== node
  }
  if (
    ts.isMetaProperty(parent) ||
    (ts.isBindingElement(parent) && parent.propertyName === node) ||
    ts.isImportSpecifier(parent) ||
    ts.isExportSpecifier(parent) ||
    ts.isImportClause(parent) ||
    ts.isNamespaceImport(parent) ||
    ts.isImportEqualsDeclaration(parent)
  ) {
    return false
  }
  // (A declaration's name, ex: a property assignment's, a parameter's.)
  return (parent as ts.NamedDeclaration).name !== node
}

function freeReferences(
  sourceFile: ts.SourceFile
): Map<string, ts.Identifier[]> {
  const cached = freeReferencesCache.get(sourceFile)
  if (cached) {
    return cached
  }
  const references = new Map<string, ts.Identifier[]>()
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.pos >= 0 && isFreeReference(node)) {
      const name = ts.idText(node)
      const list = references.get(name)
      if (list) {
        list.push(node)
      } else {
        references.set(name, [node])
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  freeReferencesCache.set(sourceFile, references)
  return references
}

/**
 * Whether a module file is a classic script (forced to be a module, whose
 * top-level declarations are its global's when it runs), not a module by its
 * syntax (imports or exports), whose aren't.
 */
function isScript(sourceFile: ts.SourceFile): boolean {
  const cached = isScriptCache.get(sourceFile)
  if (cached !== undefined) {
    return cached
  }
  const script =
    !sourceFile.fileName.endsWith('.mjs') && !isModuleSyntax(sourceFile)
  isScriptCache.set(sourceFile, script)
  return script
}

/** (Each source file's `isScript`, as it's asked for each declaration.) */
const isScriptCache = new WeakMap<ts.SourceFile, boolean>()

function isModuleSyntax(sourceFile: ts.SourceFile): boolean {
  return sourceFile.statements.some(
    statement =>
      ts.isImportDeclaration(statement) ||
      ts.isImportEqualsDeclaration(statement) ||
      ts.isExportDeclaration(statement) ||
      ts.isExportAssignment(statement) ||
      (ts.canHaveModifiers(statement) &&
        ts
          .getModifiers(statement)
          ?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword))
  )
}

/** A source file's top-level declarations' names. */
function topLevelNames(sourceFile: ts.SourceFile): Set<string> {
  const names = new Set<string>()
  for (const statement of sourceFile.statements) {
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement)) &&
      statement.name
    ) {
      names.add(ts.idText(statement.name))
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          names.add(ts.idText(declaration.name))
        }
      }
    }
  }
  return names
}

/** Whether a declaration's name is one of its file's top-level names. */
export function isTopLevelDeclarationName(node: ts.Node): boolean {
  const parent = node.parent
  if (!parent || !ts.isIdentifier(node)) {
    return false
  }
  if (
    (ts.isFunctionDeclaration(parent) || ts.isClassDeclaration(parent)) &&
    parent.name === node
  ) {
    return ts.isSourceFile(parent.parent)
  }
  return (
    ts.isVariableDeclaration(parent) &&
    parent.name === node &&
    ts.isVariableDeclarationList(parent.parent) &&
    ts.isVariableStatement(parent.parent.parent) &&
    ts.isSourceFile(parent.parent.parent.parent)
  )
}

export class Hooks {
  /** The module files' top-level names. */
  private moduleNames = new Set<string>()
  /** Each script's (by file name) unresolved uses' names among them. */
  private used = new Map<string, Set<string>>()
  private scripts: ts.SourceFile[] = []
  private symbols = new Map<string, ScipSymbol>()
  constructor(
    program: ts.Program,
    private checker: ts.TypeChecker,
    fileNames: string[],
    private moduleFiles: Set<string>,
    /** `scipHookNames`: a script's names it can use as hooks, by file name. */
    private hookNames: Map<string, Set<string>>,
    private fileSymbol: (sourceFile: ts.SourceFile) => ScipSymbol
  ) {
    const files = new Set(fileNames)
    for (const sourceFile of program.getSourceFiles()) {
      if (!files.has(sourceFile.fileName) || sourceFile.isDeclarationFile) {
        continue
      }
      if (moduleFiles.has(sourceFile.fileName)) {
        if (isScript(sourceFile)) {
          for (const name of topLevelNames(sourceFile)) {
            this.moduleNames.add(name)
          }
        }
      } else if (!ts.isExternalModule(sourceFile)) {
        this.scripts.push(sourceFile)
      }
    }
    for (const script of this.scripts) {
      const used = new Set<string>()
      const captured = capturedGlobals(script)
      for (const [name, references] of freeReferences(script)) {
        if (
          this.moduleNames.has(name) &&
          !captured?.has(name) &&
          references.some(
            reference => checker.getSymbolAtLocation(reference) === undefined
          )
        ) {
          used.add(name)
        }
      }
      if (used.size > 0) {
        this.used.set(script.fileName, used)
      }
    }
  }

  /** A script's hook's symbol. */
  public symbol(script: ts.SourceFile, name: string): ScipSymbol {
    const key = `${script.fileName}\0${name}`
    let symbol = this.symbols.get(key)
    if (!symbol) {
      symbol = ScipSymbol.global(this.fileSymbol(script), metaDescriptor(name))
      this.symbols.set(key, symbol)
    }
    return symbol
  }

  /**
   * Whether a script's free reference is a hook's use: of a name it can use
   * as a hook, which TypeScript resolves no symbol for.
   */
  public isUse(script: ts.SourceFile, node: ts.Identifier): boolean {
    if (
      this.moduleFiles.has(script.fileName) ||
      ts.isExternalModule(script) ||
      !isFreeReference(node)
    ) {
      return false
    }
    const name = ts.idText(node)
    return (
      !capturedGlobals(script)?.has(name) &&
      (this.moduleNames.has(name) ||
        (this.hookNames.get(script.fileName)?.has(name) ?? false)) &&
      this.checker.getSymbolAtLocation(node) === undefined
    )
  }

  /**
   * The hooks a module file's top-level declaration's name (its node) is a
   * definition of: the scripts' which use it.
   */
  public definedBy(sourceFile: ts.SourceFile, node: ts.Node): ScipSymbol[] {
    if (
      !this.moduleFiles.has(sourceFile.fileName) ||
      !isScript(sourceFile) ||
      !isTopLevelDeclarationName(node)
    ) {
      return []
    }
    const name = ts.idText(node as ts.Identifier)
    return this.scripts
      .filter(script => this.used.get(script.fileName)?.has(name))
      .map(script => this.symbol(script, name))
  }
}

/** A hook's symbol information, in a document using or defining it. */
export function hookSymbolInformation(
  symbol: ScipSymbol,
  name: string
): scip.scip.SymbolInformation {
  return new scip.scip.SymbolInformation({
    symbol: symbol.value,
    display_name: name,
    signature_documentation: new scip.scip.Signature({
      language: 'ts',
      text: `(hook) ${name}`,
    }),
  })
}
