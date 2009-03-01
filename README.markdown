Jasmine
=======
**YET ANOTHER JavaScript testing framework**

Why Another Frickin' JS TDD/BDD Framework?
-----------

There are some situations when you want to test-drive JavaScript, but you don't want to be bothered with or even have an explicit document.  You have no DOM to work with and thus lack HTML elements on which to hang event handlers.  You may need to make asynchronous calls (say, to an AJAX API) and cannot mock/stub them.

But you still need to write tests.

What's an Agile Engineer to do?

Enter Jasmine
------------

Jasmine is yet another JavaScript testing framework.  It's *heavily* influenced by JSSpec, ScrewUnit & [JSpec](http://github.com/visionmedia/jspec/tree/master), which are all influenced by RSpec.  But each of those was lacking in some way: JSSpec & ScrewUnit require a DOM.  JSpec's DOM-less assumption was a great start, but it needed asynchronous support.

So we started over.  And TDD'd a whole new framework.  Enjoy.

How To
------

There is a nice example of how to use Jasmine in the /example directory.  But here's more information.

Exciting changes are afoot and many syntax changes have been made to make Jasmine more usable. Please read the examples below for updates.

### Specs

Each spec is, naturally, a JavaScript function.  You tell Jasmine about this spec with a call to `it()` with a name and the function.  The string is a description that will be helpful to you when reading a report.

    it('should be a test', function () {
	    var foo = 0
	    foo++;
    });

### Expectations

Within your spec you will want/need to make expectations.  These are made like this:

    it('should be a test', function () {
	    var foo = 0
	    foo++;

	    expect(foo).toEqual(1);
    });

Results of the expectations are logged for later for reporting.

### Asynchronous Specs

You may be asking yourself, "Self, how do I make asynchronous tests?"

Well, say you need to make a call that is asynchronous - an AJAX API, or some other JavaScript library.  That is, the call returns immediately, yet you want to make expectations 'at some point in the future' after some magic happens in the background.

Jasmine allows you to do this with `runs()` and `waits()` blocks.

`runs()` blocks by themselves simply run as if they were called directly. The following snippets of code should provide similar results:


    it('should be a test', function () {
	    var foo = 0
	    foo++;

	    expect(foo).toEqual(1);
    });

and

    it('should be a test', function () {
      runs( function () {
	      var foo = 0
	      foo++;

	      expect(foo).toEqual(1);
      });
    });

multiple `runs()` blocks in a spec will run serially. For example,

    it('should be a test', function () {
      runs( function () {
	      var foo = 0
	      foo++;

	      expect(foo).toEqual(1);
      });
      runs( function () {
	      var bar = 0
	      bar++;

	      expect(bar).toEqual(1);
      });
    });

`runs()` blocks share functional scope -- `this` properties will be common to all blocks, but simple `vars` will not!

     it('should be a test', function () {
      runs( function () {
	      this.foo = 0
	      this.foo++;
        var bar = 0;
        bar++;

	      expect(this.foo).toEqual(1);
	      expect(bar).toEqual(1);
      });
      runs( function () {
        this.foo++;
	      var bar = 0
	      bar++;

	      expect(foo).toEqual(2);
	      expect(bar).toEqual(1);
      });
    });

`runs()` blocks exist so you can test asynchronous processes. The function `waits()` works with `runs()` to provide a naive
timeout before the next block is run. You supply a time to wait before the next `runs()` function is executed.  For example:

	it('should be a test', function () {
	  runs(function () {
	    this.foo = 0;
	    var that = this;
	    setTimeout(function () {
	      that.foo++;
	    }, 250);
	  });

	  runs(function () {
	    this.expects_that(this.foo).should_equal(0);
	  });

	  waits(500);

	  runs(function () {
	    this.expects_that(this.foo).should_equal(1);
	  });
	});

What's happening here?

* The first call to `runs()` sets call for 1/4 of a second in the future that increments `this.foo`.
* The second `runs()` is executed immediately and then verifies that `this.foo` was indeed initialized to zero in the previous `runs()`.
* Then we wait for half a second.
* Then the last call to `runs()` expects that `this.foo` was incremented by the `setTimeout`.


### Suites

Specs are grouped in Suites.  Suites are defined using the global `describe()` function:

	describe('One suite', function () {
	  it('has a test', function () {
	    ...
	  });

	  it('has another test', function () {
	    ...
	  });
	});

The name is so that reporting is more descriptive.

Suites are executed in the order in which `describe()` calls are made, usually in the order in which their script files are included.

### Runner

You don't need a DOM to run your tests, but you do need a page on which to load & execute your JS.  Include the `jasmine.js` file in a script tag as well as the JS file with your specs.  You can also use this page for reporting.  More on that in a moment.

Here's the example HTML file (in `jasmine/example`):

	<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
	    "http://www.w3.org/TR/html4/loose.dtd">
	<html>
	<head>
	  <title>Jasmine Example</title>
	  <script type="text/javascript" src="../lib/jasmine.js"></script>
	  <script type="text/javascript" src="example.js"></script>
	  <link type="text/css" rel="stylesheet" href="../lib/jasmine.css"/>
	</head>
	<body>
	<h1>
	  Running Jasmine Example Specs
	</h1>
	<div id="results"></div>
	<script type="text/javascript">
	  jasmine.execute();
	  setTimeout(function () {
	    document.getElementById('results').innerHTML = 'It\'s alive! :' +
	                                                   (jasmine.currentRunner.results.passedCount === 1);
	  }, 250);
	</script>
	</body>
	</html>

