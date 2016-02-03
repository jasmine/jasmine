describe("toEqual", function() {
  "use strict";

  function compareEquals(actual, expected) {
    var util = jasmineUnderTest.matchersUtil,
      matcher = jasmineUnderTest.matchers.toEqual(util);

    spyOn(util, 'buildFailureMessage').and.returnValue('fail!');

    var result = matcher.compare(actual, expected);

    expect(util.buildFailureMessage).toHaveBeenCalledWith('toEqual', false, actual, expected);

    return result;
  }

  it("delegates to equals function", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equals').and.returnValue(true)
      },
      matcher = jasmineUnderTest.matchers.toEqual(util),
      result;

    result = matcher.compare(1, 1);

    expect(util.equals).toHaveBeenCalledWith(1, 1, []);
    expect(result.pass).toBe(true);
  });

  it("delegates custom equality testers, if present", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equals').and.returnValue(true)
      },
      customEqualityTesters = ['a', 'b'],
      matcher = jasmineUnderTest.matchers.toEqual(util, customEqualityTesters),
      result;

    result = matcher.compare(1, 1);

    expect(util.equals).toHaveBeenCalledWith(1, 1, ['a', 'b']);
    expect(result.pass).toBe(true);
  });

  it("reports the difference between objects that are not equal", function() {
    var actual = {x: 1, y: 3},
      expected = {x: 2, y: 3},
      message =
        "fail!\n" +
        "    Expected $.x = 1 to equal 2";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports the difference between nested objects that are not equal", function() {
    var actual = {x: {y: 1}},
      expected = {x: {y: 2}},
      message =
        "fail!\n" +
        "    Expected $.x.y = 1 to equal 2";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports missing properties", function() {
    var actual = {x: {}},
      expected = {x: {y: 1}},
      message =
        "fail!\n" +
        "    Expected $.x to have properties\n" +
        "        y: 1";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports extra properties", function() {
    var actual = {x: {y: 1, z: 2}},
      expected = {x: {}},
      message =
        "fail!\n" +
        "    Expected $.x not to have properties\n" +
        "        y: 1\n" +
        "        z: 2";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports extra and missing properties together", function() {
    var actual = {x: {y: 1, z: 2, f: 4}},
      expected = {x: {y: 1, z: 2, g: 3}},
      message =
        "fail!\n" +
        "    Expected $.x to have properties\n" +
        "        g: 3\n" +
        "    Expected $.x not to have properties\n" +
        "        f: 4";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("formats values in extra/missing properties", function() {
    var actual = {x: {y: 1, z: 2, f: "a"}},
      expected = {x: {y: 1, z: 2, g: []}},
      message =
        "fail!\n" +
        "    Expected $.x to have properties\n" +
        "        g: [object Array]\n" +
        "    Expected $.x not to have properties\n" +
        "        f: \"a\"";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports multiple incorrect values", function() {
    var actual = {x: 1, y: 2},
      expected = {x: 3, y: 4},
      message =
        "fail!\n" +
        "    Expected $.x = 1 to equal 3\n" +
        "    Expected $.y = 2 to equal 4";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatch between actual child object and expected child number", function() {
    var actual = {x: {y: 2}},
      expected = {x: 1},
      message =
        "fail!\n" +
        "    Expected $.x = [object Object] to equal 1";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("uses the default failure message if actual is not an object", function() {
    var actual = 1,
      expected = {x: {}},
      message = "fail!";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("uses the default failure message if expected is not an object", function() {
    var actual = {x: {}},
      expected = 1,
      message = "fail!";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports a mismatch between arrays of different lengths", function() {
    var actual = [1, 2],
      expected = [1, 2, 3],
      message =
        "fail!\n" +
        "    Expected $ = Array[2] to have length 3";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports a mismatch between elements of equal-length arrays", function() {
    var actual = [1, 2, 5],
      expected = [1, 2, 3],
      message =
        "fail!\n" +
        "    Expected $[2] = 5 to equal 3";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports a mismatch between properties of objects in arrays", function() {
    var actual = [{x: 1}],
      expected = [{x: 2}],
      message =
        "fail!\n" +
        "    Expected $[0].x = 1 to equal 2";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports a mismatch between arrays in objects", function() {
    var actual = {x: [1]},
      expected = {x: [2]},
      message =
        "fail!\n" +
        "    Expected $.x[0] = 1 to equal 2";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between nested arrays", function() {
    var actual = [[1]],
      expected = [[2]],
      message =
        "fail!\n" +
        "    Expected $[0][0] = 1 to equal 2";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving NaN", function() {
    var actual = {x: 0},
      expected = {x: 0/0},
      message =
        "fail!\n" +
        "    Expected $.x = 0 to equal NaN";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving regular expressions", function() {
    var actual = {x: '1'},
      expected = {x: /1/},
      message =
        "fail!\n" +
        '    Expected $.x = "1" to equal /1/';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving infinities", function() {
    var actual = {x: 0},
      expected = {x: 1/0},
      message =
        "fail!\n" +
        "    Expected $.x = 0 to equal Infinity";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving booleans", function() {
    var actual = {x: false},
      expected = {x: true},
      message =
        "fail!\n" +
        "    Expected $.x = false to equal true";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving undefined", function() {
    var actual = {x: void 0},
      expected = {x: 0},
      message =
        "fail!\n" +
        "    Expected $.x = undefined to equal 0";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving null", function() {
    var actual = {x: null},
      expected = {x: 0},
      message =
        "fail!\n" +
        "    Expected $.x = null to equal 0";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("works on big complex stuff", function() {
    var actual = {
      foo: [
        {bar: 1, things: ['a', 'b']},
        {bar: 2, things: ['a', 'b']}
      ],
      baz: [
        {a: {b: 1}}
      ],
      quux: 1,
      nan: 0,
      aRegexp: 'hi',
      inf: -1/0,
      boolean: false,
      notDefined: 0,
      aNull: void 0
    }

    var expected = {
      foo: [
        {bar: 2, things: ['a', 'b', 'c']},
        {bar: 2, things: ['a', 'd']}
      ],
      baz: [
        {a: {b: 1, c: 1}}
      ],
      quux: [],
      nan: 0/0,
      aRegexp: /hi/,
      inf: 1/0,
      boolean: true,
      notDefined: void 0,
      aNull: null
    }

    var message =
      'fail!\n' +
      '    Expected $.foo[0].bar = 1 to equal 2\n' +
      '    Expected $.foo[0].things = Array[2] to have length 3\n' +
      '    Expected $.foo[1].things[1] = "b" to equal "d"\n' +
      '    Expected $.baz[0].a to have properties\n' +
      '        c: 1\n' +
      '    Expected $.quux = 1 to equal [object Array]\n' +
      '    Expected $.nan = 0 to equal NaN\n' +
      '    Expected $.aRegexp = "hi" to equal /hi/\n' +
      '    Expected $.inf = -Infinity to equal Infinity\n' +
      '    Expected $.boolean = false to equal true\n' +
      '    Expected $.notDefined = 0 to equal undefined\n' +
      '    Expected $.aNull = undefined to equal null'

    expect(compareEquals(actual, expected).message).toEqual(message);
  })
});
