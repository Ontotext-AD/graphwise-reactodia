/**
 * The stable category of a reported error. The host uses it to choose its own message.
 */
export enum ErrorCode {
  /** A required prop is missing. */
  MISSING_REQUIRED_PROP = 'missing-required-prop',
  /** A SPARQL data provider call failed. */
  DATA_FETCH = 'data-fetch',
  /** The startup load, a reload or a repository switch failed. */
  DIAGRAM_LOAD = 'diagram-load',
  /** The uploaded file was rejected or its import failed. */
  DIAGRAM_IMPORT = 'diagram-import',
  /** Reading the diagram from local storage failed. */
  LOCAL_DIAGRAM_READ = 'local-diagram-read',
  /** Saving the diagram in local storage failed. */
  LOCAL_DIAGRAM_SAVE = 'local-diagram-save'
}
