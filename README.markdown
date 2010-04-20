Jasmine
=======
**A JavaScript Testing Framework**

Quick Start
----------

1. Get the latest release from the [downloads page](http://github.com/pivotal/jasmine/downloads).
2. Open `example/example_runner.html` in your favorite browser.

For running within a Ruby environment, including automated execution with Selenium, please use
the [jasmine-ruby gem](http://github.com/pivotal/jasmine-ruby).

Releases
----------
0.10.0 [[download]](http://cloud.github.com/downloads/pivotal/jasmine/jasmine-0.10.0.zip)

0.9.0 [[download]](http://github.com/pivotal/jasmine/zipball/0.9.0)

0.8.0 [[download]](http://github.com/pivotal/jasmine/zipball/0.8.0)

### Which Release Should I Use?

Please use the latest version unless you have a good reason not to. Some of this documentation may not be applicable to older versions.

Pull Requests
----------
We welcome your contributions! Jasmine is currently maintained by Davis Frank ([infews](http://github.com/infews)), Rajan Agaskar ([ragaskar](http://github.com/ragaskar)), and Christian Williams ([Xian](http://github.com/Xian)). You can help us by removing all other recipients from your pull request.


Why Another JavaScript TDD/BDD Framework?
-----------

There are some great JavaScript testing frameworks out there already, so why did we write another?

None of the existing frameworks quite worked the way we wanted. Many only work from within a browser. Most don't support testing asynchronous code like event callbacks. Some have syntax that's hard for JS developers or IDEs to understand.

So we decided to start from scratch.

Enter Jasmine
------------

Jasmine is our dream JavaScript testing framework. It's heavily influenced by, and borrows the best parts of, ScrewUnit, JSSpec, [JSpec](http://github.com/visionmedia/jspec/tree/master), and of course RSpec.

Jasmine was designed with a few principles in mind. We believe that a good JavaScript testing framework:

* should not be tied to any browser, framework, platform, or host language.
* should have idiomatic and unsurprising syntax.
* should work anywhere JavaScript can run, including browsers, servers, phones, etc.
* shouldn't intrude in your application's territory (e.g. by cluttering the global namespace).
* should play well with IDEs (e.g. test code should pass static analysis).

Some of our goals while writing Jasmine:

* it should encourage good testing practices.
* it should integrate easily with continuous build systems.
* it should be simple to get started with.

The result is Jasmine, and we love test-driving our code with it. Enjoy.

How To
------

There is a simple example of how to use Jasmine in the /example directory.  But here's more information.

### Specs

Each spec is, naturally, a JavaScript function.  You tell Jasmine about this spec with a call to `it()` with a string and the function.  The string is a description that will be helpful to you when reading a report.

    it('should be a test', function () {
      var foo = 0;
      foo++;
    });

### Expectations

Within your spec you will want to express expectations about the behavior of your application code.  These are made with the `expect()` function and expectation matchers, like this:

    it('should be a test', function () {
      var foo = 0;            // set up the world
      foo++;                  // call your application code

      expect(foo).toEqual(1); // passes because foo == 1
    });

Results of the expectations are logged for later for reporting.

#### Expectation Matchers

Jasmine has several built-in matchers.  Here are a few:

>`expect(x).toEqual(y);` compares objects or primitives `x` and `y` and passes if they are equivalent
>
>`expect(x).toMatch(pattern);` compares `x` to string or regular expression `pattern` and passes if they match
>
>`expect(x).toBeDefined();` passes if `x` is not `undefined`
>
>`expect(x).toBeNull();` passes if `x` is not `null`
>
>`expect(x).toBeTruthy();` passes if `x` evaluates to true
>
>`expect(x).toBeFalsy();` passes if `x` evaluates to false
>
>`expect(x).toContain(y);` passes if array or string `x` contains `y`

Every matcher's criteria can be inverted by prepending `.not`:

>`expect(x).not.toEqual(y);` compares objects or primitives `x` and `y` and passes if they are *not* equivalent

#### Writing New Matchers

We've provided a small set of matchers that cover many common situations. However, we recommend that you write custom matchers when you want to assert a more specific sort of expectation. Custom matchers help to document the intent of your specs, and can help to remove code duplication in your specs.

It's extremely easy to create new matchers for your app. A matcher function receives the actual value as `this.actual`, and zero or more arguments may be passed in the function call. The function should return `true` if the actual value passes the matcher's requirements, and `false` if it does not.

Here's the definition of `toBeLessThan()`:

    toBeLessThan: function(expected) {
      return this.actual < expected;
    };

To add the matcher to your suite, call `this.addMatchers()` from within a `before` or `it` block. Call it with an object mapping matcher name to function:

    beforeEach(function() {
      this.addMatchers({
        toBeVisible: function() { return this.actual.isVisible(); }
      });
    });

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

The Suite name is so that reporting is more descriptive.

Suites are executed in the order in which `describe()` calls are made, usually in the order in which their script files are included.  Additionally, specs within a suite share a functional scope.  So you may declare variables inside a describe block and they are accessible from within your specs.  For example:

    describe('A suite with some variables', function () {
      var bar = 0
  
      it('has a test', function () {
        bar++;
        expect(bar).toEqual(1);
      });
  
      it('has another test', function () {
        bar++;
        expect(bar).toEqual(2);
      });
    });

#### beforeEach

A suite can have a beforeEach declaration. It takes a function that is run before each spec. For example:

    describe('some suite', function () {

      var suiteWideFoo;

      beforeEach(function () {
        suiteWideFoo = 1;
      });

      it('should equal bar', function () {
        expect(suiteWideFoo).toEqual(1);
      });
    });

A runner can also have beforeEach declarations. Runner beforeEach functions are executed before every spec in all suites, and execute BEFORE suite beforeEach functions. For example:

    var runnerWideFoo = [];

    beforeEach(function () {
      runnerWideFoo.push('runner');
    });

    describe('some suite', function () {

      beforeEach(function () {
        runnerWideFoo.push('suite');
      });

      it('should equal bar', function () {
        expect(runnerWideFoo).toEqual(['runner', 'suite']);
      });
    });

#### afterEach

Similarly, there is an afterEach declaration.  It takes a function that is run after each spec. For example:

    describe('some suite', function () {

      var suiteWideFoo;
      afterEach(function () {
        suiteWideFoo = 0;
      });

      it('should equal 1', function () {
        expect(suiteWideFoo).toEqual(1);
      });

      it('should equal 0 after', function () {
        expect(suiteWideFoo).toEqual(0);
      };
    });

A runner can also have an afterEach declarations. Runner afterEach functions are executed after every spec in all suites, and execute AFTER suite afterEach functions. For example:

    var runnerWideFoo = [];

    afterEach(function () {
      runnerWideFoo.push('runner');
    });

    describe('some suite', function () {

      afterEach(function () {
        runnerWideFoo.push('suite');
      });

      it('should be empty', function () {
        expect(runnerWideFoo).toEqual([]);
      });

      it('should be populated after', function () {
        expect(runnerWideFoo).toEqual(['suite', 'runner']);
      };
    });

### Single-spec After functions

A spec may ask Jasmine to execute some code after the spec has finished running; the code will run whether the spec finishes successfully or not. Multiple after functions may be given.

    describe('some suite', function () {
      it(function () {
        var originalTitle = window.title;
        this.after(function() { window.title = originalTitle; });
        MyWindow.setTitle("new value");
        expect(window.title).toEqual("new value");
      });


### Nested Describes
Jasmine supports nested describes. An example:

    describe('some suite', function () {
    
      var suiteWideFoo;
    
      beforeEach(function () {
        suiteWideFoo = 0;
      });
    
      describe('some nested suite', function() {
        var nestedSuiteBar;
        beforeEach(function() {
          nestedSuiteBar=1;
        });
    
        it('nested expectation', function () {
          expect(suiteWideFoo).toEqual(0);
          expect(nestedSuiteBar).toEqual(1);
        });
    
      });
    
      it('top-level describe', function () {
        expect(suiteWideFoo).toEqual(0);
        expect(nestedSuiteBar).toEqual(undefined);
      });
    });

### Spies

Jasmine integrates 'spies' that permit many spying, mocking, and faking behaviors.

Here are a few examples:

    var Klass = function () {
    };

    var Klass.prototype.method = function (arg) {
      return arg;
    };

    var Klass.prototype.methodWithCallback = function (callback) {
      return callback('foo');
    };

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


Spies can be very useful for testing AJAX or other asynchronous behaviors that take callbacks by faking the method firing an async call.

    var Klass = function () {
    };

    var Klass.prototype.asyncMethod = function (callback) {
      someAsyncCall(callback);
    };

    ...

    it('should test async call') {
      spyOn(Klass, 'asyncMethod');
      var callback = Jasmine.createSpy();

      Klass.asyncMethod(callback);
      expect(callback).wasNotCalled();

      var someResponseData = 'foo';
      Klass.asyncMethod.mostRecentCall.args[0](someResponseData);
      expect(callback).wasCalledWith(someResponseData);

    });

There are spy-specfic matchers that are very handy.

`expect(x).wasCalled()` passes if `x` is a spy and was called

`expect(x).wasCalledWith(arguments)` passes if `x` is a spy and was called with the specified arguments

`expect(x).wasNotCalled()` passes if `x` is a spy and was not called

`expect(x).wasNotCalledWith(arguments)` passes if `x` is a spy and was not called with the specified arguments

Spies can be trained to respond in a variety of ways when invoked:

`spyOn(x, 'method').andCallThrough()`: spies on AND calls the original function spied on

`spyOn(x, 'method').andReturn(arguments)`: returns passed arguments when spy is called

`spyOn(x, 'method').andThrow(exception)`: throws passed exception when spy is called

`spyOn(x, 'method').andCallFake(function)`: calls passed function when spy is called

Spies have some useful properties:

`callCount`: returns number of times spy was called

`mostRecentCall.args`: returns argument array from last call to spy.

`argsForCall[i]` returns arguments array for call `i` to spy.

Spies are automatically removed after each spec. They may be set in the beforeEach function.

### Disabling Tests & Suites

Specs may be disabled by calling `xit()` instead of `it()`.  Suites may be disabled by calling `xdescribe()` instead of `describe()`.  A simple find/replace in your editor of choice will allow you to run a subset of your specs.

### Asynchronous Specs

You may be thinking, "That's all very nice, but what's this about asynchronous tests?"

Well, say you need to make a call that is asynchronous - an AJAX API, event callback, or some other JavaScript library.  That is, the call returns immediately, yet you want to make expectations 'at some point in the future' after some magic happens in the background.

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

`runs()` blocks share functional scope -- `this` properties will be common to all blocks, but declared `var`'s will not!

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
        this.expects(this.foo).toEqual(0);
      });
    
      waits(500);
    
      runs(function () {
        this.expects(this.foo).toEqual(1);
      });
    });

What's happening here?

* The first call to `runs()` sets call for 1/4 of a second in the future that increments `this.foo`.
* The second `runs()` is executed immediately and then verifies that `this.foo` was indeed initialized to zero in the previous `runs()`.
* Then we wait for half a second.
* Then the last call to `runs()` expects that `this.foo` was incremented by the `setTimeout`.

## Support
We now have a Google Group for support & discussion.

* Homepage:  [http://groups.google.com/group/jasmine-js](http://groups.google.com/group/jasmine-js)
* Group email: [jasmine-js@googlegroups.com](jasmine-js@googlegroups.com)
* Current build status of Jasmine is visible at [ci.pivotallabs.com](http://ci.pivotallabs.com)

## Maintainers

* [Davis W. Frank](mailto:dwfrank@pivotallabs.com), Pivotal Labs
* [Rajan Agaskar](mailto:rajan@pivotallabs.com), Pivotal Labs
* [Christian Williams](mailto:xian@pivotallabs.com), Pivotal Labs

## Acknowledgments
* A big shout out to the various JavaScript test framework authors, especially TJ for [JSpec](http://github.com/visionmedia/jspec/tree/master) - we played with it a bit before deciding that we really needed to roll our own.
* Thanks to Pivot [Jessica Miller](http://www.jessicamillerworks.com/) for our fancy pass/fail/pending icons
* Huge contributions have been made by [Erik Hanson](mailto:erik@pivotallabs.com), [Adam Abrons](mailto:adam@pivotallabs.com) and [Carl Jackson](mailto:carl@pivotallabs.com), and many other Pivots.
