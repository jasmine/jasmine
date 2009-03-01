var createElement = function(tag, attrs) {
  var element = document.createElement(tag);
  for (var attr in attrs) {
    element[attr] = attrs[attr];
  }
  return element;
};

// Bootstrap Test Reporter function
var Reporter = function () {
  this.total = 0;
  this.passes = 0;
  this.fails = 0;
  this.start = new Date();
};

Reporter.prototype.toJSON = function(object) {
  return JSON.stringify(object);
};

Reporter.prototype.test = function (result, message) {
  this.total++;

  if (result) {
    this.passes++;
    iconElement = document.getElementById('icons');
    iconElement.appendChild(createElement('img', {src: '../images/go-16.png'}));
  }
  else {
    this.fails++;
    var fails_report = document.getElementById('fails');
    fails_report.style.display = "";

    var iconElement = document.getElementById('icons');
    iconElement.appendChild(createElement('img', {src: '../images/fail-16.png'}));

    var failMessages = document.getElementById('fail_messages');
    var newFail = createElement('p', {'class': 'fail'});
    newFail.innerHTML = message;
    failMessages.appendChild(newFail);
  }
};

Reporter.prototype.summary = function () {
  var el = createElement('p', {'class': ((this.fails > 0) ? 'fail_in_summary' : '') });
  el.innerHTML = this.total + ' expectations, ' + this.passes + ' passing, ' + this.fails + ' failed in ' + (new Date().getTime() - this.start.getTime()) + "ms.";

  var summaryElement = document.getElementById('results_summary');
  summaryElement.appendChild(el);
  summaryElement.style.display = "";
};


var reporter = new Reporter();

