var grunt = require('grunt');

function license() {
  var currentYear = "" + new Date(Date.now()).getFullYear();

  return grunt.template.process(
      grunt.file.read("grunt/templates/licenseBanner.js.jst"),
      { data: { currentYear: currentYear}});
}

module.exports = {
  'jasmine-html': {
    src: [
      'src/html/requireHtml.js',
      'src/html/HtmlReporter.js',
      'src/html/HtmlSpecFilter.js',
      'src/html/ResultsNode.js',
      'src/html/QueryString.js',
      'src/html/**/*.js'
    ],
    dest: 'lib/jasmine-core/jasmine-html.js'
  },
  jasmine: {
    src: [
      'src/core/requireCore.js',
      'src/core/matchers/requireMatchers.js',
      'src/core/base.js',
      'src/core/util.js',
      'src/core/Spec.js',
      'src/core/Order.js',
      'src/core/Env.js',
      'src/core/JsApiReporter.js',
      'src/core/PrettyPrinter',
      'src/core/Suite',
      'src/core/**/*.js',
      'src/version.js'
    ],
    dest: 'lib/jasmine-core/jasmine.js'
  },
  boot0: {
    src: ['src/boot/boot0.js'],
    dest: 'lib/jasmine-core/boot0.js'
  },
  boot1: {
    src: ['src/boot/boot1.js'],
    dest: 'lib/jasmine-core/boot1.js'
  },
  nodeBoot: {
    src: ['src/boot/node_boot.js'],
    dest: 'lib/jasmine-core/node_boot.js'
  },
  options: {
    banner: license(),
    process: {
      data: {
        version: global.jasmineVersion
      }
    }
  }
};
