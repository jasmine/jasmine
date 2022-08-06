describe('npm package', function() {
  const path = require('path'),
    temp = require('temp').track(),
    fs = require('fs');

  beforeAll(function() {
    const shell = require('shelljs'),
      pack = shell.exec('npm pack', { silent: true });

    this.tarball = pack.stdout.split('\n')[0];
    this.tmpDir = temp.mkdirSync(); // automatically deleted on exit

    const untar = shell.exec(
      'tar -xzf ' + this.tarball + ' -C ' + this.tmpDir,
      {
        silent: true
      }
    );
    expect(untar.code).toBe(0);

    this.packagedCore = require(path.join(
      this.tmpDir,
      'package/lib/jasmine-core.js'
    ));
  });

  beforeEach(function() {
    jasmine.addMatchers({
      toExistInPath: function() {
        return {
          compare: function(actual, expected) {
            const fullPath = path.resolve(expected, actual);
            return {
              pass: fs.existsSync(fullPath)
            };
          }
        };
      }
    });
  });

  afterAll(function() {
    fs.unlinkSync(this.tarball);
  });

  it('has a root path', function() {
    expect(this.packagedCore.files.path).toEqual(
      fs.realpathSync(path.resolve(this.tmpDir, 'package/lib/jasmine-core'))
    );
  });

  it('has a bootDir', function() {
    expect(this.packagedCore.files.bootDir).toEqual(
      fs.realpathSync(path.resolve(this.tmpDir, 'package/lib/jasmine-core'))
    );
  });

  it('has jsFiles', function() {
    expect(this.packagedCore.files.jsFiles).toEqual([
      'jasmine.js',
      'jasmine-html.js'
    ]);

    const packagedCore = this.packagedCore;
    this.packagedCore.files.jsFiles.forEach(function(fileName) {
      expect(fileName).toExistInPath(packagedCore.files.path);
    });
  });

  it('has cssFiles', function() {
    expect(this.packagedCore.files.cssFiles).toEqual(['jasmine.css']);

    const packagedCore = this.packagedCore;
    this.packagedCore.files.cssFiles.forEach(function(fileName) {
      expect(fileName).toExistInPath(packagedCore.files.path);
    });
  });

  it('has bootFiles', function() {
    expect(this.packagedCore.files.bootFiles).toEqual(['boot0.js', 'boot1.js']);

    for (const fileName of this.packagedCore.files.bootFiles) {
      expect(fileName).toExistInPath(this.packagedCore.files.bootDir);
    }
  });

  it('has an imagesDir', function() {
    expect(this.packagedCore.files.imagesDir).toEqual(
      fs.realpathSync(path.resolve(this.tmpDir, 'package/images'))
    );
    const images = fs.readdirSync(path.resolve(this.tmpDir, 'package/images'));

    expect(images).toContain('jasmine-horizontal.png');
    expect(images).toContain('jasmine-horizontal.svg');
    expect(images).toContain('jasmine_favicon.png');
  });

  it('does not have CI config files and scripts', function() {
    expect(fs.existsSync(path.resolve(this.tmpDir, 'package/.circleci'))).toBe(
      false
    );
    expect(fs.existsSync(path.resolve(this.tmpDir, 'package/scripts'))).toBe(
      false
    );
  });

  it('does not have any unexpected files in the root directory', function() {
    const files = fs.readdirSync(this.tmpDir);
    expect(files).toEqual(['package']);
  });

  it('does not have any unexpected files in the package directory', function() {
    const files = fs.readdirSync(path.resolve(this.tmpDir, 'package'));
    files.sort();
    expect(files).toEqual([
      'MIT.LICENSE',
      'README.md',
      'images',
      'lib',
      'package.json'
    ]);
  });

  it('only has images in the images dir', function() {
    const files = fs.readdirSync(path.resolve(this.tmpDir, 'package/images'));

    for (let i = 0; i < files.length; i++) {
      expect(files[i]).toMatch(/\.(svg|png)$/);
    }
  });

  it('only has JS and CSS files in the lib dir', function() {
    const files = [];

    function getFiles(dir) {
      const dirents = fs.readdirSync(dir, { withFileTypes: true });

      for (let j = 0; j < dirents.length; j++) {
        const dirent = dirents[j];

        if (dirent.isDirectory()) {
          getFiles(path.resolve(dir, dirent.name));
        } else {
          files.push(path.resolve(dir, dirent.name));
        }
      }
    }

    getFiles(path.resolve(this.tmpDir, 'package/lib'));

    for (let i = 0; i < files.length; i++) {
      expect(files[i]).toMatch(/\.(js|css)$/);
    }
  });
});
