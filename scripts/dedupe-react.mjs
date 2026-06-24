import {rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// react is a peerDependency AND a devDependency of the Reactodia fork. Since we use a fork and not an NPM dependency,
// we run reactodia:build, which runs the internal `npm install` and adds another react instance in the end bundle, which causes issues.
// Remove the internal react and react-dom, so they don't conflict with the ones provided from the custom web component
const forkModules = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'reactodia-workspace',
  'node_modules',
);

for (const pkg of ['react', 'react-dom']) {
  rmSync(path.join(forkModules, pkg), {recursive: true, force: true});
}
