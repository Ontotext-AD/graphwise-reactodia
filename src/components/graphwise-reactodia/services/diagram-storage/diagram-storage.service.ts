import type {SerializedDiagram} from '@reactodia/workspace';
import {Service} from '../../providers/service/service';
import {service} from '../../providers/service/service-inject';
import {WindowService} from '../window/window.service';
import {ErrorService} from '../error/error.service';
import {ErrorCode} from '../../models/error/error-code';

/**
 * Service for local store-related diagram operations
 */
@Service
export class DiagramStorageService {
  static readonly ID = 'DiagramStorageService';

  private static readonly STORAGE_KEY = 'diagram.state';

  private readonly errorService = service(ErrorService);

  /**
   * Load the persisted diagram from the local store, or `undefined` when nothing is stored (or the stored value
   * is unreadable).
   */
  load(): SerializedDiagram | undefined {
    try {
      const raw = this.storage.getItem(DiagramStorageService.STORAGE_KEY);
      if (!raw) {
        return undefined;
      }
      return JSON.parse(raw) as SerializedDiagram;
    } catch (error) {
      this.errorService.report(ErrorCode.LOCAL_DIAGRAM_READ, error);
      return undefined;
    }
  }

  /**
   * Persists the given diagram serialization.
   */
  save(diagram: SerializedDiagram): void {
    try {
      this.storage.setItem(DiagramStorageService.STORAGE_KEY, JSON.stringify(diagram));
    } catch (error) {
      this.errorService.report(ErrorCode.LOCAL_DIAGRAM_SAVE, error);
    }
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
