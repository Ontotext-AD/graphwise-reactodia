/**
 * Minimal in-memory {@link Storage}, so services that read `localStorage` can be exercised
 * without a real browser store and asserted against directly. Shared across test suites.
 */
export class StorageMock implements Storage {
  private readonly store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/**
 * Creates a fresh {@link StorageMock}. Suites install the returned instance as the global
 * `localStorage` themselves.
 */
export function createStorageMock(): StorageMock {
  return new StorageMock();
}
