import type {DataDiagramModel, DataProvider, SerializedDiagram} from '@reactodia/workspace';
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
   * Replaces the diagram content with the given serialization. Element data is requested from the data provider and
   * the links between the imported elements are validated against it.
   *
   * @param model The diagram model to import into.
   * @param dataProvider The data provider to bind to the diagram.
   * @param diagram The serialization to import. When `undefined`, the diagram is cleared.
   * @param signal Optional signal to abort the import.
   */
  importDiagram(model: DataDiagramModel, dataProvider: DataProvider, diagram: SerializedDiagram | undefined, signal?: AbortSignal): Promise<void> {
    // selection is not cleared on import, so we clear it manually to avoid painting the previous selection
    model.setSelection([]);
    return model.importLayout({dataProvider, diagram, signal, validateLinks: true});
  }

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
        if (notifyTimer) {
          onChangeCallback(model.exportLayout());
        }
        notifyTimer = undefined;
      }, DiagramService.NOTIFY_DEBOUNCE_MS);
    };

    model.history.events.on(DiagramService.HISTORY_CHANGED_EVENT, onHistoryChange);

    return () => {
      model.history.events.off(DiagramService.HISTORY_CHANGED_EVENT, onHistoryChange);
      if (notifyTimer) {
        clearTimeout(notifyTimer);
        notifyTimer = undefined;
      }
    };
  }
}
