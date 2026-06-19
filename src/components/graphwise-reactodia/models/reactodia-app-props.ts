import {SerializedDiagram, SparqlDataProviderSettings, SparqlQueryFunction} from '@reactodia/workspace';

/**
 * Props for the internal Reactodia React application.
 */
export interface ReactodiaAppProps {
  /**
   * The active repository id. Passed to the SPARQL data provider as its `endpointUrl` and
   * surfaced to {@link queryFunction} as the request `url`, which the host transport uses to
   * target the repository. Changing it re-points the diagram at a different repository.
   */
  currentRepository: string;
  /**
   * Transport for the SPARQL requests. The host owns the connection (auth, interceptors,
   * base URL) inside this function; Reactodia delegates every SPARQL call to it instead
   * of using the built-in `fetch`.
   */
  queryFunction: SparqlQueryFunction;
  /**
   * UI language code (e.g. `en`, `fr`); selects the Reactodia translation bundle
   * and is also used as the initial graph-data language.
   */
  language: string;
  /**
   * A previously exported diagram to restore on mount. Used to carry the user's current
   * canvas across a remount (e.g. forced by a language change). When omitted, the canvas
   * starts empty.
   */
  initialDiagram?: SerializedDiagram;
  /**
   * Query preset for the SPARQL data provider, owned and configured by the host. Falls back
   * to Reactodia's generic `OwlRdfsSettings` OWL/RDFS preset when omitted.
   */
  providerSettings?: SparqlDataProviderSettings;
}
