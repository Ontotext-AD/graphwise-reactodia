import {Config} from '@stencil/core';
import {sass} from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  namespace: 'graphwise-reactodia',
  // Runs once before any component loads; rollup-plugin-node-polyfills is a code-transform plugin,
  // so it needs to run AFTER the commonjs transform plugin, that's the reason it's placed in the "after" array of plugins.
  // This issue occurs before that, so we need to polyfill Node APIs for the browser bundle here as well.
  globalScript: 'src/polyfill/polyfill-node.ts',
  sourceMap: false,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'docs-readme',
    },
  ],
  plugins: [
    sass(),
  ],
  // Reactodia uses some Node APIs. Polyfill them for the browser bundle.
  // https://stenciljs.com/docs/module-bundling#node-polyfills
  rollupPlugins: {
    after: [
      nodePolyfills(),
    ],
  },
};
