var fs = require('fs');
var sys = require('sys');
var path = require('path');

// yes, really keep this here to keep us honest, but only for jasmine's own runner! [xw]
// undefined = "diz be undefined yo";

var jasmineGlobals = require("../src/base");
for(var k in jasmineGlobals) {global[k] = jasmineGlobals[k];}

//load jasmine src files based on the order in runner.html
var srcFilesInProperRequireOrder = [];
var runnerHtmlLines = fs.readFileSync("spec/runner.html", "utf8").split("\n");
var srcFileLines = [];
for (var i=0; i<runnerHtmlLines.length; i++) 
  if (runnerHtmlLines[i].match(/script(.*?)\/src\//)) 
    srcFileLines.push(runnerHtmlLines[i]);
for (i=0; i<srcFileLines.length; i++) srcFilesInProperRequireOrder.push(srcFileLines[i].match(/src=\"(.*?)\"/)[1]);
for (i=0; i<srcFilesInProperRequireOrder.length; i++) require(srcFilesInProperRequireOrder[i]);


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

function noop(){}

jasmine.executeSpecs = function(specs, done){
  for (var i = 0, len = specs.length; i < len; ++i){
    var filename = specs[i];
    require(filename.replace(/\.\w+$/, ""));
  }

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.reporter = new jasmine.TrivialConsoleReporter(sys.print, done)
  jasmineEnv.execute();
};

jasmine.getAllSpecFiles = function(dir, matcher){
  var specs = [];

  if (fs.statSync(dir).isFile() && dir.match(matcher)) {
    specs.push(dir);
  } else {
    var files = fs.readdirSync(dir);
    for (var i = 0, len = files.length; i < len; ++i){
      var filename = dir + '/' + files[i];
      if (fs.statSync(filename).isFile() && filename.match(matcher)){
        specs.push(filename);
      }else if (fs.statSync(filename).isDirectory()){
        var subfiles = this.getAllSpecFiles(filename, matcher);
        subfiles.forEach(function(result){
          specs.push(result);
        });
      }
    }
  }
  
  return specs;
};

jasmine.printRunnerResults = function(runner){
  var results = runner.results();
  var suites = runner.suites();
  var msg = '';
  msg += suites.length + ' spec' + ((suites.length === 1) ? '' : 's') + ', ';
  msg += results.totalCount + ' expectation' + ((results.totalCount === 1) ? '' : 's') + ', ';
  msg += results.failedCount + ' failure' + ((results.failedCount === 1) ? '' : 's') + '\n';
  return msg;
};

function now(){
  return new Date().getTime();
}

jasmine.asyncSpecWait = function(){
  var wait = jasmine.asyncSpecWait;
  wait.start = now();
  wait.done = false;
  (function innerWait(){
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
jasmine.asyncSpecDone = function(){
  jasmine.asyncSpecWait.done = true;
};

for ( var key in jasmine) {
  exports[key] = jasmine[key];
}

/*
End jasmine-node runner
*/





var isVerbose = false;
var showColors = true;
process.argv.forEach(function(arg){
  switch(arg) {
  case '--color': showColors = true; break;
  case '--noColor': showColors = false; break;
  case '--verbose': isVerbose = true; break;
  }
});

var specs = jasmine.getAllSpecFiles(__dirname + '/suites', new RegExp(".js$"));
var domIndependentSpecs = [];
for(var i=0; i<specs.length; i++) { 
  if (fs.readFileSync(specs[i], "utf8").indexOf("document.createElement")<0) {
    domIndependentSpecs.push(specs[i]);
  }
}

jasmine.executeSpecs(domIndependentSpecs, function(runner, log){
  if (runner.results().failedCount === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}, isVerbose, showColors);