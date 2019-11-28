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

  it('provides and deprecates all the properties of the customEqualityTesters', function() {
    var customEqualityTesters = [function() {}, function() {}],
      shim = jasmineUnderTest.asymmetricEqualityTesterArgCompatShim(
        {},
        customEqualityTesters
      ),
      deprecated = spyOn(jasmineUnderTest.getEnv(), 'deprecated'),
      expectedMessage =
        'The second argument to asymmetricMatch is now a MatchersUtil. ' +
        'Using it as an array of custom equality testers is deprecated and will stop ' +
        'working in a future release. ' +
        'See <https://jasmine.github.io/tutorials/upgrading_to_4.0> for details.';

    expect(shim.length).toBe(2);
    expect(deprecated).toHaveBeenCalledWith(expectedMessage);
    deprecated.calls.reset();

    expect(shim[0]).toBe(customEqualityTesters[0]);
    expect(deprecated).toHaveBeenCalledWith(expectedMessage);
    deprecated.calls.reset();

    expect(shim[1]).toBe(customEqualityTesters[1]);
    expect(deprecated).toHaveBeenCalledWith(expectedMessage);
  });

  it('provides and deprecates all the properties of Array.prototype', function() {
    var shim = jasmineUnderTest.asymmetricEqualityTesterArgCompatShim({}, []),
      deprecated = spyOn(jasmineUnderTest.getEnv(), 'deprecated'),
      expectedMessage =
        'The second argument to asymmetricMatch is now a MatchersUtil. ' +
        'Using it as an array of custom equality testers is deprecated and will stop ' +
        'working in a future release. ' +
        'See <https://jasmine.github.io/tutorials/upgrading_to_4.0> for details.';

    expect(shim.filter).toBe(Array.prototype.filter);
    expect(deprecated).toHaveBeenCalledWith(expectedMessage);
    deprecated.calls.reset();

    expect(shim.forEach).toBe(Array.prototype.forEach);
    expect(deprecated).toHaveBeenCalledWith(expectedMessage);
    deprecated.calls.reset();

    expect(shim.map).toBe(Array.prototype.map);
    expect(deprecated).toHaveBeenCalledWith(expectedMessage);
    deprecated.calls.reset();
  });

  it('provides and deprecates properties of Array.prototype', function() {
    var keys = [
        'concat',
        'constructor',
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
        'toLocaleString',
        'toString',
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
      deprecated = spyOn(jasmineUnderTest.getEnv(), 'deprecated'),
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
      expect(deprecated).toHaveBeenCalled();
      deprecated.calls.reset();
    }

    // Properties that are present on only some supported runtimes
    for (i = 0; i < optionalKeys.length; i++) {
      k = optionalKeys[i];

      if (shim[k] !== undefined) {
        expect(shim[k])
          .withContext(k)
          .toBe(Array.prototype[k]);
        expect(deprecated)
          .withContext(k)
          .toHaveBeenCalled();
        deprecated.calls.reset();
      }
    }
  });

  it('does not deprecate properties of Object.prototype', function() {
    var shim = jasmineUnderTest.asymmetricEqualityTesterArgCompatShim({}, []),
      deprecated = spyOn(jasmineUnderTest.getEnv(), 'deprecated');

    expect(shim.hasOwnProperty).toBe(Object.prototype.hasOwnProperty);
    expect(shim.isPrototypeOf).toBe(Object.prototype.isPrototypeOf);

    expect(deprecated).not.toHaveBeenCalled();
  });
});
