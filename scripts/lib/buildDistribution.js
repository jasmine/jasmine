const fs = require('fs');
const sass = require('sass');
const glob = require('glob');
const ejs = require('ejs');
const cssUrlEmbed = require('css-url-embed');

function buildDistribution() {
  compileSass();
  embedCssAssets();
  concatFiles();
}

function embedCssAssets() {
  const cssPath = 'lib/jasmine-core/jasmine.css';
  cssUrlEmbed.processFile(cssPath, cssPath, function(filePath) {
    if (filePath.endsWith('.png')) {
      return 'image/png';
    } else if (filePath.endsWith('.svg')) {
      return 'image/svg+xml';
    } else {
      throw new Error(`Don't know MIME type for file: ${filePath}`);
    }
  });
}

function compileSass() {
  const output = sass.compile('src/html/jasmine.scss');
  fs.writeFileSync('lib/jasmine-core/jasmine.css', output.css,
    {encoding: 'utf8'});
}

function concatFiles() {
  const pkg = JSON.parse(fs.readFileSync('package.json'));
  const configs = [
    {
      src: [
        'src/html/requireHtml.js',
        'src/html/HtmlReporter.js',
        'src/html/HtmlSpecFilter.js',
        'src/html/ResultsNode.js',
        'src/html/QueryString.js',
        'src/html/**/*.js'
      ],
      dest: 'lib/jasmine-core/jasmine-html.js',
    },
    {
      dest: 'lib/jasmine-core/jasmine.js',
      src: [
        'src/core/requireCore.js',
        'src/core/matchers/requireMatchers.js',
        'src/core/base.js',
        'src/core/util.js',
        'src/core/Spec.js',
        'src/core/Order.js',
        'src/core/Env.js',
        'src/core/JsApiReporter.js',
        'src/core/PrettyPrinter',
        'src/core/Suite',
        'src/core/**/*.js',
        {
          template: 'src/version.js',
          data: {version: pkg.version}
        },
      ],
    },
    {
      dest: 'lib/jasmine-core/boot0.js',
      src: ['src/boot/boot0.js'],
    },
    {
      dest: 'lib/jasmine-core/boot1.js',
      src: ['src/boot/boot1.js'],
    }
  ];
  const licenseBanner = {
    template: 'src/licenseBanner.js.ejs',
    data: {currentYear: new Date(Date.now()).getFullYear()}
  };

  for (const {src, dest} of configs) {
    src.unshift(licenseBanner);

    function expand(srcListEntry) {
      if (typeof srcListEntry === 'object') {
        return srcListEntry;
      }

      return glob.sync(srcListEntry)
        .sort(function (a, b) {
          // Match the sort order of previous build tools, so that the
          // output is the same.
          a = a.toLowerCase();
          b = b.toLowerCase();

          if (a < b) {
            return -1;
          } else if (a === b) {
            return 0;
          } else {
            return 1;
          }
        });
    }

    const srcs = src.flatMap(expand);
    const seen = new Set();
    const chunks = [];

    for (const s of srcs) {
      let content;

      if (!seen.has(s)) {
        if (s.template) {
          const template = fs.readFileSync(s.template, {encoding: 'utf8'});
          content = ejs.render(template, s.data);
        } else {
          content = fs.readFileSync(s, {encoding: 'utf8'});
        }

        chunks.push(content);
        seen.add(s);
      }
    }

    fs.writeFileSync(dest, chunks.join('\n'), {encoding: 'utf8'});
  }
}

module.exports = buildDistribution;
