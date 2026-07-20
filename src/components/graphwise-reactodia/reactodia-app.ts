import {createElement} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {
  DataDiagramModel,
  DataProvider,
  DefaultWorkspace,
  OwlRdfsSettings,
  SerializedDiagram,
  SparqlDataProvider,
  useLoadedWorkspace,
  Workspace,
  WorkspaceContext
} from '@reactodia/workspace';
import {blockingDefaultLayout} from '@reactodia/workspace/layout-sync';
import {ReactodiaAppProps} from './models/reactodia-app-props';
import {Triple} from './models/triple';
import {TRANSLATIONS} from './i18n/translations';
import {LanguageKey} from './i18n/language-key';
import {service} from './providers/service/service-inject';
import {DiagramService} from './services/diagram/diagram.service';
import {DiagramStorageService} from './services/diagram-storage/diagram-storage.service';
import {EventService} from './services/event/event.service';
import {SubscriptionList} from './models/subscription-list';

/**
 * Reactodia ships English as its built-in default bundle, so English needs no override.
 * Other languages are layered on top as partial bundles; unknown codes fall back to English.
 *
 * Reactodia never re-reads the translations, so the component must be remounted
 * to switch the UI language (handled in `graphwise-reactodia.tsx`).
 */
function translationsForLanguage(language: LanguageKey): readonly object[] {
  const translation = TRANSLATIONS[language];
  return translation ? [translation] : [];
}

/**
 * The workspace context captured from the Workspace `ref` once it mounts.
 * Used to drive the diagram imperatively from {@link updateReactodia}, which
 * runs outside React and therefore cannot call the `useWorkspace` hook.
 */
let workspaceContext: WorkspaceContext | null = null;

/**
 * Active listeners that persist diagram edits to local storage. Populated when the workspace
 * mounts and released in {@link unmountReactodia}, so persistence follows the same lifecycle as
 * the React root.
 */
const subscriptions = new SubscriptionList();

/**
 * Builds a Reactodia {@link SparqlDataProvider} for the given endpoint using the supplied
 * query preset. The host owns the query configuration and passes it in via props; when none
 * is provided we fall back to Reactodia's generic {@link OwlRdfsSettings} OWL/RDFS preset.
 */
function createDataProvider(props: ReactodiaAppProps): SparqlDataProvider {
  const {currentRepository, config, providerSettings} = props;
  return new SparqlDataProvider({
    endpointUrl: currentRepository,
    queryMethod: 'POST',
    queryFunction: config.queryFunction
  }, providerSettings);
}

/**
 * Places the seed entities on the canvas. Each IRI is added as a placeholder element, and data is then loaded for the
 * respective nodes using the {@link DataDiagramModel.requestData} method.
 */
async function seedIrisToCanvas(context: WorkspaceContext, dataProvider: DataProvider, seed: string[], signal: AbortSignal): Promise<void> {
  const {model, performLayout} = context;
  await model.createNewDiagram({dataProvider, signal});
  for (const iri of seed) {
    model.createElement(iri);
  }
  await model.requestData();
  await performLayout({signal});
}

/**
 * Places a pre-resolved graph (e.g. a CONSTRUCT query result) on the canvas. The difference between this and
 * {@link seedIrisToCanvas} is that this method does not request link data from the SPARQL endpoint, since describe/construct
 * queries are not persisted in the DB. Here we expect provided links and query for element data only
 */
async function seedGraphToCanvas(context: WorkspaceContext, dataProvider: DataProvider, links: readonly Triple[], signal: AbortSignal): Promise<void> {
  const {model, performLayout} = context;
  await model.createNewDiagram({dataProvider, signal});
  const uniqueIris = new Set<string>();

  links.forEach((link) => {
    uniqueIris.add(link.source);
    uniqueIris.add(link.target);
    // this is a createOrGet, regardless of the name, so we don't need to worry about duplicates.
    model.createElement(link.source);
    model.createElement(link.target);

    link.rawPredicates?.forEach((predicate) => {
      model.createLinks({
        linkTypeId: predicate,
        sourceId: link.source,
        targetId: link.target,
        properties: {}
      });
    });
  });

  await model.requestElementData(Array.from(uniqueIris));
  await performLayout({signal});
}

