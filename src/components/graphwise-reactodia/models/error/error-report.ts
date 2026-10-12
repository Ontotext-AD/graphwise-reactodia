import {ErrorCode} from './error-code';

/**
 * Name of the DOM event the `graphwise-reactodia` element dispatches for every reported error.
 */
export const GRAPHWISE_REACTODIA_ERROR_EVENT = 'graphwiseReactodiaError';

/**
 * A failure the wrapper announces to the host.
 */
export interface ErrorReport {
  code: ErrorCode;
  /**
   * The thrown value, passed on unchanged. The wrapper and the fork throw `Error`s with an untranslated `message`, but
   * a failure of the host's `config.queryFunction` arrives as whatever it rejected with (e.g. an HTTP error response),
   * so narrow it before use.
   */
  error: unknown;
}
