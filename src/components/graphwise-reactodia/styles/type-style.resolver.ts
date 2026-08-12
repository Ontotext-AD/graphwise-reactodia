import {TypeStyle, TypeStyleResolver} from '@reactodia/workspace';

const NODE_COLOR_VARIABLES = [
  '--gw-foreground-visual-diagram-categorical-01',
  '--gw-foreground-visual-diagram-categorical-02',
  '--gw-foreground-visual-diagram-categorical-03',
  '--gw-foreground-visual-diagram-categorical-04',
  '--gw-foreground-visual-diagram-categorical-05',
  '--gw-foreground-visual-diagram-categorical-06',
  '--gw-foreground-visual-diagram-categorical-07',
  '--gw-foreground-visual-diagram-categorical-08',
  '--gw-foreground-visual-diagram-categorical-09',
  '--gw-foreground-visual-diagram-categorical-10',
  '--gw-foreground-visual-diagram-categorical-11',
  '--gw-foreground-visual-diagram-categorical-12',
  '--gw-foreground-visual-diagram-categorical-13',
  '--gw-foreground-visual-diagram-categorical-14',
  '--gw-foreground-visual-diagram-categorical-15',
  '--gw-foreground-visual-diagram-categorical-16',
  '--gw-foreground-visual-diagram-categorical-17',
  '--gw-foreground-visual-diagram-categorical-18',
  '--gw-foreground-visual-diagram-categorical-19',
  '--gw-foreground-visual-diagram-categorical-20'
];

/**
 * Color slot assigned to each type, in the order the types are first seen.
 */
const typeToIndex = new Map<string, number>();

function getColor(variable: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
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

  const color = getColor(NODE_COLOR_VARIABLES[index % NODE_COLOR_VARIABLES.length]);
  return color ? {color} : undefined;
};

export const resetColors = () => {
  typeToIndex.clear();
};
