module.exports = function(grunt) {
  var pkg = require("./package.json");
  global.jasmineVersion = pkg.version;

  grunt.initConfig({
    pkg: pkg,
    jshint: require('./grunt/config/jshint.js'),
    concat: require('./grunt/config/concat.js'),
    compass: require('./grunt/config/compass.js'),
    compress: require('./grunt/config/compress.js')
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('default', ['jshint:all']);

  grunt.registerTask('buildDistribution',
    'Builds and lints jasmine.js, jasmine-html.js, jasmine.css',
    [
      'compass',
      'jshint:beforeConcat',
      'concat',
      'jshint:afterConcat'
    ]
  );

  var standaloneBuilder = require('./grunt/tasks/build_standalone.js');

  grunt.registerTask("build:compileSpecRunner",
    "Processes the spec runner template and writes to a tmp file",
    standaloneBuilder.compileSpecRunner
  );

  grunt.registerTask("build:cleanSpecRunner",
    "Deletes the tmp spec runner file",
    standaloneBuilder.cleanSpecRunner
  );

  grunt.registerTask("buildStandaloneDist",
    "Builds a standalone distribution",
    [
      "build:compileSpecRunner",
      "compress:standalone",
      "build:cleanSpecRunner"
    ]
  );
};