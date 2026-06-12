import {createElement} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {
  DefaultWorkspace,
  OwlRdfsSettings,
  SerializedDiagram,
  SparqlDataProvider,
  SparqlDataProviderSettings,
  SparqlQueryFunction,
  useLoadedWorkspace,
  Workspace,
  WorkspaceContext,
} from '@reactodia/workspace';
import {blockingDefaultLayout} from '@reactodia/workspace/layout-sync';
import {ReactodiaAppProps} from './models/reactodia-app-props';
import {TRANSLATIONS} from './i18n/translations';


/**
 * Reactodia ships English as its built-in default bundle, so English needs no override.
 * Other languages are layered on top as partial bundles; unknown codes fall back to English.
 *
 * Reactodia never re-reads the translations, so the component must be remounted
 * to switch the UI language (handled in `graphwise-reactodia.tsx`).
 */
function translationsForLanguage(language: string): readonly object[] {
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
function createDataProvider(
  currentRepository: string,
  queryFunction: SparqlQueryFunction,
  settings?: SparqlDataProviderSettings
): SparqlDataProvider {
  return new SparqlDataProvider({
    endpointUrl: currentRepository,
    queryMethod: 'POST',
    queryFunction,
  }, settings);
}

/**
 * The Reactodia workspace React component.
 *
 * Authored with `React.createElement` (no TSX) on purpose, since there are differences in stencil and react
 *
 * The canvas starts empty; the user populates it through the workspace search bar
 * (Reactodia's `DefaultWorkspace` unified search), which is backed by the SPARQL
 * data provider's lookup.
 */
function ReactodiaApp(props: ReactodiaAppProps) {
  const {currentRepository, queryFunction, language, initialDiagram, providerSettings} = props;

  const {onMount} = useLoadedWorkspace(async ({context, signal}) => {
    workspaceContext = context;
    const {model} = context;
    const dataProvider = createDataProvider(currentRepository, queryFunction, providerSettings);
    // A language change remounts this component to rebuild the workspace with the new
    // translation bundle; restoring the exported diagram keeps the user's canvas intact.
    // This is done because there is no existing mechanism to re-translate the UI at runtime (not for the UI labels at least)
    if (initialDiagram) {
      await model.importLayout({dataProvider, diagram: initialDiagram, signal});
    } else {
      await model.createNewDiagram({dataProvider, signal});
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
  const dataProvider = createDataProvider(props.currentRepository, props.queryFunction, props.providerSettings);
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
