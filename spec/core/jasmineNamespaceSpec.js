// describe('The jasmine namespace', function() {
//   it('includes all expected properties', function() {
//     const actualKeys = new Set(Object.keys(jasmineUnderTest));
//     // toEqual doesn't generate diffs for set comparisons. Check this way
//     // instead so we get readable failure output.
//     expect(setDifference(expectedKeys(), actualKeys)).toEqual(new Set());
//   });
//
//   it('does not include any unexpected properties', function() {
//     const actualKeys = new Set(Object.keys(jasmineUnderTest));
//     // toEqual doesn't generate diffs for set comparisons. Check this way
//     // instead so we get readable failure output.
//     expect(setDifference(actualKeys, expectedKeys())).toEqual(new Set());
//   });
//
//   function expectedKeys() {
//     // Note: Does not include properties added by requi
//     return new Set([
//       'DEFAULT_TIMEOUT_INTERVAL',
//       'MAX_PRETTY_PRINT_ARRAY_LENGTH',
//       'MAX_PRETTY_PRINT_CHARS',
//       'MAX_PRETTY_PRINT_DEPTH',
//       'addAsyncMatchers',
//       'addCustomObjectFormatter',
//       'addMatchers',
//       'addSpyStrategy',
//       'clock',
//       'createSpy',
//       'createSpyObj',
//       'debugLog',
//       'getEnv',
//       'isSpy',
//       'ParallelReportDispatcher',
//       'private',
//       'setDefaultSpyStrategy',
//       'spyOnGlobalErrorsAsync',
//       'Timer',
//       'version',
//
//       // Asymmetric equality testers
//       'any',
//       'anything',
//       'arrayContaining',
//       'arrayWithExactContents',
//       'empty',
//       'falsy',
//       'is',
//       'mapContaining',
//       'notEmpty',
//       'objectContaining',
//       'setContaining',
//       'stringContaining',
//       'stringMatching',
//       'truthy',
//
//       // Currently undocumented but used in browser boot files
//       'getGlobal',
//
//       // jasmine-html.js
//       // TODO: make sure 5.11 additions are here
//       'HtmlReporter',
//       'HtmlSpecFilter',
//       'QueryString'
//
//       // TODO probably a few more
//     ]);
//   }
//
//   // Can't use Set#difference yet because it isn't available in Node <22,
//   // Firefox <108, or Safari <17.
//   function setDifference(a, b) {
//     const result = new Set();
//
//     for (const v of a) {
//       if (!b.has(v)) {
//         result.add(v);
//       }
//     }
//
//     return result;
//   }
// });
