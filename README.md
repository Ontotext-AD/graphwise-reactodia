# graphwise-reactodia

Graphwise wrapper (Stencil component) around the [Reactodia](https://github.com/reactodia/reactodia-workspace) graph explorer.

Reactodia is vendored as a **git submodule** (`reactodia-workspace/`, pointing at our [fork](https://github.com/Ontotext-AD/reactodia-workspace-fork)).
It's built first, then consumed by Stencil as a normal ES module via a `file:` dependency.

## Setup

After cloning the repo for the first time you will need to update git submodules, which will fetch the Reactodia fork:
```bash
cd graphwise-reactodia
git submodule update --init --recursive
```

Install dependencies, which will symlink the Reactodia fork into `node_modules`:
```bash
npm install
```

## Develop
For development run:
```bash
npm start
```

## Build
Build the fork and the Stencil component:
```bash
npm run build 
```

`npm start` and `npm run build` both run `reactodia:build` first, which installs and builds the fork
(`reactodia:install` + `reactodia:compile`), then runs `reactodia:dedupe-react` to remove the fork's own
`react`/`react-dom` copies so the bundle ends up with a single React instance.

## Editing the fork

Reactodia lives in the `reactodia-workspace/` submodule, which is its own git repo (remote:
[reactodia-workspace-fork](https://github.com/Ontotext-AD/reactodia-workspace-fork)). The parent repo does not
store the fork's files — it stores a single pointer to a commit in the fork. So a fork change involves two repos
and two commits: one in the fork (the source change) and one here (the pointer bump).

Simple setup in IntelliJ so you don't switch between projects: map the submodule as a second VCS root 
(Settings → Version Control → Directory Mappings → add `reactodia-workspace`) so both repos appear 
in the branch widget and Commit panel.

### Testing fork changes locally

`npm start` and `npm run build` both run `reactodia:build`, which recompiles the fork from its current
files, so edits are picked up immediately.

### Persisting a fork change
1. In the fork (reactodia-workspace/): create a new branch,
2. Make edit, commit and push changes 
3. Open a PR against the fork's `master` (reactodia-workspace-fork).
4. Merge the PR.
5. In the parent (graphwise-reactodia/):
   1. `git submodule update --remote` to fetch the fork's new commit and update the pointer,
   2. Make a branch, commit the pointer bump and push.

The parent commit's diff is just the pointer, never the fork's direct file changes.
Always bump the pointer to a commit that is merged and pushed on the fork's `master`, so
anyone running `git submodule update` can fetch it.

## Test

Cypress runs against the dev server (`http://localhost:3333`), so start the app first in a separate terminal:

```bash
npm start
```

Then, in another terminal:
```bash
npm run cy:open  # for interactive browser tests
npm run cy:run   # for headless tests
```

OR run tests in a container

```bash
docker compose up
```
