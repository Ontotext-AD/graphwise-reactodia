import {ToolbarDock} from './toolbar-dock';
import {ToolbarPosition} from './toolbar-position';

/**
 * A toolbar position with its dock set.
 */
export interface ResolvedToolbarPosition extends ToolbarPosition {
  dock: ToolbarDock;
}
