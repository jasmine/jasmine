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
    '**/*.js',
    '!boot/**.js'
  ],
  specDir: 'spec',
  specFiles: ['**/*[Ss]pec.js', '!npmPackage/**/*'],
  helpers: [
    'helpers/generator.js',
    'helpers/BrowserFlags.js',
    'helpers/domHelpers.js',
    'helpers/integrationMatchers.js',
    'helpers/defineJasmineUnderTest.js',
    'helpers/resetEnv.js'
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
      tunnelIdentifier: process.env.SAUCE_TUNNEL_IDENTIFIER,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY
    }
  }
};
