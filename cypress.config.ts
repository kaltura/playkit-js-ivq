import {defineConfig} from 'cypress';

export default defineConfig({
  fileServerFolder: 'cypress/public',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  }
});
