/**
 * A button shown around a selected node that acts on it.
 */
export enum NodeAction {
  /** Groups or ungroups the selected nodes. */
  GROUP = 'group',
  /** Removes the node from the diagram. */
  REMOVE = 'remove',
  /** Expands or collapses the node to show its properties. */
  EXPAND = 'expand',
  /** Opens the node IRI. */
  OPEN_LINK = 'open-link',
  /** Opens the menu to navigate to connected nodes. */
  CONNECTIONS = 'connections',
  /** Searches for nodes connected to this one. */
  ADD_TO_FILTER = 'add-to-filter',
  /** Adds an annotation to the node. */
  ANNOTATE = 'annotate',
  /** Draws a new link from the node; for an entity, only in authoring mode. */
  ESTABLISH_LINK = 'establish-link'
}
