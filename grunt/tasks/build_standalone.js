var grunt = require("grunt");

function standaloneTmpDir(path) {  return "dist/tmp/" + path; }

module.exports = {
  compileSpecRunner: function() {
    var runnerHtml = grunt.template.process(
        grunt.file.read("grunt/templates/SpecRunner.html.jst"),
        { data: { jasmineVersion: global.jasmineVersion }});

    grunt.file.write(standaloneTmpDir("SpecRunner.html"), runnerHtml);
  },

  cleanSpecRunner: function() {
    grunt.file.delete(standaloneTmpDir(""));
  }
};
