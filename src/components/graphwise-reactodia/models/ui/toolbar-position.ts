import {ToolbarDock} from './toolbar-dock';

/**
 * Where a toolbar is placed on the canvas.
 */
export interface ToolbarPosition {
  dock?: ToolbarDock;
  /** Horizontal offset from the dock, in pixels. */
  offsetX?: number;
  /** Vertical offset from the dock, in pixels. */
  offsetY?: number;
}
