module.exports = function(grunt) {
  var pkg = require("./package.json");
  global.jasmineVersion = pkg.version;

  grunt.initConfig({
    pkg: pkg,
    concat: require('./grunt/config/concat.js'),
    sass: require('./grunt/config/sass.js'),
    compress: require('./grunt/config/compress.js'),
    cssUrlEmbed: require('./grunt/config/cssUrlEmbed.js')
  });

  require('load-grunt-tasks')(grunt);

  grunt.loadTasks('grunt/tasks');

  grunt.registerTask('default', ['sass:dist', "cssUrlEmbed"]);

  grunt.registerTask('buildDistribution',
    'Builds and lints jasmine.js, jasmine-html.js, jasmine.css',
    [
      'sass:dist',
      "cssUrlEmbed",
      'concat'
    ]
  );

  grunt.registerTask("execSpecsInNode",
    "Run Jasmine core specs in Node.js",
    function() {
      verifyNoGlobals(() => require('./lib/jasmine-core.js').noGlobals());
      const done = this.async(),
          Jasmine = require('jasmine'),
          jasmineCore = require('./lib/jasmine-core.js'),
          jasmine = new Jasmine({jasmineCore: jasmineCore});

      jasmine.loadConfigFile('./spec/support/jasmine.json');
      jasmine.exitOnCompletion = false;
      jasmine.execute().then(
        result => done(result.overallStatus === 'passed'),
        err => {
          console.error(err);
          exit(1);
        }
      );
    }
  );

  grunt.registerTask("execSpecsInNode:performance",
    "Run Jasmine performance specs in Node.js",
    function() {
      require("shelljs").exec("node_modules/.bin/jasmine JASMINE_CONFIG_PATH=spec/support/jasmine-performance.json");
    }
  );
};

function verifyNoGlobals(fn) {
  const initialGlobals = Object.keys(global);
  fn();

  const extras = Object.keys(global).filter(k => !initialGlobals.includes(k));

  if (extras.length !== 0) {
    throw new Error('Globals were unexpectedly created: ' + extras.join(', '));
  }
}
