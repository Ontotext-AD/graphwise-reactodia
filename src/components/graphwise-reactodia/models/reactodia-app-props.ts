import {SerializedDiagram, SparqlDataProviderSettings} from '@reactodia/workspace';
import {LanguageKey} from '../i18n/language-key';
import {ReactodiaConfig} from './reactodia-config';

/**
 * Props for the internal Reactodia React application.
 */
export interface ReactodiaAppProps {
  /**
   * The active repository id. Passed to the SPARQL data provider as its `endpointUrl` and
   * surfaced to the {@link ReactodiaConfig.queryFunction} as the request `url`, which the host
   * transport uses to target the repository. Changing it re-points the diagram at a different
   * repository.
   */
  currentRepository: string;
  /**
   * Host-supplied configuration read once on mount: the SPARQL transport and the optional
   * set of entities to pre-populate the canvas with.
   */
  config: ReactodiaConfig;
  /**
   * UI language code (e.g. `en`, `fr`); selects the Reactodia translation bundle
   * and is also used as the initial graph-data language.
   */
  language: LanguageKey;
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
