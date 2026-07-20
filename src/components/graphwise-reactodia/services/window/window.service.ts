import {Service} from '../../providers/service/service';

/**
 * Service that provides access to browser window-related functionality.
 */
export class WindowService implements Service {
  getWindow(): Window {
    return window;
  }
}
