import {createElement, Fragment} from 'react';
import {DefaultWorkspaceProps} from '@reactodia/workspace';
import {UiConfig} from '../models/ui/ui-config';
import {ResolvedToolbarPosition} from '../models/ui/resolved-toolbar-position';
import {ToolbarDock} from '../models/ui/toolbar-dock';
import {MenuItem} from '../models/ui/menu-item';
import {NodeAction} from '../models/ui/node-action';
import {ErrorCode} from '../models/error/error-code';
import {service} from '../providers/service/service-inject';
import {ErrorService} from '../services/error/error.service';
import {mergeWithDefaults} from '../utils/object-util';
import {DEFAULT_UI_CONFIG} from './default-ui-config';
import {createMenuItems} from '../menu/graphwise-menu';
import {createNodeActions} from '../node-action/node-actions';

/**
 * The `DefaultWorkspace` props the UI configuration sets.
 */
export type UiConfigProps = Pick<DefaultWorkspaceProps, 'menu' | 'mainToolbar' | 'actionsToolbar' | 'halo'>;

const errorService = service(ErrorService);

/**
 * Merges the host's UI configuration over the default and maps the result to `DefaultWorkspace` props. A `null` or
 * missing field keeps the default; objects merge key by key and lists replace the default whole. Unknown values are
 * reported and left out; a repeated list entry is kept once.
 *
 * @param ui The host's UI configuration.
 */
export function toWorkspaceProps(ui: UiConfig | undefined): UiConfigProps {
  const resolved = mergeWithDefaults(ui ?? {}, DEFAULT_UI_CONFIG);
  const menuItems = [...new Set(resolved.menu.items)].filter((item) => isValid(item, MenuItem));
  const nodeActions = [...new Set(resolved.nodeActions)].filter((action) => isValid(action, NodeAction));
  return {
    menu: menuItems.length ? createElement(Fragment, null, createMenuItems(menuItems)) : null,
    mainToolbar: toToolbarProps(resolved.mainToolbar, DEFAULT_UI_CONFIG.mainToolbar),
    actionsToolbar: toToolbarProps(resolved.actionsToolbar, DEFAULT_UI_CONFIG.actionsToolbar),
    halo: {children: createNodeActions(nodeActions)}
  };
}

/**
 * Maps a toolbar position to the `DefaultWorkspace` toolbar props. With an unknown dock, `defaultPosition` is used
 * whole, since the offsets are relative to the dock.
 */
function toToolbarProps(position: ResolvedToolbarPosition, defaultPosition: ResolvedToolbarPosition): DefaultWorkspaceProps['mainToolbar'] {
  const {dock, offsetX, offsetY} = isValid(position.dock, ToolbarDock) ? position : defaultPosition;
  return {dock, dockOffsetX: offsetX, dockOffsetY: offsetY};
}

/**
 * Whether `value` is one of the `known` values. Reports it as unknown UI configuration when it is not.
 *
 * @param value The value from the UI configuration.
 * @param known The known values, e.g. an enum.
 */
function isValid<T extends string>(value: T, known: Record<string, T>): boolean {
  const isValid = Object.values(known).includes(value);
  if (!isValid) {
    errorService.report(ErrorCode.UNKNOWN_UI_CONFIG, new Error(`Unknown UI configuration value: "${value}"`));
  }
  return isValid;
}
