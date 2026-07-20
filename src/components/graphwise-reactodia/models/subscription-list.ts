import {Subscription} from './subscription';

/**
 * A collection of {@link Subscription}s that can be released together. Components collect the
 * subscriptions they open and call {@link unsubscribeAll} on teardown so nothing is left
 * listening.
 */
export class SubscriptionList {
  private items: Subscription[];

  constructor(subscriptions: Subscription[] = []) {
    this.items = subscriptions;
  }

  /**
   * Adds a subscription to the list.
   */
  add(subscription: Subscription): void {
    this.items.push(subscription);
  }

  /**
   * Adds multiple subscriptions to the list.
   */
  addAll(subscriptions: Subscription[]): void {
    this.items.push(...subscriptions);
  }

  /**
   * Removes a subscription from the list without unsubscribing it.
   */
  remove(subscription: Subscription): void {
    this.items = this.items.filter((sub) => sub !== subscription);
  }

  /**
   * Calls every subscription (unsubscribing it) and clears the list.
   */
  unsubscribeAll(): void {
    this.items.forEach((subscription) => subscription());
    this.items = [];
  }
}
