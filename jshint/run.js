var fs = require("fs");
var sys = require("sys");
var path = require("path");
var JSHINT = require("./jshint").JSHINT;

function isExcluded(fullPath) {
  var fileName = path.basename(fullPath);
  var excludeFiles = ["json2.js", "jshint.js", "publish.js", "node_suite.js", "jasmine.js", "jasmine-html.js"];
  for (var i=0; i<excludeFiles.length; i++) if (fileName==excludeFiles[i]) return true;
  return false;
}

function allJasmineJsFiles(rootDir) {
  var files = [];
  var things = fs.readdirSync(rootDir);
  for (var i=0; i<things.length; i++) {
    var thing = things[i];
    var fullPath = rootDir + "/" + thing;
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(allJasmineJsFiles(fullPath));
    } else {
      if (fullPath.match(/\.js$/) && !isExcluded(fullPath)) files.push(fullPath);
    }
  }
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
  for(var i=0; i<errors.length; i++) {
    if (!(errors[i] &&
          errors[i].raw && 
          errors[i].evidence &&
          ( errors[i].evidence.match(/jasmine\.undefined/) ||
            errors[i].evidence.match(/diz be undefined yo/) )
       )) keepErrors.push(errors[i]);
  }
  return keepErrors;  
}

for(var i=0; i<jasmineJsFiles.length; i++) {
  var file = jasmineJsFiles[i];
  JSHINT(fs.readFileSync(file, "utf8"), jasmineJsHintConfig);
  var errors = JSHINT.data().errors || [];
  errors = removeJasmineUndefinedErrors(errors);
  
  if (errors.length>=1) {
    console.log("JSHINT failure: ", file);
    console.log(errors);
    process.exit(1);
  }  
}