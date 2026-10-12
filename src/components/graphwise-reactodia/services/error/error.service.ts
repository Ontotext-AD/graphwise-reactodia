import {Service} from '../../providers/service/service';
import {Subscription} from '../../models/subscription';
import {ErrorCallback} from '../../models/error/error-callback';
import {ErrorCause} from '../../models/error/error-cause';
import {ErrorCode} from '../../models/error/error-code';

/**
 * Service that collects the failures of the wrapper and the fork, so they can be announced to the host.
 */
@Service
export class ErrorService {
  static readonly ID = 'ErrorService';

  private static readonly ABORT_ERROR_NAME = 'AbortError';

  private callback?: ErrorCallback;
  private readonly reported = new WeakSet<object>();

  /**
   * Reports a failure to the host, unless it's an abort, or this exact error object is already reported
   * from another place.
   *
   * The same error object may be reported from different places. E.g. a query that fails while a diagram loads is
   * reported by the data provider decorator as `data-fetch`, and then reaches the `catch` around the load, which
   * reports it as `diagram-load`. Only the first one is announced.
   *
   * The `cause` is checked because the fork wraps whatever fails during a diagram import in a new error:
   *
   * ```ts
   * // reactodia-workspace/src/editor/dataDiagramModel.ts, importLayout
   * } catch (error) {
   *   throw new Error('Reactodia: failed to import a layout', {cause: error});
   * }
   * ```
   *
   * We need to check the cause to make sure we don't report the same error/abort more than once.
   *
   * @param code The category of the failure.
   * @param thrown The thrown value.
   */
  report(code: ErrorCode, thrown: unknown): void {
    const causes = this.causeChain(thrown);
    if (this.isAbortedOrAlreadyReported(causes)) {
      return;
    }
    causes.forEach((cause) => this.reported.add(cause));
    this.callback?.({code, error: thrown});
  }

  /**
   * Subscribes to the reported errors, replacing the previous subscriber.
   *
   * @param callback Called with every reported error.
   * @returns A {@link Subscription} that, when called, removes the callback, unless it has already been replaced.
   */
  subscribe(callback: ErrorCallback): Subscription {
    this.callback = callback;
    return () => {
      if (this.callback === callback) {
        this.callback = undefined;
      }
    };
  }

  /**
   * Whether any link of the given cause chain is an abort or is already reported.
   */
  private isAbortedOrAlreadyReported(causes: ErrorCause[]): boolean {
    return causes.some((cause) => cause.name === ErrorService.ABORT_ERROR_NAME || this.reported.has(cause));
  }

  /**
   * The thrown value followed by its `cause`, the cause of that, and so on, for as long as they are objects.
   */
  private causeChain(thrown: unknown): ErrorCause[] {
    const causes: ErrorCause[] = [];
    let current = thrown;
    while (typeof current === 'object' && current !== null && !causes.includes(current)) {
      causes.push(current);
      current = (current as ErrorCause).cause;
    }
    return causes;
  }
}
