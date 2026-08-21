import type {SerializedDiagram} from '@reactodia/workspace';
import {Service} from '../../providers/service/service';
import {service} from '../../providers/service/service-inject';
import {WindowService} from '../window/window.service';

/**
 * Service for local store-related diagram operations
 */
@Service
export class DiagramStorageService {
  static readonly ID = 'DiagramStorageService';

  private static readonly STORAGE_KEY = 'diagram.state';

  private static readonly ACCEPT_BLANK_NODES_KEY = 'diagram.accept-blank-nodes';

  /**
   * Load the persisted diagram from the local store, or `undefined` when nothing is stored (or the stored value
   * is unreadable).
   */
  load(): SerializedDiagram | undefined {
    const raw = this.storage.getItem(DiagramStorageService.STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    return JSON.parse(raw) as SerializedDiagram;
  }

  /**
   * Persists the given diagram serialization.
   */
  save(diagram: SerializedDiagram): void {
    this.storage.setItem(DiagramStorageService.STORAGE_KEY, JSON.stringify(diagram));
  }

  /**
   * Removes the persisted diagram. Used when a new view (a seed) should take precedence over
   * previously saved edits.
   */
  clear(): void {
    this.storage.removeItem(DiagramStorageService.STORAGE_KEY);
  }

  /**
   * Reads back the blank node toggle, defaulting to `false` when nothing is stored.
   *
   * The flag has to survive a reload: a restored diagram can hold blank node elements, and
   * their IRIs can only be resolved while the data provider accepts blank nodes - the endpoint
   * knows nothing about them.
   *
   * TEMPORARY, remove together with the blank node checkbox in `graphwise-reactodia.tsx`.
   * Only the checkbox needs this. In production the flag arrives on the `providerSettings`
   * prop, which the host supplies on every mount, so there is nothing to persist.
   */
  loadAcceptBlankNodes(): boolean {
    return this.storage.getItem(DiagramStorageService.ACCEPT_BLANK_NODES_KEY) === 'true';
  }

  /**
   * Persists the blank node toggle.
   *
   * TEMPORARY, see {@link loadAcceptBlankNodes}.
   */
  saveAcceptBlankNodes(acceptBlankNodes: boolean): void {
    this.storage.setItem(DiagramStorageService.ACCEPT_BLANK_NODES_KEY, String(acceptBlankNodes));
  }

  /**
   * Local storage getter
   */
  private get storage(): Storage {
    return service(WindowService).getWindow().localStorage;
  }
}
