describe("toBeCloseTo", function() {
  it("passes when within two decimal places by default", function() {
    var matcher = j$.matchers.toBeCloseTo(),
      result;

    result = matcher.compare(0, 0);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.001);
    expect(result.pass).toBe(true);
  });

  it("fails when not within two decimal places by default", function() {
    var matcher = j$.matchers.toBeCloseTo(),
      result;

    result = matcher.compare(0, 0.01);
    expect(result.pass).toBe(false);
  });

  it("accepts an optional precision argument", function() {
    var matcher = j$.matchers.toBeCloseTo(),
      result;

    result = matcher.compare(0, 0.1, 0);
    expect(result.pass).toBe(true);

    result = matcher.compare(0, 0.0001, 3);
    expect(result.pass).toBe(true);
  });

  it("rounds expected values", function() {
    var matcher = j$.matchers.toBeCloseTo(),
      result;

    result = matcher.compare(1.23, 1.229);
    expect(result.pass).toBe(true);

    result = matcher.compare(1.23, 1.226);
    expect(result.pass).toBe(true);

    result = matcher.compare(1.23, 1.225);
    expect(result.pass).toBe(true);

    result = matcher.compare(1.23, 1.2249999);
    expect(result.pass).toBe(false);

    result = matcher.compare(1.23, 1.234);
    expect(result.pass).toBe(true);
  });
});
