var fs = require("fs")
var sys = require("sys")
var path = require("path")
var JSHINT = require("./jshint").JSHINT;

function isVendorFile(fullPath) {
  var fileName = path.basename(fullPath)
  var vendorFiles = ["json2.js", "jshint.js", "publish.js"]
  for (var i=0; i<vendorFiles.length; i++) if (fileName==vendorFiles[i]) return true
  return false
}

function allJasmineJsFiles(rootDir) {
  var files = []
  var things = fs.readdirSync(rootDir)
  for (var i=0; i<things.length; i++) {
    var thing = things[i]
    var fullPath = rootDir + "/" + thing
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(allJasmineJsFiles(fullPath))
    } else {
      if (fullPath.match(/\.js$/) && !isVendorFile(fullPath)) files.push(fullPath)
    }
  }
  return files
}

var jasmineJsFiles = allJasmineJsFiles(".")

var jasmineJsHintConfig = {}
var jasmineGlobals = {}


for(var i=0; i<jasmineJsFiles.length; i++) {
  var file = jasmineJsFiles[i]
  var result = JSHINT(fs.readFileSync(file, "utf8"))
  if (!result) {
    console.log("JSHINT failure: ", file)
    console.log(JSHINT.data().errors)
    process.exit(1)
  }  
}