// Mock all responses as turtle, as we won't be making any SPARQL requests in the dev server.
async function stubQueryFunction(_params) {
  return (new Response('', {headers: {'Content-Type': 'text/turtle'}}));
}

// IRIs of the entities the host asks to pre-populate the canvas with on startup.
const SEED_NODES = ['http://example.com/alice', 'http://example.com/bob'];

// Pre-resolved edges (e.g. a CONSTRUCT result) the host asks to draw directly on the canvas,
// without querying the SPARQL endpoint for link data.
const SEED_GRAPH = [
  {
    source: 'http://example.com/alice',
    target: 'http://example.com/bob',
    predicates: ['knows'],
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
