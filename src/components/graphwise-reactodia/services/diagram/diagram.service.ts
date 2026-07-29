import type {DataDiagramModel, SerializedDiagram} from '@reactodia/workspace';
import {Service} from '../../providers/service/service';
import {Subscription} from '../../models/subscription';

/**
 * Callback invoked with the current diagram layout whenever it changes.
 */
export type DiagramChangeCallback = (diagram: SerializedDiagram) => void;

/**
 * Service for diagram related operations and subscriptions
 */
@Service
export class DiagramService {
  static readonly ID = 'DiagramService';

  private static readonly NOTIFY_DEBOUNCE_MS = 300;
  private static readonly HISTORY_CHANGED_EVENT = 'historyChanged';

  /**
   * Subscribes to diagram changes. On every debounced change the current layout is
   * exported and passed to the callback.
   * Debounce time for the callback trigger is needed, because certain events (like moving a node) can trigger
   * multiple `historyChanged` events in a short time.
   *
   * @param model The diagram model to observe.
   * @param onChangeCallback Called with the exported layout when the diagram changes.
   * @returns A {@link Subscription} that, when called, removes the listener and drops any
   * pending notification.
   */
  subscribeToDiagramChange(model: DataDiagramModel, onChangeCallback: DiagramChangeCallback): Subscription {
    let notifyTimer: ReturnType<typeof setTimeout> | undefined;

    const onHistoryChange = (): void => {
      if (notifyTimer) {
        clearTimeout(notifyTimer);
      }
      notifyTimer = setTimeout(() => {
        notifyTimer = undefined;
        onChangeCallback(model.exportLayout());
      }, DiagramService.NOTIFY_DEBOUNCE_MS);
    };

    model.history.events.on(DiagramService.HISTORY_CHANGED_EVENT, onHistoryChange);

    return () => {
      model.history.events.off(DiagramService.HISTORY_CHANGED_EVENT, onHistoryChange);
      if (notifyTimer) {
        clearTimeout(notifyTimer);
      }
    };
  }
}
