import {EventDetail} from './event-detail';

/**
 * Callback invoked with every emitted event.
 */
export type EventCallback = (detail: EventDetail) => void;
