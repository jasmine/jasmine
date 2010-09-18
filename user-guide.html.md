---
layout: default
title: Jasmine User Guide
---

# Quick Start

## For JavaScript-only projects:
1. Get the latest standalone release from the [downloads page](index.html).
2. Open `SpecRunner.html` in your favorite browser.

## Other distributions:
* For integration with the Ruby environment, including automated execution with Selenium, please use the [jasmine gem](http://github.com/pivotal/jasmine-gem).

# Which Release Should I Use?

Please use the latest version unless you have a good reason not to. Some of this documentation may not be applicable to older versions. Please see [Release Notes](release-notes.html) for change information.

# Why Another JavaScript TDD/BDD Framework?

There are some great JavaScript testing frameworks out there already, so why did we write another?

None of the existing frameworks quite worked the way we wanted. Many only work from within a browser. Most don't support testing asynchronous code like event callbacks. Some have syntax that's hard for JS developers or IDEs to understand.

So we decided to start from scratch.

# Enter Jasmine

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

# How To

There is a simple example of how to use Jasmine in the /example directory, but here's more information.

## Specs

Each spec is, naturally, a JavaScript function.  You tell Jasmine about a spec with a call to `it()` with a description string and the function.  The string is a description of a behavior that you want your production code to exhibit; it should be meaningful to you when reading a report.

    it('should increment a variable', function () {
      var foo = 0;
      foo++;
    });

## Expectations

Within your spec you will express expectations about the behavior of your application code.  This is done using the `expect()` function and any of various expectation matchers, like this:

    it('should increment a variable', function () {
      var foo = 0;            // set up the world
      foo++;                  // call your application code

      expect(foo).toEqual(1); // passes because foo == 1
    });

Results of the expectations will be reported to you when the spec is run.

### Expectation Matchers

Jasmine has several built-in matchers.  Here are a few:

>`expect(x).toEqual(y);` compares objects or primitives `x` and `y` and passes if they are equivalent
>
>`expect(x).toBe(y);` compares objects or primitives `x` and `y` and passes if they are the same object
>
>`expect(x).toMatch(pattern);` compares `x` to string or regular expression `pattern` and passes if they match
>
>`expect(x).toBeDefined();` passes if `x` is not `undefined`
>
>`expect(x).toBeNull();` passes if `x` is `null`
>
>`expect(x).toBeTruthy();` passes if `x` evaluates to true
>
>`expect(x).toBeFalsy();` passes if `x` evaluates to false
>
>`expect(x).toContain(y);` passes if array or string `x` contains `y`
>
>`expect(x).toBeLessThan(y);` passes if `x` is less than `y`
>
>`expect(x).toBeGreaterThan(y);` passes if `x` is greater than `y`
>
>`expect(fn).toThrow(e);` passes if function `fn` throws exception `e` when executed

<small>The old matchers `toNotEqual`, `toNotBe`, `toNotMatch`, and `toNotContain` have been deprecated and will be removed in a future release. Please change your specs to use `not.toEqual`, `not.toBe`, `not.toMatch`, and `not.toContain` respectively.</small>

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

    describe('Calculator', function () {
      it('can add a number', function () {
        ...
      });

      it('has multiply some numbers', function () {
        ...
      });
    });

The Suite name is typically the name of a class or other applicaton component, and will be reported with results when your specs are run.

Suites are executed in the order in which `describe()` calls are made, usually in the order in which their script files are included.  Additionally, specs within a suite share a functional scope.  So you may declare variables inside a describe block and they are accessible from within your specs.  For example:

    describe('Calculator', function () {
      var counter = 0

      it('can add a number', function () {
        counter = counter + 2;   // counter was 0 before
        expect(bar).toEqual(2);
      });

      it('can multiply a number', function () {
        counter = counter * 5;   // counter was 2 before
        expect(bar).toEqual(10);
      });
    });

Be aware that code directly inside the `describe()` function is only executed once, which is why `counter` in the above example is not reset to `0` for the second spec. If you want to initialize variables before each spec, use a `beforeEach()` function.

#### beforeEach

A suite can have a `beforeEach()` declaration. It takes a function that is run before each spec. For example:

    describe('some suite', function () {

      var suiteWideFoo;

      beforeEach(function () {
        suiteWideFoo = 1;
      });

      it('should equal bar', function () {
        expect(suiteWideFoo).toEqual(1);
      });
    });

A runner can also have `beforeEach()` declarations. Runner `beforeEach()` functions are executed before every spec in all suites, and execute BEFORE suite `beforeEach()` functions. For example:

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

Similarly, there is an `afterEach()` declaration.  It takes a function that is run after each spec. For example:

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

A runner can also have an `afterEach()` declarations. Runner `afterEach()` functions are executed after every spec in all suites, and execute AFTER suite `afterEach()` functions. For example:

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

    Klass.staticMethod = function (arg) {
      return arg;
    };

    Klass.prototype.method = function (arg) {
      return arg;
    };

    Klass.prototype.methodWithCallback = function (callback) {
      return callback('foo');
    };

    ...

    describe("spy behavior", function() {
      it('should spy on a static method of Klass', function() {
        spyOn(Klass, 'staticMethod');
        Klass.staticMethod('foo argument');

        expect(Klass.staticMethod).toHaveBeenCalledWith('foo argument');
      });

      it('should spy on an instance method of a Klass', function() {
        var obj = new Klass();
        spyOn(obj, 'method');
        obj.method('foo argument');

        expect(obj.method).toHaveBeenCalledWith('foo argument');

        var obj2 = new Klass();
        spyOn(obj2, 'method');
        expect(obj2.method).not.toHaveBeenCalled();
      });

      it('should spy on Klass#methodWithCallback', function() {
        var callback = jasmine.createSpy();
        new Klass().methodWithCallback(callback);

        expect(callback).toHaveBeenCalledWith('foo');
      });
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
      var callback = jasmine.createSpy();

      Klass.asyncMethod(callback);
      expect(callback).not.toHaveBeenCalled();

      var someResponseData = 'foo';
      Klass.asyncMethod.mostRecentCall.args[0](someResponseData);
      expect(callback).toHaveBeenCalledWith(someResponseData);

    });

There are spy-specfic matchers that are very handy.

`expect(x).toHaveBeenCalled()` passes if `x` is a spy and was called

`expect(x).toHaveBeenCalledWith(arguments)` passes if `x` is a spy and was called with the specified arguments

`expect(x).not.toHaveBeenCalled()` passes if `x` is a spy and was not called

`expect(x).not.toHaveBeenCalledWith(arguments)` passes if `x` is a spy and was not called with the specified arguments

<small>The old matchers `wasCalled`, `wasNotCalled`, `wasCalledWith`, and `wasNotCalledWith` have been deprecated and will be removed in a future release. Please change your specs to use `toHaveBeenCalled`, `not.toHaveBeenCalled`, `toHaveBeenCalledWith`, and `not.toHaveBeenCalledWith` respectively.</small>

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

Specs may be disabled by calling `xit()` instead of `it()`.  Suites may be disabled by calling `xdescribe()` instead of `describe()`.

### Asynchronous Specs

You may be thinking, "That's all very nice, but what's this about asynchronous tests?"

Well, say you need to make a call that is asynchronous - an AJAX API, event callback, or some other JavaScript library.  That is, the call returns immediately, yet you want to make expectations 'at some point in the future' after some magic happens in the background.

Jasmine allows you to do this with `runs()`, `waits()` and `waitsFor()` blocks.

#### `runs(function)`

`runs()` blocks by themselves simply run as if they were called directly. The following snippets of code provide similar results:

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

Multiple `runs()` blocks in a spec will run serially. For example,

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

#### `waits(timeout)`

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
        expect(this.foo).toEqual(0);
      });

      waits(500);

      runs(function () {
        expect(this.foo).toEqual(1);
      });
    });

