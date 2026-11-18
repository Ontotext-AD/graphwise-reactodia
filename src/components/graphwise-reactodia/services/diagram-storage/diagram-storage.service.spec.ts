import {SerializedDiagram} from '@reactodia/workspace';
import {DiagramStorageService} from './diagram-storage.service';
import {WindowService} from '../window/window.service';
import {ErrorService} from '../error/error.service';
import {ErrorCode} from '../../models/error/error-code';
import {ServiceProvider} from '../../providers/service/service.provider';
import {createStorageMock, StorageMock} from '../../testing/storage.mock';

const STORAGE_KEY = 'host.graph-navigator.diagram';

describe('DiagramStorageService', () => {
  const diagram = {layoutData: {elements: [{'@type': 'Element', '@id': 'e1'}], links: []}} as unknown as SerializedDiagram;
  const emptyDiagram = {layoutData: {elements: [], links: []}} as unknown as SerializedDiagram;
  let diagramStorageService: DiagramStorageService;
  let storage: StorageMock;
  let errorServiceMock: jest.Mocked<ErrorService>;

  beforeEach(() => {
    storage = createStorageMock();
    const windowServiceMock = {getWindow: jest.fn(() => ({localStorage: storage}) as unknown as Window)};
    errorServiceMock = {report: jest.fn()} as unknown as jest.Mocked<ErrorService>;

    // Only the services used by the test are stubbed; the cast bridges get's generic return type.
    jest.spyOn(ServiceProvider, 'get').mockImplementation((type) => {
      const services = new Map<unknown, unknown>([[WindowService, windowServiceMock], [ErrorService, errorServiceMock]]);
      return services.get(type) as never;
    });

    // Created after the stub, since the service resolves its dependencies on construction
    diagramStorageService = new DiagramStorageService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('load returns undefined when nothing is stored', () => {
    // When loading with an empty store
    // Then nothing is returned
    expect(diagramStorageService.load(STORAGE_KEY)).toBeUndefined();
  });

  test('save persists the diagram under the storage key', () => {
    // When a diagram is saved
    diagramStorageService.save(STORAGE_KEY, diagram);

    // Then the diagram is written under the storage key
    expect(JSON.parse(storage.getItem(STORAGE_KEY) as string)).toEqual(diagram);
  });

  test('save round-trips through load', () => {
    // When a diagram is saved and loaded back
    diagramStorageService.save(STORAGE_KEY, diagram);

    // Then the loaded diagram equals the saved one
    expect(diagramStorageService.load(STORAGE_KEY)).toEqual(diagram);
  });

  test('save removes the stored diagram when the diagram has no elements', () => {
    // Given a saved diagram
    diagramStorageService.save(STORAGE_KEY, diagram);

    // When a diagram without elements is saved (e.g. the canvas is emptied)
    diagramStorageService.save(STORAGE_KEY, emptyDiagram);

    // Then nothing is stored
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  test('load ignores a diagram stored under another key', () => {
    // Given a diagram saved under one key
    diagramStorageService.save(STORAGE_KEY, diagram);

    // When it is loaded under another key
    // Then nothing is returned
    expect(diagramStorageService.load('other.key')).toBeUndefined();
    // And the diagram under the first key is untouched
    expect(diagramStorageService.load(STORAGE_KEY)).toEqual(diagram);
  });

  test('load reports an unreadable value and returns undefined', () => {
    // Given a value that is not valid JSON under the storage key
    storage.setItem(STORAGE_KEY, '{not a diagram');

    // When the diagram is loaded
    const loaded = diagramStorageService.load(STORAGE_KEY);

    // Then nothing is returned
    expect(loaded).toBeUndefined();
    // And the failure is reported
    expect(errorServiceMock.report).toHaveBeenCalledWith(ErrorCode.LOCAL_DIAGRAM_READ, expect.any(SyntaxError));
  });

  test('save reports a failed write instead of throwing', () => {
    // Given a store that rejects writes
    const error = new Error('Quota exceeded');
    jest.spyOn(storage, 'setItem').mockImplementation(() => {
      throw error;
    });

    // When a diagram is saved
    // Then it does not throw
    expect(() => diagramStorageService.save(STORAGE_KEY, diagram)).not.toThrow();
    // And the failure is reported
    expect(errorServiceMock.report).toHaveBeenCalledWith(ErrorCode.LOCAL_DIAGRAM_SAVE, error);
  });

  test('clear removes the persisted diagram', () => {
    // Given a saved diagram
    diagramStorageService.save(STORAGE_KEY, diagram);

    // When the store is cleared
    diagramStorageService.clear(STORAGE_KEY);

    // Then nothing remains to load
    expect(diagramStorageService.load(STORAGE_KEY)).toBeUndefined();
  });

  test('clear is a no-op when nothing is stored', () => {
    // When clearing an empty store
    // Then it neither throws nor leaves anything behind
    expect(() => diagramStorageService.clear(STORAGE_KEY)).not.toThrow();
    expect(diagramStorageService.load(STORAGE_KEY)).toBeUndefined();
  });
});
