describe('toBeCloseTo', function() {
  it('passes when within two decimal places by default', function() {
    var matcher = jasmineUnderTest.matchers.toBeCloseTo(),
      result;

    result = matcher.compare(0, 0);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.001);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.005);
    expect(result.pass).toBe(true);
  });

  it('fails when not within two decimal places by default', function() {
    var matcher = jasmineUnderTest.matchers.toBeCloseTo(),
      result;

    result = matcher.compare(0, 0.01);
    expect(result.pass).toBe(false);

    result = matcher.compare(0, 0.05);
    expect(result.pass).toBe(false);
  });

  it('accepts an optional precision argument', function() {
    var matcher = jasmineUnderTest.matchers.toBeCloseTo(),
      result;

    result = matcher.compare(0, 0.1, 0);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.5, 0);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.0001, 3);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.0005, 3);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.00001, 4);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.00005, 4);
    expect(result.pass).toBe(true);
  });

  it('fails when one of the arguments is null', function() {
    var matcher = jasmineUnderTest.matchers.toBeCloseTo();

    expect(function() {
      matcher.compare(null, null);
    }).toThrowError(
      'Cannot use toBeCloseTo with null. Arguments evaluated to: expect(null).toBeCloseTo(null).'
    );

    expect(function() {
      matcher.compare(0, null);
    }).toThrowError(
      'Cannot use toBeCloseTo with null. Arguments evaluated to: expect(0).toBeCloseTo(null).'
    );

    expect(function() {
      matcher.compare(null, 0);
    }).toThrowError(
      'Cannot use toBeCloseTo with null. Arguments evaluated to: expect(null).toBeCloseTo(0).'
    );
  });

  it('rounds expected values', function() {
    var matcher = jasmineUnderTest.matchers.toBeCloseTo(),
      result;

    result = matcher.compare(1.23, 1.229);
    expect(result.pass).toBe(true);

    result = matcher.compare(1.23, 1.226);
    expect(result.pass).toBe(true);

    result = matcher.compare(1.23, 1.225);
    expect(result.pass).toBe(true);

    result = matcher.compare(1.23, 1.235);
    expect(result.pass).toBe(true);

    // 1.2249999 will be rounded to 1.225
    result = matcher.compare(1.23, 1.2249999);
    expect(result.pass).toBe(true);

    // 1.2249999 will be rounded to 1.224
    result = matcher.compare(1.23, 1.2244999);
    expect(result.pass).toBe(false);

    result = matcher.compare(1.23, 1.234);
    expect(result.pass).toBe(true);
  });

  it('handles edge cases with rounding', function() {
    var matcher = jasmineUnderTest.matchers.toBeCloseTo(),
      result;

    // these cases resulted in false negatives in version of V8
    // included in Node.js 12 and Chrome 74 (and Edge Chromium)
    result = matcher.compare(4.030904708957288, 4.0309, 5);
    expect(result.pass).toBe(true);
    result = matcher.compare(4.82665525779431, 4.82666, 5);
    expect(result.pass).toBe(true);
    result = matcher.compare(-2.82665525779431, -2.82666, 5);
    expect(result.pass).toBe(true);
  });

  describe('Infinity handling', function() {
    it('passes when the actual and expected are both Infinity', function() {
      const matcher = jasmineUnderTest.matchers.toBeCloseTo();
      const result = matcher.compare(Infinity, Infinity, 0);
      expect(result.pass).toBe(true);
    });

    it('passes when the actual and expected are both -Infinity', function() {
      const matcher = jasmineUnderTest.matchers.toBeCloseTo();
      const result = matcher.compare(-Infinity, -Infinity, 0);
      expect(result.pass).toBe(true);
    });

    it('fails when the actual is Infinity and the expected is -Infinity', function() {
      const matcher = jasmineUnderTest.matchers.toBeCloseTo();
      const result = matcher.compare(Infinity, -Infinity, 0);
      expect(result.pass).toBe(false);
    });

    it('fails when the actual is -Infinity and the expected is Infinity', function() {
      const matcher = jasmineUnderTest.matchers.toBeCloseTo();
      const result = matcher.compare(-Infinity, Infinity, 0);
      expect(result.pass).toBe(false);
    });

    it('fails when the actual is a number and the expected is Infinity', function() {
      const matcher = jasmineUnderTest.matchers.toBeCloseTo();
      const result = matcher.compare(42, Infinity, 0);
      expect(result.pass).toBe(false);
    });

    it('fails when the actual is a number and the expected is -Infinity', function() {
      const matcher = jasmineUnderTest.matchers.toBeCloseTo();
      const result = matcher.compare(42, -Infinity, 0);
      expect(result.pass).toBe(false);
    });
  });
});
