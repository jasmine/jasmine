module.exports = function (grunt) {
  grunt.initConfig({
    jshint: require('./grunt/config/jshint.js')
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint:all']);
};