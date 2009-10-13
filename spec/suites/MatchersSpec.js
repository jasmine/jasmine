describe("jasmine.Matchers", function() {
  var env;
  
  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
  });
  
  function match(value) {
    return new jasmine.Matchers(env, value);
  }

  function detailsFor(actual, matcherName, matcherArgs) {
    var matcher = match(actual);
    matcher[matcherName].apply(matcher, matcherArgs);
    expect(matcher.results().getItems().length).toEqual(1);
    return matcher.results().getItems()[0].details;
  }

  it("toEqual with primitives, objects, dates, html nodes, etc.", function() {
    expect(match(true).toEqual(true)).toEqual(true);

    expect(match({foo:'bar'}).toEqual(null)).toEqual(false);

    var functionA = function() { return 'hi'; };
    var functionB = function() { return 'hi'; };
    expect(match({foo:functionA}).toEqual({foo:functionB})).toEqual(false);
    expect(match({foo:functionA}).toEqual({foo:functionA})).toEqual(true);

    expect((match(false).toEqual(true))).toEqual(false);

    var circularGraph = {};
    circularGraph.referenceToSelf = circularGraph;
    expect((match(circularGraph).toEqual(circularGraph))).toEqual(true);

    var nodeA = document.createElement('div');
    var nodeB = document.createElement('div');
    expect((match(nodeA).toEqual(nodeA))).toEqual(true);
    expect((match(nodeA).toEqual(nodeB))).toEqual(false);

    expect((match(new Date(2008, 1, 3, 15, 17, 19, 1234)).toEqual(new Date(2009, 1, 3, 15, 17, 19, 1234)))).toEqual(false);
    expect((match(new Date(2008, 1, 3, 15, 17, 19, 1234)).toEqual(new Date(2008, 1, 3, 15, 17, 19, 1234)))).toEqual(true);


    expect(match(true).toNotEqual(false)).toEqual(true);
    expect((match(true).toNotEqual(true))).toEqual(false);

    expect((match(['a', 'b']).toEqual(['a', undefined]))).toEqual(false);
    expect((match(['a', 'b']).toEqual(['a', 'b', undefined]))).toEqual(false);
  });

  it('toBe should return true only if the expected and actual items === each other', function() {
    var a = {};
    var b = {};
    //noinspection UnnecessaryLocalVariableJS
    var c = a;
    expect((match(a).toBe(b))).toEqual(false);
    expect((match(a).toBe(a))).toEqual(true);
    expect((match(a).toBe(c))).toEqual(true);
    expect((match(a).toNotBe(b))).toEqual(true);
    expect((match(a).toNotBe(a))).toEqual(false);
    expect((match(a).toNotBe(c))).toEqual(false);
  });


  it("toMatch and #toNotMatch should perform regular expression matching on strings", function() {
    expect((match('foobarbel').toMatch(/bar/))).toEqual(true);
    expect((match('foobazbel').toMatch(/bar/))).toEqual(false);

    expect((match('foobarbel').toMatch("bar"))).toEqual(true);
    expect((match('foobazbel').toMatch("bar"))).toEqual(false);

    expect((match('foobarbel').toNotMatch(/bar/))).toEqual(false);
    expect((match('foobazbel').toNotMatch(/bar/))).toEqual(true);

    expect((match('foobarbel').toNotMatch("bar"))).toEqual(false);
    expect((match('foobazbel').toNotMatch("bar"))).toEqual(true);
  });

  it("toBeDefined", function() {
    expect(match('foo').toBeDefined()).toEqual(true);
    expect(match(undefined).toBeDefined()).toEqual(false);
  });

  it("toBeNull", function() {
    expect(match(null).toBeNull()).toEqual(true);
    expect(match(undefined).toBeNull()).toEqual(false);
    expect(match("foo").toBeNull()).toEqual(false);
  });

  it("toBeFalsy", function() {
    expect(match(false).toBeFalsy()).toEqual(true);
    expect(match(true).toBeFalsy()).toEqual(false);
    expect(match(undefined).toBeFalsy()).toEqual(true);
    expect(match(0).toBeFalsy()).toEqual(true);
    expect(match("").toBeFalsy()).toEqual(true);
  });

  it("toBeTruthy", function() {
    expect(match(false).toBeTruthy()).toEqual(false);
    expect(match(true).toBeTruthy()).toEqual(true);
    expect(match(undefined).toBeTruthy()).toEqual(false);
    expect(match(0).toBeTruthy()).toEqual(false);
    expect(match("").toBeTruthy()).toEqual(false);
    expect(match("hi").toBeTruthy()).toEqual(true);
    expect(match(5).toBeTruthy()).toEqual(true);
    expect(match({foo: 1}).toBeTruthy()).toEqual(true);
  });

  it("toEqual", function() {
    expect(match(undefined).toEqual(undefined)).toEqual(true);
    expect(match({foo:'bar'}).toEqual({foo:'bar'})).toEqual(true);
    expect(match("foo").toEqual({bar: undefined})).toEqual(false);
    expect(match({foo: undefined}).toEqual("goo")).toEqual(false);
    expect(match({foo: {bar :undefined}}).toEqual("goo")).toEqual(false);
  });

  it("toEqual with jasmine.any()", function() {
    expect(match("foo").toEqual(jasmine.any(String))).toEqual(true);
    expect(match(3).toEqual(jasmine.any(Number))).toEqual(true);
    expect(match("foo").toEqual(jasmine.any(Function))).toEqual(false);
    expect(match("foo").toEqual(jasmine.any(Object))).toEqual(false);
    expect(match({someObj:'foo'}).toEqual(jasmine.any(Object))).toEqual(true);
    expect(match({someObj:'foo'}).toEqual(jasmine.any(Function))).toEqual(false);
    expect(match(function() {}).toEqual(jasmine.any(Object))).toEqual(false);
    expect(match(["foo", "goo"]).toEqual(["foo", jasmine.any(String)])).toEqual(true);
    expect(match(function() {}).toEqual(jasmine.any(Function))).toEqual(true);
    expect(match(["a", function() {}]).toEqual(["a", jasmine.any(Function)])).toEqual(true);
  });

  it("toEqual handles circular objects ok", function() {
    expect(match({foo: "bar", baz: undefined}).toEqual({foo: "bar", baz: undefined})).toEqual(true);
    expect(match({foo:['bar','baz','quux']}).toEqual({foo:['bar','baz','quux']})).toEqual(true);
    expect(match({foo: {bar:'baz'}, quux:'corge'}).toEqual({foo:{bar:'baz'}, quux:'corge'})).toEqual(true);

    var circularObject = {};
    var secondCircularObject = {};
    circularObject.field = circularObject;
    secondCircularObject.field = secondCircularObject;
    expect(match(circularObject).toEqual(secondCircularObject)).toEqual(true);
  });

  it("toNotEqual as slightly surprising behavior, but is it intentional?", function() {
    expect(match({x:"x", y:"y", z:"w"}).toNotEqual({x:"x", y:"y", z:"z"})).toEqual(true);
    expect(match({x:"x", y:"y", w:"z"}).toNotEqual({x:"x", y:"y", z:"z"})).toEqual(true);
    expect(match({x:"x", y:"y", z:"z"}).toNotEqual({w: "w", x:"x", y:"y", z:"z"})).toEqual(true);
    expect(match({w: "w", x:"x", y:"y", z:"z"}).toNotEqual({x:"x", y:"y", z:"z"})).toEqual(true);
  });

  it("toEqual handles arrays", function() {
    expect(match([1, "A"]).toEqual([1, "A"])).toEqual(true);
  });

  it("toContain and toNotContain", function() {
    expect(match('ABC').toContain('A')).toEqual(true);
    expect(match('ABC').toContain('X')).toEqual(false);
    
    expect(match(['A', 'B', 'C']).toContain('A')).toEqual(true);
    expect(match(['A', 'B', 'C']).toContain('F')).toEqual(false);
    expect(match(['A', 'B', 'C']).toNotContain('F')).toEqual(true);
    expect(match(['A', 'B', 'C']).toNotContain('A')).toEqual(false);

    expect(match(['A', {some:'object'}, 'C']).toContain({some:'object'})).toEqual(true);
    expect(match(['A', {some:'object'}, 'C']).toContain({some:'other object'})).toEqual(false);

    expect(detailsFor('abc', 'toContain', ['x'])).toEqual({
      matcherName: 'toContain', expected: 'x', actual: 'abc'
    });
  });

  it("toBeLessThan should pass if actual is less than expected", function() {
    expect(match(37).toBeLessThan(42)).toEqual(true);
    expect(match(37).toBeLessThan(-42)).toEqual(false);
    expect(match(37).toBeLessThan(37)).toEqual(false);
  });

  it("toBeGreaterThan should pass if actual is greater than expected", function() {
    expect(match(37).toBeGreaterThan(42)).toEqual(false);
    expect(match(37).toBeGreaterThan(-42)).toEqual(true);
    expect(match(37).toBeGreaterThan(37)).toEqual(false);
  });

  it("toThrow", function() {
    var expected = new jasmine.Matchers(env, function() {
      throw new Error("Fake Error");
    });
    expect(expected.toThrow()).toEqual(true);
    expect(expected.toThrow("Fake Error")).toEqual(true);
    expect(expected.toThrow(new Error("Fake Error"))).toEqual(true);
    expect(expected.toThrow("Other Error")).toEqual(false);
    expect(expected.toThrow(new Error("Other Error"))).toEqual(false);

    expect(match(function() {}).toThrow()).toEqual(false);
  });

  it("wasCalled, wasNotCalled, wasCalledWith", function() {
    var currentSuite;
    var spec;
    currentSuite = env.describe('default current suite', function() {
      spec = env.it();
    });

    var TestClass = { someFunction: function() {
    } };

    var expected;
    expect(match(TestClass.someFunction).wasCalled()).toEqual(false);
    expect(match(TestClass.someFunction).wasNotCalled()).toEqual(false);

    spec.spyOn(TestClass, 'someFunction');

    expect(match(TestClass.someFunction).wasCalled()).toEqual(false);
    expect(match(TestClass.someFunction).wasNotCalled()).toEqual(true);


    TestClass.someFunction();
    expect(match(TestClass.someFunction).wasCalled()).toEqual(true);
    expect(match(TestClass.someFunction).wasCalled('some arg')).toEqual(false);
    expect(match(TestClass.someFunction).wasNotCalled()).toEqual(false);

    TestClass.someFunction('a', 'b', 'c');
    expect(match(TestClass.someFunction).wasCalledWith('a', 'b', 'c')).toEqual(true);

    expected = match(TestClass.someFunction);
    expect(expected.wasCalledWith('c', 'b', 'a')).toEqual(false);
    expect(expected.results().getItems()[0].passed()).toEqual(false);

    TestClass.someFunction.reset();
    TestClass.someFunction('a', 'b', 'c');
    TestClass.someFunction('d', 'e', 'f');
    expect(expected.wasCalledWith('a', 'b', 'c')).toEqual(true);
    expect(expected.wasCalledWith('d', 'e', 'f')).toEqual(true);
    expect(expected.wasCalledWith('x', 'y', 'z')).toEqual(false);

    expect(detailsFor(TestClass.someFunction, 'wasCalledWith', ['x', 'y', 'z'])).toEqual({
      matcherName: 'wasCalledWith', expected: ['x', 'y', 'z'], actual: TestClass.someFunction.argsForCall
    });

  });

  it("should report mismatches in some nice way", function() {
    var results = new jasmine.NestedResults();
    var expected = new jasmine.Matchers(env, true, results);
    expected.toEqual(true);
    expected.toEqual(false);

    expect(results.getItems().length).toEqual(2);

    expect(results.getItems()[0].passed()).toEqual(true);

    expect(results.getItems()[1].passed()).toEqual(false);

    results = new jasmine.NestedResults();
    expected = new jasmine.Matchers(env, false, results);
    expected.toEqual(true);

    var expectedMessage = 'Expected<br /><br />true<br /><br />but got<br /><br />false<br />';
    expect(results.getItems()[0].message).toEqual(expectedMessage);

    results = new jasmine.NestedResults();
    expected = new jasmine.Matchers(env, null, results);
    expected.toEqual('not null');

    expectedMessage = 'Expected<br /><br />\'not null\'<br /><br />but got<br /><br />null<br />';
    expect(results.getItems()[0].message).toEqual(expectedMessage);

    results = new jasmine.NestedResults();
    expected = new jasmine.Matchers(env, undefined, results);
    expected.toEqual('not undefined');

    expectedMessage = 'Expected<br /><br />\'not undefined\'<br /><br />but got<br /><br />undefined<br />';
    expect(results.getItems()[0].message).toEqual(expectedMessage);


    results = new jasmine.NestedResults();
    expected = new jasmine.Matchers(env, {foo:'one',baz:'two', more: 'blah'}, results);
    expected.toEqual({foo:'one', bar: '<b>three</b> &', baz: '2'});

    expectedMessage =
    "Expected<br /><br />{ foo : 'one', bar : '&lt;b&gt;three&lt;/b&gt; &amp;', baz : '2' }<br /><br />but got<br /><br />{ foo : 'one', baz : 'two', more : 'blah' }<br />" +
    "<br /><br />Different Keys:<br />" +
    "expected has key 'bar', but missing from <b>actual</b>.<br />" +
    "<b>expected</b> missing key 'more', but present in actual.<br />" +
    "<br /><br />Different Values:<br />" +
    "'bar' was<br /><br />'&lt;b&gt;three&lt;/b&gt; &amp;'<br /><br />in expected, but was<br /><br />'undefined'<br /><br />in actual.<br /><br />" +
    "'baz' was<br /><br />'2'<br /><br />in expected, but was<br /><br />'two'<br /><br />in actual.<br /><br />";
    var actualMessage = results.getItems()[0].message;
    expect(actualMessage).toEqual(expectedMessage);


    results = new jasmine.NestedResults();
    expected = new jasmine.Matchers(env, true, results);
    expected.toEqual(true);

    expect(results.getItems()[0].message).toEqual('Passed.');


    expected = new jasmine.Matchers(env, [1, 2, 3], results);
    results.getItems().length = 0;
    expected.toEqual([1, 2, 3]);
    expect(results.getItems()[0].passed()).toEqual(true);

    expected = new jasmine.Matchers(env, [1, 2, 3], results);
    results.getItems().length = 0;
    expected.toEqual([{}, {}, {}]);
    expect(results.getItems()[0].passed()).toEqual(false);

    expected = new jasmine.Matchers(env, [{}, {}, {}], results);
    results.getItems().length = 0;
    expected.toEqual([1, 2, 3]);
    expect(results.getItems()[0].passed()).toEqual(false);
  });

});
