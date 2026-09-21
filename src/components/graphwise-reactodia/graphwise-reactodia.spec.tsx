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
 * input before attaching the element would.
 */
function renderWith(props: RequiredProps) {
  return newSpecPage({
    components: [GraphwiseReactodia],
    template: () => (
      <graphwise-reactodia
        currentRepository={props.currentRepository}
        config={props.config}
        providerSettings={props.providerSettings}
      ></graphwise-reactodia>
    ),
  });
}

describe('graphwise-reactodia', () => {
  describe('prop validation', () => {
    test('throws when currentRepository is missing', async () => {
      // When the element is rendered without a repository
      const render = renderWith({config: CONFIG, providerSettings: PROVIDER_SETTINGS});

      // Then it fails with a clear error
      await expect(render).rejects.toThrow('currentRepository is required');
    });

    test('throws when config.queryFunction is missing', async () => {
      // When the element is rendered with a config that has no query function
      const render = renderWith({
        currentRepository: REPOSITORY,
        config: {} as ReactodiaConfig,
        providerSettings: PROVIDER_SETTINGS,
      });

      // Then it fails with a clear error
      await expect(render).rejects.toThrow('config.queryFunction is required');
    });

    test('throws when providerSettings is missing', async () => {
      // When the element is rendered without data provider settings
      const render = renderWith({currentRepository: REPOSITORY, config: CONFIG});

      // Then it fails with a clear error instead of falling back to a default preset
      await expect(render).rejects.toThrow('providerSettings is required');
    });
  });
});
