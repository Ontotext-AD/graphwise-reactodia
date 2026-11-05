/**
 * Merges an object with default values. Ported from the GraphDB Workbench `ObjectUtil.mergeWithDefaults`.
 *
 * For each property in `defaults`, if the value in `object` is `null` or `undefined`, the default value is used instead.
 * Nested objects are merged recursively. Arrays and other non-plain values are treated as single values and are not
 * merged.
 *
 * The returned object is a new object and does not share references with the inputs. The inputs must be
 * structured-cloneable.
 *
 * @param object Source object whose values take precedence over defaults.
 * @param defaults Default values applied when properties are missing or null.
 * @returns A new object containing the merged result.
 */
export function mergeWithDefaults<T extends object>(object: object, defaults: T): T {
  const result = structuredClone(object) as Record<string, unknown>;
  Object.entries(defaults).forEach(([key, defaultValue]) => {
    const value = result[key];
    if (value === null || value === undefined) {
      result[key] = structuredClone(defaultValue);
    } else if (isPlainObject(value) && isPlainObject(defaultValue)) {
      result[key] = mergeWithDefaults(value, defaultValue);
    }
  });
  return result as T;
}

function isPlainObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
