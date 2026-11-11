/**
 * A service class injectable by the {@link ServiceProvider}. The class itself, not its `name`, keys the singleton
 * instance: minifiers can give different classes the same name.
 *
 * @template T the type of the service
 */
export type Service<T> = new () => T;
