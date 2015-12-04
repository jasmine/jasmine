(function() {
  // By the time onload is called, jasmineRequire will be redefined to point
  // to the Jasmine source files (and not jasmine.js). So re-require
  window.jasmineUnderTest = jasmineRequire.core(jasmineRequire);
  jasmineRequire.html(jasmineUnderTest);
  jasmineRequire.console(jasmineRequire, jasmineUnderTest);
})();
