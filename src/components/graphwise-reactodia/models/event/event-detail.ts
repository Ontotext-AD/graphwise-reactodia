import {EventType} from './event-type';
import {ErrorReport} from '../error/error-report';

/**
 * Name of the DOM event the `graphwise-reactodia` element dispatches for every event.
 */
export const GRAPHWISE_REACTODIA_EVENT = 'graphwiseReactodiaEvent';

/**
 * The payload of each {@link EventType}. It is the single place that ties an event type to its payload, so
 * adding an event is one {@link EventType} value and one entry here.
 *
 * @example
 * ```ts
 * interface EventPayloadMap {
 *   [EventType.ERROR]: ErrorReport;
 *   // A new event:
 *   [EventType.NEW_TYPE]: NewTypePayload;
 * }
 * ```
 */
interface EventPayloadMap {
  [EventType.ERROR]: ErrorReport;
}

/**
 * Maps an {@link EventType} to its event detail: `{type, payload}`, with the payload from
 * {@link EventPayloadMap}. If no event type is provided, it is the union of the details of all event types.
 *
 * @template T The event type to map.
 *
 * @example
 * ```ts
 * // Any event, narrowed by its type.
 * function onEvent(detail: EventDetail): void {
 *   if (detail.type === EventType.ERROR) {
 *     const {code, error} = detail.payload; // an ErrorReport
 *   }
 * }
 *
 * // One event.
 * const detail: EventDetail<EventType.ERROR> = {type: EventType.ERROR, payload: {code, error}};
 * ```
 */
export type EventDetail<T extends EventType = EventType> = {
  [K in T]: {type: K; payload: EventPayloadMap[K]};
}[T];
