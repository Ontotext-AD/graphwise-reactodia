/**
 * A pre-resolved edge to place on the canvas on startup, mirroring GraphDB's
 * `rest/explore-graph` link shape. Used to visualize the result of a CONSTRUCT query, whose
 * relationships are computed and therefore not persisted in the repository, so they cannot be
 * fetched lazily through the SPARQL provider and must be supplied directly.
 *
 * The host adapts its source data into this neutral shape (e.g. the workbench maps the
 * `rest/explore-graph/graph` response onto {@link rawPredicates}).
 */
export interface Triple {
  /** Source element IRI. */
  source: string;

  /** Target element IRI. */
  target: string;

  /**
   * Full (absolute) predicate IRIs.
   */
  rawPredicates: string[];
}
