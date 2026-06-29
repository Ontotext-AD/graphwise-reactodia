// Mock all responses as turtle, as we won't be making any SPARQL requests in the dev server.
async function stubQueryFunction(_params) {
  return (new Response('', {headers: {'Content-Type': 'text/turtle'}}));
}

// IRIs of the entities the host asks to pre-populate the canvas with on startup.
const SEED_NODES = ['http://example.com/alice', 'http://example.com/bob'];

const reactodia = document.querySelector('graphwise-reactodia');

function setQueryFunction() {
  reactodia.config = {...reactodia.config, queryFunction: stubQueryFunction};
}

function setSeed() {
  reactodia.config = {...reactodia.config, seedIris: SEED_NODES};
}

function setRepository(repository) {
  reactodia.currentRepository = repository;
}

function setLanguage(language) {
  reactodia.language = language;
}
