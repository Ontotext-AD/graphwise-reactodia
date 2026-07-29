import {Service} from '../../providers/service/service';

/**
 * Service that provides access to browser window-related functionality.
 */
@Service
export class WindowService {
  static readonly ID = 'WindowService';

  getWindow(): Window {
    return window;
  }
}
