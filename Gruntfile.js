module.exports = function(grunt) {
  var pkg = require("./package.json");
  global.jasmineVersion = pkg.version;

  grunt.initConfig({
    pkg: pkg,
    concat: require('./grunt/config/concat.js'),
    sass: require('./grunt/config/sass.js'),
    cssUrlEmbed: require('./grunt/config/cssUrlEmbed.js')
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerMultiTask('cssUrlEmbed', "Embed URLs as base64 strings inside your stylesheets", function () {
    var done = this.async();

    import('css-url-embed').then(cssEmbed => {
      for (const file of this.files) {
        try {
          grunt.log.subhead('Processing source file "' + file.src[0] + '"');
          const urls = cssEmbed.processFile(file.src[0], file.dest);

          for (const url of urls) {
            grunt.log.ok('"' + url + '" embedded');
          }

          grunt.log.writeln('File "' + file.dest + '" created');
        } catch (e) {
          grunt.log.error(e);
          grunt.fail.warn('URL embedding failed\n');
        }
      }

      done();
    });
  });

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
          done(false);
        }
      );
    }
  );

  grunt.registerTask("execSpecsInParallel",
    "Run Jasmine core specs in parallel in Node.js",
    function() {
      // Need to require this here rather than at the top of the file
      // so that we don't break verifyNoGlobals above by loading jasmine-core
      // too early
      const ParallelRunner = require('jasmine/parallel');
      let numWorkers = require('os').cpus().length;

      if (process.env['CIRCLECI']) {
        // On Circle CI, the above gives the number of CPU cores on the host
        // computer, which is unrelated to the resources actually available
        // to the container. 2 workers gives peak performance with our current
        // configuration, but 4 might increase the odds of discovering any
        // parallel-specific bugs.
        numWorkers = 4;
      }

      const done = this.async();
      const runner = new ParallelRunner({
        jasmineCore: require('./lib/jasmine-core.js'),
        numWorkers
      });

      runner.loadConfigFile('./spec/support/jasmine.json')
        .then(() => {
          runner.exitOnCompletion = false;
          return runner.execute();
        }).then(
          jasmineDoneInfo => done(jasmineDoneInfo.overallStatus === 'passed'),
          err => {
            console.error(err);
            done(false);
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
