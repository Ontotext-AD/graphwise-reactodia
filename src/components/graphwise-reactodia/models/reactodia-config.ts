import {SparqlQueryFunction} from '@reactodia/workspace';
import {Triple} from './triple';

/**
 * Host-supplied configuration read once when the workspace mounts (not reactive).
 *
 * Groups the inputs the host wires up before the graph is created: the SPARQL transport
 * and the optional set of entities to pre-populate the canvas with. Passed to the
 * `graphwise-reactodia` component as a single DOM property (an object, not an attribute).
 */
export interface ReactodiaConfig {
  /**
   * HTTP transport for the SPARQL requests. Set by the host so requests go through the host's
   * HTTP layer (auth, interceptors) instead of a built-in `fetch`.
   */
  queryFunction: SparqlQueryFunction;

  /**
   * IRIs of the elements(nodes) to place on the canvas on startup. When provided, each IRI is added
   * as an element and its data (labels, types, properties) and links are resolved from the
   * SPARQL provider, then the workspace lays them out. Note that when using this seed method reactodia will request data
   * from the connected sparql endpoint for both elements and links, so if the resources are not in the DB, then this approach will not work.
   * (e.g. in the case of a construct query)
   */
  seedIris?: string[];

  /**
   * Pre-resolved triples (source, rawPredicate, target) to place on the canvas on startup. Date for the links is provided
   * here, so reactodia will not request data for them. Data for nodes will be requested based on the IRIs of the source
   * and target of the links. This is useful for visualizing the result of a CONSTRUCT query, whose relationships are
   * computed and not persisted in the repository
   */
  seedGraph?: Triple[];
}