var testMatchersComparisons = function () {
  var expected = new Jasmine.Matchers(true);
  reporter.test(expected.toEqual(true),
      'expect(true).toEqual(true) returned false');

  expected = new Jasmine.Matchers({foo:'bar'});
  reporter.test(!expected.toEqual(null),
      'expect({foo:\'bar\'}).toEqual(null) returned true');

  var functionA = function () {
    return 'hi';
  };
  var functionB = function () {
    return 'hi';
  };
  expected = new Jasmine.Matchers({foo:functionA});
  reporter.test(expected.toEqual({foo:functionB}),
      'expect({foo: function () { return \'hi\' };})' +
      '.toEqual({foo: function () { return \'hi\' };}) ' +
      'returned true, but returned false');

  expected = new Jasmine.Matchers(false);
  reporter.test(!(expected.toEqual(true)),
      'expect(false).toEqual(true) returned true');

  var nodeA = document.createElement('div');
  var nodeB = document.createElement('div');
  expected = new Jasmine.Matchers(nodeA);
  reporter.test((expected.toEqual(nodeA)),
      'expect(nodeA).toEqual(nodeA) returned false');

  expected = new Jasmine.Matchers(nodeA);
  reporter.test(!(expected.toEqual(nodeB)),
      'expect(nodeA).toEqual(nodeB) returned true');


  expected = new Jasmine.Matchers(true);
  reporter.test(expected.toNotEqual(false),
      'expect(true).toNotEqual(false) returned false');

  expected = new Jasmine.Matchers(true);
  reporter.test(!(expected.toNotEqual(true)),
      'expect(true).toNotEqual(false) returned true');

  expected = new Jasmine.Matchers('foobarbel');
  reporter.test((expected.toMatch(/bar/)),
      'expect(forbarbel).toMatch(/bar/) returned false');

  expected = new Jasmine.Matchers('foobazbel');
  reporter.test(!(expected.toMatch(/bar/)),
      'expect(forbazbel).toMatch(/bar/) returned true');

  expected = new Jasmine.Matchers('foobarbel');
  reporter.test((expected.toMatch("bar")),
      'expect(forbarbel).toMatch(/bar/) returned false');

  expected = new Jasmine.Matchers('foobazbel');
  reporter.test(!(expected.toMatch("bar")),
      'expect(forbazbel).toMatch(/bar/) returned true');

  expected = new Jasmine.Matchers('foobarbel');
  reporter.test(!(expected.toNotMatch(/bar/)),
      'expect(forbarbel).toNotMatch(/bar/) returned false');

  expected = new Jasmine.Matchers('foobazbel');
  reporter.test((expected.toNotMatch(/bar/)),
      'expect(forbazbel).toNotMatch(/bar/) returned true');

  expected = new Jasmine.Matchers('foobarbel');
  reporter.test(!(expected.toNotMatch("bar")),
      'expect(forbarbel).toNotMatch("bar") returned false');

  expected = new Jasmine.Matchers('foobazbel');
  reporter.test((expected.toNotMatch("bar")),
      'expect(forbazbel).toNotMatch("bar") returned true');

  expected = new Jasmine.Matchers('foo');
  reporter.test(expected.toBeDefined(),
      'expect(foo).toBeDefined() returned true');

  expected = new Jasmine.Matchers(undefined);
  reporter.test(! expected.toBeDefined(),
      'expect(undefined).toBeDefined() returned false');

  expected = new Jasmine.Matchers(null);
  reporter.test(expected.toBeNull(),
      'expect(null).toBeNull() should be true');

  expected = new Jasmine.Matchers(undefined);
  reporter.test(! expected.toBeNull(),
      'expect(undefined).toBeNull() should be false');

  expected = new Jasmine.Matchers("foo");
  reporter.test(! expected.toBeNull(),
      'expect("foo").toBeNull() should be false');

  expected = new Jasmine.Matchers(false);
  reporter.test(expected.toBeFalsy(),
      'expect(false).toBeFalsy() should be true');

  expected = new Jasmine.Matchers(true);
  reporter.test(!expected.toBeFalsy(),
      'expect(true).toBeFalsy() should be false');

  expected = new Jasmine.Matchers(undefined);
  reporter.test(expected.toBeFalsy(),
      'expect(undefined).toBeFalsy() should be true');

  expected = new Jasmine.Matchers(0);
  reporter.test(expected.toBeFalsy(),
      'expect(0).toBeFalsy() should be true');

  expected = new Jasmine.Matchers("");
  reporter.test(expected.toBeFalsy(),
      'expect("").toBeFalsy() should be true');

  expected = new Jasmine.Matchers(false);
  reporter.test(!expected.toBeTruthy(),
      'expect(false).toBeTruthy() should be false');

  expected = new Jasmine.Matchers(true);
  reporter.test(expected.toBeTruthy(),
      'expect(true).toBeTruthy() should be true');

  expected = new Jasmine.Matchers(undefined);
  reporter.test(!expected.toBeTruthy(),
      'expect(undefined).toBeTruthy() should be false');

  expected = new Jasmine.Matchers(0);
  reporter.test(!expected.toBeTruthy(),
      'expect(0).toBeTruthy() should be false');

  expected = new Jasmine.Matchers("");
  reporter.test(!expected.toBeTruthy(),
      'expect("").toBeTruthy() should be false');

  expected = new Jasmine.Matchers("hi");
  reporter.test(expected.toBeTruthy(),
      'expect("hi").toBeTruthy() should be true');

  expected = new Jasmine.Matchers(5);
  reporter.test(expected.toBeTruthy(),
      'expect(5).toBeTruthy() should be true');

  expected = new Jasmine.Matchers({foo: 1});
  reporter.test(expected.toBeTruthy(),
      'expect({foo: 1}).toBeTruthy() should be true');

  expected = new Jasmine.Matchers(undefined);
  reporter.test(expected.toEqual(undefined),
      'expect(undefined).toEqual(undefined) should return true');

  expected = new Jasmine.Matchers({foo:'bar'});
  reporter.test(expected.toEqual({foo:'bar'}),
      'expect({foo:\'bar\').toEqual({foo:\'bar\'}) returned true');

  expected = new Jasmine.Matchers("foo");
  reporter.test(! expected.toEqual({bar: undefined}),
      'expect({"foo").toEqual({bar:undefined}) should return false');

  expected = new Jasmine.Matchers({foo: undefined});
  reporter.test(! expected.toEqual("goo"),
      'expect({foo:undefined}).toEqual("goo") should return false');

  expected = new Jasmine.Matchers({foo: {bar :undefined}});
  reporter.test(! expected.toEqual("goo"),
      'expect({foo:{ bar: undefined}}).toEqual("goo") should return false');

  expected = new Jasmine.Matchers("foo");
  reporter.test(expected.toEqual(Jasmine.any(String)),
      'expect("foo").toEqual(Jasmine.any(String)) should return true');

  expected = new Jasmine.Matchers(3);
  reporter.test(expected.toEqual(Jasmine.any(Number)),
      'expect(3).toEqual(Jasmine.any(Number)) should return true');

  expected = new Jasmine.Matchers("foo");
  reporter.test(! expected.toEqual(Jasmine.any(Function)),
      'expect("foo").toEqual(Jasmine.any(Function)) should return false');

  expected = new Jasmine.Matchers(["foo", "goo"]);
  reporter.test(expected.toEqual(["foo", Jasmine.any(String)]),
      'expect(["foo", "goo"]).toEqual(["foo", Jasmine.any(String)]) should return true');

  expected = new Jasmine.Matchers(function () {
  });
  reporter.test(expected.toEqual(Jasmine.any(Function)),
      'expect(function () {}).toEqual(Jasmine.any(Function)) should return true');


  expected = new Jasmine.Matchers({foo: "bar", baz: undefined});
  reporter.test(expected.toEqual({foo: "bar", baz: undefined}),
      'expect({foo: "bar", baz: undefined}).toEqual({foo: "bar", baz: undefined}) should return true');

  expected = new Jasmine.Matchers({foo:['bar','baz','quux']});
  reporter.test(expected.toEqual({foo:['bar','baz','quux']}),
      "expect({foo:['bar','baz','quux']}).toEqual({foo:['bar','baz','quux']}) returned true");

  expected = new Jasmine.Matchers({foo: {bar:'baz'}, quux:'corge'});
  reporter.test(expected.toEqual({foo:{bar:'baz'}, quux:'corge'}),
      'expect({foo:{bar:"baz"}, quux:"corge"}).toEqual({foo: {bar: \'baz\'}, quux:\'corge\'}) returned true');

  expected = new Jasmine.Matchers({x:"x", y:"y", z:"w"});
  reporter.test(expected.toNotEqual({x:"x", y:"y", z:"z"}),
      'expect({x:"x", y:"y", z:"w"}).toNotEqual({x:"x", y:"y", z:"w"}) returned true');

  expected = new Jasmine.Matchers({x:"x", y:"y", w:"z"});
  reporter.test(expected.toNotEqual({x:"x", y:"y", z:"z"}),
      'expect({x:"x", y:"y", w:"z"}).toNotEqual({x:"x", y:"y", z:"z"}) returned true');

  expected = new Jasmine.Matchers({x:"x", y:"y", z:"z"});
  reporter.test(expected.toNotEqual({w: "w", x:"x", y:"y", z:"z"}),
      'expect({x:"x", y:"y", z:"z"}).toNotEqual({w: "w", x:"x", y:"y", z:"z"}) returned true');

  expected = new Jasmine.Matchers({w: "w", x:"x", y:"y", z:"z"});
  reporter.test(expected.toNotEqual({x:"x", y:"y", z:"z"}),
      'expect({w: "w", x:"x", y:"y", z:"z"}).toNotEqual({x:"x", y:"y", z:"z"}) returned true');

  expected = new Jasmine.Matchers([1, "A"]);
  reporter.test(expected.toEqual([1, "A"]),
      'expect([1, "A"]).toEqual([1, "A"]) returned true');


  var expected = new Jasmine.Matchers(['A', 'B', 'C']);
  reporter.test(expected.toContain('A'),
      'expect(["A", "B", "C").toContain("A") returned false');
  reporter.test(!expected.toContain('F'),
      'expect(["A", "B", "C").toContain("F") returned true');
  reporter.test(expected.toNotContain('F'),
      'expect(["A", "B", "C").toNotContain("F") returned false');
  reporter.test(!expected.toNotContain('A'),
      'expect(["A", "B", "C").toNotContain("A") returned true');

  var currentSuite = describe('default current suite', function() {
  });
  var spec = it();
  var TestClass = { someFunction: function() {
  } };

  expected = new Jasmine.Matchers(TestClass.someFunction);
  reporter.test(!expected.wasCalled(),
      'expect(TestClass.someFunction).wasCalled() returned true for non-spies, expected false');
  expected = new Jasmine.Matchers(TestClass.someFunction);
  reporter.test(!expected.wasNotCalled(),
      'expect(TestClass.someFunction).wasNotCalled() returned true for non-spies, expected false');

  spec.spyOn(TestClass, 'someFunction');

  expected = new Jasmine.Matchers(TestClass.someFunction);
  reporter.test(!expected.wasCalled(),
      'expect(TestClass.someFunction).wasCalled() returned true when spies have not been called, expected false');
  expected = new Jasmine.Matchers(TestClass.someFunction);
  reporter.test(expected.wasNotCalled(),
      'expect(TestClass.someFunction).wasNotCalled() returned false when spies have not been called, expected true');

  TestClass.someFunction();
  expected = new Jasmine.Matchers(TestClass.someFunction);
  reporter.test(expected.wasCalled(),
      'expect(TestClass.someFunction).wasCalled() returned false when spies have been called, expected true');
  expected = new Jasmine.Matchers(TestClass.someFunction);
  reporter.test(!expected.wasNotCalled(),
      'expect(TestClass.someFunction).wasNotCalled() returned true when spies have been called, expected false');

  TestClass.someFunction('a', 'b', 'c');
  expected = new Jasmine.Matchers(TestClass.someFunction);
  reporter.test(expected.wasCalledWith('a', 'b', 'c'),
      'expect(TestClass.someFunction).wasCalledWith(\'a\', \'b\', \'c\') returned false, expected true');

  expected = new Jasmine.Matchers(TestClass.someFunction);
  reporter.test(!expected.wasCalledWith('c', 'b', 'a'),
      'expect(TestClass.someFunction).wasCalledWith(\'c\', \'b\', \'a\') returned true, expected false');
  // todo: make this better... only one result should be added. [xian/rajan 20090310]
  reporter.test(expected.results.results[0].passed,
      'result 0 (from wasCalled()) should be true');
  reporter.test(!expected.results.results[1].passed,
      'result 1 (from arguments comparison) should be false');
};

