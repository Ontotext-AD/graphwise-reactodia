const EMPTY_SPARQL_RESULT = {
  head: {vars: []},
  results: {bindings: []},
};

function stubQueryFunction() {
  return Promise.resolve(
    new Response(JSON.stringify(EMPTY_SPARQL_RESULT), {
      status: 200,
      headers: {'Content-Type': 'application/sparql-results+json'},
    })
  );
}

const reactodia = document.querySelector('graphwise-reactodia');

function setQueryFunction() {
  reactodia.queryFunction = stubQueryFunction;
}

function setRepository(repository) {
  reactodia.currentRepository = repository;
}

function setLanguage(language) {
  reactodia.language = language;
}
