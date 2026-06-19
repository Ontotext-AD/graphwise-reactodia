const {defineConfig} = require('cypress');
const fs = require('fs');

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'http://localhost:3333/',
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    setupNodeEvents(on) {
      // Keep videos only for failing specs to avoid bloating the workspace.
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          const hasFailure = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed')
          );

          if (!hasFailure) {
            try {
              fs.rmSync(results.video, {force: true});
            } catch (err) {
              console.error(err);
            }
          }
        }
      });
    },
  },
});
