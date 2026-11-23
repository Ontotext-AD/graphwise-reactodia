import {execFileSync} from 'child_process';
import {randomUUID} from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Lists the third-party libraries bundled into dist/ and writes them as a CycloneDX 1.6 SBOM (sbom.cdx.json) and
 * as a list of their licences (THIRD-PARTY-LICENSES.txt).
 *
 * The list comes from the modules Rollup renders into the output chunks, so only code that ends up in dist/ is listed.
 * Two kinds of code are bundled without a package of their own, and are found here as well:
 * - The reactodia-workspace fork is bundled from its own dist/, where Vite has already inlined some packages. Vite
 *   marks each inlined module with a `//#region node_modules/<package>/...` comment.
 * - rollup-plugin-node-polyfills ships copies of other packages, each with a `LICENSE-<polyfill>.txt` file
 *   naming the original package.
 */

const PROJECT_ROOT = path.resolve(__dirname, '..');
const FORK_DIR = path.join(PROJECT_ROOT, 'reactodia-workspace');
const FORK_REPOSITORY = 'https://github.com/Ontotext-AD/reactodia-workspace-fork';
const NODE_POLYFILLS_DIR = path.join('rollup-plugin-node-polyfills', 'polyfills');
const VITE_REGION = /^\/\/#region (node_modules\/(?:@[^/\s]+\/)?[^/\s]+)\//gm;
const LICENSE_FILE = /^(licen[cs]e|copying)(\.(md|txt))?$/i;

interface PackageJson {
  name: string;
  version: string;
  description?: string;
  license?: string;
  homepage?: string;
  repository?: string | {url?: string};
  dependencies?: Record<string, string>;
}

interface Library {
  bomRef: string;
  name: string;
  version: string;
  purl: string;
  license?: string;
  description?: string;
  homepage?: string;
  repository?: string;
  licenseText?: string;
  pedigree?: object;
  /** Names of the packages this library imports, from its package.json. */
  dependencies: string[];
  /** bom-refs of the libraries inlined into this one by its own build. */
  inlined: string[];
}

export function bundledLibraries(options: {sbomFile: string; licensesFile: string}) {
  const libraries = new Map<string, Library>();

  const add = (library: Library) => {
    if (!libraries.has(library.bomRef)) {
      libraries.set(library.bomRef, library);
    }
    return libraries.get(library.bomRef)!;
  };

  const addModule = (id: string) => {
    const packageDir = findPackageDir(id);
    if (!packageDir) {
      return;
    }
    if (packageDir === FORK_DIR) {
      const fork = add(forkLibrary());
      for (const inlinedDir of inlinedPackageDirs(id)) {
        const inlined = add(npmLibrary(inlinedDir));
        if (!fork.inlined.includes(inlined.bomRef)) {
          fork.inlined.push(inlined.bomRef);
        }
      }
      return;
    }
    const library = add(npmLibrary(packageDir));
    const polyfill = polyfillLibrary(id);
    if (polyfill && !library.inlined.includes(polyfill.bomRef)) {
      add(polyfill);
      library.inlined.push(polyfill.bomRef);
    }
  };

  return {
    name: 'bundled-libraries',
    generateBundle(_options: unknown, bundle: Record<string, {type: string; modules?: Record<string, {renderedLength: number}>}>) {
      for (const output of Object.values(bundle)) {
        for (const [id, module] of Object.entries(output.modules ?? {})) {
          if (module.renderedLength > 0 && path.isAbsolute(id)) {
            addModule(id);
          }
        }
      }
      // Stencil bundles the ESM and the CommonJS output separately; the files list the libraries of both.
      const sorted = [...libraries.values()].sort((a, b) => a.bomRef.localeCompare(b.bomRef));
      fs.writeFileSync(options.sbomFile, JSON.stringify(sbom(sorted), null, 2) + '\n');
      fs.writeFileSync(options.licensesFile, licensesText(sorted));
    },
  };
}

/**
 * The directory of the package a bundled module belongs to: the fork, or the package under the last node_modules/ in
 * its path. Undefined for this project's own modules.
 */
function findPackageDir(id: string): string | undefined {
  const match = id.match(/^(.*[\\/]node_modules[\\/](?:@[^\\/]+[\\/])?[^\\/]+)[\\/]/);
  if (match) {
    return match[1];
  }
  return id.startsWith(FORK_DIR + path.sep) ? FORK_DIR : undefined;
}

function readPackageJson(dir: string): PackageJson {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
}

function npmLibrary(dir: string): Library {
  const pkg = readPackageJson(dir);
  const purl = npmPurl(pkg.name, pkg.version);
  return {
    bomRef: purl,
    name: pkg.name,
    version: pkg.version,
    purl,
    license: pkg.license,
    description: pkg.description,
    homepage: pkg.homepage,
    repository: repositoryUrl(pkg.repository),
    licenseText: licenseText(dir),
    dependencies: Object.keys(pkg.dependencies ?? {}),
    inlined: [],
  };
}

/**
 * The fork is not published to npm, so it is named after the Git commit it is built from. The npm package it is
 * forked from is its ancestor.
 */
