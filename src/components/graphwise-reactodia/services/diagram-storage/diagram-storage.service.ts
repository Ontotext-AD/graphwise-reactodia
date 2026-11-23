import type {SerializedDiagram} from '@reactodia/workspace';
import {service} from '../../providers/service/service-inject';
import {WindowService} from '../window/window.service';
import {ErrorService} from '../error/error.service';
import {ErrorCode} from '../../models/error/error-code';

/**
 * Service for local store-related diagram operations. Only one diagram is kept per storage key.
 */
export class DiagramStorageService {
  /**
   * The storage key used when the host does not set one.
   */
  static readonly DEFAULT_STORAGE_KEY = 'diagram.state';

  private readonly errorService = service(ErrorService);

  /**
   * Loads the persisted diagram.
   *
   * @param storageKey The local storage key.
   * @returns The diagram, or `undefined` when nothing is stored or the value is unreadable.
   */
  load(storageKey: string): SerializedDiagram | undefined {
    try {
      const raw = this.storage.getItem(storageKey);
      return raw ? JSON.parse(raw) as SerializedDiagram : undefined;
    } catch (error) {
      this.errorService.report(ErrorCode.LOCAL_DIAGRAM_READ, error);
      return undefined;
    }
  }

  /**
   * Persists the diagram, replacing any stored diagram. A diagram without elements is removed instead, so the host
   * can tell from the key alone whether something is drawn. A failed write is reported.
   *
   * @param storageKey The local storage key.
   * @param diagram The serialized diagram.
   */
  save(storageKey: string, diagram: SerializedDiagram): void {
    if (!diagram.layoutData.elements.length) {
      this.clear(storageKey);
      return;
    }
    try {
      this.storage.setItem(storageKey, JSON.stringify(diagram));
    } catch (error) {
      this.errorService.report(ErrorCode.LOCAL_DIAGRAM_SAVE, error);
    }
  }

  /**
   * Removes the persisted diagram.
   *
   * @param storageKey The local storage key.
   */
  clear(storageKey: string): void {
    this.storage.removeItem(storageKey);
  }

  private get storage(): Storage {
    return service(WindowService).getWindow().localStorage;
  }
}
