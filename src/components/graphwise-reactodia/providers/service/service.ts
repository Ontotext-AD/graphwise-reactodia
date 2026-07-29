/**
 * Interface for injectable services by the service provider. Each service needs to have a static unique ID, which
 * is used by the {@link ServiceProvider} to cache and retrieve the singleton instance of the service. Unique IDs ensure
 * correct working of the service provider, when the services are minified
 *
 * @template T the type of the service
 */
export interface Service<T> {
  // unique id of the service
  readonly ID: string;
  // force classes only and allow instance creation. This means ID should be a static member of the class
  new(): T;
}

/**
 * Decorator for a service class.
 * It receives the class and simply type checks it with the {@link Service} interface.
 * Works as a contract, which enforces the service class to have a static ID member.
 * We can't simply implement the interface, since this will enforce the ID to be an instance member, which is not what we want.
 *
 * @param _serviceClass The decorated service class, checked for its ID and discarded.
 * @template T The type of the service instance.
 * @example
 * ```TypeScript
 * @Service
 * export class WindowService {
 *   static readonly ID = 'WindowService';
 * }
 * ```
 */
export function Service<T>(_serviceClass: Service<T>): void {
  // no implementation needed. We only use the type checking of the parameter
}
