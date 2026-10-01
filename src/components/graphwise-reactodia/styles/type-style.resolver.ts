import {TypeStyle, TypeStyleResolver} from '@reactodia/workspace';

/**
 * Color slot assigned to each type, in the order the types are first seen.
 */
const typeToIndex = new Map<string, number>();

/**
 * Returns the internal property of the given palette slot, numbered from 1 and padded to two digits as in `_theme.scss`.
 */
function getTypeColorProperty(slot: number): string {
  return `--_graphwise-reactodia-type-color-${String(slot).padStart(2, '0')}`;
}

/**
 * Reads the type palette of the Theme API: the internal properties `_theme.scss` resolves from the ones
 * the host declares, in slot order up to the first empty one.
 */
function getPalette(): string[] {
  const host = document.querySelector('graphwise-reactodia');
  if (!host) {
    return [];
  }

  const style = getComputedStyle(host);
  const palette: string[] = [];
  let color = style.getPropertyValue(getTypeColorProperty(1)).trim();
  while (color) {
    palette.push(color);
    color = style.getPropertyValue(getTypeColorProperty(palette.length + 1)).trim();
  }
  return palette;
}

/**
 * Colors an element by its type: each type takes the next color from the palette, which wraps
 * around once it runs out
 *
 * Returns `undefined` for elements without a type (placeholders and other non-entity elements) and
 * when the host does not define the palette, leaving Reactodia to fall back to its own hash-based
 * colors.
 */
export const resolveTypeStyle: TypeStyleResolver = (types: readonly string[]): TypeStyle | undefined => {
  const type = types[0];
  if (!type) {
    return undefined;
  }

  let index = typeToIndex.get(type);
  if (index === undefined) {
    index = typeToIndex.size;
    typeToIndex.set(type, index);
  }

  const colors = getPalette();
  return colors.length ? {color: colors[index % colors.length]} : undefined;
};

export const resetColors = () => {
  typeToIndex.clear();
};
