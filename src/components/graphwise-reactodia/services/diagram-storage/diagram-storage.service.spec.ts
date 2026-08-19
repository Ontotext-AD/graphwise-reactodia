import {SerializedDiagram} from '@reactodia/workspace';
import {DiagramStorageService} from './diagram-storage.service';
import {WindowService} from '../window/window.service';
import {ServiceProvider} from '../../providers/service/service.provider';
import {createStorageMock, StorageMock} from '../../testing/storage.mock';

const STORAGE_KEY = 'diagram.state';

describe('DiagramStorageService', () => {
  const diagram = {layoutData: {elements: [], links: []}} as unknown as SerializedDiagram;
  let diagramStorageService: DiagramStorageService;
  let storage: StorageMock;
  let windowServiceMock: jest.Mocked<WindowService>;

  beforeEach(() => {
    storage = createStorageMock();
    diagramStorageService = new DiagramStorageService();

    windowServiceMock = {
      getWindow: jest.fn(() => ({localStorage: storage}) as unknown as Window),
    } as unknown as jest.Mocked<WindowService>;

    // Only the services used by the test are stubbed; the cast bridges get's generic return type.
    jest.spyOn(ServiceProvider, 'get').mockImplementation(
      (type) => (type === WindowService ? windowServiceMock : undefined) as never
    );
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

  test('loadAcceptBlankNodes is false when nothing is stored', () => {
    // When reading the blank node toggle from an empty store
    // Then it is off
    expect(diagramStorageService.loadAcceptBlankNodes()).toBe(false);
  });

  test('saveAcceptBlankNodes round-trips through loadAcceptBlankNodes', () => {
    // When the toggle is turned on
    diagramStorageService.saveAcceptBlankNodes(true);
    // Then it reads back as on
    expect(diagramStorageService.loadAcceptBlankNodes()).toBe(true);

    // When it is turned back off
    diagramStorageService.saveAcceptBlankNodes(false);
    // Then it reads back as off
    expect(diagramStorageService.loadAcceptBlankNodes()).toBe(false);
  });

  test('the blank node toggle is not affected by clearing the diagram', () => {
    // Given the toggle is on and a diagram is saved
    diagramStorageService.saveAcceptBlankNodes(true);
    diagramStorageService.save(diagram);

    // When the persisted diagram is removed
    diagramStorageService.clear();

    // Then the toggle survives, as it is a data provider setting and not diagram state
    expect(diagramStorageService.loadAcceptBlankNodes()).toBe(true);
  });
});
