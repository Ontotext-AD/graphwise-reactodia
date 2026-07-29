import {ServiceProvider} from './service.provider';
import {Service} from './service';

/**
 * Injects the singleton instance of the given service class from the {@link ServiceProvider}.
 *
 * @param serviceClass The class of the service to inject.
 * @returns The shared instance of the specified service class.
 * @template T The type of the service to inject.
 * @example
 * ```typescript
 * const diagramStateService = service(DiagramStateService);
 * ```
 */
export function service<T>(serviceClass: Service<T>): T {
  return ServiceProvider.get(serviceClass);
}
