var _ = require("underscore");

module.exports = function(grunt) {
  return {
    registerTasks: function() {
      grunt.registerTask("build:compileSpecRunner",
        "Processes the spec runner template and writes to a tmp file",
        this.compileSpecRunner
      );

      grunt.registerTask("build:cleanSpecRunner",
        "Deletes the tmp spec runner file",
        this.cleanSpecRunner
      );

      grunt.registerTask("buildStandaloneDist",
        "Builds a standalone distribution",
        ["build:compileSpecRunner", "compress:standalone", "build:cleanSpecRunner"]
      );
    },

    compileSpecRunner: function() {
      var runnerTemplate = _.template(grunt.file.read("lib/templates/SpecRunner.html.jst")),
        runner = runnerTemplate({ jasmineVersion: global.jasmineVersion });

      grunt.file.write(standaloneTmpDir("SpecRunner.html"), runner);
    },

    cleanSpecRunner: function() {
      grunt.file.delete(standaloneTmpDir(""));
    }
  };

  function standaloneTmpDir(path) {
    return "dist/tmp/" + path;
  }
};