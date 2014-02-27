(function() {
  // By the time onload is called, jasmineRequire will be redefined to point
  // to the Jasmine source files (and not jasmine.js). So re-require
  window.j$ = jasmineRequire.core(jasmineRequire);
  jasmineRequire.html(j$);
  jasmineRequire.console(jasmineRequire, j$);
})();
