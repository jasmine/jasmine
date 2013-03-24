var standaloneLibDir = "lib/jasmine-" + jasmineVersion;

function root(path) { return "./" + path; }
function lib(path) { return root("lib/jasmine-core/" + path); }
function dist(path) { return root("dist/" + path); }

module.exports = {
  standalone: {
    options: {
      archive: root("dist/jasmine-standalone-" + global.jasmineVersion + ".zip")
    },

    files: [
      { src: [ root("MIT.LICENSE") ] },
      {
        src: [ "jasmine_favicon.png"],
        dest: standaloneLibDir,
        expand: true,
        cwd: root("images")
      },
      {
        src: [
          "jasmine.js",
          "jasmine-html.js",
          "jasmine.css"
        ],
        dest: standaloneLibDir,
        expand: true,
        cwd: lib("")
      },
      {
        src: [ "boot.js" ],
        dest: standaloneLibDir,
        expand: true,
        cwd: lib("boot")
      },
      {
        src: [ "SpecRunner.html" ],
        dest: root(""),
        expand: true,
        cwd: dist("tmp")
      },
      {
        src: [ "*.js" ],
        dest: "src",
        expand: true,
        cwd: lib("example/src/")
      },
      {
        src: [ "*.js" ],
        dest: "spec",
        expand: true,
        cwd: lib("example/spec/")
      }
    ]
  }
};
