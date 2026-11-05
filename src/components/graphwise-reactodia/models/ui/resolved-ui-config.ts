import {MenuConfig} from './menu-config';
import {NodeAction} from './node-action';
import {ResolvedToolbarPosition} from './resolved-toolbar-position';

/**
 * The host's UI configuration merged over the default, with every field set.
 */
export interface ResolvedUiConfig {
  mainToolbar: ResolvedToolbarPosition;
  actionsToolbar: ResolvedToolbarPosition;
  menu: Required<MenuConfig>;
  nodeActions: NodeAction[];
}
