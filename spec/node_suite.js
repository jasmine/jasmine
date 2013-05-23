var fs = require('fs');
var util = require('util');
var path = require('path');

var jasmineGlobals = require('../lib/jasmine-core/jasmine.js');
for (var k in jasmineGlobals) {
  global[k] = jasmineGlobals[k];
}
var env = jasmine.getEnv();

var jasmineInterface = {
  describe: function(description, specDefinitions) {
    return env.describe(description, specDefinitions);
  },

  xdescribe: function(description, specDefinitions) {
    return env.xdescribe(description, specDefinitions);
  },

  given: env.jasmine.given,

  it: function(desc, func) {
    return env.it(desc, func);
  },

  xit: function(desc, func) {
    return env.xit(desc, func);
  },

  beforeEach: function(beforeEachFunction) {
    return env.beforeEach(beforeEachFunction);
  },

  afterEach: function(afterEachFunction) {
    return env.afterEach(afterEachFunction);
  },

  expect: function(actual) {
    return env.expect(actual);
  },

  addMatchers: function(matchers) {
    return env.addMatchers(matchers);
  },

  spyOn: function(obj, methodName) {
    return env.spyOn(obj, methodName);
  },

  clock: env.clock,
  setTimeout: env.clock.setTimeout,
  clearTimeout: env.clock.clearTimeout,
  setInterval: env.clock.setInterval,
  clearInterval: env.clock.clearInterval,

  jsApiReporter: new jasmine.JsApiReporter(jasmine)
};

for (var k in jasmineInterface) {
  global[k] = jasmineInterface[k];
}

require('../src/console/ConsoleReporter.js');

/*
 Pulling in code from jasmine-node.

 We can't just depend on jasmine-node because it has its own jasmine that it uses.
 */

global.window = {
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};

delete global.window;

function noop() {
}

jasmine.executeSpecs = function(specs, done, isVerbose, showColors) {
  global.originalJasmine = jasmine;

  for (var i = 0, len = specs.length; i < len; ++i) {
    var filename = specs[i];
    require(filename.replace(/\.\w+$/, ""));
  }

  var jasmineEnv = jasmine.getEnv();
  var consoleReporter = new jasmine.ConsoleReporter({
    print: util.print,
    onComplete: done,
    showColors: showColors
  });

  jasmineEnv.addReporter(consoleReporter);
  jasmineEnv.execute();
};

jasmine.getAllSpecFiles = function(dir, matcher) {
  var specs = [];

  if (fs.statSync(dir).isFile() && dir.match(matcher)) {
    specs.push(dir);
  } else {
    var files = fs.readdirSync(dir);
    for (var i = 0, len = files.length; i < len; ++i) {
      var filename = dir + '/' + files[i];
      if (fs.statSync(filename).isFile() && filename.match(matcher)) {
        specs.push(filename);
      } else if (fs.statSync(filename).isDirectory()) {
        var subfiles = this.getAllSpecFiles(filename, matcher);
        subfiles.forEach(function(result) {
          specs.push(result);
        });
      }
    }
  }

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

for (var key in jasmine) {
  exports[key] = jasmine[key];
}

/*
 End jasmine-node runner
 */

var isVerbose = false;
var showColors = true;
process.argv.forEach(function(arg) {
  switch (arg) {
    case '--color': showColors = true; break;
    case '--noColor': showColors = false; break;
    case '--verbose': isVerbose = true; break;
  }
});

// var specs = jasmine.getAllSpecFiles(__dirname + '/smoke', new RegExp("test.js$"));
var specs = jasmine.getAllSpecFiles(__dirname, new RegExp("Spec.js$"));
var domIndependentSpecs = [];
for (var i = 0; i < specs.length; i++) {
  if (!specs[i].match('html')) {
    domIndependentSpecs.push(specs[i]);
  }
}

jasmine.executeSpecs(domIndependentSpecs, function(passed) {
  if (passed) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}, isVerbose, showColors);
