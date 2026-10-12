/**
 * A link in the `cause` chain of a thrown value: the value itself, its `cause`, the cause of that, and so on.
 * Anything can be thrown, so a link is not necessarily an `Error` and neither field is guaranteed.
 */
export interface ErrorCause {
  /** The error name, e.g. `AbortError`. */
  name?: unknown;
  /** The next link in the chain. */
  cause?: unknown;
}
