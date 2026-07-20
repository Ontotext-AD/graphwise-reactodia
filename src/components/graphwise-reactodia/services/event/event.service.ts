import {Service} from '../../providers/service/service';
import {Subscription} from '../../models/subscription';
import {CLEAR_DIAGRAM_STORAGE_EVENT} from '../../models/clear-diagram-storage-event';
import {service} from '../../providers/service/service-inject';
import {WindowService} from '../window/window.service';

/**
 * Service for event based operations
 */
export class EventService implements Service {
  /**
   * Subscribes to the host's "clear persisted diagram" command.
   *
   * @param onClear Called whenever the event fires.
   * @returns A {@link Subscription} that, when called, removes the listener.
   */
  subscribeToClearDiagramStorage(onClear: () => void): Subscription {
    const target = service(WindowService).getWindow();
    if (!target) {
      return () => undefined;
    }
    target.addEventListener(CLEAR_DIAGRAM_STORAGE_EVENT, onClear);
    return () => target.removeEventListener(CLEAR_DIAGRAM_STORAGE_EVENT, onClear);
  }
}
