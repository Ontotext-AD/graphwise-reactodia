// There is no SPARQL endpoint behind the dev server, so every query is answered with an empty
// result. The shape has to match what the provider asks for: SELECT/ASK queries are parsed with
// `response.json()` and would blow up on an empty body, CONSTRUCT/DESCRIBE queries are parsed as
// turtle, where an empty body is a valid (empty) graph.
//
// The queries are recorded, so the tests can tell which provider settings built them.
const sparqlQueries = [];
window.sparqlQueries = sparqlQueries;

async function stubQueryFunction(params) {
  sparqlQueries.push(params.body);
  const accept = params.headers?.['Accept'] ?? '';
  if (accept.includes('sparql-results+json')) {
    const body = JSON.stringify({head: {vars: []}, results: {bindings: []}, boolean: false});
    return new Response(body, {headers: {'Content-Type': 'application/sparql-results+json'}});
  }
  return new Response('', {headers: {'Content-Type': 'text/turtle'}});
}

// A transport that always fails, as an unreachable or misconfigured endpoint would.
async function failingQueryFunction() {
  throw new Error('Query failed');
}

// A transport that never answers. Once its request is cancelled it fails with an ordinary error, as a transport
// that does not throw an `AbortError` would. The pending and the cancelled requests are counted.
window.pendingQueries = 0;
window.cancelledQueries = 0;

function hangingQueryFunction(params) {
  window.pendingQueries++;
  return new Promise((_resolve, reject) => {
    params.signal?.addEventListener('abort', () => {
      window.pendingQueries--;
      window.cancelledQueries++;
      reject(new Error('Request cancelled'));
    });
  });
}

// The errors the component reports are recorded, so the tests can tell what the host was notified of.
const reportedErrors = [];
window.reportedErrors = reportedErrors;
// The listener is on the document, since the tests replace the element.
document.addEventListener('graphwiseReactodiaError', (event) => {
  reportedErrors.push({code: event.detail.code, message: event.detail.error.message});
});

const SEED_NODES = ['http://example.com/alice', 'http://example.com/bob'];

const SEED_GRAPH = [
  {
    source: 'http://example.com/alice',
    target: 'http://example.com/bob',
    rawPredicates: ['http://example.com/knows'],
  },
];

const reactodia = document.querySelector('graphwise-reactodia');

function setQueryFunction() {
  reactodia.config = {...reactodia.config, queryFunction: stubQueryFunction};
}

function setFailingQueryFunction() {
  reactodia.config = {...reactodia.config, queryFunction: failingQueryFunction};
}

function setHangingQueryFunction() {
  reactodia.config = {...reactodia.config, queryFunction: hangingQueryFunction};
}

// The wrapper has no default preset, so the host always passes one. The demo uses Reactodia's generic
// OWL/RDFS preset, copied into `owl-rdfs-settings.js`.
function setProviderSettings() {
  reactodia.providerSettings = OWL_RDFS_SETTINGS;
}

// A runtime change goes through the `providerSettings` prop. The extra prefix marks the queries built
// with the changed settings.
function changeProviderSettings() {
  reactodia.providerSettings = {
    ...OWL_RDFS_SETTINGS,
    defaultPrefix: `${OWL_RDFS_SETTINGS.defaultPrefix}\nPREFIX changed: <http://example.com/changed#>\n`,
  };
}

// Replaces the element with a new one the way a framework such as Angular renders it: attached first, then
// the props set one by one. The component code is already loaded by then, so the component is initialized
// before it has any of its props.
function attachThenSetProps(order) {
  const props = {
    config: {queryFunction: stubQueryFunction, seedIris: SEED_NODES},
    currentRepository: 'repo-a',
    providerSettings: OWL_RDFS_SETTINGS,
    language: 'fr',
    theme: 'light',
  };
  const element = document.createElement('graphwise-reactodia');
  element.dataset.test = 'reactodia';
  document.querySelector('graphwise-reactodia').replaceWith(element);
  order.forEach((prop) => {
    element[prop] = props[prop];
  });
}

function setSeed() {
  reactodia.config = {...reactodia.config, seedIris: SEED_NODES};
}

function setSeedGraph() {
  reactodia.config = {...reactodia.config, seedGraph: SEED_GRAPH};
}

function setRepository(repository) {
  reactodia.currentRepository = repository;
}

function setLanguage(language) {
  reactodia.language = language;
}

function setTheme(theme) {
  reactodia.theme = theme;
}

// The host asks the component to drop its persisted diagram by dispatching a namespaced window
// event, rather than holding an element reference and calling a method on it.
function clearDiagramStorage() {
  window.dispatchEvent(new Event('graphwise-reactodia:clear-diagram-storage'));
}
