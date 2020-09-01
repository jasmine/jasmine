describe('asymmetricEqualityTesterArgCompatShim', function() {
  it('provides all the properties of the MatchersUtil', function() {
    var matchersUtil = {
        foo: function() {},
        bar: function() {}
      },
      shim = jasmineUnderTest.asymmetricEqualityTesterArgCompatShim(
        matchersUtil,
        []
      );

    expect(shim.foo).toBe(matchersUtil.foo);
    expect(shim.bar).toBe(matchersUtil.bar);
  });

  it('provides all the properties of the customEqualityTesters', function() {
    var customEqualityTesters = [function() {}, function() {}],
      shim = jasmineUnderTest.asymmetricEqualityTesterArgCompatShim(
        {},
        customEqualityTesters
      );

    expect(shim.length).toBe(2);
    expect(shim[0]).toBe(customEqualityTesters[0]);
    expect(shim[1]).toBe(customEqualityTesters[1]);
  });

  it('provides all the properties of Array.prototype', function() {
    var shim = jasmineUnderTest.asymmetricEqualityTesterArgCompatShim({}, []);

    expect(shim.filter).toBe(Array.prototype.filter);
    expect(shim.forEach).toBe(Array.prototype.forEach);
    expect(shim.map).toBe(Array.prototype.map);
  });

  it('provides properties of Array.prototype', function() {
    var keys = [
        'concat',
        'every',
        'filter',
        'forEach',
        'indexOf',
        'join',
        'lastIndexOf',
        'length',
        'map',
        'pop',
        'push',
        'reduce',
        'reduceRight',
        'reverse',
        'shift',
        'slice',
        'some',
        'sort',
        'splice',
        'unshift'
      ],
      optionalKeys = [
        'copyWithin',
        'entries',
        'fill',
        'find',
        'findIndex',
        'flat',
        'flatMap',
        'includes',
        'keys',
        'toSource',
        'values'
      ],
      shim = jasmineUnderTest.asymmetricEqualityTesterArgCompatShim({}, []),
      i,
      k;

    // Properties that are present on all supported runtimes
    for (i = 0; i < keys.length; i++) {
      k = keys[i];
      expect(shim[k])
        .withContext(k)
        .not.toBeUndefined();
      expect(shim[k])
        .withContext(k)
        .toBe(Array.prototype[k]);
    }

    // Properties that are present on only some supported runtimes
    for (i = 0; i < optionalKeys.length; i++) {
      k = optionalKeys[i];

      if (shim[k] !== undefined) {
        expect(shim[k])
          .withContext(k)
          .toBe(Array.prototype[k]);
      }
    }
  });

  describe('When Array.prototype additions collide with MatchersUtil methods', function() {
    function keys() {
      return [
        'contains',
        'buildFailureMessage',
        'asymmetricDiff_',
        'asymmetricMatch_',
        'equals',
        'eq_'
      ];
    }

    beforeEach(function() {
      keys().forEach(function(k) {
        if (Array.prototype[k]) {
          console.log(Array.prototype[k].toString());
        }
        expect(Array.prototype[k])
          .withContext('Array.prototype already had ' + k)
          .toBeUndefined();
        Array.prototype[k] = function() {};
      });
    });

    afterEach(function() {
      keys().forEach(function(k) {
        delete Array.prototype[k];
      });
    });

    it('uses the MatchersUtil methods', function() {
      var matchersUtil = new jasmineUnderTest.MatchersUtil({}),
        shim = jasmineUnderTest.asymmetricEqualityTesterArgCompatShim(
          matchersUtil,
          []
        );

      keys().forEach(function(k) {
        expect(shim[k])
          .withContext(k + ' was overwritten')
          .toBe(jasmineUnderTest.MatchersUtil.prototype[k]);
      });
    });
  });
});
