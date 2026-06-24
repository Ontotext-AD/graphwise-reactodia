import {Config} from '@stencil/core';
import {sass} from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  namespace: 'graphwise-reactodia',
  // The reactodia-workspace fork builds its own node modules upon `build` and `start`. Since react and react-dom are
  // dev and peer dependencies, they end up added as dependencies. The Wrapper also depends on them, so when we install,
  // we end up with two copies. This causes errors like "Invalid hook call / two copies of React", so dedupe them here.
  nodeResolve: {
    dedupe: ['react', 'react-dom'],
  },
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
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        {src: 'pages'},
      ],
    },
  ],
  devServer: {
    initialLoadUrl: '/pages/index.html',
  },
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
