import {Component, h, Host, Prop, State, Watch} from '@stencil/core';
import {Root} from 'react-dom/client';
import {SparqlDataProviderSettings} from '@reactodia/workspace';
import {mountReactodia, unmountReactodia, updateReactodia} from './reactodia-app';
import {LanguageKey} from './i18n/language-key';
import {ReactodiaConfig} from './models/reactodia-config';
import {service} from './providers/service/service-inject';
import {DiagramStorageService} from './services/diagram-storage/diagram-storage.service';
import {resetColors} from './styles/type-style.resolver';

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
  @Prop() providerSettings?: Partial<SparqlDataProviderSettings>;

  /**
   * The theme currently applied by the host (e.g. `light`, `dark`). The value itself is never read -
   * the node colors are taken from the host's CSS custom properties - it only signals that those
   * values have changed. The host owns the theme, including whether it follows the OS color scheme,
   * so the change is passed in instead of being detected here.
   */
  @Prop() theme?: string;

  /**
   * Runtime toggle for the data provider's `acceptBlankNodes` flag, for testing blank node
   * support against a live endpoint. Internal, not part of the public API - in production the
   * host sets `acceptBlankNodes` through the {@link providerSettings} prop instead.
   *
   * TEMPORARY. Removing the checkbox means removing, in this file: this field, the
   * `blank-nodes-toggle` label in {@link render}, {@link onAcceptBlankNodesChange}, the
   * `acceptBlankNodes` override handed to `mountReactodia`, and the {@link graphContainer} /
   * {@link componentDidLoad} pair - the graph mounted straight into the host element before
   * the toggle needed a sibling. Then `.blank-nodes-toggle` in the stylesheet, and
   * `loadAcceptBlankNodes` / `saveAcceptBlankNodes` on {@link DiagramStorageService}.
   */
  @State() acceptBlankNodes = service(DiagramStorageService).loadAcceptBlankNodes();

  private reactRoot?: Root;
  private graphContainer?: HTMLElement;

  @Watch('currentRepository')
  @Watch('providerSettings')
  onProviderSettingsChange(): void {
    this.renderGraph();
  }

  @Watch('language')
  onLanguageChange(): void {
    // The translations are evaluated by the workspace at construction, so the only way
    // to re-translate the UI is to re-create the graph.
    this.renderGraph(true);
  }

  @Watch('theme')
  onThemeChange(): void {
    resetColors();
    this.renderGraph(true);
  }

  // The graph container is only available after the first render, so the initial mount happens here.
  componentDidLoad(): void {
    if (this.config) {
      this.renderGraph();
    }
  }

  disconnectedCallback(): void {
    if (this.reactRoot) {
      unmountReactodia(this.reactRoot);
      this.reactRoot = undefined;
    }
  }

  render() {
    return (
      <Host>
        <label class="blank-nodes-toggle">
          <input type="checkbox"
                 data-test="accept-blank-nodes"
                 checked={this.acceptBlankNodes}
                 onChange={(event) => this.onAcceptBlankNodesChange(event)}/>
          Accept blank nodes
        </label>
        <div class="reactodia-container" ref={(element) => this.graphContainer = element}></div>
      </Host>
    );
  }

  /**
   * The flag is read when the provider is constructed, so the toggle rebuilds the provider,
   * which resets the canvas. That is the same path the host takes when it changes
   * {@link providerSettings}.
   *
   * It is also persisted, so that a diagram restored from the local store is loaded by a
   * provider which can still resolve the blank nodes it holds.
   */
  private onAcceptBlankNodesChange(event: Event): void {
    this.acceptBlankNodes = (event.target as HTMLInputElement).checked;
    service(DiagramStorageService).saveAcceptBlankNodes(this.acceptBlankNodes);
    this.renderGraph();
  }

  private renderGraph(isReloading?: boolean): void {
    if (!this.currentRepository) {
      throw new Error('currentRepository is required');
    }

    if (!this.config?.queryFunction) {
      throw new Error('config.queryFunction is required');
    }

    if (!this.graphContainer) {
      return;
    }

    const props = {
      isReload: isReloading,
      currentRepository: this.currentRepository,
      config: this.config,
      language: this.language,
      // The toggle wins over the host setting, so it stays applied when the provider is rebuilt.
      providerSettings: {...this.providerSettings, acceptBlankNodes: this.acceptBlankNodes},
    };

    if (this.reactRoot && !isReloading) {
      void updateReactodia(props);
    } else {
      this.reactRoot = mountReactodia(this.graphContainer, props);
    }
  }
}
