import {ErrorReport} from './error-report';

/**
 * Callback invoked with every reported error.
 */
export type ErrorCallback = (report: ErrorReport) => void;
