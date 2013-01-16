
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

/**
 * getCurrentFile:
 * 
 * Get the file info about the file being currently executed.  Taken
 * from straight http://stackoverflow.com/a/14078345 , which is, in
 * turn, based on a huge hack from the gnome-shell sources:
 * http://git.gnome.org/browse/gnome-shell/tree/js/misc/extensionUtils.js
 */
function getCurrentFile() {
  let stack = (new Error()).stack;

  // Assuming we're importing this directly from an extension (and we shouldn't
  // ever not be), its UUID should be directly in the path here.
  let stackLine = stack.split('\n')[1];
  if (!stackLine) {
    throw new Error('Could not find current file');
  }

  // The stack line is like:
  //   init([object Object])@/home/user/data/gnome-shell/extensions/u@u.id/prefs.js:8
  //
  // In the case that we're importing from
  // module scope, the first field is blank:
  //   @/home/user/data/gnome-shell/extensions/u@u.id/prefs.js:8
  let match = new RegExp('@(.+):\\d+').exec(stackLine);
  if (!match) {
    throw new Error('Could not find current file');
  }

  let path = match[1];
  let file = Gio.File.new_for_path(path);
  return file;
}

const projectRoot = getCurrentFile().get_parent().get_parent().get_path();
imports.searchPath.unshift(projectRoot);

const jasmineGlobals = imports.lib['jasmine-core'].jasmine;
for (let k in jasmineGlobals) {
  this[k] = jasmineGlobals[k];
}
void(imports.src.console.ConsoleReporter);

function noop() {
}

jasmine.getAllSpecFiles = function(root, matcher) {
  let specs = [];
  (function findInner(dir) {
    let enumerator = dir.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NONE, null);
    let info = null;
    while ((info = enumerator.next_file(null))) {
      let type = info.get_file_type();
      let name = info.get_name();
      if (type === Gio.FileType.DIRECTORY) {
        let subdir = dir.get_child(name);
        findInner(subdir);
      } else if (type === Gio.FileType.REGULAR && name.match(matcher)) {
        let file = dir.get_child(name);
        specs.push(file);
      }
    }
    enumerator.close(null);
  })(root);
  return specs;
};


function now() {
  return new Date().getTime();
}

jasmine.asyncSpecWait = function() {
  var wait = jasmine.asyncSpecWait;
  wait.start = now();
  wait.done = false;
  (function innerWait() {
    waits(10);
    runs(function() {
      if (wait.start + wait.timeout < now()) {
        expect('timeout waiting for spec').toBeNull();
      } else if (wait.done) {
        wait.done = false;
      } else {
        innerWait();
      }
    });
  })();
};
jasmine.asyncSpecWait.timeout = 4 * 1000;
jasmine.asyncSpecDone = function() {
  jasmine.asyncSpecWait.done = true;
};

/*let file = Gio.File.new_for_path(projectRoot + '/spec/core/BaseSpec.js');
let results = file.load_contents(null);
if (results[0]) {
  eval(results[1]);
}*/

var isVerbose = false;
var showColors = true;
ARGV.forEach(function(arg) {
  switch (arg) {
    case '--color': showColors = true; break;
    case '--noColor': showColors = false; break;
    case '--verbose': isVerbose = true; break;
  }
});

let jsFile = /\.js$/;
let specs = jasmine.getAllSpecFiles(getCurrentFile().get_parent(), jsFile);
for (let i = 0; i < specs.length; i++) {
  let file = specs[i];
  let contents = file.load_contents(null);
  if (contents[0]) {
    let source = contents[1].toString();
    let requiresDom = source.indexOf('document.createElement') >= 0;
    if (requiresDom) {
      continue;
    }
    let module = file.get_path().replace(jsFile, '').replace(projectRoot, '');
    void(imports[module]);
  }
}

let stdout = Gio.UnixOutputStream.new(1, false);
function write(s) {
  stdout.write(s, null);
}

function executeSpecs() {
  let jasmineEnv = jasmine.getEnv();
  let consoleReporter = new jasmine.ConsoleReporter(write, done, showColors);
  jasmineEnv.addReporter(consoleReporter);
  jasmineEnv.execute();
}
GLib.idle_add(GLib.PRIORITY_DEFAULT, executeSpecs, null);

let result = -1;
let mainLoop = GLib.MainLoop.new(null, true);
function done(runner, log) {
  if (runner.results().failedCount === 0) {
    result = 0;
  } else {
    result = 1;
  }
  stdout.close(null);
  mainLoop.quit();
}
mainLoop.run();

result;