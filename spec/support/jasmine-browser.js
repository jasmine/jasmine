/* eslint-env node, es6 */
module.exports = {
  srcDir: 'src',
  srcFiles: [
    'core/requireCore.js',
    'core/base.js',
    'core/util.js',
    'core/Spec.js',
    'core/Env.js',
    'core/JsApiReporter.js',
    'core/PrettyPrinter.js',
    'core/Suite.js',
    'core/**/*.js',
    'html/**/*.js',
    '**/*.js'
  ],
  specDir: 'spec',
  specFiles: ['**/*[Ss]pec.js', '!npmPackage/**/*'],
  helpers: [
    'helpers/asyncAwait.js',
    'helpers/BrowserFlags.js',
    'helpers/checkForMap.js',
    'helpers/checkForSet.js',
    'helpers/checkForSymbol.js',
    'helpers/checkForTypedArrays.js',
    'helpers/integrationMatchers.js',
    'helpers/promises.js',
    'helpers/defineJasmineUnderTest.js'
  ],
  random: true,
  browser: {
    name: process.env.JASMINE_BROWSER || 'firefox',
    useSauce: process.env.USE_SAUCE === 'true',
    sauce: {
      name: `jasmine-core ${new Date().toISOString()}`,
      os: process.env.SAUCE_OS,
      browserVersion: process.env.SAUCE_BROWSER_VERSION,
      build: `Core ${process.env.TRAVIS_BUILD_NUMBER || 'Ran locally'}`,
      tags: ['Jasmine-Core'],
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
        ? process.env.TRAVIS_JOB_NUMBER.toString()
        : null,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY
    }
  }
};
