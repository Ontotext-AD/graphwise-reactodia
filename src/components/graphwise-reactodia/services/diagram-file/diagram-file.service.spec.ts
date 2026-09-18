import type {SerializedDiagram} from '@reactodia/workspace';
import {DiagramFileService} from './diagram-file.service';
import {WindowService} from '../window/window.service';
import {ServiceProvider} from '../../providers/service/service.provider';

const OBJECT_URL = 'blob:diagram';

function mockFile(content: string): File {
  return {name: 'diagram.json', text: () => Promise.resolve(content)} as unknown as File;
}

describe('DiagramFileService', () => {
  const diagram = {
    '@context': {},
    '@type': 'Diagram',
    layoutData: {'@type': 'Layout', elements: [], links: []}
  } as unknown as SerializedDiagram;
  let diagramFileService: DiagramFileService;
  let link: {href: string; download: string; click: jest.Mock};
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;

  beforeEach(() => {
    diagramFileService = new DiagramFileService();
    link = {href: '', download: '', click: jest.fn()};
    createObjectURL = jest.fn(() => OBJECT_URL);
    revokeObjectURL = jest.fn();

    const windowServiceMock = {
      getWindow: jest.fn(() => ({
        URL: {createObjectURL, revokeObjectURL},
        document: {createElement: jest.fn(() => link)}
      }) as unknown as Window),
    } as unknown as jest.Mocked<WindowService>;

    // Only the services used by the test are stubbed; the cast bridges get's generic return type.
    jest.spyOn(ServiceProvider, 'get').mockImplementation(
      (type) => (type === WindowService ? windowServiceMock : undefined) as never
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('download clicks a link to the diagram serialization and releases its url', async () => {
    // When a diagram is downloaded
    diagramFileService.download(diagram, 'my-diagram.json');

    // Then a link to a JSON blob with the serialized diagram is clicked under the given name
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toEqual('application/json');
    expect(await blob.text()).toEqual(JSON.stringify(diagram));
    expect(link.href).toEqual(OBJECT_URL);
    expect(link.download).toEqual('my-diagram.json');
    expect(link.click).toHaveBeenCalledTimes(1);

    // And the object url is released
    expect(revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });

  test('read returns the diagram from a file with a serialized diagram', async () => {
    // When a file with a serialized diagram is read
    // Then the diagram is returned
    await expect(diagramFileService.read(mockFile(JSON.stringify(diagram)))).resolves.toEqual(diagram);
  });

  test('read round-trips a downloaded diagram', async () => {
    // Given a downloaded diagram
    diagramFileService.download(diagram, 'my-diagram.json');
    const blob = createObjectURL.mock.calls[0][0] as Blob;

    // When its content is read back
    // Then the read diagram equals the downloaded one
    await expect(diagramFileService.read(mockFile(await blob.text()))).resolves.toEqual(diagram);
  });

  test('read rejects a file which is not JSON', async () => {
    // When a file with invalid JSON is read
    // Then reading fails
    await expect(diagramFileService.read(mockFile('not json'))).rejects.toThrow('File "diagram.json" is not valid JSON');
  });

  test.each([
    ['null', null],
    ['a non diagram type', {...diagram, '@type': 'Other'}],
    ['missing layout data', {'@type': 'Diagram'}],
    ['missing links', {'@type': 'Diagram', layoutData: {elements: []}}],
  ])('read rejects JSON with %s', async (_description, content) => {
    // When a file with JSON which is not a serialized diagram is read
    // Then reading fails
    await expect(diagramFileService.read(mockFile(JSON.stringify(content)))).rejects.toThrow('is not a serialized diagram');
  });
});
