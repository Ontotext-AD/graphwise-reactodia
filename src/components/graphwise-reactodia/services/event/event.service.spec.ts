import {EventService} from './event.service';
import {WindowService} from '../window/window.service';
import {ServiceProvider} from '../../providers/service/service.provider';
import {Subscription} from '../../models/subscription';
import {CLEAR_DIAGRAM_STORAGE_EVENT} from '../../models/clear-diagram-storage-event';

describe('EventService', () => {
  let eventService: EventService;
  let windowServiceMock: jest.Mocked<WindowService>;
  let cleanups: Subscription[];

  beforeEach(() => {
    eventService = new EventService();
    cleanups = [];

    windowServiceMock = {
      getWindow: jest.fn(() => window),
    } as unknown as jest.Mocked<WindowService>;

    // Only the services used by the test are stubbed; the cast bridges get's generic return type.
    jest.spyOn(ServiceProvider, 'get').mockImplementation(
      (type) => (type === WindowService ? windowServiceMock : undefined) as never
    );
  });

  afterEach(() => {
    // Release any listeners left on the window bus so they never leak across tests.
    cleanups.forEach((unsubscribe) => unsubscribe());
    jest.clearAllMocks();
  });

  /** Subscribes and records the returned teardown for cleanup. */
  function subscribe(handler: () => void): Subscription {
    const unsubscribe = eventService.subscribeToClearDiagramStorage(handler);
    cleanups.push(unsubscribe);
    return unsubscribe;
  }

  function dispatchClear(): void {
    window.dispatchEvent(new CustomEvent(CLEAR_DIAGRAM_STORAGE_EVENT));
  }

  test('should call the handler when the clear event is dispatched on the window bus', () => {
    // Given a handler subscribed to the clear command
    const onClear = jest.fn();
    subscribe(onClear);

    // When the clear event is dispatched
    dispatchClear();

    // Then the handler is invoked
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test('should keep calling the handler on each dispatch until unsubscribed', () => {
    // Given a subscribed handler
    const onClear = jest.fn();
    const unsubscribe = subscribe(onClear);

    // When the event fires twice, the subscription is released, then the event fires again
    dispatchClear();
    dispatchClear();
    unsubscribe();
    dispatchClear();

    // Then only the dispatches before unsubscribe were delivered
    expect(onClear).toHaveBeenCalledTimes(2);
  });

  test('should not call the handler for unrelated events on the window', () => {
    // Given a subscribed handler
    const onClear = jest.fn();
    subscribe(onClear);

    // When a differently named event is dispatched
    window.dispatchEvent(new CustomEvent('graphwise-reactodia:unrelated'));

    // Then the handler is not invoked
    expect(onClear).not.toHaveBeenCalled();
  });
});
