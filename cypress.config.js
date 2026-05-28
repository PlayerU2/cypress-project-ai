const { defineConfig } = require('cypress')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(__dirname, '.env')

if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .forEach((line) => {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()

      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = value
      }
    })
}

module.exports = defineConfig({
  allowCypressEnv: false,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/mochawesome',
    reportFilename: '[datetime]-[name]-report',
    timestamp: 'yyyy-mm-dd_HH-MM-ss',
    charts: true,
    reportPageTitle: 'Hub de Leitura - Relatorio de Testes E2E',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    overwrite: false,
    html: true,
    json: true,
  },

  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    screenshotOnRunFailure: true,
    video: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      return config
    },
  },
  env: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    adminEmail: process.env.CYPRESS_ADMIN_EMAIL,
    adminPassword: process.env.CYPRESS_ADMIN_PASSWORD,
    userEmail: process.env.CYPRESS_USER_EMAIL,
    userPassword: process.env.CYPRESS_USER_PASSWORD,
    testEnvironment: process.env.TEST_ENVIRONMENT || 'local',
    testRunName: process.env.TEST_RUN_NAME || 'hub-leitura-local',
  },
})
