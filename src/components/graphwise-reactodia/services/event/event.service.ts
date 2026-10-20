import {Service} from '../../providers/service/service';
import {Subscription} from '../../models/subscription';
import {CLEAR_DIAGRAM_STORAGE_EVENT} from '../../models/clear-diagram-storage-event';
import {EventCallback} from '../../models/event/event-callback';
import {EventDetail} from '../../models/event/event-detail';
import {service} from '../../providers/service/service-inject';
import {WindowService} from '../window/window.service';

/**
 * Service for event based operations
 */
@Service
export class EventService {
  static readonly ID = 'EventService';

  private callback?: EventCallback;

  /**
   * Announces an event to the host.
   *
   * @param detail The event detail.
   */
  emit(detail: EventDetail): void {
    this.callback?.(detail);
  }

  /**
   * Subscribes to the emitted events, replacing the previous subscriber.
   *
   * @param callback Called with every emitted event.
   * @returns A {@link Subscription} that, when called, removes the callback, unless it has already been replaced.
   */
  subscribe(callback: EventCallback): Subscription {
    this.callback = callback;
    return () => {
      if (this.callback === callback) {
        this.callback = undefined;
      }
    };
  }

  /**
   * Subscribes to the host's "clear persisted diagram" command.
   *
   * @param onClear Called whenever the event fires.
   * @returns A {@link Subscription} that, when called, removes the listener.
   */
  subscribeToClearDiagramStorage(onClear: () => void): Subscription {
    const target = service(WindowService).getWindow();
    target.addEventListener(CLEAR_DIAGRAM_STORAGE_EVENT, onClear);
    return () => target.removeEventListener(CLEAR_DIAGRAM_STORAGE_EVENT, onClear);
  }
}
