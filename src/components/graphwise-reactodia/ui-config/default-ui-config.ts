import {MenuItem} from '../models/ui/menu-item';
import {NodeAction} from '../models/ui/node-action';
import {ResolvedUiConfig} from '../models/ui/resolved-ui-config';
import {ToolbarDock} from '../models/ui/toolbar-dock';

/**
 * The default UI configuration: Reactodia's behaviour, plus the diagram download and upload in the menu.
 */
export const DEFAULT_UI_CONFIG: ResolvedUiConfig = {
  mainToolbar: {dock: ToolbarDock.NW},
  actionsToolbar: {dock: ToolbarDock.SW},
  menu: {
    items: [
      MenuItem.CLEAR_ALL,
      MenuItem.EXPORT_PNG,
      MenuItem.EXPORT_SVG,
      MenuItem.PRINT,
      MenuItem.EXPORT_JSON,
      MenuItem.IMPORT_JSON
    ]
  },
  nodeActions: [
    NodeAction.GROUP,
    NodeAction.REMOVE,
    NodeAction.EXPAND,
    NodeAction.OPEN_LINK,
    NodeAction.CONNECTIONS,
    NodeAction.ADD_TO_FILTER,
    NodeAction.ANNOTATE,
    NodeAction.ESTABLISH_LINK
  ]
};