var testMatchersPrettyPrinting = function () {
  var sampleValue;
  var expected;
  var actual;

  sampleValue = 'some string';
  reporter.test((Jasmine.pp(sampleValue) === "'some string'"),
      "Expected Jasmine.pp('some string') to return the string 'some string' but got " + Jasmine.pp(sampleValue));

  sampleValue = true;
  reporter.test((Jasmine.pp(sampleValue) === 'true'),
      "Expected Jasmine.pp(true) to return the string 'true' but got " + Jasmine.pp(sampleValue));

  sampleValue = false;
  reporter.test((Jasmine.pp(sampleValue) === 'false'),
      "Expected Jasmine.pp(false) to return the string 'false' but got " + Jasmine.pp(sampleValue));

  sampleValue = null;
  reporter.test((Jasmine.pp(sampleValue) === 'null'),
      "Expected Jasmine.pp(null) to return the string 'null' but got " + Jasmine.pp(sampleValue));

  sampleValue = undefined;
  reporter.test((Jasmine.pp(sampleValue) === 'undefined'),
      "Expected Jasmine.pp(undefined) to return the string 'undefined' but got " + Jasmine.pp(sampleValue));

  sampleValue = 3;
  reporter.test((Jasmine.pp(sampleValue) === '3'),
      "Expected Jasmine.pp(3) to return the string '3' but got " + Jasmine.pp(sampleValue));

  sampleValue = [1, 2];
  reporter.test((Jasmine.pp(sampleValue) === '[ 1, 2 ]'),
      "Expected Jasmine.pp([ 1, 2 ]) to return the string '[ 1, 2 ]' but got " + Jasmine.pp(sampleValue));

  var array1 = [1, 2];
  var array2 = [array1];
  array1.push(array2);
  sampleValue = array1;
  expected = '[ 1, 2, [ <circular reference: Array> ] ]';
  actual = Jasmine.pp(sampleValue);
  reporter.test(actual === expected,
      "Expected Jasmine.pp([ 1, 2, Array ]) to return the string " + '"' + expected + '"' + " but got " + actual);

  sampleValue = [1, 'foo', {}, undefined, null];
  expected = "[ 1, 'foo', {  }, undefined, null ]";
  actual = Jasmine.pp(sampleValue);
  reporter.test(actual === expected,
      "Expected Jasmine.pp([ 1, 'foo', Object, undefined, null ]) to return the string " + '"' + expected + '"' + " but got " + actual);

  sampleValue = window;
  expected = "<window>";
  actual = Jasmine.pp(sampleValue);
  reporter.test(actual === expected,
      "Expected Jasmine.pp(<window>) to return the string " + '"' + expected + '"' + " but got " + actual);

  sampleValue = {foo: 'bar'};
  expected = "{ foo : 'bar' }";
  actual = Jasmine.pp(sampleValue);
  reporter.test(actual === expected,
      "Expected Jasmine.pp({ foo : 'bar' }) to return the string " + '"' + expected + '"' + " but got " + actual);

  sampleValue = {foo:'bar', baz:3, nullValue: null, undefinedValue: undefined};
  expected = "{ foo : 'bar', baz : 3, nullValue : null, undefinedValue : undefined }";
  actual = Jasmine.pp(sampleValue);
  reporter.test(actual === expected,
      "Expected Jasmine.pp(" + '"' + "{ foo : 'bar', baz : 3, nullValue : null, undefinedValue : undefined }" + '"' + " to return the string " + '"' + expected + '"' + " but got " + actual);

  sampleValue = {foo: function () {
  }, bar: [1, 2, 3]};
  expected = "{ foo : Function, bar : [ 1, 2, 3 ] }";
  actual = Jasmine.pp(sampleValue);
  reporter.test(actual === expected,
      "Expected Jasmine.pp(" + '"' + "{ foo : function () {}, bar : [1, 2, 3] }" + '"' + " to return the string " + '"' + expected + '"' + " but got " + actual);

  sampleValue = {foo: 'hello'};
  sampleValue.nested = sampleValue;
  expected = "{ foo : 'hello', nested : <circular reference: Object> }";
  actual = Jasmine.pp(sampleValue);
  reporter.test(actual === expected,
      "Expected Jasmine.pp({foo: \'hello\'}) to return the string " + '"' + expected + '"' + " but got " + actual);

  var sampleNode = document.createElement('div');
  sampleNode.innerHTML = 'foo<b>bar</b>';
  sampleValue = sampleNode;
  reporter.test((Jasmine.pp(sampleValue) === "HTMLNode"),
      "Expected Jasmine.pp(" + sampleValue + ") to return the string " + '"' + "HTMLNode" + '"' + " but got " + Jasmine.pp(sampleValue));

  sampleValue = {foo: sampleNode};
  reporter.test((Jasmine.pp(sampleValue) === "{ foo : HTMLNode }"),
      "Expected Jasmine.pp({ foo : " + sampleNode + " }) to return the string " + '"' + "{ foo: HTMLNode }" + '"' + " but got " + Jasmine.pp(sampleValue));

  //todo object with function
};

var testMatchersReporting = function () {

  var results = [];
  var expected = new Jasmine.Matchers(true, results);
  expected.toEqual(true);
  expected.toEqual(false);

  reporter.test((results.length == 2),
      "Results array doesn't have 2 results");

  reporter.test((results[0].passed === true),
      "First spec didn't pass");

  reporter.test((results[1].passed === false),
      "Second spec did pass");

  results = [];
  expected = new Jasmine.Matchers(false, results);
  expected.toEqual(true);

  var expectedMessage = 'Expected<br /><br />true<br /><br />but got<br /><br />false<br />';
  reporter.test((results[0].message == expectedMessage),
      "Failed expectation didn't test the failure message, expected: " + expectedMessage + " got: " + results[0].message);

  results = [];
  expected = new Jasmine.Matchers(null, results);
  expected.toEqual('not null');

  expectedMessage = 'Expected<br /><br />\'not null\'<br /><br />but got<br /><br />null<br />';
  reporter.test((results[0].message == expectedMessage),
      "Failed expectation didn't test the failure message, expected: " + expectedMessage + " got: " + results[0].message);

  results = [];
  expected = new Jasmine.Matchers(undefined, results);
  expected.toEqual('not undefined');

  expectedMessage = 'Expected<br /><br />\'not undefined\'<br /><br />but got<br /><br />undefined<br />';
  reporter.test((results[0].message == expectedMessage),
      "Failed expectation didn't test the failure message, expected: " + expectedMessage + " got: " + results[0].message);


  results = [];
  expected = new Jasmine.Matchers({foo:'one',baz:'two', more: 'blah'}, results);
  expected.toEqual({foo:'one', bar: '<b>three</b> &', baz: '2'});

  expectedMessage =
  "Expected<br /><br />{ foo : 'one', bar : '&lt;b&gt;three&lt;/b&gt; &amp;', baz : '2' }<br /><br />but got<br /><br />{ foo : 'one', baz : 'two', more : 'blah' }<br />" +
  "<br /><br />Different Keys:<br />" +
  "expected has key 'bar', but missing from <b>actual</b>.<br />" +
  "<b>expected</b> missing key 'more', but present in actual.<br />" +
  "<br /><br />Different Values:<br />" +
  "'bar' was<br /><br />'&lt;b&gt;three&lt;/b&gt; &amp;'<br /><br />in expected, but was<br /><br />'undefined'<br /><br />in actual.<br /><br />" +
  "'baz' was<br /><br />'2'<br /><br />in expected, but was<br /><br />'two'<br /><br />in actual.<br /><br />";
  var actualMessage = results[0].message;
  reporter.test((actualMessage == expectedMessage),
      "Matcher message was incorrect. This is the message we expected: <br /><br />" + expectedMessage + " <br /><br />This is the message we got:<br /><br /> " + actualMessage);


  results = [];
  expected = new Jasmine.Matchers(true, results);
  expected.toEqual(true);

  reporter.test((results[0].message == 'Passed.'),
      "Passing expectation didn't test the passing message");
};

var testDisabledSpecs = function () {
  var xitSpecWasRun = false;
  var suite = describe('default current suite', function() {

    xit('disabled spec').runs(function () {
      xitSpecWasRun = true;
    });

    it('enabled spec').runs(function () {
      var foo = 'bar';
      expect(foo).toEqual('bar');
    });

  });


  suite.execute();

  reporter.test((suite.specs.length === 1),
      "Only one spec should be defined in this suite.");

  reporter.test((xitSpecWasRun === false),
      "xitSpec should not have been run.");

};

var testDisabledSuites = function() {
  var dontChangeMe = 'dontChangeMe';
  var disabledSuite = xdescribe('a disabled suite', function() {
    it('enabled spec, but should not be run', function() {
      dontChangeMe = 'changed';
    });
  });

  disabledSuite.execute();

  reporter.test((dontChangeMe === 'dontChangeMe'),
      "spec in disabled suite should not have been run.");
};

