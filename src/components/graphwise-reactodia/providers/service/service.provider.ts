import {Service} from './service';

/**
 * Provider for all {@link Service} instances. Services are singletons: there is only one
 * instance of each service, created on demand and cached here so every consumer shares it.
 */
export class ServiceProvider {
  private static readonly SERVICE_INSTANCES = new Map<string, Service>();

  /**
   * Returns the instance of the given service type, creating and caching it on first request.
   *
   * @param type The service type to retrieve.
   * @returns The shared instance of the service.
   * @template T The type of the service to retrieve.
   */
  static get<T extends Service>(type: {new (): T}): T {
    if (!ServiceProvider.SERVICE_INSTANCES.has(type.name)) {
      ServiceProvider.SERVICE_INSTANCES.set(type.name, new type());
    }
    return ServiceProvider.SERVICE_INSTANCES.get(type.name) as T;
  }
}
