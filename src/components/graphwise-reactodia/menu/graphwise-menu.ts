import {createElement, Key, ReactElement} from 'react';
import {ToolbarActionClearAll, ToolbarActionExport} from '@reactodia/workspace';
import {MenuItem} from '../models/ui/menu-item';
import {ExportDiagramAction} from './export-diagram-action';
import {ImportDiagramAction} from './import-diagram-action';

/**
 * Each menu entry.
 *
 * Passing a `menu` to the `DefaultWorkspace` replaces its default actions, so they are listed here again.
 */
const MENU_ITEMS: Record<MenuItem, (key: Key) => ReactElement> = {
  [MenuItem.CLEAR_ALL]: (key) => createElement(ToolbarActionClearAll, {key}),
  [MenuItem.EXPORT_PNG]: (key) => createElement(ToolbarActionExport, {key, kind: 'exportRaster'}),
  [MenuItem.EXPORT_SVG]: (key) => createElement(ToolbarActionExport, {key, kind: 'exportSvg'}),
  [MenuItem.PRINT]: (key) => createElement(ToolbarActionExport, {key, kind: 'print'}),
  [MenuItem.EXPORT_JSON]: (key) => createElement(ExportDiagramAction, {key}),
  [MenuItem.IMPORT_JSON]: (key) => createElement(ImportDiagramAction, {key})
};

/**
 * The menu entries for the given menu items.
 */
export function createMenuItems(items: MenuItem[]): ReactElement[] {
  return items.map((item) => MENU_ITEMS[item](item));
}
