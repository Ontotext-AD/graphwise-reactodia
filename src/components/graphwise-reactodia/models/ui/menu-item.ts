/**
 * An entry of the workspace main menu.
 */
export enum MenuItem {
  /** Removes all nodes from the diagram. */
  CLEAR_ALL = 'clear-all',
  /** Exports the diagram as a PNG image. */
  EXPORT_PNG = 'export-png',
  /** Exports the diagram as an SVG image. */
  EXPORT_SVG = 'export-svg',
  /** Prints the diagram. */
  PRINT = 'print',
  /** Exports the diagram as a JSON file. */
  EXPORT_JSON = 'export-json',
  /** Imports a diagram from a JSON file. */
  IMPORT_JSON = 'import-json'
}
