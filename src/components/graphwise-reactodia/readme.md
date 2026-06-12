# graphwise-reactodia



<!-- Auto Generated Below -->


## Overview

A web component that renders a graph with the Reactodia workspace.

The component is backed by a SPARQL endpoint but is endpoint-agnostic: the host passes
the active repository's endpoint via `current-repository` and a `queryFunction` that
performs the actual HTTP request. Reactodia fetches all node, link and type data lazily
through them; the canvas starts empty and the user populates it via the search bar.

The component is a thin wrapper around Reactodia: query configuration lives outside the
wrapper and is supplied through the `providerSettings` prop.

## Properties

| Property            | Attribute            | Description                                                                                                                                                                                                                                                                                                    | Type                                                                                                                                           | Default     |
| ------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `currentRepository` | `current-repository` | The active repository id. Appended to {@link queryFunction} as the request `url`; changing it re-points the graph at the new repository (and resets the canvas), which is how runtime repository changes are handled.                                                                                          | `string`                                                                                                                                       | `undefined` |
| `language`          | `language`           | UI language code (e.g. `en`, `fr`) for the Reactodia interface. Defaults to English.                                                                                                                                                                                                                           | `string`                                                                                                                                       | `'en'`      |
| `providerSettings`  | `provider-settings`  | Query preset for the SPARQL data provider, owned and configured by the host. A DOM property (an object, not an attribute) passed in from outside the wrapper. When omitted, the data provider falls back to Reactodia's generic OWL/RDFS preset. Changing it rebuilds the data provider and resets the canvas. | `SparqlDataProviderSettings`                                                                                                                   | `undefined` |
| `queryFunction`     | `query-function`     | HTTP transport for the SPARQL requests. Set by the host so requests go through the host's HTTP layer (auth, interceptors) instead of a built-in `fetch`.                                                                                                                                                       | `(params: { url: string; body?: string; headers: { [header: string]: string; }; method: string; signal?: AbortSignal; }) => Promise<Response>` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