function forkLibrary(): Library {
  const pkg = readPackageJson(FORK_DIR);
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: FORK_DIR, encoding: 'utf8'}).trim();
  const purl = `pkg:github/ontotext-ad/reactodia-workspace-fork@${commit}`;
  return {
    bomRef: purl,
    name: pkg.name,
    version: `${pkg.version}+${commit.substring(0, 7)}`,
    purl,
    license: pkg.license,
    description: pkg.description,
    homepage: pkg.homepage,
    repository: FORK_REPOSITORY,
    licenseText: licenseText(FORK_DIR),
    pedigree: {
      ancestors: [{
        type: 'library',
        ...nameAndGroup(pkg.name),
        version: pkg.version,
        purl: npmPurl(pkg.name, pkg.version),
      }],
      commits: [{uid: commit, url: `${FORK_REPOSITORY}/commit/${commit}`}],
    },
    dependencies: Object.keys(pkg.dependencies ?? {}),
    inlined: [],
  };
}

/** Packages that the fork's build inlined into the given file of its dist/. */
function inlinedPackageDirs(file: string): string[] {
  const code = fs.readFileSync(file, 'utf8');
  const dirs = new Set([...code.matchAll(VITE_REGION)].map((match) => path.join(FORK_DIR, match[1])));
  return [...dirs];
}

/** The package that a rollup-plugin-node-polyfills module was copied from, if the module is such a copy. */
function polyfillLibrary(id: string): Library | undefined {
  const dir = path.dirname(id);
  if (!dir.endsWith(path.sep + NODE_POLYFILLS_DIR)) {
    return undefined;
  }
  const noticeFile = path.join(dir, `LICENSE-${path.basename(id, '.js')}.txt`);
  if (!fs.existsSync(noticeFile)) {
    return undefined;
  }
  const notice = fs.readFileSync(noticeFile, 'utf8');
  const field = (name: string) => notice.match(new RegExp(`^${name}: (.*)$`, 'm'))?.[1].trim();
  const name = field('Name');
  const version = field('Version');
  if (!name || !version) {
    throw new Error(`${noticeFile} does not name the package and version it was copied from.`);
  }
  const purl = npmPurl(name, version);
  return {
    bomRef: purl,
    name,
    version,
    purl,
    license: field('License'),
    description: field('Description'),
    repository: repositoryUrl(field('Repository')),
    // The copy ships only this notice, without the license text.
    licenseText: notice.split('\n').filter((line) => !/^(Name|Version|License|Repository):/.test(line)).join('\n').trim(),
    dependencies: [],
    inlined: [],
  };
}

function licenseText(dir: string): string | undefined {
  const files = fs.readdirSync(dir).filter((file) => LICENSE_FILE.test(file)).sort();
  if (!files.length) {
    return undefined;
  }
  return files.map((file) => fs.readFileSync(path.join(dir, file), 'utf8').trim()).join('\n\n');
}

function npmPurl(name: string, version: string): string {
  return `pkg:npm/${name.replace(/^@/, '%40')}@${encodeURIComponent(version)}`;
}

function nameAndGroup(name: string): {group?: string; name: string} {
  const scoped = name.match(/^(@[^/]+)\/(.+)$/);
  return scoped ? {group: scoped[1], name: scoped[2]} : {name};
}

function repositoryUrl(repository: PackageJson['repository']): string | undefined {
  const url = typeof repository === 'string' ? repository : repository?.url;
  if (!url) {
    return undefined;
  }
  if (/^[\w-]+\/[\w.-]+$/.test(url)) {
    return `https://github.com/${url}`;
  }
  return url
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^(ssh:\/\/git@|git:\/\/)github\.com\//, 'https://github.com/')
    .replace(/\.git$/, '');
}

function sbom(libraries: Library[]) {
  const pkg = readPackageJson(PROJECT_ROOT);
  const rootRef = npmPurl(pkg.name, pkg.version);
  const byName = new Map(libraries.map((library) => [library.name, library.bomRef]));
  const dependsOn = (library: Library) => [
    ...library.dependencies.map((name) => byName.get(name)).filter((ref): ref is string => !!ref),
    ...library.inlined,
  ];
  const used = new Set(libraries.flatMap(dependsOn));
  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      authors: [{name: 'Ontotext'}],
      component: {
        'bom-ref': rootRef,
        type: 'library',
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        licenses: licenseChoice(pkg.license),
        purl: rootRef,
      },
    },
    components: libraries.map((library) => ({
      'bom-ref': library.bomRef,
      type: 'library',
      ...nameAndGroup(library.name),
      version: library.version,
      description: library.description,
      licenses: licenseChoice(library.license),
      purl: library.purl,
      externalReferences: [
        ...(library.repository ? [{type: 'vcs', url: library.repository}] : []),
        ...(library.homepage ? [{type: 'website', url: library.homepage}] : []),
      ],
      pedigree: library.pedigree,
    })),
    dependencies: [
      {ref: rootRef, dependsOn: libraries.map((library) => library.bomRef).filter((ref) => !used.has(ref))},
      ...libraries.map((library) => ({ref: library.bomRef, dependsOn: dependsOn(library)})),
    ],
  };

  function licenseChoice(license: string | undefined) {
    if (!license) {
      return undefined;
    }
    return /\s(AND|OR|WITH)\s/.test(license) ? [{expression: license}] : [{license: {id: license}}];
  }
}

function licensesText(libraries: Library[]): string {
  return libraries.map((library) => [
    `Name: ${library.name}`,
    `Version: ${library.version}`,
    `License: ${library.license ?? 'unknown'}`,
    ...(library.repository ? [`Repository: ${library.repository}`] : []),
    '',
    library.licenseText ?? 'No license text is included in the package.',
  ].join('\n')).join('\n\n---------------------------------------------------------------------\n\n') + '\n';
}
