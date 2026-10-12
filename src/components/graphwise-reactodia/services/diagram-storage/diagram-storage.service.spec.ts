import {SerializedDiagram} from '@reactodia/workspace';
import {DiagramStorageService} from './diagram-storage.service';
import {WindowService} from '../window/window.service';
import {ErrorService} from '../error/error.service';
import {ErrorCode} from '../../models/error/error-code';
import {ServiceProvider} from '../../providers/service/service.provider';
import {createStorageMock, StorageMock} from '../../testing/storage.mock';

const STORAGE_KEY = 'diagram.state';

describe('DiagramStorageService', () => {
  const diagram = {layoutData: {elements: [], links: []}} as unknown as SerializedDiagram;
  let diagramStorageService: DiagramStorageService;
  let storage: StorageMock;
  let windowServiceMock: jest.Mocked<WindowService>;
  let errorServiceMock: jest.Mocked<ErrorService>;

  beforeEach(() => {
    storage = createStorageMock();

    windowServiceMock = {
      getWindow: jest.fn(() => ({localStorage: storage}) as unknown as Window),
    } as unknown as jest.Mocked<WindowService>;

    errorServiceMock = {
      report: jest.fn(),
    } as unknown as jest.Mocked<ErrorService>;

    // Only the services used by the test are stubbed; the cast bridges get's generic return type.
    jest.spyOn(ServiceProvider, 'get').mockImplementation((type) => {
      const services = new Map<unknown, unknown>([[WindowService, windowServiceMock], [ErrorService, errorServiceMock]]);
      return services.get(type) as never;
    });

    // Created after the stub, since the service resolves its dependencies on construction
    diagramStorageService = new DiagramStorageService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('load returns undefined when nothing is stored', () => {
    // When loading with an empty store
    // Then nothing is returned
    expect(diagramStorageService.load()).toBeUndefined();
  });

  test('load returns the parsed diagram when a valid value is stored', () => {
    // Given a serialized diagram is present under the storage key
    storage.setItem(STORAGE_KEY, JSON.stringify(diagram));

    // When the diagram is loaded
    // Then the parsed diagram is returned
    expect(diagramStorageService.load()).toEqual(diagram);
  });

  test('load reports an unreadable value and returns undefined', () => {
    // Given a value that is not valid JSON under the storage key
    storage.setItem(STORAGE_KEY, '{not a diagram');

    // When the diagram is loaded
    const loaded = diagramStorageService.load();

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
    expect(() => diagramStorageService.save(diagram)).not.toThrow();
    // And the failure is reported
    expect(errorServiceMock.report).toHaveBeenCalledWith(ErrorCode.LOCAL_DIAGRAM_SAVE, error);
  });

  test('save persists the serialized diagram under the storage key', () => {
    // When a diagram is saved
    diagramStorageService.save(diagram);

    // Then its serialization is written under the storage key
    expect(storage.getItem(STORAGE_KEY)).toEqual(JSON.stringify(diagram));
  });

  test('save round-trips through load', () => {
    // When a diagram is saved and loaded back
    diagramStorageService.save(diagram);

    // Then the loaded diagram equals the saved one
    expect(diagramStorageService.load()).toEqual(diagram);
  });

  test('clear removes the persisted diagram', () => {
    // Given a saved diagram
    diagramStorageService.save(diagram);

    // When the store is cleared
    diagramStorageService.clear();

    // Then nothing remains to load
    expect(diagramStorageService.load()).toBeUndefined();
  });

  test('clear is a no-op when nothing is stored', () => {
    // When clearing an empty store
    // Then it neither throws nor leaves anything behind
    expect(() => diagramStorageService.clear()).not.toThrow();
    expect(diagramStorageService.load()).toBeUndefined();
  });
});
