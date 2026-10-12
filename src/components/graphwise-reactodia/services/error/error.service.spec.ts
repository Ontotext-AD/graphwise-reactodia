import {ErrorService} from './error.service';
import {ErrorReport} from '../../models/error/error-report';
import {ErrorCode} from '../../models/error/error-code';

describe('ErrorService', () => {
  let errorService: ErrorService;
  let onError: jest.Mock<void, [ErrorReport]>;

  beforeEach(() => {
    errorService = new ErrorService();
    onError = jest.fn();
  });

  test('should deliver a reported error to the subscribers', () => {
    // Given a subscriber
    errorService.subscribe(onError);
    const error = new Error('Query failed');

    // When an error is reported
    errorService.report(ErrorCode.DATA_FETCH, error);

    // Then the subscriber receives it with its code
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith({code: ErrorCode.DATA_FETCH, error});
  });

  test('should stop delivering after unsubscribe', () => {
    // Given a subscriber that unsubscribed
    const unsubscribe = errorService.subscribe(onError);
    unsubscribe();

    // When an error is reported
    errorService.report(ErrorCode.LOCAL_DIAGRAM_SAVE, new Error('Storage failed'));

    // Then the subscriber is not called
    expect(onError).not.toHaveBeenCalled();
  });

  test('should deliver only to the latest subscriber', () => {
    // Given a subscriber replaced by another one
    const unsubscribe = errorService.subscribe(onError);
    const onLatestError = jest.fn();
    errorService.subscribe(onLatestError);
    // And the replaced subscriber unsubscribes
    unsubscribe();

    // When an error is reported
    errorService.report(ErrorCode.DATA_FETCH, new Error('Query failed'));

    // Then only the latest subscriber receives it
    expect(onError).not.toHaveBeenCalled();
    expect(onLatestError).toHaveBeenCalledTimes(1);
  });

  test('should deliver a thrown value that is not an Error as is', () => {
    // Given a subscriber
    errorService.subscribe(onError);

    // When a string is reported
    errorService.report(ErrorCode.LOCAL_DIAGRAM_SAVE, 'quota exceeded');

    // Then it is delivered unchanged
    expect(onError).toHaveBeenCalledWith({code: ErrorCode.LOCAL_DIAGRAM_SAVE, error: 'quota exceeded'});
  });

  test('should skip aborts', () => {
    // Given a subscriber
    errorService.subscribe(onError);
    const abort = Object.assign(new Error('The operation was aborted'), {name: 'AbortError'});

    // When an abort is reported
    errorService.report(ErrorCode.DATA_FETCH, abort);

    // Then nothing is delivered
    expect(onError).not.toHaveBeenCalled();
  });

  test('should skip an error that is already reported', () => {
    // Given a subscriber and a reported error
    errorService.subscribe(onError);
    const error = new Error('Query failed');
    errorService.report(ErrorCode.DATA_FETCH, error);

    // When the same error is reported again
    errorService.report(ErrorCode.DIAGRAM_LOAD, error);

    // Then it is delivered once
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('should deliver an error that wraps the original failure', () => {
    // Given a subscriber and an error that wraps the original failure
    errorService.subscribe(onError);
    const error = new Error('Failed to import a layout', {cause: new Error('Diagram is malformed')});

    // When the wrapping error is reported
    errorService.report(ErrorCode.DIAGRAM_LOAD, error);

    // Then it is delivered as it is
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith({code: ErrorCode.DIAGRAM_LOAD, error});
  });

  test('should skip an error caused by an abort', () => {
    // Given a subscriber
    errorService.subscribe(onError);
    const abort = Object.assign(new Error('The operation was aborted'), {name: 'AbortError'});

    // When an error caused by an abort is reported
    errorService.report(ErrorCode.DIAGRAM_LOAD, new Error('Failed to import a layout', {cause: abort}));

    // Then nothing is delivered
    expect(onError).not.toHaveBeenCalled();
  });

  test('should skip an error whose cause is already reported', () => {
    // Given a subscriber and a reported error
    errorService.subscribe(onError);
    const cause = new Error('Query failed');
    errorService.report(ErrorCode.DATA_FETCH, cause);

    // When an error caused by it is reported
    errorService.report(ErrorCode.DIAGRAM_LOAD, new Error('Failed to import a layout', {cause}));

    // Then only the first report is delivered
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('should skip an error caused by a reported value that is not an Error', () => {
    // Given a subscriber and a reported object that is not an Error
    errorService.subscribe(onError);
    const cause = {status: 500};
    errorService.report(ErrorCode.DATA_FETCH, cause);

    // When an error caused by it is reported
    errorService.report(ErrorCode.DIAGRAM_LOAD, new Error('Failed to import a layout', {cause}));

    // Then only the first report is delivered
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('should skip the cause of an error that is already reported', () => {
    // Given a subscriber and a reported error that wraps the original failure
    errorService.subscribe(onError);
    const cause = new Error('Diagram is malformed');
    errorService.report(ErrorCode.DIAGRAM_LOAD, new Error('Failed to import a layout', {cause}));

    // When the original failure is reported
    errorService.report(ErrorCode.DIAGRAM_IMPORT, cause);

    // Then only the first report is delivered
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('should deliver distinct errors with the same message', () => {
    // Given a subscriber
    errorService.subscribe(onError);

    // When two different errors with the same message are reported
    errorService.report(ErrorCode.DATA_FETCH, new Error('Query failed'));
    errorService.report(ErrorCode.DATA_FETCH, new Error('Query failed'));

    // Then both are delivered
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
