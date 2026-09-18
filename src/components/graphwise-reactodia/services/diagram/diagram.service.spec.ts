import type {DataDiagramModel, DataProvider, SerializedDiagram} from '@reactodia/workspace';
import {DiagramService} from './diagram.service';

const HISTORY_CHANGED = 'historyChanged';
const DEBOUNCE_MS = 300;

/**
 * A jest-mocked `DataDiagramModel` exposing just the surface `DiagramService` touches:
 * the `history.events` on/off pair and `exportLayout`. `emitHistoryChanged` fires whatever
 * listener the service registered.
 */
function mockModel(layout: SerializedDiagram) {
  let historyHandler: (() => void) | undefined;
  const on = jest.fn((event: string, handler: () => void) => {
    if (event === HISTORY_CHANGED) {
      historyHandler = handler;
    }
  });
  const off = jest.fn((event: string, handler: () => void) => {
    if (event === HISTORY_CHANGED && historyHandler === handler) {
      historyHandler = undefined;
    }
  });
  const exportLayout = jest.fn().mockReturnValue(layout);

  const model = {
    history: {events: {on, off}},
    exportLayout,
  } as unknown as DataDiagramModel;

  return {
    model,
    on,
    off,
    exportLayout,
    emitHistoryChanged: (): void => historyHandler?.(),
    getHistoryHandler: (): (() => void) | undefined => historyHandler,
  };
}

describe('DiagramService', () => {
  const layout = {layoutData: {elements: [], links: []}} as unknown as SerializedDiagram;
  let service: DiagramService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new DiagramService();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('importDiagram should import the layout with the data provider and validate its links', async () => {
    // Given a model and a data provider
    const importLayout = jest.fn().mockResolvedValue(undefined);
    const setSelection = jest.fn();
    const model = {importLayout, setSelection} as unknown as DataDiagramModel;
    const dataProvider = {} as DataProvider;
    const signal = new AbortController().signal;

    // When a diagram is imported
    await service.importDiagram(model, dataProvider, layout, signal);

    // Then the layout is imported through the model with link validation
    expect(importLayout).toHaveBeenCalledWith({dataProvider, diagram: layout, signal, validateLinks: true});
  });

  test('importDiagram should clear the selection before replacing the diagram content', async () => {
    // Given a model that records the order of the calls it receives
    const calls: string[] = [];
    const importLayout = jest.fn().mockImplementation(() => {
      calls.push('importLayout');
      return Promise.resolve();
    });
    const setSelection = jest.fn().mockImplementation(() => calls.push('setSelection'));
    const model = {importLayout, setSelection} as unknown as DataDiagramModel;

    // When a diagram is imported
    await service.importDiagram(model, {} as DataProvider, layout);

    // Then the selection is emptied first, so the selection widgets stop painting the discarded cells
    expect(setSelection).toHaveBeenCalledWith([]);
    expect(calls).toEqual(['setSelection', 'importLayout']);
  });

  test('should call the callback with the exported layout once the debounce elapses', () => {
    // Given a subscription to diagram changes
    const model = mockModel(layout);
    const onChange = jest.fn();
    service.subscribeToDiagramChange(model.model, onChange);

    // When the model reports a change but the debounce window has not elapsed
    model.emitHistoryChanged();

    // Then the callback has not fired yet
    expect(onChange).not.toHaveBeenCalled();

    // When the debounce window elapses
    jest.advanceTimersByTime(DEBOUNCE_MS);

    // Then the callback fires once with the exported layout
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(layout);
  });

  test('should collapse a burst of changes into a single debounced callback', () => {
    // Given a subscription to diagram changes
    const model = mockModel(layout);
    const onChange = jest.fn();
    service.subscribeToDiagramChange(model.model, onChange);

    // When several changes arrive within the debounce window (each resetting the timer)
    model.emitHistoryChanged();
    jest.advanceTimersByTime(DEBOUNCE_MS - 1);
    model.emitHistoryChanged();
    jest.advanceTimersByTime(DEBOUNCE_MS - 1);

    // Then the callback has still not fired
    expect(onChange).not.toHaveBeenCalled();

    // When the window finally elapses
    jest.advanceTimersByTime(1);

    // Then the callback fires exactly once
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('should remove the history listener and drop a pending notification on unsubscribe', () => {
    // Given a subscription with a change pending in the debounce window
    const model = mockModel(layout);
    const onChange = jest.fn();
    const unsubscribe = service.subscribeToDiagramChange(model.model, onChange);
    model.emitHistoryChanged();
    const handler = model.getHistoryHandler();

    // When the subscription is released before the window elapses
    unsubscribe();
    jest.advanceTimersByTime(DEBOUNCE_MS);

    // Then the pending notification is dropped and the listener is removed
    expect(onChange).not.toHaveBeenCalled();
    expect(model.off).toHaveBeenCalledWith(HISTORY_CHANGED, handler);
  });

  test('should ignore changes emitted after unsubscribe', () => {
    // Given a released subscription
    const model = mockModel(layout);
    const onChange = jest.fn();
    const unsubscribe = service.subscribeToDiagramChange(model.model, onChange);
    unsubscribe();

    // When the model reports a change afterwards
    model.emitHistoryChanged();
    jest.advanceTimersByTime(DEBOUNCE_MS);

    // Then the callback is never invoked
    expect(onChange).not.toHaveBeenCalled();
  });
});
