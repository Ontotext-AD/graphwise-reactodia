// There is no SPARQL endpoint behind the dev server, so every query is answered with an empty
// result. The shape has to match what the provider asks for: SELECT/ASK queries are parsed with
// `response.json()` and would blow up on an empty body, CONSTRUCT/DESCRIBE queries are parsed as
// turtle, where an empty body is a valid (empty) graph.
async function stubQueryFunction(params) {
  const accept = params.headers?.['Accept'] ?? '';
  if (accept.includes('sparql-results+json')) {
    const body = JSON.stringify({head: {vars: []}, results: {bindings: []}, boolean: false});
    return new Response(body, {headers: {'Content-Type': 'application/sparql-results+json'}});
  }
  return new Response('', {headers: {'Content-Type': 'text/turtle'}});
}

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

// The host asks the component to drop its persisted diagram by dispatching a namespaced window
// event, rather than holding an element reference and calling a method on it.
function clearDiagramStorage() {
  window.dispatchEvent(new Event('graphwise-reactodia:clear-diagram-storage'));
}
