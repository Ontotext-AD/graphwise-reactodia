import {Component, Element, h, Host, Prop, Watch} from '@stencil/core';
import {Root} from 'react-dom/client';
import {SerializedDiagram, SparqlDataProviderSettings} from '@reactodia/workspace';
import {exportReactodiaLayout, mountReactodia, unmountReactodia, updateReactodia} from './reactodia-app';
import {LanguageKey} from './i18n/language-key';
import {ReactodiaConfig} from './models/reactodia-config';

/**
 * A web component that renders a graph with the Reactodia workspace.
 *
 * The component is backed by a SPARQL endpoint but is endpoint-agnostic: the host passes
 * the active repository's endpoint via `current-repository` and a `config.queryFunction`
 * that performs the actual HTTP request. Reactodia fetches all node, link and type data
 * lazily through them; the canvas starts empty and the user populates it via the search bar.
 *
 * The component is a thin wrapper around Reactodia: query configuration lives outside the
 * wrapper and is supplied through the `providerSettings` prop.
 */
@Component({
  tag: 'graphwise-reactodia',
  styleUrl: 'graphwise-reactodia.scss',
})
export class GraphwiseReactodia {
  @Element() private readonly hostElement?: HTMLElement;

  /**
   * The active repository id. Appended to {@link queryFunction} as the request `url`;
   * changing it re-points the graph at the new repository (and resets the canvas),
   * which is how runtime repository changes are handled.
   */
  @Prop() currentRepository?: string;

  /**
   * Host-supplied configuration: the SPARQL `queryFunction` transport and an optional `seed`
   * set of entities to pre-populate the canvas with. A DOM property (an object, not an
   * attribute) passed in from outside the wrapper.
   *
   * Read once on mount; not watched, as it only sets up the data source and initial canvas.
   */
  @Prop() config?: ReactodiaConfig;

  /**
   * UI language code (e.g. `en`, `fr`) for the Reactodia interface. Defaults to English.
   */
  @Prop() language = LanguageKey.EN;

  /**
   * Query preset for the SPARQL data provider, owned and configured by the host. A DOM
   * property (an object, not an attribute) passed in from outside the wrapper. When omitted,
   * the data provider falls back to Reactodia's generic OWL/RDFS preset. Changing it rebuilds
   * the data provider and resets the canvas.
   */
  @Prop() providerSettings?: SparqlDataProviderSettings;

  private reactRoot?: Root;

  @Watch('currentRepository')
  @Watch('providerSettings')
  onProviderSettingsChange(): void {
    this.renderGraph();
  }

  @Watch('language')
  onLanguageChange(): void {
    // The translations are evaluated by the workspace at construction, so the only way
    // to re-translate the UI is to re-create the graph. We carry the
    // current diagram across the remount so switching languages does not wipe the canvas.
    const diagram = exportReactodiaLayout();
    this.renderGraph(diagram);
  }

  componentDidLoad(): void {
    this.renderGraph();
  }

  disconnectedCallback(): void {
    if (this.reactRoot) {
      unmountReactodia(this.reactRoot);
      this.reactRoot = undefined;
    }
  }

  render() {
    return (
      <Host></Host>
    );
  }

  private renderGraph(initialDiagram?: SerializedDiagram): void {
    if (!this.currentRepository) {
      throw new Error('currentRepository is required');
    }

    if (!this.config?.queryFunction) {
      throw new Error('config.queryFunction is required');
    }

    if (!this.hostElement) {
      return;
    }

    const props = {
      initialDiagram,
      currentRepository: this.currentRepository,
      config: this.config,
      language: this.language,
      providerSettings: this.providerSettings,
    };

    if (this.reactRoot && !initialDiagram) {
      void updateReactodia(props);
    } else {
      this.reactRoot = mountReactodia(this.hostElement, props);
    }
  }
}