### Reports

If a reporter exists on the Jasmine instance (named `jasmine`), it will be called when each spec, suite and the overall runner complete. If you're at the single-spec result level, you'll get a spec description, whether it passed or failed, and what the failure message was.  At the suite & runner report level, you'll get the total specs run so far, the passed counts, failed counts, and a description (of the suite or runner).

There is a `Jasmine.Reporters` namespace for you to see how to handle reporting. See the file `json_reporter.js`, which takes the results objects and turns them into JSON strings, for two examples of how to make the results callbacks work for you.

### Custom Matchers

Jasmine has several matchers:

`toEqual` compares objects or primitives and returns true if they are equal

`toNotEqual` compares objects or primitives and returns true if they are not equal

`toMatch` takes a regex or a string and returns true if it matches

`toNotMatch` takes a regex or a string and returns true if it does not match

`toBeDefined` returns true if the object or primitive is not `undefined`

`toBeNull` returns true if the object or primitive is not `null`

`toBeTruthy` returns true if the object or primitive evaluates to true

`toBeFalsy` returns true if the object or primitive evaluates to false

`wasCalled` returns true if the object is a spy and was called

`wasNotCalled` returns true if the object is a spy and was not called

`wasNotCalledWith` returns true if the object is a spy and was called with the passed arguments

`toContain` returns true if an array or string contains the passed variable.

`toNotContain` returns true if an array or string does not contain the passed variable.

### Writing new Matchers
A Matcher has a method name, takes an expected value as it's only parameter, has access to the actual value in this, and then makes a call to this.report with true/false with a failure message.  Here's the definition of should\_equal():

	Jasmine.Matchers.prototype.shouldEqual = function (expected) {
	  return this.report((this.actual === expected),
	      'Expected ' + expected + ' but got ' + this.actual + '.');
	});

Feel free to define your own matcher as needed in your code.  If you'd like to add Matchers to Jasmine, please write tests.

### Disabling Tests & Suites

specs may be disabled by calling `xit()` instead of `it()`.
suites may be disabled by calling `xdescribe()` instead of `describe()`

### beforeEach

beforeEach takes a function that is run before each spec. For example:

  describe('some suite', function () {

    var suiteWideFoo;
    beforeEach(function () {
      suiteWideFoo = 1;
    }

    it('should equal bar', function () {
      expect(suiteWideFoo).toEqual(1);
    };
  });

### afterEach

afterEach takes a function that is run after each spec. For example:

  describe('some suite', function () {

    var suiteWideFoo;
    afterEach(function () {
      suiteWideFoo = 0;
    }

    it('should equal 1', function () {
      expect(suiteWideFoo).toEqual(1);
    };

    it('should equal 0 after', function () {
      expect(suiteWideFoo).toEqual(0);
    };
  });


### Spies

Jasmine integrates 'spies' that permit many spying, mocking, and faking behaviors.

Here are a few examples:

  var Klass = function () {
  }

  var Klass.prototype.method = function (arg) {
    return arg;
  }

  var Klass.prototype.methodWithCallback = function (callback) {
    return callback('foo');
  }


...

  it('should spy on Klass#method') {
    spyOn(Klass, 'method');
    Klass.method('foo argument');
    expect(Klass.method).wasCalledWith('foo argument');
  });

  it('should spy on Klass#methodWithCallback') {
    var callback = Jasmine.createSpy();
    Klass.method(callback);
    expect(callback).wasCalledWith('foo');
  });

Many other options are available for spies:

`andCallThrough()`: spies on AND calls the original function spied on

`andReturn()`: returns passed arguments when spy is called

`andThrow()`: throws passed exception when spy is called

`andCallFake()`: calls passed function when spy is called

`callCount`: returns number of times spy was called

`mostRecentCall.args`: returns argument array from last call to spy.

`argsForCall[i]` returns arguments array for call `i` to spy.

Spies are automatically removed after each spec. They may be set in the beforeEach function.

Big thanks to [Christian Williams](xian@pivotallabs.com) are due for his addition of spy code.

Contributing and Tests
----------------------

Sometimes it's hard to test a framework with the framework itself.  Either the framework isn't mature enough or it just hurts your head.  Jasmine is affected by both.

So we made a little bootstrappy test reporter that lets us test Jasmine's pieces in isolation.  See test/bootstrap.js.  Feel free to use the bootstrap test suite to test your custom Matchers or extensions/changes to Jasmine.

Your contributions are welcome.  Please submit tests with your pull request.

## Maintainers

* [Davis W. Frank](dwfrank@pivotallabs.com), Pivotal Labs
* [Rajan Agaskar](rajan@pivotallabs.com), Pivotal Labs

## Acknowledgments
* A big shout out to the various JavaScript test framework authors, especially TJ for [JSpec](http://github.com/visionmedia/jspec/tree/master) - we played with it a bit before deciding that we really needed to roll our own.
* Thanks to Pivot [Jessica Miller](http://www.jessicamillerworks.com/) for our fancy pass/fail/pending icons
* Huge contributions have been made by [Christian Williams](xian@pivotallabs.com), [Erik Hanson](erik@pivotallabs.com), [Adam Abrons](adam@pivotallabs.com) and [Carl Jackson](carl@pivotallabs.com), and many other Pivots.

## TODO List

* Pending & Disabled counts should be included in results
