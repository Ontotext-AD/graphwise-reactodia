import {createElement} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {
  DefaultWorkspace,
  OwlRdfsSettings,
  SerializedDiagram,
  SparqlDataProvider,
  useLoadedWorkspace,
  Workspace,
  WorkspaceContext,
} from '@reactodia/workspace';
import {blockingDefaultLayout} from '@reactodia/workspace/layout-sync';
import {ReactodiaAppProps} from './models/reactodia-app-props';
import {ReactodiaSeedLink} from './models/reactodia-seed-link';
import {TRANSLATIONS} from './i18n/translations';
import {LanguageKey} from './i18n/language-key';


/**
 * Reactodia ships English as its built-in default bundle, so English needs no override.
 * Other languages are layered on top as partial bundles; unknown codes fall back to English.
 *
 * Reactodia never re-reads the translations, so the component must be remounted
 * to switch the UI language (handled in `graphwise-reactodia.tsx`).
 */
function translationsForLanguage(language: LanguageKey): readonly object[] {
  const translation = TRANSLATIONS[language]
  return translation ? [translation] : [];
 }

/**
 * The workspace context captured from the Workspace `ref` once it mounts.
 * Used to drive the diagram imperatively from {@link updateReactodia}, which
 * runs outside React and therefore cannot call the `useWorkspace` hook.
 */
let workspaceContext: WorkspaceContext | null = null;

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
    queryFunction: config.queryFunction,
  }, providerSettings);
}

/**
 * Places the seed entities on the canvas. Each IRI is added as a placeholder element, and data is then loaded for the
 * respective nodes using the {@link DataDiagramModel.requestData} method.
 */
async function seedCanvas(context: WorkspaceContext, seed: string[], signal: AbortSignal): Promise<void> {
  const {model, performLayout} = context;
  for (const iri of seed) {
    model.createElement(iri);
  }
  await model.requestData();
  await performLayout({signal});
}

/**
 * Places a pre-resolved graph (e.g. a CONSTRUCT query result) on the canvas. The relationships
 * are computed and not persisted in the repository, so the edges are drawn directly from the
 * supplied data instead of being fetched. The node IRIs do exist in the repository, so only
 * their display data is hydrated via {@link DataDiagramModel.requestElementData}.
 *
 * Note we use `requestElementData` rather than `requestData`: the latter would also query the
 * provider for *all* persisted links between the seeded nodes, over-fetching beyond the
 * CONSTRUCT's selection. Hydrating elements alone keeps the canvas to exactly the supplied
 * edges, while further expansion continues lazily against the SPARQL provider.
 */
async function seedGraphCanvas(
  context: WorkspaceContext,
  links: readonly ReactodiaSeedLink[],
  signal: AbortSignal,
): Promise<void> {
  const {model, performLayout} = context;
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

  // Request data only for elements.
  // Link data is not available in the DB, since we are displaying construct/describe queries
  await model.requestElementData(Array.from(uniqueIris));
  await performLayout({signal});
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
  const {language, initialDiagram, config} = props;

  const {onMount} = useLoadedWorkspace(async ({context, signal}) => {
    workspaceContext = context;
    const {model} = context;
    const dataProvider = createDataProvider(props);
    // A language change remounts this component to rebuild the workspace with the new
    // translation bundle; restoring the exported diagram keeps the user's canvas intact.
    // This is done because there is no existing mechanism to re-translate the UI at runtime (not for the UI labels at least)
    if (initialDiagram) {
      await model.importLayout({dataProvider, diagram: initialDiagram, signal});
    } else {
      await model.createNewDiagram({dataProvider, signal});
      if (config.seedGraph?.length) {
        await seedGraphCanvas(context, config.seedGraph, signal);
      } else if (config.seedIris?.length) {
        await seedCanvas(context, config.seedIris, signal);
      }
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
  root.unmount();
}