var testSpecs = function () {
  var currentSuite = describe('default current suite', function() {
  });

  var spec = it('new spec');
  reporter.test((spec.description == 'new spec'),
      "Spec did not have a description");

  var another_spec = it('spec with an expectation').runs(function () {
    var foo = 'bar';
    expect(foo).toEqual('bar');
  });
  another_spec.execute();
  another_spec.done = true;

  reporter.test((another_spec.results.results.length === 1),
      "Results aren't there after a spec was executed");
  reporter.test((another_spec.results.results[0].passed === true),
      "Results has a result, but it's true");
  reporter.test((another_spec.results.description === 'spec with an expectation'),
      "Spec's results did not get the spec's description");

  var yet_another_spec = it('spec with failing expectation').runs(function () {
    var foo = 'bar';
    expect(foo).toEqual('baz');
  });
  yet_another_spec.execute();
  yet_another_spec.done = true;

  reporter.test((yet_another_spec.results.results[0].passed === false),
      "Expectation that failed, passed");

  var yet_yet_another_spec = it('spec with multiple assertions').runs(function () {
    var foo = 'bar';
    var baz = 'quux';

    expect(foo).toEqual('bar');
    expect(baz).toEqual('quux');
  });
  yet_yet_another_spec.execute();
  yet_yet_another_spec.done = true;

  reporter.test((yet_yet_another_spec.results.results.length === 2),
      "Spec doesn't support multiple expectations");
};

var testSpecsWithoutRunsBlock = function () {
  var currentSuite = describe('default current suite', function() {
  });

  var another_spec = it('spec with an expectation', function () {
    var foo = 'bar';
    expect(foo).toEqual('bar');
    expect(foo).toEqual('baz');
  });

  another_spec.execute();
  another_spec.done = true;

  reporter.test((another_spec.results.results.length === 2),
      "Results length should be 2, got " + another_spec.results.results.length);
  reporter.test((another_spec.results.results[0].passed === true),
      "In a spec without a run block, expected first expectation result to be true but was false");
  reporter.test((another_spec.results.results[1].passed === false),
      "In a spec without a run block, expected second expectation result to be false but was true");
  reporter.test((another_spec.results.description === 'spec with an expectation'),
      "In a spec without a run block, results did not include the spec's description");

};

var testAsyncSpecs = function () {
  var foo = 0;

  //set a bogus suite for the spec to attach to
  Jasmine.getEnv().currentSuite = {specs: []};

  var a_spec = it('simple queue test', function () {
    runs(function () {
      foo++;
    });
    runs(function () {
      expect(foo).toEqual(1);
    });
  });

  reporter.test(a_spec.queue.length === 1,
      'Expected spec queue length to be 1, was ' + a_spec.queue.length);

  a_spec.execute();
  reporter.test(a_spec.queue.length === 3,
      'Expected spec queue length to be 3, was ' + a_spec.queue.length);

  foo = 0;
  a_spec = it('spec w/ queued statments', function () {
    runs(function () {
      foo++;
    });
    runs(function () {
      expect(foo).toEqual(1);
    });
  });

  a_spec.execute();

  reporter.test((a_spec.results.results.length === 1),
      'No call to waits(): Spec queue did not run all functions');
  reporter.test((a_spec.results.results[0].passed === true),
      'No call to waits(): Queued expectation failed');

  foo = 0;
  a_spec = it('spec w/ queued statments', function () {
    runs(function () {
      setTimeout(function() {
        foo++;
      }, 500);
    });
    waits(1000);
    runs(function() {
      expect(foo).toEqual(1);
    });
  });

  a_spec.execute();
  Clock.tick(500);
  Clock.tick(500);

  reporter.test((a_spec.results.results.length === 1),
      'Calling waits(): Spec queue did not run all functions');

  reporter.test((a_spec.results.results[0].passed === true),
      'Calling waits(): Queued expectation failed');

  var bar = 0;
  var another_spec = it('spec w/ queued statments', function () {
    runs(function () {
      setTimeout(function() {
        bar++;
      }, 250);

    });
    waits(500);
    runs(function () {
      setTimeout(function() {
        bar++;
      }, 250);
    });
    waits(500);
    runs(function () {
      expect(bar).toEqual(2);
    });
  });

  reporter.test((another_spec.queue.length === 1),
      'Calling 2 waits(): Expected queue length to be 1, got ' + another_spec.queue.length);

  another_spec.execute();

  Clock.tick(1000);
  reporter.test((another_spec.queue.length === 4),
      'Calling 2 waits(): Expected queue length to be 4, got ' + another_spec.queue.length);

  reporter.test((another_spec.results.results.length === 1),
      'Calling 2 waits(): Spec queue did not run all functions');

  reporter.test((another_spec.results.results[0].passed === true),
      'Calling 2 waits(): Queued expectation failed');

  var baz = 0;
  var yet_another_spec = it('spec w/ async fail', function () {
    runs(function () {
      setTimeout(function() {
        baz++;
      }, 250);
    });
    waits(100);
    runs(function() {
      expect(baz).toEqual(1);
    });
  });


  yet_another_spec.execute();
  Clock.tick(250);

  reporter.test((yet_another_spec.queue.length === 3),
      'Calling 2 waits(): Expected queue length to be 3, got ' + another_spec.queue.length);
  reporter.test((yet_another_spec.results.results.length === 1),
      'Calling 2 waits(): Spec queue did not run all functions');
  reporter.test((yet_another_spec.results.results[0].passed === false),
      'Calling 2 waits(): Queued expectation failed');
};

var testAsyncSpecsWithMockSuite = function () {
  var bar = 0;
  var another_spec = it('spec w/ queued statments', function () {
    runs(function () {
      setTimeout(function() {
        bar++;
      }, 250);
    });
    waits(500);
    runs(function () {
      setTimeout(function() {
        bar++;
      }, 250);
    });
    waits(1500);
    runs(function() {
      expect(bar).toEqual(2);
    });
  });

  another_spec.execute();
  Clock.tick(2000);
  reporter.test((another_spec.queue.length === 4),
      'Calling 2 waits(): Expected queue length to be 4, got ' + another_spec.queue.length);
  reporter.test((another_spec.results.results.length === 1),
      'Calling 2 waits(): Spec queue did not run all functions');
  reporter.test((another_spec.results.results[0].passed === true),
      'Calling 2 waits(): Queued expectation failed');
};

var testWaitsFor = function() {
  var doneWaiting = false;
  var runsBlockExecuted = false;

  var spec;
  describe('foo', function() {
    spec = it('has a waits for', function() {
      runs(function() {
      });

      waitsFor(500, function() {
        return doneWaiting;
      });

      runs(function() {
        runsBlockExecuted = true;
      });
    });
  });

  spec.execute();
  reporter.test(runsBlockExecuted === false, 'should not have executed runs block yet');
  Clock.tick(100);
  doneWaiting = true;
  Clock.tick(100);
  reporter.test(runsBlockExecuted === true, 'should have executed runs block');
};

var testWaitsForFailsWithMessage = function() {
  var spec;
  describe('foo', function() {
    spec = it('has a waits for', function() {
      runs(function() {
      });

      waitsFor(500, function() {
        return false; // force a timeout
      }, 'my awesome condition');

      runs(function() {
      });
    });
  });

  spec.execute();
  Clock.tick(1000);
  var actual = spec.results.results[0].message;
  var expected = 'timeout: timed out after 500 msec waiting for my awesome condition';
  reporter.test(actual === expected,
      'expected "' + expected + '" but found "' + actual + '"');
};

var testWaitsForFailsIfTimeout = function() {
  var runsBlockExecuted = false;

  var spec;
  describe('foo', function() {
    spec = it('has a waits for', function() {
      runs(function() {
      });

      waitsFor(500, function() {
        return false; // force a timeout
      });

      runs(function() {
        runsBlockExecuted = true;
      });
    });
  });

  spec.execute();
  reporter.test(runsBlockExecuted === false, 'should not have executed runs block yet');
  Clock.tick(100);
  reporter.test(runsBlockExecuted === false, 'should not have executed runs block yet');
  Clock.tick(400);
  reporter.test(runsBlockExecuted === false, 'should have timed out, so the second runs block should not have been called');
  var actual = spec.results.results[0].message;
  var expected = 'timeout: timed out after 500 msec waiting for something to happen';
  reporter.test(actual === expected,
      'expected "' + expected + '" but found "' + actual + '"');
};

