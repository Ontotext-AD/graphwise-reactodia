import type {SerializedDiagram} from '@reactodia/workspace';
import {Service} from '../../providers/service/service';
import {service} from '../../providers/service/service-inject';
import {WindowService} from '../window/window.service';

/**
 * Service for downloading and uploading the diagram as a file. The file content is the same
 * {@link SerializedDiagram} that is persisted to the local store.
 */
@Service
export class DiagramFileService {
  static readonly ID = 'DiagramFileService';

  static readonly FILE_EXTENSION = '.json';

  private static readonly MIME_TYPE = 'application/json';

  /**
   * Downloads the given diagram serialization as a file with the given name.
   */
  download(diagram: SerializedDiagram, fileName: string): void {
    const window = service(WindowService).getWindow() as Window & typeof globalThis;
    const blob = new Blob([JSON.stringify(diagram)], {type: DiagramFileService.MIME_TYPE});
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Reads a diagram serialization from the given file.
   *
   * @throws Error when the file is not valid JSON or is not a serialized diagram.
   */
  async read(file: File): Promise<SerializedDiagram> {
    let diagram: unknown;
    try {
      diagram = JSON.parse(await file.text());
    } catch (error) {
      throw new Error(`File "${file.name}" is not valid JSON: ${(error as Error).message}`);
    }
    if (!this.isSerializedDiagram(diagram)) {
      throw new Error(`File "${file.name}" is not a serialized diagram`);
    }
    return diagram;
  }

  /**
   * Checks if the provided value is a serialized diagram
   */
  private isSerializedDiagram(value: unknown): value is SerializedDiagram {
    const diagram = value as SerializedDiagram;
    return diagram?.['@type'] === 'Diagram'
      && Array.isArray(diagram.layoutData?.elements)
      && Array.isArray(diagram.layoutData?.links);
  }
}
