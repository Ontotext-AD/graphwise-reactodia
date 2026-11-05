import {mergeWithDefaults} from './object-util';
import {MenuItem} from '../models/ui/menu-item';
import {NodeAction} from '../models/ui/node-action';
import {ToolbarDock} from '../models/ui/toolbar-dock';
import {UiConfig} from '../models/ui/ui-config';
import {DEFAULT_UI_CONFIG} from '../ui-config/default-ui-config';

describe('mergeWithDefaults', () => {
  test('should resolve an empty UI configuration to the default', () => {
    // When no UI configuration is passed
    const resolved = mergeWithDefaults({}, DEFAULT_UI_CONFIG);

    // Then every field has Reactodia's behaviour
    expect(resolved).toEqual({
      mainToolbar: {dock: ToolbarDock.NW},
      actionsToolbar: {dock: ToolbarDock.SW},
      menu: {
        items: [
          MenuItem.CLEAR_ALL, MenuItem.EXPORT_PNG, MenuItem.EXPORT_SVG, MenuItem.PRINT, MenuItem.EXPORT_JSON, MenuItem.IMPORT_JSON
        ]
      },
      nodeActions: [
        NodeAction.GROUP, NodeAction.REMOVE, NodeAction.EXPAND, NodeAction.OPEN_LINK, NodeAction.CONNECTIONS,
        NodeAction.ADD_TO_FILTER, NodeAction.ANNOTATE, NodeAction.ESTABLISH_LINK
      ]
    });
  });

  test('should merge a toolbar position over the default key by key', () => {
    // When only the actions toolbar offset is passed
    const resolved = mergeWithDefaults({actionsToolbar: {offsetY: 10}}, DEFAULT_UI_CONFIG);

    // Then the default dock is kept beside it, and the other fields stay default
    expect(resolved.actionsToolbar).toEqual({dock: ToolbarDock.SW, offsetY: 10});
    expect(resolved.mainToolbar).toEqual({dock: ToolbarDock.NW});
    expect(resolved.nodeActions).toHaveLength(8);
  });

  test('should replace a default list whole', () => {
    // When the node actions and an empty menu are passed
    const ui: UiConfig = {nodeActions: [NodeAction.REMOVE, NodeAction.GROUP], menu: {items: []}};
    const resolved = mergeWithDefaults(ui, DEFAULT_UI_CONFIG);

    // Then they replace the default lists, in the passed order
    expect(resolved.nodeActions).toEqual([NodeAction.REMOVE, NodeAction.GROUP]);
    expect(resolved.menu).toEqual({items: []});
  });

  test('should not share references with the default', () => {
    // When a merged list is changed
    mergeWithDefaults({}, DEFAULT_UI_CONFIG).nodeActions.push(NodeAction.REMOVE);

    // Then the default is unchanged
    expect(DEFAULT_UI_CONFIG.nodeActions).toHaveLength(8);
  });

  test('should keep the default for a null value', () => {
    // When fields are set to null
    const ui = {mainToolbar: {dock: null}, menu: null, nodeActions: null} as unknown as UiConfig;
    const resolved = mergeWithDefaults(ui, DEFAULT_UI_CONFIG);

    // Then they keep the default
    expect(resolved).toEqual(DEFAULT_UI_CONFIG);
  });
});
