(function() {
  // By the time onload is called, getJasmineRequireObj() and
  // getJasmineHtmlRequireObj() will be redefined to point
  // to the Jasmine source files (and not jasmine.js). So re-require.
  const jasmineRequire = getJasmineRequireObj();
  const coreUnderTest = jasmineRequire.core(jasmineRequire);
  window.jasmineUnderTest = coreUnderTest.jasmine;
  window.privateUnderTest = coreUnderTest.private;

  getJasmineHtmlRequireObj().html(jasmineUnderTest, privateUnderTest);
})();
