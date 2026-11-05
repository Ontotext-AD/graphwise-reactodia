import {SparqlQueryParams} from './sparql-query-params';

/**
 * HTTP transport for the SPARQL requests. The data provider passes it to the fork, so the compiler checks it against
 * the fork's `SparqlQueryFunction`.
 */
export type SparqlQueryFunction = (params: SparqlQueryParams) => Promise<Response>;
