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
    'helpers/init.js',
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
    useRemoteSeleniumGrid: process.env.USE_SAUCE === 'true',
    remoteSeleniumGrid: {
      url: 'https://ondemand.saucelabs.com/wd/hub',
      browserVersion: process.env.SAUCE_BROWSER_VERSION,
      platformName: process.env.SAUCE_OS,
      'sauce:options': {
        name: `jasmine-core ${new Date().toISOString()}`,
        build: `Core ${process.env.CIRCLE_BUILD_NUM || 'Ran locally'}`,
        tags: ['Jasmine-Core'],
        tunnelIdentifier: process.env.SAUCE_TUNNEL_IDENTIFIER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      }
    }
  }
};
