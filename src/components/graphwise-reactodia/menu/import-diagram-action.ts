import {createElement} from 'react';
import {ToolbarActionOpen, useTranslation, useWorkspace} from '@reactodia/workspace';
import {service} from '../providers/service/service-inject';
import {DiagramService} from '../services/diagram/diagram.service';
import {DiagramFileService} from '../services/diagram-file/diagram-file.service';
import {ErrorService} from '../services/error/error.service';
import {ErrorCode} from '../models/error/error-code';

/**
 * Imports a diagram from a JSON file into the workspace.
 */
export function ImportDiagramAction() {
  const {model} = useWorkspace();
  const t = useTranslation();
  const diagramFileService = service(DiagramFileService);
  const diagramService = service(DiagramService);
  const errorService = service(ErrorService);

  const importDiagram = async (file: File): Promise<void> => {
    try {
      const diagram = await diagramFileService.read(file);
      await diagramService.importDiagram(model, model.dataProvider, diagram);
    } catch (error) {
      errorService.report(ErrorCode.DIAGRAM_IMPORT, error);
    }
  };

  return createElement(
    ToolbarActionOpen,
    {
      title: t.text('graphwise_toolbar_action.import_json.title'),
      fileAccept: DiagramFileService.FILE_EXTENSION,
      onSelect: (file: File) => void importDiagram(file)
    },
    t.text('graphwise_toolbar_action.import_json.label')
  );
}