What's happening here?

* The first call to `runs()` sets call for 1/4 of a second in the future that increments `this.foo`.
* The second `runs()` is executed immediately and then verifies that `this.foo` was indeed initialized to zero in the previous `runs()`.
* Then we wait for half a second.
* Then the last call to `runs()` expects that `this.foo` was incremented by the `setTimeout`.

`waits()` allows you to pause the spec for a fixed period of time, in order to give your code the opportunity to perform
some other operation. But what if you don't know exactly how long you need to wait?

#### `waitsFor(function, optional message, optional timeout)`

`waitsFor()` provides a better interface for pausing your spec until some other work has completed. Jasmine will wait until
the provided function returns `true` before continuing with the next block. This may mean waiting an arbitrary period of
time, or you may specify a maxiumum period in milliseconds before timing out:

    describe('Spreadsheet', function() {
      it('should calculate the total asynchronously', function () {
        var spreadsheet = new Spreadsheet();
        spreadsheet.fillWith(lotsOfFixureDataValues());
        spreadsheet.asynchronouslyCalculateTotal();

        waitsFor(function() {
          return spreadsheet.calculationIsComplete();
        }, "Spreadsheet calculation never completed", 10000);

        runs(function () {
          expect(spreadsheet.total).toEqual(123456);
        });
      });
    });

