var grunt = require("grunt");
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const glob = require('glob');

function standaloneTmpDir(path) {  return "dist/tmp/" + path; }

grunt.registerTask("build:compileSpecRunner",
    "Processes the spec runner template and writes to a tmp file",
    function() {
        var runnerHtml = grunt.template.process(
            grunt.file.read("grunt/templates/SpecRunner.html.jst"),
            { data: { jasmineVersion: global.jasmineVersion }});

        grunt.file.write(standaloneTmpDir("SpecRunner.html"), runnerHtml);
    }
);

grunt.registerTask("build:cleanSpecRunner",
    "Deletes the tmp spec runner file",
    function() {
        grunt.file.delete(standaloneTmpDir(""));
    }
);

const standaloneFileGroups = [
    {
        src: [
            'LICENSE',
            'dist/tmp/SpecRunner.html',
        ]
    },
    {
        src: [
            'images/jasmine_favicon.png',
            'lib/jasmine-core/jasmine.js',
            'lib/jasmine-core/jasmine-html.js',
            'lib/jasmine-core/jasmine.css',
            'lib/jasmine-core/boot0.js',
            'lib/jasmine-core/boot1.js',
        ],
        destDir: 'lib/jasmine-' + jasmineVersion
    },
    {
        src: glob.sync('lib/jasmine-core/example/src/*.js'),
        destDir: 'src'
    },
    {
        src: glob.sync('lib/jasmine-core/example/spec/*.js'),
        destDir: 'spec'
    }
];

grunt.registerTask("zipStandaloneDist",
    "Creates a zip file for the standalone distribution",
    function() {
        const done = this.async();
        const destPath = `./dist/jasmine-standalone-${global.jasmineVersion}.zip`;
        const output = fs.createWriteStream(destPath);
        const archive = archiver('zip');

        output.on('close', done);

        archive.on('warning', function (err) {
            grunt.fail.warn(err)
        });

        archive.on('error', function (err) {
            grunt.fail.warn(err)
        });

        archive.pipe(output);

        for (const group of standaloneFileGroups) {
            for (const srcPath of group.src) {
                let destPath = path.basename(srcPath);

                if (group.destDir) {
                    destPath = `${group.destDir}/${destPath}`;
                }

                archive.file(srcPath, {name: destPath});
            }
        }

        archive.finalize();
    }
);

grunt.registerTask("buildStandaloneDist",
    "Builds a standalone distribution",
    [
      "buildDistribution",
      "build:compileSpecRunner",
      "zipStandaloneDist",
      "build:cleanSpecRunner"
    ]
);
