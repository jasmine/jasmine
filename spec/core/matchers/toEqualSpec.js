describe("toEqual", function() {
  "use strict";

  function compareEquals(actual, expected) {
    var util = jasmineUnderTest.matchersUtil,
      matcher = jasmineUnderTest.matchers.toEqual(util);

    var result = matcher.compare(actual, expected);

    return result;
  }

  it("delegates to equals function", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equals').and.returnValue(true),
        buildFailureMessage: function() {
          return 'does not matter'
        },
        DiffBuilder: jasmineUnderTest.matchersUtil.DiffBuilder
      },
      matcher = jasmineUnderTest.matchers.toEqual(util),
      result;

    result = matcher.compare(1, 1);

    expect(util.equals).toHaveBeenCalledWith(1, 1, [], jasmine.anything());
    expect(result.pass).toBe(true);
  });

  it("delegates custom equality testers, if present", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equals').and.returnValue(true),
        buildFailureMessage: function() {
          return 'does not matter'
        },
        DiffBuilder: jasmineUnderTest.matchersUtil.DiffBuilder
      },
      customEqualityTesters = ['a', 'b'],
      matcher = jasmineUnderTest.matchers.toEqual(util, customEqualityTesters),
      result;

    result = matcher.compare(1, 1);

    expect(util.equals).toHaveBeenCalledWith(1, 1, ['a', 'b'], jasmine.anything());
    expect(result.pass).toBe(true);
  });

  it("reports the difference between objects that are not equal", function() {
    var actual = {x: 1, y: 3},
      expected = {x: 2, y: 3},
      message = "Expected $.x = 1 to equal 2.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports the difference between nested objects that are not equal", function() {
    var actual = {x: {y: 1}},
      expected = {x: {y: 2}},
      message = "Expected $.x.y = 1 to equal 2.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("formats property access so that it's valid JavaScript", function() {
    var actual = {'my prop': 1},
      expected = {'my prop': 2},
      message = "Expected $['my prop'] = 1 to equal 2.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports missing properties", function() {
    var actual = {x: {}},
      expected = {x: {y: 1}},
      message =
        "Expected $.x to have properties\n" +
        "    y: 1";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports extra properties", function() {
    var actual = {x: {y: 1, z: 2}},
      expected = {x: {}},
      message =
        "Expected $.x not to have properties\n" +
        "    y: 1\n" +
        "    z: 2";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("pretty-prints properties", function() {
    var actual = {x: {y: 'foo bar'}},
      expected = {x: {}},
      message =
        "Expected $.x not to have properties\n" +
        "    y: 'foo bar'"

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports extra and missing properties together", function() {
    var actual = {x: {y: 1, z: 2, f: 4}},
      expected = {x: {y: 1, z: 2, g: 3}},
      message =
        "Expected $.x to have properties\n" +
        "    g: 3\n" +
        "Expected $.x not to have properties\n" +
        "    f: 4";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports extra and missing properties of the root-level object", function() {
    var actual = {x: 1},
      expected = {a: 1},
      message =
        "Expected object to have properties\n" +
        "    a: 1\n" +
        "Expected object not to have properties\n" +
        "    x: 1";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports multiple incorrect values", function() {
    var actual = {x: 1, y: 2},
      expected = {x: 3, y: 4},
      message =
        "Expected $.x = 1 to equal 3.\n" +
        "Expected $.y = 2 to equal 4.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatch between actual child object and expected child number", function() {
    var actual = {x: {y: 2}},
      expected = {x: 1},
      message = "Expected $.x = Object({ y: 2 }) to equal 1.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("uses the default failure message if actual is not an object", function() {
    var actual = 1,
      expected = {x: {}},
      message = "Expected 1 to equal Object({ x: Object({  }) }).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("uses the default failure message if expected is not an object", function() {
    var actual = {x: {}},
      expected = 1,
      message = "Expected Object({ x: Object({  }) }) to equal 1.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("uses the default failure message given arrays with different lengths", function() {
    var actual = [1, 2],
      expected = [1, 2, 3],
      message = 'Expected $.length = 2 to equal 3.\n' +
        'Expected $[2] = undefined to equal 3.';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports a mismatch between elements of equal-length arrays", function() {
    var actual = [1, 2, 5],
      expected = [1, 2, 3],
      message = "Expected $[2] = 5 to equal 3.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports a mismatch between multiple array elements", function() {
    var actual = [2, 2, 5],
      expected = [1, 2, 3],
      message =
        "Expected $[0] = 2 to equal 1.\n" +
        "Expected $[2] = 5 to equal 3.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports a mismatch between properties of objects in arrays", function() {
    var actual = [{x: 1}],
      expected = [{x: 2}],
      message = "Expected $[0].x = 1 to equal 2.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports a mismatch between arrays in objects", function() {
    var actual = {x: [1]},
      expected = {x: [2]},
      message =
        "Expected $.x[0] = 1 to equal 2.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between nested arrays", function() {
    var actual = [[1]],
      expected = [[2]],
      message =
        "Expected $[0][0] = 1 to equal 2.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between arrays of different types", function() {
    jasmine.getEnv().requireFunctioningTypedArrays();

    var actual = new Uint32Array([1, 2, 3]),
      expected = new Uint16Array([1, 2, 3]),
      message = "Expected Uint32Array [ 1, 2, 3 ] to equal Uint16Array [ 1, 2, 3 ].";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving NaN", function() {
    var actual = {x: 0},
      expected = {x: 0/0},
      message = "Expected $.x = 0 to equal NaN.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving regular expressions", function() {
    var actual = {x: '1'},
      expected = {x: /1/},
      message = "Expected $.x = '1' to equal /1/.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving infinities", function() {
    var actual = {x: 0},
      expected = {x: 1/0},
      message = "Expected $.x = 0 to equal Infinity.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving booleans", function() {
    var actual = {x: false},
      expected = {x: true},
      message = "Expected $.x = false to equal true.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving strings", function() {
    var actual = {x: 'foo'},
      expected = {x: 'bar'},
      message = "Expected $.x = 'foo' to equal 'bar'.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving undefined", function() {
    var actual = {x: void 0},
      expected = {x: 0},
      message = "Expected $.x = undefined to equal 0.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches involving null", function() {
    var actual = {x: null},
      expected = {x: 0},
      message = "Expected $.x = null to equal 0.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between objects with different constructors", function () {
    function Foo() {}
    function Bar() {}

    var actual = {x: new Foo()},
        expected = {x: new Bar()},
        message = "Expected $.x to be a kind of Bar, but was Foo({  }).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports type mismatches at the root level", function () {
    function Foo() {}
    function Bar() {}

    var actual = new Foo(),
      expected = new Bar(),
      message = "Expected object to be a kind of Bar, but was Foo({  }).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  function constructorIsNotEnumerable() {
    // in IE8, the constructor property is not enumerable, even if it is an
    // own property of the object.
    // Objects that differ only by an own `constructor` property are thus
    // considered equal in IE8.
    for (var key in {constructor: 1}) {
      return false;
    }
    return true;
  }

  it("reports mismatches between objects with their own constructor property", function () {
    if (constructorIsNotEnumerable()) {
      return;
    }

    function Foo() {}
    function Bar() {}

    var actual = {x: {constructor: 'blerf'}},
        expected = {x: {constructor: 'ftarrh'}},
        message = "Expected $.x.constructor = 'blerf' to equal 'ftarrh'.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between an object with a real constructor and one with its own constructor property", function () {
    if (constructorIsNotEnumerable()) {
      return;
    }

    function Foo() {}
    function Bar() {}

    var actual = {x: {}},
      expected = {x: {constructor: 'ftarrh'}},
      message =
        "Expected $.x to have properties\n" +
        "    constructor: 'ftarrh'";

    expect(compareEquals(actual, expected).message).toEqual(message);
    expect(compareEquals(expected, actual).message).toEqual(
      "Expected $.x not to have properties\n    constructor: 'ftarrh'"
    );
  });

  it("reports mismatches between 0 and -0", function() {
    var actual = {x: 0},
      expected = {x: -0},
      message = "Expected $.x = 0 to equal -0.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Errors", function() {
    var actual = {x: new Error("the error you got")},
      expected = {x: new Error("the error you want")},
      message = "Expected $.x = Error: the error you got to equal Error: the error you want.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Functions", function() {
    var actual = {x: function() {}},
      expected = {x: function() {}},
      message = "Expected $.x = Function to equal Function.";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  // == Sets ==

  it("reports mismatches between Sets", function() {
    jasmine.getEnv().requireFunctioningSets();

    var actual = new Set([1]),
      expected = new Set([2]),
      message = 'Expected Set( 1 ) to equal Set( 2 ).';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports deep mismatches within Sets", function() {
    jasmine.getEnv().requireFunctioningSets();

    var actual = new Set([{x: 1}]),
      expected = new Set([{x: 2}]),
       message = 'Expected Set( Object({ x: 1 }) ) to equal Set( Object({ x: 2 }) ).';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Sets nested in objects", function() {
    jasmine.getEnv().requireFunctioningSets();

    var actual = {sets: [new Set([1])]},
      expected = {sets: [new Set([2])]},
      message = "Expected $.sets[0] = Set( 1 ) to equal Set( 2 ).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Sets of different lengths", function() {
    jasmine.getEnv().requireFunctioningSets();

    var actual = new Set([1, 2]),
      expected = new Set([2]),
      message = 'Expected Set( 1, 2 ) to equal Set( 2 ).';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Sets where actual is missing a value from expected", function() {
    jasmine.getEnv().requireFunctioningSets();

    // Use 'duplicate' object in actual so sizes match
    var actual = new Set([{x: 1}, {x: 1}]),
      expected = new Set([{x: 1}, {x: 2}]),
      message = 'Expected Set( Object({ x: 1 }), Object({ x: 1 }) ) to equal Set( Object({ x: 1 }), Object({ x: 2 }) ).';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Sets where actual has a value missing from expected", function() {
    jasmine.getEnv().requireFunctioningSets();

    // Use 'duplicate' object in expected so sizes match
    var actual = new Set([{x: 1}, {x: 2}]),
      expected = new Set([{x: 1}, {x: 1}]),
      message = 'Expected Set( Object({ x: 1 }), Object({ x: 2 }) ) to equal Set( Object({ x: 1 }), Object({ x: 1 }) ).';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  // == Maps ==

  it("does not report mismatches between deep equal Maps", function() {
    jasmine.getEnv().requireFunctioningMaps();

    // values are the same but with different object identity
    var actual = new Map();
    actual.set('a',{x:1});
    var expected = new Map();
    expected.set('a',{x:1});

    expect(compareEquals(actual, expected).pass).toBe(true);
  });

  it("reports deep mismatches within Maps", function() {
    jasmine.getEnv().requireFunctioningMaps();

    var actual = new Map();
    actual.set('a',{x:1});
    var expected = new Map();
    expected.set('a',{x:2});
    var message = "Expected Map( [ 'a', Object({ x: 1 }) ] ) to equal Map( [ 'a', Object({ x: 2 }) ] ).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Maps nested in objects", function() {
    jasmine.getEnv().requireFunctioningMaps();

    var actual = {Maps:[new Map()]};
    actual.Maps[0].set('a',1);
    var expected = {Maps:[new Map()]};
    expected.Maps[0].set('a',2);

    var message = "Expected $.Maps[0] = Map( [ 'a', 1 ] ) to equal Map( [ 'a', 2 ] ).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Maps of different lengths", function() {
    jasmine.getEnv().requireFunctioningMaps();

    var actual = new Map();
    actual.set('a',1);
    var expected = new Map();
    expected.set('a',2);
    expected.set('b',1);
    var message = "Expected Map( [ 'a', 1 ] ) to equal Map( [ 'a', 2 ], [ 'b', 1 ] ).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports mismatches between Maps with equal values but differing keys", function() {
    jasmine.getEnv().requireFunctioningMaps();

    var actual = new Map();
    actual.set('a',1);
    var expected = new Map();
    expected.set('b',1);
    var message = "Expected Map( [ 'a', 1 ] ) to equal Map( [ 'b', 1 ] ).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("does not report mismatches between Maps with keys with same object identity", function() {
    jasmine.getEnv().requireFunctioningMaps();
    var  key = {x: 1};
    var actual = new Map();
    actual.set(key,2);
    var expected = new Map();
    expected.set(key,2);

    expect(compareEquals(actual, expected).pass).toBe(true);
  });

  it("reports mismatches between Maps with identical keys with different object identity", function() {
    jasmine.getEnv().requireFunctioningMaps();

    var actual = new Map();
    actual.set({x:1},2);
    var expected = new Map();
    expected.set({x:1},2);
    var message = "Expected Map( [ Object({ x: 1 }), 2 ] ) to equal Map( [ Object({ x: 1 }), 2 ] ).";

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("does not report mismatches when comparing Map key to jasmine.anything()", function() {
    jasmine.getEnv().requireFunctioningMaps();

    var actual = new Map();
    actual.set('a',1);
    var expected = new Map();
    expected.set(jasmineUnderTest.anything(),1);

    expect(compareEquals(actual, expected).pass).toBe(true);
  });

  it("does not report mismatches when comparing Maps with the same symbol keys", function() {
    jasmine.getEnv().requireFunctioningMaps();
    jasmine.getEnv().requireFunctioningSymbols();

    var key = Symbol();
    var actual = new Map();
    actual.set(key,1);
    var expected = new Map();
    expected.set(key,1);

    expect(compareEquals(actual, expected).pass).toBe(true);
  });

  it("reports mismatches between Maps with different symbol keys", function() {
    jasmine.getEnv().requireFunctioningMaps();
    jasmine.getEnv().requireFunctioningSymbols();

    var actual = new Map();
    actual.set(Symbol(),1);
    var expected = new Map();
    expected.set(Symbol(),1);
    var message = "Expected Map( [ Symbol(), 1 ] ) to equal Map( [ Symbol(), 1 ] ).";

    expect(compareEquals(actual, expected).message).toBe(message);
  });

  it("does not report mismatches when comparing Map symbol key to jasmine.anything()", function() {
    jasmine.getEnv().requireFunctioningMaps();
    jasmine.getEnv().requireFunctioningSymbols();

    var actual = new Map();
    actual.set(Symbol(),1);
    var expected = new Map();
    expected.set(jasmineUnderTest.anything(),1);

    expect(compareEquals(actual, expected).pass).toBe(true);
  });

  function isNotRunningInBrowser() {
    return typeof document === 'undefined'
  }

  it("reports mismatches between DOM nodes with different tags", function() {
    if(isNotRunningInBrowser()) {
      return;
    }

    var actual = {a: document.createElement('div')},
      expected = {a: document.createElement('p')},
      message = 'Expected $.a = HTMLNode to equal HTMLNode.';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it('reports mismatches between DOM nodes with different content', function() {
    if(isNotRunningInBrowser()) {
      return;
    }

    var nodeA = document.createElement('div'),
      nodeB = document.createElement('div');

    nodeA.innerText = 'foo'
    nodeB.innerText = 'bar'

    var actual = {a: nodeA},
      expected = {a: nodeB},
      message = 'Expected $.a = HTMLNode to equal HTMLNode.';

    expect(compareEquals(actual, expected).message).toEqual(message);
  })

  it("reports mismatches between a DOM node and a bare Object", function() {
    if(isNotRunningInBrowser()) {
      return;
    }

    var actual = {a: document.createElement('div')},
      expected = {a: {}},
      message = 'Expected $.a = HTMLNode to equal Object({  }).';

    expect(compareEquals(actual, expected).message).toEqual(message);
  });

  it("reports asymmetric mismatches", function() {
    var actual = {a: 1},
      expected = {a: jasmineUnderTest.any(String)},
      message = 'Expected $.a = 1 to equal <jasmine.any(String)>.';

    expect(compareEquals(actual, expected).message).toEqual(message);
    expect(compareEquals(actual, expected).pass).toBe(false)
  });

  it("reports asymmetric mismatches when the asymmetric comparand is the actual value", function() {
    var actual = {a: jasmineUnderTest.any(String)},
      expected = {a: 1},
      message = 'Expected $.a = <jasmine.any(String)> to equal 1.';

    expect(compareEquals(actual, expected).message).toEqual(message);
    expect(compareEquals(actual, expected).pass).toBe(false)
  });

  it("does not report a mismatch when asymmetric matchers are satisfied", function() {
    var actual = {a: 'a'},
      expected = {a: jasmineUnderTest.any(String)};

    expect(compareEquals(actual, expected).message).toEqual('');
    expect(compareEquals(actual, expected).pass).toBe(true)
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
      'Expected $.foo[0].bar = 1 to equal 2.\n' +
      'Expected $.foo[0].things.length = 2 to equal 3.\n' +
      "Expected $.foo[0].things[2] = undefined to equal 'c'.\n" +
      "Expected $.foo[1].things[1] = 'b' to equal 'd'.\n" +
      'Expected $.baz[0].a to have properties\n' +
      '    c: 1\n' +
      'Expected $.quux = 1 to equal [  ].\n' +
      'Expected $.nan = 0 to equal NaN.\n' +
      "Expected $.aRegexp = 'hi' to equal /hi/.\n" +
      'Expected $.inf = -Infinity to equal Infinity.\n' +
      'Expected $.boolean = false to equal true.\n' +
      'Expected $.notDefined = 0 to equal undefined.\n' +
      'Expected $.aNull = undefined to equal null.'

    expect(compareEquals(actual, expected).message).toEqual(message);
  })

  describe("different length arrays", function() {
    it("actual array is longer", function() {
      var actual = [1, 1, 2, 3, 5],
        expected = [1, 1, 2, 3],
        message = 'Expected $.length = 5 to equal 4.\n' +
          'Expected $[4] = 5 to equal undefined.';

      expect(compareEquals(actual, expected).pass).toBe(false)
      expect(compareEquals(actual, expected).message).toEqual(message);
    });

    it("expected array is longer", function() {
      var actual = [1, 1, 2, 3],
        expected = [1, 1, 2, 3, 5],
        message = 'Expected $.length = 4 to equal 5.\n' +
          'Expected $[4] = undefined to equal 5.';

      expect(compareEquals(actual, expected).pass).toBe(false)
      expect(compareEquals(actual, expected).message).toEqual(message);
    });

    it("expected array is longer by 4 elements", function() {
      var actual = [1, 1, 2],
        expected = [1, 1, 2, 3, 5, 8, 13],
        message = 'Expected $.length = 3 to equal 7.\n' +
          'Expected $[3] = undefined to equal 3.\n' +
          'Expected $[4] = undefined to equal 5.\n' +
          'Expected $[5] = undefined to equal 8.\n' +
          'Expected $[6] = undefined to equal 13.';

      expect(compareEquals(actual, expected).pass).toBe(false)
      expect(compareEquals(actual, expected).message).toEqual(message);
    });

    it("different length and different elements", function() {
      var actual = [1],
        expected = [2, 3],
        message = 'Expected $.length = 1 to equal 2.\n' +
          'Expected $[0] = 1 to equal 2.\n' +
          'Expected $[1] = undefined to equal 3.';

      expect(compareEquals(actual, expected).pass).toBe(false)
      expect(compareEquals(actual, expected).message).toEqual(message);
    });

    it("object with nested array", function() {
      var actual = { values: [1, 1, 2, 3] },
        expected = { values: [1, 1, 2] },
        message = 'Expected $.values.length = 4 to equal 3.\n' +
          'Expected $.values[3] = 3 to equal undefined.';

      expect(compareEquals(actual, expected).pass).toBe(false)
      expect(compareEquals(actual, expected).message).toEqual(message);
    });

    it("array with nested object", function() {
      var actual = [1, 1, 2, { value: 3 }],
        expected = [1, 1, 2],
        message = 'Expected $.length = 4 to equal 3.\n' +
          'Expected $[3] = Object({ value: 3 }) to equal undefined.';

      expect(compareEquals(actual, expected).pass).toBe(false)
      expect(compareEquals(actual, expected).message).toEqual(message);
    });

    it("array with nested different length array", function() {
      var actual = [[1], [1, 2]],
        expected = [[1, 1], [2]],
        message = 'Expected $[0].length = 1 to equal 2.\n' +
          'Expected $[0][1] = undefined to equal 1.\n' +
          'Expected $[1].length = 2 to equal 1.\n' +
          'Expected $[1][0] = 1 to equal 2.\n' +
          'Expected $[1][1] = 2 to equal undefined.';

      expect(compareEquals(actual, expected).pass).toBe(false)
      expect(compareEquals(actual, expected).message).toEqual(message);
    });

    it("last element of longer array is undefined", function() {
      var actual = [1, 2],
        expected = [1, 2, void 0],
        message = 'Expected $.length = 2 to equal 3.';

      expect(compareEquals(actual, expected).pass).toBe(false)
      expect(compareEquals(actual, expected).message).toEqual(message);
    });
  })
});