In this example, we create a spreadsheet and fill it with some sample data. We then ask the spreadsheet to start calculating
its total, which presumably is a slow operation and therefore happens asynchronously. We ask Jasmine to wait until the
spreadsheet's calculation work is complete (or up to 10 seconds, whichever comes first) before continuing with the rest of
the spec. If the calculation finishes within the allotted 10 seconds, Jasmine continues on to the final `runs()` block, where
it validates the calculation. If the spreadsheet hasn't finished calculations within 10 seconds, the spec stops and reports
a spec failure with the message given in the `waitsFor()` block.

## Support
We now have a Google Group for support & discussion.

* Discussion: [http://groups.google.com/group/jasmine-js](http://groups.google.com/group/jasmine-js)
* Group email: [jasmine-js@googlegroups.com](jasmine-js@googlegroups.com)
* Current build status of Jasmine is visible at [ci.pivotallabs.com](http://ci.pivotallabs.com)
* Pivotal Tracker project: [http://www.pivotaltracker.com/projects/10606](http://www.pivotaltracker.com/projects/10606)
* Twitter: [@JasmineBDD](http://twitter.com/JasmineBDD)

## Maintainers
* [Davis W. Frank](mailto:dwfrank@pivotallabs.com), Pivotal Labs
* [Rajan Agaskar](mailto:rajan@pivotallabs.com), Pivotal Labs
* [Christian Williams](mailto:xian@pivotallabs.com), Pivotal Labs

## Developers
We welcome your contributions! Jasmine is currently maintained by Davis Frank ([infews](http://github.com/infews)), Rajan Agaskar ([ragaskar](http://github.com/ragaskar)), and Christian Williams ([Xian](http://github.com/Xian)). You can help us by removing all other recipients from your pull request.

## Acknowledgments
* A big shout out to the various JavaScript test framework authors, especially TJ for [JSpec](http://github.com/visionmedia/jspec/tree/master) - we played with it a bit before deciding that we really needed to roll our own.
* Thanks to Pivot [Jessica Miller](http://www.jessicamillerworks.com/) for our logo and fancy pass/fail/pending icons
* Huge contributions have been made by [Adam Abrons](mailto:adam@pivotallabs.com), [Lee Byrd](mailto:lee@pivotallabs.com), [Erik Hanson](mailto:erik@pivotallabs.com), [Carl Jackson](mailto:carl@pivotallabs.com), and many other Pivots.