/**
 * Subscribes to the model's changes so diagram edits are persisted to local storage. The
 * subscription is tracked in {@link subscriptions} so it is released together with the React
 * root in {@link unmountReactodia}.
 */
function onDiagramChange(model: DataDiagramModel): void {
  const storage = service(DiagramStorageService);
  const diagramService = service(DiagramService);
  subscriptions.add(
    diagramService.subscribeToDiagramChange(model, (diagram) => storage.save(diagram))
  );
}

/**
 * Subscribes to the host's "clear persisted diagram" command so the saved layout is dropped on
 * request (e.g. before a fresh seed should take precedence over previously saved edits). The
 * subscription is tracked in {@link subscriptions} so it is released together with the React
 * root in {@link unmountReactodia}.
 */
function onClearDiagramStorage(): void {
  const storage = service(DiagramStorageService);
  const eventService = service(EventService);
  subscriptions.add(
    eventService.subscribeToClearDiagramStorage(() => storage.clear())
  );
}

/**
 * The Reactodia workspace React component.
 *
 * Authored with `React.createElement` (no TSX) on purpose, since there are differences in stencil and react
 *
 * Without a seed the canvas starts empty and the user populates it through the workspace
 * search bar (Reactodia's `DefaultWorkspace` unified search), backed by the SPARQL data
 * provider's lookup. With a seed, the seeded nodes are placed on the canvas on startup.
 */
function ReactodiaApp(props: ReactodiaAppProps) {
  const {language, config} = props;
  const currentDiagram = props.isReload ? exportReactodiaLayout() : undefined

  const {onMount} = useLoadedWorkspace(async ({context, signal}) => {
    workspaceContext = context;
    const {model} = context;
    onDiagramChange(model);
    onClearDiagramStorage();
    const dataProvider = createDataProvider(props);
    const isReload = props.isReload;
    const savedDiagram = service(DiagramStorageService).load();

    if (isReload) {
      // Simply reload without using the current state. This may happen when the user switches the language at runtime.
      // since there is no existing mechanism to re-translate the UI at runtime (not for the UI labels at least)
      await model.importLayout({dataProvider, diagram: currentDiagram, signal});
    } else if (config.seedIris?.length) {
      await seedIrisToCanvas(context, dataProvider, config.seedIris, signal);
    } else if (config.seedGraph?.length) {
      await seedGraphToCanvas(context, dataProvider, config.seedGraph, signal);
    } else {
      // Restore the previously saved layout when present, otherwise start empty. Either way this binds the
      // data provider (savedDiagram is undefined -> empty diagram), so the unified search/lookup works.
      await model.importLayout({dataProvider, diagram: savedDiagram, signal});
    }
  }, [language]);

  /**
   * From the documentation
   *
   * return (
   *     <Reactodia.Workspace ref={onMount}
   *       defaultLayout={defaultLayout}>
   *       <Reactodia.DefaultWorkspace />
   *     </Reactodia.Workspace>
   *   );
   */
  return createElement(
    Workspace,
    {
      ref: onMount,
      defaultLayout: blockingDefaultLayout,
      defaultLanguage: language,
      translations: translationsForLanguage(language)
    } as never,
    createElement(DefaultWorkspace, {})
  );
}

/**
 * Mounts the Reactodia application into the given container and returns the React root.
 */
export function mountReactodia(container: HTMLElement, props: ReactodiaAppProps): Root {
  const root = createRoot(container);
  root.render(createElement(ReactodiaApp, props));
  return root;
}

/**
 * Re-points the diagram at a new SPARQL endpoint or query preset by recreating it with a
 * fresh data provider. The canvas is reset to empty, matching the initial mount.
 */
export async function updateReactodia(props: ReactodiaAppProps): Promise<void> {
  if (!workspaceContext) {
    return;
  }
  const {model} = workspaceContext;
  const dataProvider = createDataProvider(props);
  await model.createNewDiagram({dataProvider});
}

/**
 * Serializes the current diagram so it can be restored after a remount (e.g. when a
 * language change rebuilds the workspace). Returns `undefined` if nothing is mounted yet.
 */
export function exportReactodiaLayout(): SerializedDiagram | undefined {
  return workspaceContext?.model.exportLayout();
}

/**
 * Unmounts the Reactodia application.
 */
export function unmountReactodia(root: Root): void {
  subscriptions.unsubscribeAll();
  root.unmount();
}
