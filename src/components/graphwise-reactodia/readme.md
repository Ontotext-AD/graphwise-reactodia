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

| Property            | Attribute            | Description                                                                                                                                                                                                                                                                                                                                 | Type                               | Default          |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------- |
| `config`            | `config`             | Host-supplied configuration: the SPARQL `queryFunction` transport and an optional `seed` set of entities to pre-populate the canvas with. A DOM property (an object, not an attribute) passed in from outside the wrapper.  Read once on mount; not watched, as it only sets up the data source and initial canvas.                         | `ReactodiaConfig`                  | `undefined`      |
| `currentRepository` | `current-repository` | The active repository id. Appended to {@link queryFunction } as the request `url`; changing it re-points the graph at the new repository (and resets the canvas), which is how runtime repository changes are handled.                                                                                                                      | `string`                           | `undefined`      |
| `language`          | `language`           | UI language code (e.g. `en`, `fr`) for the Reactodia interface. Defaults to English.                                                                                                                                                                                                                                                        | `LanguageKey.EN \| LanguageKey.FR` | `LanguageKey.EN` |
| `providerSettings`  | `provider-settings`  | Query preset for the SPARQL data provider, owned and configured by the host. A DOM property (an object, not an attribute) passed in from outside the wrapper. Required: the wrapper has no default preset and throws when it is missing. Changing it rebuilds the data provider and reloads the graph with it, keeping the current diagram. | `SparqlDataProviderSettings`       | `undefined`      |
| `theme`             | `theme`              | The reactodia theme to use                                                                                                                                                                                                                                                                                                                  | `"dark" \| "light"`                | `undefined`      |


## CSS Custom Properties

| Name                                        | Description                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `--graphwise-reactodia-type-color-01`       | Color slot 1 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-02`       | Color slot 2 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-03`       | Color slot 3 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-04`       | Color slot 4 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-05`       | Color slot 5 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-06`       | Color slot 6 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-07`       | Color slot 7 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-08`       | Color slot 8 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-09`       | Color slot 9 of 20 for node types                                         |
| `--graphwise-reactodia-type-color-10`       | Color slot 10 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-11`       | Color slot 11 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-12`       | Color slot 12 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-13`       | Color slot 13 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-14`       | Color slot 14 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-15`       | Color slot 15 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-16`       | Color slot 16 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-17`       | Color slot 17 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-18`       | Color slot 18 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-19`       | Color slot 19 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-20`       | Color slot 20 of 20 for node types                                        |
| `--graphwise-reactodia-type-color-contrast` | Contrast color for categorical node styles (the letter inside the circle) |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
