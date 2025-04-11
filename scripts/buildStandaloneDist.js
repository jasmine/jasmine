const fs = require('fs');
const path = require('path');
const glob = require('glob');
const ejs = require('ejs');
const archiver = require('archiver');
const { rimrafSync } = require('rimraf');
const buildDistribution = require('./lib/buildDistribution');

const tmpDir = 'dist/tmp'

if (!fs.existsSync(tmpDir)) {
  if (!fs.existsSync(path.dirname(tmpDir))) {
    fs.mkdirSync(path.dirname(tmpDir));
  }
  fs.mkdirSync(tmpDir);
}

buildStandaloneDist().finally(function() {
  rimrafSync(tmpDir);
});

async function buildStandaloneDist() {
  buildDistribution();
  const pkg = JSON.parse(fs.readFileSync('package.json'));
  compileSpecRunner(pkg.version);
  await zipStandaloneDist(pkg.version);
}

function compileSpecRunner(jasmineVersion) {
  const template = fs.readFileSync('src/SpecRunner.html.ejs',
    {encoding: 'utf8'});
  const runnerHtml = ejs.render(template, { jasmineVersion });
  fs.writeFileSync('dist/tmp/SpecRunner.html', runnerHtml,
    {encoding: 'utf8'});
}

async function zipStandaloneDist(jasmineVersion) {
  const fileGroups = [
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

  const destPath = `./dist/jasmine-standalone-${jasmineVersion}.zip`;
  const output = fs.createWriteStream(destPath);
  const archive = archiver('zip');

  const done = new Promise(function(resolve, reject) {
    output.on('close', resolve);
    archive.on('warning', reject);
    archive.on('error', reject);
  });

  archive.pipe(output);

  for (const group of fileGroups) {
    for (const srcPath of group.src) {
      let destPath = path.basename(srcPath);

      if (group.destDir) {
        destPath = `${group.destDir}/${destPath}`;
      }

      archive.file(srcPath, {name: destPath});
    }
  }

  archive.finalize();
  await done;
}
