describe("toContainAll", function () {
  it("passes when all items are present", function () {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util);

    var result = matcher.compare([1, 2, 3], 1, 2, 3);
    expect(result.pass).toBe(true);
  });

  it("passes with shuffled arrays", function () {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util);

    var result = matcher.compare([1, 2, 3], 3, 2, 1);
    expect(result.pass).toBe(true);
  });

  it("passes with a valid subset", function () {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util);
    var result;

    result = matcher.compare([1, 2, 3], 1, 2, 3);
    expect(result.pass).toBe(true);

    result = matcher.compare([1, 2, 3], 3, 1);
    expect(result.pass).toBe(true);

    result = matcher.compare([1, 2, 3], 2);
    expect(result.pass).toBe(true);

    result = matcher.compare([1, 2, 3]);
    expect(result.pass).toBe(true);
  });

  it("handles arrays of mixed types", function () {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util);
    var result;

    result = matcher.compare([10, /fuzzy/, "pickles"], /fuzzy/, 10);
    expect(result.pass).toBe(true);

    result = matcher.compare([1, '2', '3'], '2', '3', 1);
    expect(result.pass).toBe(true);

    result = matcher.compare([1, {foo: 2}, 3], 3, {foo: 2}, 1);
    expect(result.pass).toBe(true);
  });

  it("handles duplicates", function () {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util);
    var result;

    result = matcher.compare([1, 2, 3], 3, 3);
    expect(result.pass).toBe(false);

    result = matcher.compare([1, 2, 1, 2], 2, 2, 1);
    expect(result.pass).toBe(true);
  });

  it("handles empty actual", function () {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util);

    var result = matcher.compare([], 3);
    expect(result.pass).toBe(false);
  });

  it("handles captured arguments", function() {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util);
    var capturedArguments;

    (function () {
      capturedArguments = arguments;
    })(1, 2);

    var result = matcher.compare(capturedArguments, 1, 2);
    expect(result.pass).toBe(true);
  });

  it("uses custom equality testers, if present", function () {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util, [customTester]);
    var actual = [{foo: 'bar'}];

    function customTester(first, second) {
      return first.bar === second.bar;
    }

    var result = matcher.compare(actual, {foo: 'bar', baz: 'quux'});
    expect(result.pass).toBe(true);
  });

  it("throws an Error if passed a non-array actual", function () {
    var util = { equals: j$.matchersUtil.equals };
    var matcher = j$.matchers.toContainAll(util);

    function bogusComparison() {
      return matcher.compare('not an array', 1);
    }

    expect(bogusComparison).toThrowError("Expected an Array but got 'not an array'");
  });
});