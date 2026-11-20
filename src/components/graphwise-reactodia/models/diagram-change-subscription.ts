import {Subscription} from './subscription';

/**
 * A {@link Subscription} to diagram changes, which can also deliver a pending change at once.
 */
export interface DiagramChangeSubscription extends Subscription {
  /**
   * Notifies a change that is still waiting for the debounce window at once. Does nothing when no change is pending.
   */
  flush(): void;
}
