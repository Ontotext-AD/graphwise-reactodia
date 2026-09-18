import {createElement, Fragment} from 'react';
import {
  ToolbarAction,
  ToolbarActionClearAll,
  ToolbarActionExport,
  ToolbarActionOpen,
  useTranslation,
  useWorkspace
} from '@reactodia/workspace';
import {service} from '../providers/service/service-inject';
import {DiagramService} from '../services/diagram/diagram.service';
import {DiagramFileService} from '../services/diagram-file/diagram-file.service';

/**
 * The workspace main menu: Reactodia's default actions, followed by the diagram download and upload.
 *
 * Passing a `menu` to the `DefaultWorkspace` replaces its default actions, so they are listed here again.
 * Rendered inside the workspace, so the actions can use the workspace hooks.
 */
export function GraphwiseMenu() {
  const {model} = useWorkspace();
  const t = useTranslation();
  const diagramFileService = service(DiagramFileService);
  const diagramService = service(DiagramService);

  const downloadDiagram = (): void => {
    const timestamp = new Date().toISOString().replace(/[-:]|\.\d+Z$/g, '');
    diagramFileService.download(model.exportLayout(), `diagram-${timestamp}${DiagramFileService.FILE_EXTENSION}`);
  };

  const uploadDiagram = async (file: File): Promise<void> => {
    try {
      const diagram = await diagramFileService.read(file);
      await diagramService.importDiagram(model, model.dataProvider, diagram);
    } catch (error) {
      console.error('Failed to upload the diagram', error);
    }
  };

  return createElement(
    Fragment,
    null,
    createElement(ToolbarActionClearAll, {}),
    createElement(ToolbarActionExport, {kind: 'exportRaster'}),
    createElement(ToolbarActionExport, {kind: 'exportSvg'}),
    createElement(ToolbarActionExport, {kind: 'print'}),
    createElement(
      ToolbarAction,
      // The same icon as ToolbarActionSave. We dont use that action, since it disables saving on refresh
      {className: 'reactodia-toolbar-action__save', title: t.text('graphwise_toolbar_action.download_diagram.title'), onSelect: downloadDiagram},
      t.text('graphwise_toolbar_action.download_diagram.label')
    ),
    createElement(
      ToolbarActionOpen,
      {
        title: t.text('graphwise_toolbar_action.upload_diagram.title'),
        fileAccept: DiagramFileService.FILE_EXTENSION,
        onSelect: (file: File) => void uploadDiagram(file)
      },
      t.text('graphwise_toolbar_action.upload_diagram.label')
    )
  );
}
