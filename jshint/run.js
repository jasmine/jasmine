var fs = require("fs");
var util = require("util");
var path = require("path");
var JSHINT = require("./jshint").JSHINT;

// DWF TODO: Standardize this?
function isExcluded(fullPath) {
  var fileName = path.basename(fullPath);
  var excludeFiles = ["json2.js", "jshint.js", "publish.js", "node_suite.js", "jasmine.js", "jasmine-html.js"];
  for (var i = 0; i < excludeFiles.length; i++) {
    if (fileName == excludeFiles[i]) {
      return true;
    }
  }
  return false;
}

// DWF TODO: This function could/should be re-written
function allJasmineJsFiles(rootDir) {
  var files = [];
  fs.readdirSync(rootDir).filter(function(filename) {

    var fullPath = rootDir + "/" + filename;
    if (fs.statSync(fullPath).isDirectory() && !fullPath.match(/pages/)) {
      var subDirFiles = allJasmineJsFiles(fullPath);
      if (subDirFiles.length > 0) {
        files = files.concat();
        return true;
      }
    } else {
      if (fullPath.match(/\.js$/) && !isExcluded(fullPath)) {
        files.push(fullPath);
        return true;
      }
    }
    return false;
  });

  return files;
}

var jasmineJsFiles = allJasmineJsFiles(".");
jasmineJsFiles.reverse(); //cheap way to do the stuff in src stuff first

var jasmineJsHintConfig = {

  forin:true,             //while it's possible that we could be
  //considering unwanted prototype methods, mostly
  //we're doing this because the jsobjects are being
  //used as maps.

  loopfunc:true           //we're fine with functions defined inside loops (setTimeout functions, etc)

};

var jasmineGlobals = {};


//jasmine.undefined is a jasmine-ism, let's let it go...
function removeJasmineUndefinedErrors(errors) {
  var keepErrors = [];
  for (var i = 0; i < errors.length; i++) {
    if (!(errors[i] &&
      errors[i].raw &&
      errors[i].evidence &&
      ( errors[i].evidence.match(/jasmine\.undefined/) ||
        errors[i].evidence.match(/diz be undefined yo/) )
      )) {
      keepErrors.push(errors[i]);
    }
  }
  return keepErrors;
}

(function() {
  var ansi = {
    green: '\033[32m',
    red: '\033[31m',
    yellow: '\033[33m',
    none: '\033[0m'
  };

  for (var i = 0; i < jasmineJsFiles.length; i++) {
    var file = jasmineJsFiles[i];
    JSHINT(fs.readFileSync(file, "utf8"), jasmineJsHintConfig);
    var errors = JSHINT.data().errors || [];
    errors = removeJasmineUndefinedErrors(errors);

    if (errors.length >= 1) {
      console.log(ansi.red + "Jasmine JSHint failure: " + ansi.none);
      console.log(file);
      console.log(errors);
      process.exit(1);
    }
  }

  console.log(ansi.green + "Jasmine JSHint PASSED." + ansi.none);
})();

