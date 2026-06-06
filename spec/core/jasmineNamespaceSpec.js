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

  describe('Preventing monkey patching', function() {
    const mutable = mutableKeys();

    for (const key of expectedKeys()) {
      if (mutable.includes(key)) {
        it(`allows overwriting of jasmine.${key}`, function() {
          const existingVal = jasmineUnderTest[key];

          try {
            jasmineUnderTest[key] = 'new value';
            expect(jasmineUnderTest[key]).toEqual('new value');
          } finally {
            jasmineUnderTest[key] = existingVal;
          }
        });
      } else {
        it(`prevents overwriting of jasmine.${key}`, function() {
          const existingVal = jasmineUnderTest[key];

          try {
            jasmineUnderTest[key] = 'monkey patch';
            expect(jasmineUnderTest[key]).toBe(existingVal);
          } finally {
            // This will be a no-op if the test passed, but will prevent state
            // leakage if it failed.
            jasmineUnderTest[key] = existingVal;
          }
        });
      }
    }

    it('allows additions', function() {
      try {
        jasmineUnderTest.Ajax = 'it worked';
        expect(jasmineUnderTest.Ajax).toEqual('it worked');
      } finally {
        delete jasmineUnderTest.Ajax;
      }
    });
  });

  function mutableKeys() {
    return [
      'MAX_PRETTY_PRINT_ARRAY_LENGTH',
      'MAX_PRETTY_PRINT_CHARS',
      'MAX_PRETTY_PRINT_DEPTH',
      'DEFAULT_TIMEOUT_INTERVAL'
    ];
  }

  function expectedKeys() {
    // Does not include properties added by requireInterface(), since that isn't
    // called by defineJasmineUnderTest.js/nodeDefineJasmineUnderTest.js.
    const result = new Set([
      ...mutableKeys(),
      'debugLog',
      'getEnv',
      'isSpy',
      'ParallelReportDispatcher',
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
      result.add('HtmlReporterV2');
      result.add('HtmlReporterV2Urls');
      result.add('QueryString');
    }

    return result;
  }

  // Can't use Set#difference yet because it isn't available in Node <22
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
