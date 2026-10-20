// The guards run before React mounts, so the Reactodia app is never reached. It is stubbed only
// because Jest can't load the ESM-only `@reactodia/workspace` package it imports.
jest.mock('./reactodia-app', () => ({
  mountReactodia: jest.fn(),
  updateReactodia: jest.fn(),
  unmountReactodia: jest.fn(),
}));

import {h} from '@stencil/core';
import {newSpecPage} from '@stencil/core/testing';
import type {SparqlDataProviderSettings, SparqlQueryFunction} from '@reactodia/workspace';
import {GraphwiseReactodia} from './graphwise-reactodia';
import {ReactodiaConfig} from './models/reactodia-config';
import {ErrorCode} from './models/error/error-code';
import {EventDetail, GRAPHWISE_REACTODIA_EVENT} from './models/event/event-detail';
import {EventType} from './models/event/event-type';
import {service} from './providers/service/service-inject';
import {ErrorService} from './services/error/error.service';

const REPOSITORY = 'repo-a';
const CONFIG: ReactodiaConfig = {queryFunction: jest.fn() as unknown as SparqlQueryFunction};
// The settings are never read by the guards, so any object stands in for a real preset.
const PROVIDER_SETTINGS = {} as SparqlDataProviderSettings;

interface RequiredProps {
  currentRepository?: string;
  config?: ReactodiaConfig;
  providerSettings?: SparqlDataProviderSettings;
}

/**
 * Mounts `<graphwise-reactodia>` with the given props already set, as a host that wires every
 * input before attaching the element would. The events the element dispatches go to `onEvent`.
 */
function renderWith(props: RequiredProps, onEvent?: (event: CustomEvent<EventDetail>) => void) {
  return newSpecPage({
    components: [GraphwiseReactodia],
    template: () => (
      <graphwise-reactodia
        currentRepository={props.currentRepository}
        config={props.config}
        providerSettings={props.providerSettings}
        onGraphwiseReactodiaEvent={onEvent}
      ></graphwise-reactodia>
    ),
  });
}

/** The `{code, message}` of every error event the handler received. */
function reportedErrors(onEvent: jest.Mock): {code: ErrorCode; message: string}[] {
  return onEvent.mock.calls
    .map(([event]: [CustomEvent<EventDetail>]) => event.detail)
    .filter((detail) => detail.type === EventType.ERROR)
    .map(({payload}) => ({
      code: payload.code,
      message: (payload.error as Error).message,
    }));
}

describe('graphwise-reactodia', () => {
  describe('prop validation', () => {
    test('throws when currentRepository is missing', async () => {
      // When the element is rendered without a repository
      const onEvent = jest.fn();
      const render = renderWith({config: CONFIG, providerSettings: PROVIDER_SETTINGS}, onEvent);

      // Then it fails with a clear error
      await expect(render).rejects.toThrow('currentRepository is required');
      // And the error is reported to the host
      expect(reportedErrors(onEvent)).toEqual([{code: ErrorCode.MISSING_REQUIRED_PROP, message: 'currentRepository is required'}]);
    });

    test('throws when config.queryFunction is missing', async () => {
      // When the element is rendered with a config that has no query function
      const onEvent = jest.fn();
      const render = renderWith({
        currentRepository: REPOSITORY,
        config: {} as ReactodiaConfig,
        providerSettings: PROVIDER_SETTINGS,
      }, onEvent);

      // Then it fails with a clear error
      await expect(render).rejects.toThrow('config.queryFunction is required');
      // And the error is reported to the host
      expect(reportedErrors(onEvent)).toEqual([{code: ErrorCode.MISSING_REQUIRED_PROP, message: 'config.queryFunction is required'}]);
    });

    test('throws when providerSettings is missing', async () => {
      // When the element is rendered without data provider settings
      const onEvent = jest.fn();
      const render = renderWith({currentRepository: REPOSITORY, config: CONFIG}, onEvent);

      // Then it fails with a clear error instead of falling back to a default preset
      await expect(render).rejects.toThrow('providerSettings is required');
      // And the error is reported to the host
      expect(reportedErrors(onEvent)).toEqual([{code: ErrorCode.MISSING_REQUIRED_PROP, message: 'providerSettings is required'}]);
    });
  });

  describe('error reporting', () => {
    const ALL_PROPS = {currentRepository: REPOSITORY, config: CONFIG, providerSettings: PROVIDER_SETTINGS};

    test('dispatches a reported error on the element', async () => {
      // Given a rendered element
      const onEvent = jest.fn();
      await renderWith(ALL_PROPS, onEvent);
      const error = new Error('Query failed');

      // When an error is reported
      service(ErrorService).report(ErrorCode.DATA_FETCH, error);

      // Then the element dispatches it
      expect(onEvent).toHaveBeenCalledTimes(1);
      const event: CustomEvent<EventDetail> = onEvent.mock.calls[0][0];
      expect(event.type).toBe(GRAPHWISE_REACTODIA_EVENT);
      expect(event.bubbles).toBe(true);
      expect(event.detail).toEqual({type: EventType.ERROR, payload: {code: ErrorCode.DATA_FETCH, error}});
    });

    test('dispatches nothing after the element is disconnected', async () => {
      // Given a rendered element that is removed from the page
      const onEvent = jest.fn();
      const page = await renderWith(ALL_PROPS, onEvent);
      page.root?.remove();

      // When an error is reported
      service(ErrorService).report(ErrorCode.DATA_FETCH, new Error('Query failed'));

      // Then the element dispatches nothing
      expect(onEvent).not.toHaveBeenCalled();
    });
  });
});
