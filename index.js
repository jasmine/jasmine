var jasmine = module.exports = require(__dirname + "/src/base");
global.jasmine = jasmine; //need to make jasmine a global for now.
                          //we're transitioning to a more CommonJS-friendly style.

var srcFilesInOrder = [
  "util",
  "Env",
  "Reporter",
  "Block",
  "JsApiReporter",
  "Matchers",
  "mock-timeout",
  "MultiReporter",
  "NestedResults",
  "PrettyPrinter",
  "Queue",
  "Runner",
  "Spec",
  "Suite",
  "WaitsBlock",
  "WaitsForBlock"
];

for (var i=0; i<srcFilesInOrder.length; i++) require(__dirname + "/src/" + srcFilesInOrder[i]);