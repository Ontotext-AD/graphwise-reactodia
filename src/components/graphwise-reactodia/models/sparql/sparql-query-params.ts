/**
 * The HTTP request a {@link SparqlQueryFunction} sends.
 */
export interface SparqlQueryParams {
  url: string;
  body?: string;
  headers: {[header: string]: string};
  method: string;
  signal?: AbortSignal;
}
