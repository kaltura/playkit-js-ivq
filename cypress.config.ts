import {defineConfig} from 'cypress';

export default defineConfig({
  fileServerFolder: 'cypress/public',
  defaultCommandTimeout: 5000,
  e2e: {
    supportFile: false
  }
});