var testSpecAfter = function() {
  var log = "";
  var spec;
  var suite = describe("has after", function() {
    spec = it('spec with after', function() {
      runs(function() {
        log += "spec";
      });
    });
  });
  spec.after(function() {
    log += "after1";
  });
  spec.after(function() {
    log += "after2";
  });

  suite.execute();
  reporter.test((log == "specafter1after2"), "after function should be executed after spec runs");
};

var testSuites = function () {

  // suite has a description
  var suite = describe('one suite description', function() {
  });
  reporter.test((suite.description == 'one suite description'),
      'Suite did not get a description');

  // suite can have a test
  suite = describe('one suite description', function () {
    it('should be a test');
  });

  reporter.test((suite.specs.length === 1),
      'Suite did not get a spec pushed');
  reporter.test((suite.specs[0].queue.length === 0),
      "Suite's Spec should not have queuedFunctions");

  suite = describe('one suite description', function () {
    it('should be a test with queuedFunctions', function() {
      runs(function() {
        var foo = 0;
        foo++;
      });
    });
  });

  reporter.test((suite.specs[0].queue.length === 1),
      "Suite's spec did not get a function pushed");

  suite = describe('one suite description', function () {
    it('should be a test with queuedFunctions', function() {
      runs(function() {
        var foo = 0;
        foo++;
      });
      waits(100);
      runs(function() {
        var bar = 0;
        bar++;
      });

    });
  });

  reporter.test((suite.specs[0].queue.length === 1),
      "Suite's spec length should have been 1, was " + suite.specs[0].queue.length);

  suite.execute();

  reporter.test((suite.specs[0].queue.length === 3),
      "Suite's spec length should have been 3, was " + suite.specs[0].queue.length);

  var foo = 0;
  suite = describe('one suite description', function () {
    it('should be a test with queuedFunctions', function() {
      runs(function() {
        foo++;
      });
    });

    it('should be a another spec with queuedFunctions', function() {
      runs(function() {
        foo++;
      });
    });
  });

  suite.execute();

  reporter.test((suite.specs.length === 2),
      "Suite doesn't have two specs");
  reporter.test((foo === 2),
      "Suite didn't execute both specs");
};

var testBeforeAndAfterCallbacks = function () {

  var suiteWithBefore = describe('one suite with a before', function () {

    beforeEach(function () {
      this.foo = 1;
    });

    it('should be a spec', function () {
      runs(function() {
        this.foo++;
        expect(this.foo).toEqual(2);
      });
    });

    it('should be another spec', function () {
      runs(function() {
        this.foo++;
        expect(this.foo).toEqual(2);
      });
    });
  });

  suiteWithBefore.execute();
  var suite = suiteWithBefore;
  reporter.test((suite.beforeEach !== undefined),
      "testBeforeAndAfterCallbacks: Suite's beforeEach was not defined");
  reporter.test((suite.results.results[0].results[0].passed === true),
      "testBeforeAndAfterCallbacks: the first spec's foo should have been 2");
  reporter.test((suite.results.results[1].results[0].passed === true),
      "testBeforeAndAfterCallbacks: the second spec's this.foo should have been 2");

  var suiteWithAfter = describe('one suite with an after_each', function () {

    it('should be a spec with an after_each', function () {
      runs(function() {
        this.foo = 0;
        this.foo++;
        expect(this.foo).toEqual(1);
      });
    });

    it('should be another spec with an after_each', function () {
      runs(function() {
        this.foo = 0;
        this.foo++;
        expect(this.foo).toEqual(1);
      });
    });

    afterEach(function () {
      this.foo = 0;
    });
  });

  suiteWithAfter.execute();
  var suite = suiteWithAfter;
  reporter.test((suite.afterEach !== undefined),
      "testBeforeAndAfterCallbacks: Suite's afterEach was not defined");
  reporter.test((suite.results.results[0].results[0].passed === true),
      "testBeforeAndAfterCallbacks: afterEach failure: " + suite.results.results[0].results[0].message);
  reporter.test((suite.specs[0].foo === 0),
      "testBeforeAndAfterCallbacks: afterEach failure: foo was not reset to 0");
  reporter.test((suite.results.results[1].results[0].passed === true),
      "testBeforeAndAfterCallbacks: afterEach failure: " + suite.results.results[0].results[0].message);
  reporter.test((suite.specs[1].foo === 0),
      "testBeforeAndAfterCallbacks: afterEach failure: foo was not reset to 0");

};

var testBeforeExecutesSafely = function() {
  var report = "";
  var suite = describe('before fails on first test, passes on second', function() {
    var counter = 0;
    beforeEach(function() {
      counter++;
      if (counter == 1) {
        throw "before failure";
      }
    });
    it("first should not run because before fails", function() {
      runs(function() {
        report += "first";
        expect(true).toEqual(true);
      });
    });
    it("second should run and pass because before passes", function() {
      runs(function() {
        report += "second";
        expect(true).toEqual(true);
      });
    });
  });

  suite.execute();

  reporter.test((report === "firstsecond"), "both tests should run");
  reporter.test(suite.specs[0].results.results[0].passed === false, "1st spec should fail");
  reporter.test(suite.specs[1].results.results[0].passed === true, "2nd spec should pass");

  reporter.test(suite.specResults[0].results[0].passed === false, "1st spec should fail");
  reporter.test(suite.specResults[1].results[0].passed === true, "2nd spec should pass");
};

var testAfterExecutesSafely = function() {
  var report = "";
  var suite = describe('after fails on first test, then passes', function() {
    var counter = 0;
    afterEach(function() {
      counter++;
      if (counter == 1) {
        throw "after failure";
      }
    });
    it("first should run, expectation passes, but spec fails because after fails", function() {
      runs(function() {
        report += "first";
        expect(true).toEqual(true);
      });
    });
    it("second should run and pass because after passes", function() {
      runs(function() {
        report += "second";
        expect(true).toEqual(true);
      });
    });
    it("third should run and pass because after passes", function() {
      runs(function() {
        report += "third";
        expect(true).toEqual(true);
      });
    });
  });

  suite.execute();

  reporter.test((report === "firstsecondthird"), "all tests should run");
  //After each errors should not go in spec results because it confuses the count.
  reporter.test(suite.specs.length === 3, 'testAfterExecutesSafely should have results for three specs');
  reporter.test(suite.specs[0].results.results[0].passed === true, "testAfterExecutesSafely 1st spec should pass");
  reporter.test(suite.specs[1].results.results[0].passed === true, "testAfterExecutesSafely 2nd spec should pass");
  reporter.test(suite.specs[2].results.results[0].passed === true, "testAfterExecutesSafely 3rd spec should pass");

  reporter.test(suite.specResults[0].results[0].passed === true, "testAfterExecutesSafely 1st result for 1st suite spec should pass");
  reporter.test(suite.specResults[0].results[1].passed === false, "testAfterExecutesSafely 2nd result for 1st suite spec should fail because afterEach failed");
  reporter.test(suite.specResults[1].results[0].passed === true, "testAfterExecutesSafely 2nd suite spec should pass");
  reporter.test(suite.specResults[2].results[0].passed === true, "testAfterExecutesSafely 3rd suite spec should pass");

};


