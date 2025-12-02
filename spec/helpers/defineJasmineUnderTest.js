(function() {
  // By the time onload is called, jasmineRequire will be redefined to point
  // to the Jasmine source files (and not jasmine.js). So re-require
  window.jasmineUnderTest = jasmineRequire.core(jasmineRequire);
  jasmineRequire.html(jasmineUnderTest);

  // Alias the private namespace so tests can be less verbose
  window.privateUnderTest = window.jasmineUnderTest.private;
})();
