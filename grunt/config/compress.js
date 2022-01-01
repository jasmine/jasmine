var standaloneLibDir = "lib/jasmine-" + jasmineVersion;

function root(path) { return "./" + path; }
function libJasmineCore(path) { return root("lib/jasmine-core/" + path); }
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
        cwd: libJasmineCore("")
      },
      {
        src: [ "boot0.js", "boot1.js" ],
        dest: standaloneLibDir,
        expand: true,
        cwd: libJasmineCore("")
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
        cwd: libJasmineCore("example/src/")
      },
      {
        src: [ "*.js" ],
        dest: "spec",
        expand: true,
        cwd: libJasmineCore("example/spec/")
      }
    ]
  }
};
