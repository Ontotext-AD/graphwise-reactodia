import type {SerializedDiagram} from '@reactodia/workspace';
import {Service} from '../../providers/service/service';
import {service} from '../../providers/service/service-inject';
import {WindowService} from '../window/window.service';

/**
 * Service for local store-related diagram operations
 */
export class DiagramStorageService implements Service {
  private static readonly STORAGE_KEY = 'diagram.state';

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
   * Local storage getter
   */
  private get storage(): Storage {
    return service(WindowService).getWindow().localStorage;
  }
}
