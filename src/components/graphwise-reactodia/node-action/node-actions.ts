import {createElement, Key, ReactElement} from 'react';
import {
  SelectionActionAddToFilter,
  SelectionActionAnchor,
  SelectionActionAnnotate,
  SelectionActionConnections,
  SelectionActionEstablishLink,
  SelectionActionExpand,
  SelectionActionGroup,
  SelectionActionRemove
} from '@reactodia/workspace';
import {NodeAction} from '../models/ui/node-action';

/**
 * Each node action at its position in the fork's default `Halo`.
 */
const NODE_ACTIONS: Record<NodeAction, (key: Key) => ReactElement> = {
  [NodeAction.GROUP]: (key) => createElement(SelectionActionGroup, {key, dock: 'nw', dockColumn: 1}),
  [NodeAction.REMOVE]: (key) => createElement(SelectionActionRemove, {key, dock: 'ne'}),
  [NodeAction.EXPAND]: (key) => createElement(SelectionActionExpand, {key, dock: 's'}),
  [NodeAction.OPEN_LINK]: (key) => createElement(SelectionActionAnchor, {key, dock: 'w'}),
  [NodeAction.CONNECTIONS]: (key) => createElement(SelectionActionConnections, {key, dock: 'e'}),
  [NodeAction.ADD_TO_FILTER]: (key) => createElement(SelectionActionAddToFilter, {key, dock: 'se'}),
  [NodeAction.ANNOTATE]: (key) => createElement(SelectionActionAnnotate, {key, dock: 'se', dockColumn: 1}),
  [NodeAction.ESTABLISH_LINK]: (key) => createElement(SelectionActionEstablishLink, {key, dock: 'sw'})
};

/**
 * The `Halo` children for the given node actions.
 */
export function createNodeActions(actions: NodeAction[]): ReactElement[] {
  return actions.map((action) => NODE_ACTIONS[action](action));
}
