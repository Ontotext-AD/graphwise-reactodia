import {MenuConfig} from './menu-config';
import {NodeAction} from './node-action';
import {ToolbarPosition} from './toolbar-position';

/**
 * The UI configuration a host passes. It is partial and merged over the default UI configuration: objects are merged
 * key by key, lists replace the default whole.
 */
export interface UiConfig {
  /** The toolbar with the menu and the search. */
  mainToolbar?: ToolbarPosition;
  /** The toolbar with undo, redo and layout. */
  actionsToolbar?: ToolbarPosition;
  /** The main menu in the main toolbar. */
  menu?: MenuConfig;
  /** The actions shown around a selected node. */
  nodeActions?: NodeAction[];
}
