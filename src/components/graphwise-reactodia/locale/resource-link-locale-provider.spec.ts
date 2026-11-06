// The fork is ESM-only and cannot be loaded by jest; the stub mirrors the fork's default anchor.
jest.mock('@reactodia/workspace', () => ({
  DefaultDataLocaleProvider: class {
    prepareAnchor(targetIri: string) {
      return {href: targetIri, target: '_blank', rel: 'noreferrer'};
    }
  },
  isEncodedBlank: (iri: string) => iri.startsWith('urn:reactodia:blank:')
}), {virtual: true});

import type {DefaultDataLocaleProviderOptions} from '@reactodia/workspace';
import {ResourceLinkLocaleProvider} from './resource-link-locale-provider';

const IRI = 'http://example.com/a#b';
const BLANK_NODE = 'urn:reactodia:blank:sparql:b0';

function createProvider(getResourceLinkUrl?: (iri: string) => string): ResourceLinkLocaleProvider {
  return new ResourceLinkLocaleProvider({model: {}, translation: {}} as DefaultDataLocaleProviderOptions, getResourceLinkUrl);
}

describe('ResourceLinkLocaleProvider', () => {
  test('should link to the URL from the callback in a new tab', () => {
    // Given a provider with a resource link callback
    const provider = createProvider((iri) => `https://host.test/view?iri=${encodeURIComponent(iri)}`);

    // When the anchor of a resource is prepared
    const anchor = provider.prepareAnchor(IRI);

    // Then it links to the callback's URL in a new tab
    expect(anchor).toEqual({
      href: 'https://host.test/view?iri=http%3A%2F%2Fexample.com%2Fa%23b',
      target: '_blank',
      rel: 'noreferrer'
    });
  });

  test('should link to the IRI without a callback', () => {
    // Given a provider without a resource link callback
    const provider = createProvider();

    // When the anchor of a resource is prepared
    const anchor = provider.prepareAnchor(IRI);

    // Then it links to the IRI in a new tab
    expect(anchor).toEqual({href: IRI, target: '_blank', rel: 'noreferrer'});
  });

  test('should not call the callback for a blank node', () => {
    // Given a provider with a resource link callback
    const getResourceLinkUrl = jest.fn();
    const provider = createProvider(getResourceLinkUrl);

    // When the anchor of a blank node is prepared
    provider.prepareAnchor(BLANK_NODE);

    // Then the callback is not called
    expect(getResourceLinkUrl).not.toHaveBeenCalled();
  });
});
