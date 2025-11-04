describe('The jasmine namespace', function() {
  it('includes all expected properties', function() {
    const actualKeys = new Set(Object.keys(jasmineUnderTest));
    // toEqual doesn't generate diffs for set comparisons. Check this way
    // instead so we get readable failure output.
    expect(setDifference(expectedKeys(), actualKeys)).toEqual(new Set());
  });

  it('does not include any unexpected properties', function() {
    const actualKeys = new Set(Object.keys(jasmineUnderTest));
    // toEqual doesn't generate diffs for set comparisons. Check this way
    // instead so we get readable failure output.
    expect(setDifference(actualKeys, expectedKeys())).toEqual(new Set());
  });

  function expectedKeys() {
    // Does not include properties added by requireInterface(), since that isn't
    // called by defineJasmineUnderTest.js/nodeDefineJasmineUnderTest.js.
    const result = new Set([
      'MAX_PRETTY_PRINT_ARRAY_LENGTH',
      'MAX_PRETTY_PRINT_CHARS',
      'MAX_PRETTY_PRINT_DEPTH',
      'debugLog',
      'getEnv',
      'isSpy',
      'ParallelReportDispatcher',
      'private',
      'spyOnGlobalErrorsAsync',
      'Timer',
      'version',

      // Asymmetric equality testers
      'allOf',
      'any',
      'anything',
      'arrayContaining',
      'arrayWithExactContents',
      'empty',
      'falsy',
      'is',
      'mapContaining',
      'notEmpty',
      'objectContaining',
      'setContaining',
      'stringContaining',
      'stringMatching',
      'truthy',

      // Currently undocumented but used in browser boot files, so it's
      // effectively public
      'getGlobal'
    ]);

    if (typeof window !== 'undefined') {
      // jasmine-html.js
      result.add('HtmlReporter');
      result.add('HtmlReporterV2');
      result.add('HtmlReporterV2Urls');
      result.add('HtmlSpecFilter');
      result.add('QueryString');
    }

    return result;
  }

  // Can't use Set#difference yet because it isn't available in Node <22,
  // Firefox <108, or Safari <17.
  function setDifference(a, b) {
    const result = new Set();

    for (const v of a) {
      if (!b.has(v)) {
        result.add(v);
      }
    }

    return result;
  }
});
