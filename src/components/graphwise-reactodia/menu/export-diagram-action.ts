import {createElement} from 'react';
import {ToolbarAction, useTranslation, useWorkspace} from '@reactodia/workspace';
import {service} from '../providers/service/service-inject';
import {DiagramFileService} from '../services/diagram-file/diagram-file.service';

/**
 * Exports the diagram as a JSON file.
 */
export function ExportDiagramAction() {
  const {model} = useWorkspace();
  const t = useTranslation();
  const diagramFileService = service(DiagramFileService);

  const exportDiagram = (): void => {
    const timestamp = new Date().toISOString().replace(/[-:]|\.\d+Z$/g, '');
    diagramFileService.download(model.exportLayout(), `diagram-${timestamp}${DiagramFileService.FILE_EXTENSION}`);
  };

  return createElement(
    ToolbarAction,
    // The same icon as ToolbarActionSave. We don't use that action, since it disables saving on refresh
    {className: 'reactodia-toolbar-action__save', title: t.text('graphwise_toolbar_action.export_json.title'), onSelect: exportDiagram},
    t.text('graphwise_toolbar_action.export_json.label')
  );
}
