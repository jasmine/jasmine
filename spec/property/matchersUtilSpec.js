describe('matchersUtil -- property tests', function() {
  'use strict';
  var fc = require('fast-check');

  function basicAnythingSettings() {
    return {
      key: fc.oneof(fc.string(), fc.constantFrom('k1', 'k2', 'k3')),
      // Limiting depth & number of keys allows fast-check to try
      // a lot more scalar values.
      maxDepth: 2,
      maxKeys: 5,
      withBoxedValues: true,
      withMap: true,
      withSet: true
    };
  }

  function numRuns() {
    var many = 5000000;

    // Be thorough but very slow when specified (usually on CI).
    if (process.env.JASMINE_LONG_PROPERTY_TESTS) {
      console.log(
        'Using',
        many,
        'runs of fc.assert because JASMINE_LONG_PROPERTY_TESTS was set. This may take several minutes.'
      );
      return many;
    } else {
      return undefined;
    }
  }

  describe('equals', function() {
    it('is symmetric', function() {
      fc.assert(
        fc.property(
          fc.anything(basicAnythingSettings()),
          fc.anything(basicAnythingSettings()),
          function(a, b) {
            return (
              jasmineUnderTest.matchersUtil.equals(a, b) ===
              jasmineUnderTest.matchersUtil.equals(b, a)
            );
          }
        ),
        {
          numRuns: numRuns(),
          examples: [[0, 5e-324]]
        }
      );
    });

    it('is reflexive', function() {
      var anythingSettings = basicAnythingSettings();
      anythingSettings.withMap = false;
      fc.assert(
        fc.property(fc.dedup(fc.anything(anythingSettings), 2), function(
          values
        ) {
          return jasmineUnderTest.matchersUtil.equals(values[0], values[1]);
        }),
        {
          numRuns: numRuns()
        }
      );
    });
  });
});
