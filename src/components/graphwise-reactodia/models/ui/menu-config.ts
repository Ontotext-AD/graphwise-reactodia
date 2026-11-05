import {MenuItem} from './menu-item';

/**
 * The workspace main menu.
 */
export interface MenuConfig {
  /** The menu entries, in order. An empty list hides the menu. */
  items?: MenuItem[];
}
