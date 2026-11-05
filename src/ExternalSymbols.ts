import * as ts from 'typescript'

import * as scip from './scip'

/**
 * With `--only-files`, the symbol information of the symbols its documents use
 * which the projects' other files define (which a full index has documents
 * of, with their symbol information), as those documents would have it, for
 * the index's external symbols: so that the uses of an index of only some
 * files have it as a full index's do (ex: their types).
 */
export class ExternalSymbols {
  public readonly symbols: scip.scip.SymbolInformation[] = []
  private added = new Set<string>()

  constructor(
    /** The files a full index has documents of. */
    private readonly projectsFiles: Set<string>,
    /** The files this index has documents of. */
    private readonly onlyFiles: Set<string>
  ) {}

  /**
   * Whether the symbol, which `declaration` defines, is an external symbol
   * which isn't added yet.
   */
  public wants(declaration: ts.Node, symbol: string): boolean {
    const fileName = declaration.getSourceFile().fileName
    return (
      this.projectsFiles.has(fileName) &&
      !this.onlyFiles.has(fileName) &&
      !this.added.has(symbol)
    )
  }

  public add(information: scip.scip.SymbolInformation): void {
    this.added.add(information.symbol)
    this.symbols.push(information)
  }
}
