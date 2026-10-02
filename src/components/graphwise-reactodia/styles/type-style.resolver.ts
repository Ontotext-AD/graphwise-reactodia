import {TypeStyle, TypeStyleResolver} from '@reactodia/workspace';

/**
 * The type palette of the Theme API: the internal properties `_theme.scss` resolves from the ones
 * the host declares.
 */
const TYPE_COLOR_PROPERTIES = [
  '--_graphwise-reactodia-type-color-01',
  '--_graphwise-reactodia-type-color-02',
  '--_graphwise-reactodia-type-color-03',
  '--_graphwise-reactodia-type-color-04',
  '--_graphwise-reactodia-type-color-05',
  '--_graphwise-reactodia-type-color-06',
  '--_graphwise-reactodia-type-color-07',
  '--_graphwise-reactodia-type-color-08',
  '--_graphwise-reactodia-type-color-09',
  '--_graphwise-reactodia-type-color-10',
  '--_graphwise-reactodia-type-color-11',
  '--_graphwise-reactodia-type-color-12',
  '--_graphwise-reactodia-type-color-13',
  '--_graphwise-reactodia-type-color-14',
  '--_graphwise-reactodia-type-color-15',
  '--_graphwise-reactodia-type-color-16',
  '--_graphwise-reactodia-type-color-17',
  '--_graphwise-reactodia-type-color-18',
  '--_graphwise-reactodia-type-color-19',
  '--_graphwise-reactodia-type-color-20'
];

/**
 * Color slot assigned to each type, in the order the types are first seen.
 */
const typeToIndex = new Map<string, number>();

function getColor(property: string) {
  const host = document.querySelector('graphwise-reactodia');
  return host ? getComputedStyle(host).getPropertyValue(property).trim() : undefined;
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

  const color = getColor(TYPE_COLOR_PROPERTIES[index % TYPE_COLOR_PROPERTIES.length]);
  return color ? {color} : undefined;
};

export const resetColors = () => {
  typeToIndex.clear();
};
