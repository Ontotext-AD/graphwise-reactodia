import {ErrorService} from './error.service';
import {ErrorCode} from '../../models/error/error-code';
import {EventDetail} from '../../models/event/event-detail';
import {EventType} from '../../models/event/event-type';
import {Subscription} from '../../models/subscription';
import {service} from '../../providers/service/service-inject';
import {EventService} from '../event/event.service';

describe('ErrorService', () => {
  let errorService: ErrorService;
  let onEvent: jest.Mock<void, [EventDetail]>;
  let unsubscribe: Subscription;

  beforeEach(() => {
    errorService = new ErrorService();
    onEvent = jest.fn();
    unsubscribe = service(EventService).subscribe(onEvent);
  });

  afterEach(() => {
    unsubscribe();
  });

  test('should emit a reported error as an error event', () => {
    // Given an error
    const error = new Error('Query failed');

    // When it is reported
    errorService.report(ErrorCode.DATA_FETCH, error);

    // Then it is emitted with its code
    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({type: EventType.ERROR, payload: {code: ErrorCode.DATA_FETCH, error}});
  });

  test('should emit a thrown value that is not an Error as is', () => {
    // When a string is reported
    errorService.report(ErrorCode.LOCAL_DIAGRAM_SAVE, 'quota exceeded');

    // Then it is emitted unchanged
    expect(onEvent).toHaveBeenCalledWith({
      type: EventType.ERROR,
      payload: {code: ErrorCode.LOCAL_DIAGRAM_SAVE, error: 'quota exceeded'}
    });
  });

  test('should skip aborts', () => {
    // Given an abort
    const abort = Object.assign(new Error('The operation was aborted'), {name: 'AbortError'});

    // When it is reported
    errorService.report(ErrorCode.DATA_FETCH, abort);

    // Then nothing is emitted
    expect(onEvent).not.toHaveBeenCalled();
  });

  test('should skip an error that is already reported', () => {
    // Given a reported error
    const error = new Error('Query failed');
    errorService.report(ErrorCode.DATA_FETCH, error);

    // When the same error is reported again
    errorService.report(ErrorCode.DIAGRAM_LOAD, error);

    // Then it is emitted once
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  test('should emit an error that wraps the original failure', () => {
    // Given an error that wraps the original failure
    const error = new Error('Failed to import a layout', {cause: new Error('Diagram is malformed')});

    // When the wrapping error is reported
    errorService.report(ErrorCode.DIAGRAM_LOAD, error);

    // Then it is emitted as it is
    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({type: EventType.ERROR, payload: {code: ErrorCode.DIAGRAM_LOAD, error}});
  });

  test('should skip an error caused by an abort', () => {
    // Given an abort
    const abort = Object.assign(new Error('The operation was aborted'), {name: 'AbortError'});

    // When an error caused by it is reported
    errorService.report(ErrorCode.DIAGRAM_LOAD, new Error('Failed to import a layout', {cause: abort}));

    // Then nothing is emitted
    expect(onEvent).not.toHaveBeenCalled();
  });

  test('should skip an error whose cause is already reported', () => {
    // Given a reported error
    const cause = new Error('Query failed');
    errorService.report(ErrorCode.DATA_FETCH, cause);

    // When an error caused by it is reported
    errorService.report(ErrorCode.DIAGRAM_LOAD, new Error('Failed to import a layout', {cause}));

    // Then only the first report is emitted
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  test('should skip an error caused by a reported value that is not an Error', () => {
    // Given a reported object that is not an Error
    const cause = {status: 500};
    errorService.report(ErrorCode.DATA_FETCH, cause);

    // When an error caused by it is reported
    errorService.report(ErrorCode.DIAGRAM_LOAD, new Error('Failed to import a layout', {cause}));

    // Then only the first report is emitted
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  test('should skip the cause of an error that is already reported', () => {
    // Given a reported error that wraps the original failure
    const cause = new Error('Diagram is malformed');
    errorService.report(ErrorCode.DIAGRAM_LOAD, new Error('Failed to import a layout', {cause}));

    // When the original failure is reported
    errorService.report(ErrorCode.DIAGRAM_IMPORT, cause);

    // Then only the first report is emitted
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  test('should emit distinct errors with the same message', () => {
    // When two different errors with the same message are reported
    errorService.report(ErrorCode.DATA_FETCH, new Error('Query failed'));
    errorService.report(ErrorCode.DATA_FETCH, new Error('Query failed'));

    // Then both are emitted
    expect(onEvent).toHaveBeenCalledTimes(2);
  });
});
