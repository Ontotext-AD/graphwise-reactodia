import {Service} from './service';

/**
 * Provider for all {@link Service} instances. Services are singletons: there is only one
 * instance of each service, created on demand and cached here so every consumer shares it.
 */
export class ServiceProvider {
  private static readonly SERVICE_INSTANCES = new Map<string, unknown>();

  /**
   * Returns the instance of the given service type, creating and caching it on first request.
   *
   * @param serviceClass The service type to retrieve.
   * @returns The shared instance of the service.
   * @template T The type of the service to retrieve.
   */
  static get<T>(serviceClass: Service<T>): T {
    if (!ServiceProvider.SERVICE_INSTANCES.has(serviceClass.ID)) {
      ServiceProvider.SERVICE_INSTANCES.set(serviceClass.ID, new serviceClass());
    }
    return ServiceProvider.SERVICE_INSTANCES.get(serviceClass.ID) as T;
  }
}
