var grunt = require("grunt");
var _ = require("underscore");

function standaloneTmpDir(path) {  return "dist/tmp/" + path; }

module.exports = {
  compileSpecRunner: function() {
    var runnerTemplate = _.template(grunt.file.read("lib/templates/SpecRunner.html.jst")),
      runner = runnerTemplate({ jasmineVersion: global.jasmineVersion });

    grunt.file.write(standaloneTmpDir("SpecRunner.html"), runner);
  },

  cleanSpecRunner: function() {
    grunt.file.delete(standaloneTmpDir(""));
  }
};
