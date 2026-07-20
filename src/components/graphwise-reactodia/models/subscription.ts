/**
 * A subscription: calling it unsubscribes (removes the underlying listener).
 */
export type Subscription = () => void;
