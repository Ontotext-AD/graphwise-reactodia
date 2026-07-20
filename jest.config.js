// Lets IDE Jest runners (e.g. IntelliJ) use Stencil's TypeScript preprocessor.
// The canonical test runner is `npm test` (`stencil test --spec`); this config
// mirrors the transform Stencil applies so running specs directly also works.
module.exports = {
  preset: '@stencil/core/testing',
};