var testSpecSpy = function () {
  var suite = describe('Spec spying', function () {
    it('should replace the specified function with a spy object', function() {
      var originalFunctionWasCalled = false;
      var TestClass = {
        someFunction: function() {
          originalFunctionWasCalled = true;
        }
      };
      this.spyOn(TestClass, 'someFunction');

      expect(TestClass.someFunction.wasCalled).toEqual(false);
      expect(TestClass.someFunction.callCount).toEqual(0);
      TestClass.someFunction('foo');
      expect(TestClass.someFunction.wasCalled).toEqual(true);
      expect(TestClass.someFunction.callCount).toEqual(1);
      expect(TestClass.someFunction.mostRecentCall.args).toEqual(['foo']);
      expect(TestClass.someFunction.mostRecentCall.object).toEqual(TestClass);
      expect(originalFunctionWasCalled).toEqual(false);

      TestClass.someFunction('bar');
      expect(TestClass.someFunction.callCount).toEqual(2);
      expect(TestClass.someFunction.mostRecentCall.args).toEqual(['bar']);
    });

    it('should return allow you to view args for a particular call', function() {
      var originalFunctionWasCalled = false;
      var TestClass = {
        someFunction: function() {
          originalFunctionWasCalled = true;
        }
      };
      this.spyOn(TestClass, 'someFunction');

      TestClass.someFunction('foo');
      TestClass.someFunction('bar');
      expect(TestClass.someFunction.argsForCall[0]).toEqual(['foo']);
      expect(TestClass.someFunction.argsForCall[1]).toEqual(['bar']);
      expect(TestClass.someFunction.mostRecentCall.args).toEqual(['bar']);
    });

    it('should be possible to call through to the original method, or return a specific result', function() {
      var originalFunctionWasCalled = false;
      var passedArgs;
      var passedObj;
      var TestClass = {
        someFunction: function() {
          originalFunctionWasCalled = true;
          passedArgs = arguments;
          passedObj = this;
          return "return value from original function";
        }
      };

      this.spyOn(TestClass, 'someFunction').andCallThrough();
      var result = TestClass.someFunction('arg1', 'arg2');
      expect(result).toEqual("return value from original function");
      expect(originalFunctionWasCalled).toEqual(true);
      expect(passedArgs).toEqual(['arg1', 'arg2']);
      expect(passedObj).toEqual(TestClass);
      expect(TestClass.someFunction.wasCalled).toEqual(true);
    });

    it('should be possible to return a specific value', function() {
      var originalFunctionWasCalled = false;
      var TestClass = {
        someFunction: function() {
          originalFunctionWasCalled = true;
          return "return value from original function";
        }
      };

      this.spyOn(TestClass, 'someFunction').andReturn("some value");
      originalFunctionWasCalled = false;
      var result = TestClass.someFunction('arg1', 'arg2');
      expect(result).toEqual("some value");
      expect(originalFunctionWasCalled).toEqual(false);
    });

    it('should be possible to throw a specific error', function() {
      var originalFunctionWasCalled = false;
      var TestClass = {
        someFunction: function() {
          originalFunctionWasCalled = true;
          return "return value from original function";
        }
      };

      this.spyOn(TestClass, 'someFunction').andThrow(new Error('fake error'));
      var exception;
      try {
        TestClass.someFunction('arg1', 'arg2');
      } catch (e) {
        exception = e;
      }
      expect(exception.message).toEqual('fake error');
      expect(originalFunctionWasCalled).toEqual(false);
    });

    it('should be possible to call a specified function', function() {
      var originalFunctionWasCalled = false;
      var fakeFunctionWasCalled = false;
      var passedArgs;
      var passedObj;
      var TestClass = {
        someFunction: function() {
          originalFunctionWasCalled = true;
          return "return value from original function";
        }
      };

      this.spyOn(TestClass, 'someFunction').andCallFake(function() {
        fakeFunctionWasCalled = true;
        passedArgs = arguments;
        passedObj = this;
        return "return value from fake function";
      });

      var result = TestClass.someFunction('arg1', 'arg2');
      expect(result).toEqual("return value from fake function");
      expect(originalFunctionWasCalled).toEqual(false);
      expect(fakeFunctionWasCalled).toEqual(true);
      expect(passedArgs).toEqual(['arg1', 'arg2']);
      expect(passedObj).toEqual(TestClass);
      expect(TestClass.someFunction.wasCalled).toEqual(true);
    });

    it('is torn down when Pockets.removeAllSpies is called', function() {
      var originalFunctionWasCalled = false;
      var TestClass = {
        someFunction: function() {
          originalFunctionWasCalled = true;
        }
      };
      this.spyOn(TestClass, 'someFunction');

      TestClass.someFunction('foo');
      expect(originalFunctionWasCalled).toEqual(false);

      this.removeAllSpies();

      TestClass.someFunction('foo');
      expect(originalFunctionWasCalled).toEqual(true);
    });

    it('adds removeAllSpies to the after spec teardown', function() {
      var originalFunctionWasCalled = false;
      var TestClass = {
        someFunction: function() {
          originalFunctionWasCalled = true;
        }
      };

      expect(this.afterCallbacks.length).toEqual(0);

      this.spyOn(TestClass, 'someFunction');

      expect(this.afterCallbacks.length).toEqual(1);
      this.afterCallbacks[0].call();

      TestClass.someFunction('foo');
      expect(originalFunctionWasCalled).toEqual(true);
    });

    it('throws an exception when some method is spied on twice', function() {
      var TestClass = { someFunction: function() {
      } };
      this.spyOn(TestClass, 'someFunction');
      var exception;
      try {
        this.spyOn(TestClass, 'someFunction');
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeDefined();
    });

    it('should be able to reset a spy', function() {
      var TestClass = { someFunction: function() {
      } };
      this.spyOn(TestClass, 'someFunction');

      expect(TestClass.someFunction).wasNotCalled();
      TestClass.someFunction();
      expect(TestClass.someFunction).wasCalled();
      TestClass.someFunction.reset();
      expect(TestClass.someFunction).wasNotCalled();
      expect(TestClass.someFunction.callCount).toEqual(0);
    });
  });

  suite.execute();

  for (var j = 0; j < suite.specResults.length; j++) {
    reporter.test(suite.specResults[j].results.length > 0, "testSpecSpy: should have results, got " + suite.specResults[j].results.length);
    for (var i = 0; i < suite.specResults[j].results.length; i++) {
      reporter.test(suite.specResults[j].results[i].passed === true, "testSpecSpy: expectation number " + i + " failed: " + suite.specResults[j].results[i].message);
    }
  }
};

var testExplodes = function () {
  var suite = describe('exploding', function () {
    it('should throw an exception when this.explodes is called inside a spec', function() {
      var exceptionMessage = false;

      try {
        this.explodes();
      }
      catch (e) {
        exceptionMessage = e;
      }
      expect(exceptionMessage).toEqual('explodes function should not have been called');
    });

  });
  suite.execute();

  for (var j = 0; j < suite.specResults.length; j++) {
    reporter.test(suite.specResults[j].results.length > 0, "testExplodes: should have results, got " + suite.specResults[j].results.length);
    for (var i = 0; i < suite.specResults[j].results.length; i++) {
      reporter.test(suite.specResults[j].results[i].passed === true, "testExplodes: expectation number " + i + " failed: " + suite.specResults[j].results[i].message);
    }
  }
};

var testSpecScope = function () {

  var suite = describe('one suite description', function () {
    it('should be a test with queuedFunctions', function() {
      runs(function() {
        this.foo = 0;
        this.foo++;
      });

      runs(function() {
        var that = this;
        setTimeout(function() {
          that.foo++;
        }, 250);
      });

      runs(function() {
        expect(this.foo).toEqual(2);
      });

      waits(300);

      runs(function() {
        expect(this.foo).toEqual(2);
      });
    });

  });

  suite.execute();
  Clock.tick(600);
  reporter.test((suite.specs[0].foo === 2),
      "Spec does not maintain scope in between functions");
  reporter.test((suite.specs[0].results.results.length === 2),
      "Spec did not get results for all expectations");
  reporter.test((suite.specs[0].results.results[0].passed === false),
      "Spec did not return false for a failed expectation");
  reporter.test((suite.specs[0].results.results[1].passed === true),
      "Spec did not return true for a passing expectation");
  reporter.test((suite.results.description === 'one suite description'),
      "Suite did not get its description in the results");
};


var testRunner = function() {

  var runner = Runner();
  describe('one suite description', function () {
    it('should be a test');
  });
  reporter.test((runner.suites.length === 1),
      "Runner expected one suite, got " + runner.suites.length);

  runner = Runner();
  describe('one suite description', function () {
    it('should be a test');
  });
  describe('another suite description', function () {
    it('should be a test');
  });
  reporter.test((runner.suites.length === 2),
      "Runner expected two suites, but got " + runner.suites.length);

  runner = Runner();
  describe('one suite description', function () {
    it('should be a test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });
  });

  describe('another suite description', function () {
    it('should be another test', function() {
      runs(function () {
        expect(true).toEqual(false);
      });
    });
  });

  runner.execute();

  reporter.test((runner.suites.length === 2),
      "Runner expected two suites, got " + runner.suites.length);
  reporter.test((runner.suites[0].specs[0].results.results[0].passed === true),
      "Runner should have run specs in first suite");
  reporter.test((runner.suites[1].specs[0].results.results[0].passed === false),
      "Runner should have run specs in second suite");

  runner = Runner();
  xdescribe('one suite description', function () {
    it('should be a test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });
  });

  describe('another suite description', function () {
    it('should be another test', function() {
      runs(function () {
        expect(true).toEqual(false);
      });
    });
  });

  runner.execute();

  reporter.test((runner.suites.length === 1),
      "Runner expected 1 suite, got " + runner.suites.length);
  reporter.test((runner.suites[0].specs[0].results.results[0].passed === false),
      "Runner should have run specs in first suite");
  reporter.test((runner.suites[1] === undefined),
      "Second suite should be undefined, but was " + reporter.toJSON(runner.suites[1]));
};

var testRunnerFinishCallback = function () {
  var runner = Runner();
  var foo = 0;

  runner.finish();

  reporter.test((runner.finished === true),
      "Runner finished flag was not set.");

  runner.finishCallback = function () {
    foo++;
  };

  runner.finish();

  reporter.test((runner.finished === true),
      "Runner finished flag was not set.");
  reporter.test((foo === 1),
      "Runner finish callback was not called");
};


var testNestedResults = function () {

  // Leaf case
  var results = new Jasmine.NestedResults();

  results.push({passed: true, message: 'Passed.'});

  reporter.test((results.results.length === 1),
      "nestedResults.push didn't work");
  reporter.test((results.totalCount === 1),
      "nestedResults.push didn't increment totalCount");
  reporter.test((results.passedCount === 1),
      "nestedResults.push didn't increment passedCount");
  reporter.test((results.failedCount === 0),
      "nestedResults.push didn't ignore failedCount");

  results.push({passed: false, message: 'FAIL.'});

  reporter.test((results.results.length === 2),
      "nestedResults.push didn't work");
  reporter.test((results.totalCount === 2),
      "nestedResults.push didn't increment totalCount");
  reporter.test((results.passedCount === 1),
      "nestedResults.push didn't ignore passedCount");
  reporter.test((results.failedCount === 1),
      "nestedResults.push didn't increment failedCount");

  // Branch case
  var leafResultsOne = new Jasmine.NestedResults();
  leafResultsOne.push({passed: true, message: ''});
  leafResultsOne.push({passed: false, message: ''});

  var leafResultsTwo = new Jasmine.NestedResults();
  leafResultsTwo.push({passed: true, message: ''});
  leafResultsTwo.push({passed: false, message: ''});

  var branchResults = new Jasmine.NestedResults();
  branchResults.push(leafResultsOne);
  branchResults.push(leafResultsTwo);

  reporter.test((branchResults.results.length === 2),
      "Branch Results should have 2 nestedResults, has " + branchResults.results.length);
  reporter.test((branchResults.totalCount === 4),
      "Branch Results should have 4 results, has " + branchResults.totalCount);
  reporter.test((branchResults.passedCount === 2),
      "Branch Results should have 2 passed, has " + branchResults.passedCount);
  reporter.test((branchResults.failedCount === 2),
      "Branch Results should have 2 failed, has " + branchResults.failedCount);
};

var testResults = function () {
  var runner = Runner();
  describe('one suite description', function () {
    it('should be a test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });
  });

  describe('another suite description', function () {
    it('should be another test', function() {
      runs(function () {
        expect(true).toEqual(false);
      });
    });
  });

  runner.execute();

  reporter.test((runner.results.totalCount === 2),
      'Expectation count should be 2, but was ' + runner.results.totalCount);
  reporter.test((runner.results.passedCount === 1),
      'Expectation Passed count should be 1, but was ' + runner.results.passedCount);
  reporter.test((runner.results.failedCount === 1),
      'Expectation Failed count should be 1, but was ' + runner.results.failedCount);
  reporter.test((runner.results.description === 'All Jasmine Suites'),
      'Jasmine Runner does not have the expected description, has: ' + runner.results.description);

};

var testReporterWithCallbacks = function () {
  Jasmine.currentEnv_ = new Jasmine.Env();
  var runner = Runner();

  describe('Suite for JSON Reporter with Callbacks', function () {
    it('should be a test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });
    it('should be a failing test', function() {
      runs(function () {
        expect(false).toEqual(true);
      });
    });
  });
  describe('Suite for JSON Reporter with Callbacks 2', function () {
    it('should be a test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });

  });

  var foo = 0;
  var bar = 0;
  var baz = 0;

  var specCallback = function (results) {
    foo++;
  };
  var suiteCallback = function (results) {
    bar++;
  };
  var runnerCallback = function (results) {
    baz++;
  };

  Jasmine.getEnv().reporter = Jasmine.Reporters.reporter({
    specCallback: specCallback,
    suiteCallback: suiteCallback,
    runnerCallback: runnerCallback
  });
  runner.execute();

  reporter.test((foo === 3),
      'foo was expected to be 3, was ' + foo);
  reporter.test((bar === 2),
      'bar was expected to be 2, was ' + bar);
  reporter.test((baz === 1),
      'baz was expected to be 1, was ' + baz);
};

var testJSONReporter = function () {
  Jasmine.currentEnv_ = new Jasmine.Env();
  var runner = Runner();

  describe('Suite for JSON Reporter, NO DOM', function () {
    it('should be a test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });
  });

  Jasmine.getEnv().reporter = Jasmine.Reporters.JSON();

  runner.execute();

  var expectedSpecJSON = '{"totalCount":1,"passedCount":1,"failedCount":0,"results":[{"passed":true,"message":"Passed."}],"description":"should be a test"}';
  var expectedSuiteJSON = '{"totalCount":1,"passedCount":1,"failedCount":0,"results":[' + expectedSpecJSON + '],"description":"Suite for JSON Reporter, NO DOM"}';
  var expectedRunnerJSON = '{"totalCount":1,"passedCount":1,"failedCount":0,"results":[' + expectedSuiteJSON + '],"description":"All Jasmine Suites"}';

  var specJSON = Jasmine.getEnv().reporter.specJSON;
  reporter.test((specJSON === expectedSpecJSON),
      'JSON Reporter does not have the expected Spec results report.<br /> <b>Expected:</b><br /> ' + expectedSpecJSON +
      '<br /><b>Got:</b><br /> ' + specJSON);

  var suiteJSON = Jasmine.getEnv().reporter.suiteJSON;
  reporter.test((suiteJSON === expectedSuiteJSON),
      'JSON Reporter does not have the expected Suite results report.<br /> <b>Expected:</b><br /> ' + expectedSuiteJSON +
      '<br /><b>Got:</b><br /> ' + suiteJSON);

  var runnerJSON = Jasmine.getEnv().reporter.runnerJSON;
  reporter.test((runnerJSON === expectedRunnerJSON),
      'JSON Reporter does not have the expected Runner results report.<br /> <b>Expected:</b><br /> ' + expectedRunnerJSON +
      '<br /><b>Got:</b><br /> ' + runnerJSON);
};

var testJSONReporterWithDOM = function () {
  Jasmine.currentEnv_ = new Jasmine.Env();
  var runner = Runner();

  describe('Suite for JSON Reporter/DOM', function () {
    it('should be a test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });
  });

  Jasmine.getEnv().reporter = Jasmine.Reporters.JSONtoDOM('json_reporter_results');
  runner.execute();

  var expectedJsonString = '{"totalCount":1,"passedCount":1,"failedCount":0,"results":[{"totalCount":1,"passedCount":1,"failedCount":0,"results":[{"totalCount":1,"passedCount":1,"failedCount":0,"results":[{"passed":true,"message":"Passed."}],"description":"should be a test"}],"description":"Suite for JSON Reporter/DOM"}],"description":"All Jasmine Suites"}';
  //this statement makes sure we have a string that is the same across different DOM implementations.
  var actualJsonString = document.getElementById('json_reporter_results').innerHTML.replace(/&quot;/g, '"');
  reporter.test((actualJsonString == expectedJsonString),
      'JSON Reporter with DOM did not write the expected report to the DOM, got:<br /><br />' + actualJsonString + '<br /><br />expected<br /><br />' + expectedJsonString);
};


var testHandlesBlankSpecs = function () {
  Jasmine.currentEnv_ = new Jasmine.Env();
  var runner = Runner();
  describe('Suite for handles blank specs', function () {
    it('should be a test with a blank runs block', function() {
      runs(function () {
      });
    });
    it('should be a blank (empty function) test', function() {
    });

  });
  runner.execute();

  reporter.test((runner.suites[0].specResults.length === 2),
      'Should have found 2 spec results, got ' + runner.suites[0].specResults.length);
  reporter.test((runner.suites[0].results.passedCount === 2),
      'Should have found 2 passing specs, got ' + runner.suites[0].results.passedCount);
};

var testFormatsExceptionMessages = function () {

  var sampleFirefoxException = {
    fileName: 'foo.js',
    line: '1978',
    message: 'you got your foo in my bar',
    name: 'A Classic Mistake'
  };

  var sampleWebkitException = {
    sourceURL: 'foo.js',
    lineNumber: '1978',
    message: 'you got your foo in my bar',
    name: 'A Classic Mistake'
  };

  var expected = 'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)';

  reporter.test((Jasmine.util.formatException(sampleFirefoxException) === expected),
      'Should have got ' + expected + ' but got: ' + Jasmine.util.formatException(sampleFirefoxException));

  reporter.test((Jasmine.util.formatException(sampleWebkitException) === expected),
      'Should have got ' + expected + ' but got: ' + Jasmine.util.formatException(sampleWebkitException));
};

var testHandlesExceptions = function () {
  Jasmine.currentEnv_ = new Jasmine.Env();
  var runner = Runner();

  //we run two exception tests to make sure we continue after throwing an exception
  describe('Suite for handles exceptions', function () {
    it('should be a test that fails because it throws an exception', function() {
      runs(function () {
        fakeObject.fakeMethod();
      });
    });

    it('should be another test that fails because it throws an exception', function() {
      runs(function () {
        fakeObject2.fakeMethod2();
      });
      runs(function () {
        expect(true).toEqual(true);
      });
    });


    it('should be a passing test that runs after exceptions are thrown', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });

    it('should be another test that fails because it throws an exception after a wait', function() {
      runs(function () {
        var foo = 'foo';
      });
      waits(250);
      runs(function () {
        fakeObject3.fakeMethod();
      });
    });

    it('should be a passing test that runs after exceptions are thrown from a async test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });


  });
  runner.execute();
  Clock.tick(400); //TODO: setting this to a large number causes failures, but shouldn't

  reporter.test((runner.suites[0].specResults.length === 5),
      'Should have found 5 spec results, got ' + runner.suites[0].specResults.length);

  reporter.test((runner.suites[0].specs[0].expectationResults[0].passed === false),
      'First test should have failed, got passed');

  reporter.test((typeof runner.suites[0].specs[0].expectationResults[0].message.search(/fakeObject/) !== -1),
      'First test should have contained /fakeObject/, got ' + runner.suites[0].specs[0].expectationResults[0].message);

  reporter.test((runner.suites[0].specs[1].expectationResults[0].passed === false),
      'Second test should have a failing first result, got passed');

  reporter.test((typeof runner.suites[0].specs[1].expectationResults[0].message.search(/fakeObject2/) !== -1),
      'Second test should have contained /fakeObject2/, got ' + runner.suites[0].specs[1].expectationResults[0].message);

  reporter.test((runner.suites[0].specs[1].expectationResults[1].passed === true),
      'Second expectation in second test should have still passed');

  reporter.test((runner.suites[0].specs[2].expectationResults[0].passed === true),
      'Third test should have passed, got failed');

  reporter.test((runner.suites[0].specs[3].expectationResults[0].passed === false),
      'Fourth test should have a failing first result, got passed');

  reporter.test((typeof runner.suites[0].specs[3].expectationResults[0].message.search(/fakeObject3/) !== -1),
      'Fourth test should have contained /fakeObject3/, got ' + runner.suites[0].specs[3].expectationResults[0].message);
};


var testResultsAliasing = function () {
  Jasmine.currentEnv_ = new Jasmine.Env();
  var runner = Runner();

  describe('Suite for result aliasing test', function () {

    it('should be a test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });

  });

  describe('Suite number two for result aliasing test', function () {
    it('should be a passing test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });

    it('should be a passing test', function() {
      runs(function () {
        expect(true).toEqual(true);
      });
    });

  });


  runner.execute();

  reporter.test((runner.suiteResults !== undefined),
      'runner.suiteResults was not defined');

  reporter.test((runner.suiteResults == runner.results.results),
      'runner.suiteResults should have been ' + reporter.toJSON(runner.results.results) +
      ', but was ' + reporter.toJSON(runner.suiteResults));

  reporter.test((runner.suiteResults[1] == runner.results.results[1]),
      'runner.suiteResults should have been ' + reporter.toJSON(runner.results.results[1]) +
      ', but was ' + reporter.toJSON(runner.suiteResults[1]));

  reporter.test((runner.suites[0].specResults !== undefined),
      'runner.suites[0].specResults was not defined');

  reporter.test((runner.suites[0].specResults == runner.results.results[0].results),
      'runner.suites[0].specResults should have been ' + reporter.toJSON(runner.results.results[0].results) +
      ', but was ' + reporter.toJSON(runner.suites[0].specResults));

  reporter.test((runner.suites[0].specs[0].expectationResults !== undefined),
      'runner.suites[0].specs[0].expectationResults was not defined');

  reporter.test((runner.suites[0].specs[0].expectationResults == runner.results.results[0].results[0].results),
      'runner.suites[0].specs[0].expectationResults should have been ' + reporter.toJSON(runner.results.results[0].results[0].results) +
      ', but was ' + reporter.toJSON(runner.suites[0].specs[0].expectationResults));

};


var runTests = function () {
  document.getElementById('spinner').style.display = "";

  testMatchersPrettyPrinting();
  testMatchersComparisons();
  testMatchersReporting();
  testDisabledSpecs();
  testDisabledSuites();
  testSpecs();
  testSpecsWithoutRunsBlock();
  testAsyncSpecs();
  testAsyncSpecsWithMockSuite();
  testWaitsFor();
  testWaitsForFailsWithMessage();
  testWaitsForFailsIfTimeout();
  testSpecAfter();
  testSuites();
  testBeforeAndAfterCallbacks();
  testBeforeExecutesSafely();
  testAfterExecutesSafely();
  testSpecScope();
  testRunner();
  testRunnerFinishCallback();
  testNestedResults();
  testResults();
  testFormatsExceptionMessages();
  testHandlesExceptions();
  testResultsAliasing();
  testReporterWithCallbacks();
  testJSONReporter();
  testJSONReporterWithDOM();
  testSpecSpy();
  testExplodes();


  //   handle blank specs will work later.
  //      testHandlesBlankSpecs();


  reporter.summary();
  document.getElementById('spinner').style.display = "none";

};

