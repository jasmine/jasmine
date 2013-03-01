module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        /* While it's possible that we could be considering unwanted prototype methods, mostly
         * we're doing this because the objects are being used as maps.
         */
        forin: false,

        /* We're fine with functions defined inside loops (setTimeout functions, etc) */
        loopfunc: true
      },
      all: ['src/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['jshint']);
};