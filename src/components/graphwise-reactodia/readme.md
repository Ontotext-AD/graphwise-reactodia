# graphwise-reactodia



<!-- Auto Generated Below -->


## Overview

A web component that renders a graph with the Reactodia workspace.

The component is backed by a SPARQL endpoint but is endpoint-agnostic: the host passes
the active repository's endpoint via `current-repository` and a `config.queryFunction`
that performs the actual HTTP request. Reactodia fetches all node, link and type data
lazily through them; the canvas starts empty and the user populates it via the search bar.

The component is a thin wrapper around Reactodia: query configuration lives outside the
wrapper and is supplied through the `providerSettings` prop.

## Properties

| Property            | Attribute            | Description                                                                                                                                                                                                                                                                                                         | Type                               | Default          |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------- |
| `config`            | `config`             | Host-supplied configuration: the SPARQL `queryFunction` transport and an optional `seed` set of entities to pre-populate the canvas with. A DOM property (an object, not an attribute) passed in from outside the wrapper.  Read once on mount; not watched, as it only sets up the data source and initial canvas. | `ReactodiaConfig`                  | `undefined`      |
| `currentRepository` | `current-repository` | The active repository id. Appended to {@link queryFunction } as the request `url`; changing it re-points the graph at the new repository (and resets the canvas), which is how runtime repository changes are handled.                                                                                              | `string`                           | `undefined`      |
| `language`          | `language`           | UI language code (e.g. `en`, `fr`) for the Reactodia interface. Defaults to English.                                                                                                                                                                                                                                | `LanguageKey.EN \| LanguageKey.FR` | `LanguageKey.EN` |
| `providerSettings`  | `provider-settings`  | Query preset for the SPARQL data provider, owned and configured by the host. A DOM property (an object, not an attribute) passed in from outside the wrapper. When omitted, the data provider falls back to Reactodia's generic OWL/RDFS preset. Changing it rebuilds the data provider and resets the canvas.      | `SparqlDataProviderSettings`       | `undefined`      |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
