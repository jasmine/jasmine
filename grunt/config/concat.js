module.exports = {
  'jasmine-html': {
    src: [
      'src/html/HtmlReporter.js',
      'src/html/HtmlSpecFilter.js',
      'src/html/ResultsNode.js',
      'src/html/QueryString.js'
    ],
    dest: 'lib/jasmine-core/jasmine-html.js'
  },
  jasmine: {
    src: [
      'src/core/base.js',
      'src/core/util.js',
      'src/core/Spec.js',
      'src/core/Env.js',
      'src/core/JsApiReporter.js',
      'src/core/Matchers',
      'src/core/PrettyPrinter',
      'src/core/Suite',
      'src/core/**/*.js',
      'src/version.js'
    ],
    dest: 'lib/jasmine-core/jasmine.js'
  },
  options: {
    process: {
      data: {
        version: global.jasmineVersion
      }
    }
  }
};