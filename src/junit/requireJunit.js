function getJasmineRequireObj() {
  if (typeof module !== "undefined" && module.exports) {
    return exports;
  } else {
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

getJasmineRequireObj().junit = function(jRequire, j$) {
  j$.JunitReporter = jRequire.JunitReporter(j$);
  j$.JunitResultsNode = jRequire.JunitResultsNode(j$);
};
