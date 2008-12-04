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

### Specs

Each spec is, naturally, a JavaScript function.  You tell Jasmine about this spec with a call to `it()` with a name and the function.  The string is a description that will be helpful to you when reading a report.

Your spec needs to call `runs()` with another function that is the actual spec.  More on why in a moment.  Here's an example:

    it('should be a test', function () {
	  runs(function () {
	    var foo = 0
	    foo++;
	  });
    });

### Expectations

Within your spec you will want/need to make expectations.  These are made like this:

    it('should be a test', function () {
      runs(function () {
	    var foo = 0
	    foo++;
	
	    this.expects_that(foo).should_equal(1);
      });
    });

Results of the expectations are logged for later for reporting.

### Multiple Calls to `runs()` & Scope in Your Spec

Your spec can call `runs()` multiple times if you need to break your spec up for any reason.  Say, for async support (see next section).  To allow you to share variables across your `runs()` functions, `this` is set to the spec itself.  For example:

	it('should be a test', function () {
	  runs(function () {
	    this.foo = 0
	    this.foo++;

	    this.expects_that(this.foo).should_equal(1);
	  });

	  runs(function () {
	    this.foo++;

	    this.expects_that(this.foo).should_equal(2);
	  })
	});

Functions defined with `runs()` are called in the order in which they are defined.

### Asynchronous Specs

You may be asking yourself, "Self, why would I ever need to break up my tests into pieces like this?"  The answer is when dealing with asynchronous function calls.

Say you need to make a call that is asynchronous - an AJAX API, or some other JavaScript library.  That is, the call returns immediately, yet you want to make expectations 'at some point in the future' after some magic happens in the background.

Jasmine allows you to do this by chaining calls to `runs()` with calls to `waits()`. You supply a time to wait before the next `runs()` function is executed.  Such as:

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

// include example.html

### Reports

no reporting yet other than Runner.results, which is walkable

#### JSON Reporter
Coming soon.

#### HTML Reporter
Coming soon.

#### In-line HTML Reporter
Coming soon.

### Custom Matchers

Jasmine has a simple set of matchers - currently just should\_equal and should\_not\_equal.  But Matchers can be extended simply to add new expectations.  We use Douglas Crockford's Function.method() helper to define new Matchers.

A Matcher has a method name, takes an expected value as it's only parameter, has access to the actual value in this, and then makes a call to this.report with true/false with a failure message.  Here's the definition of should\_equal():

	Matchers.method('should_equal', function (expected) {
	  return this.report((this.actual === expected),
	      'Expected ' + expected + ' but got ' + this.actual + '.');
	});
	
Feel free to define your own matcher as needed in your code.  If you'd like to add Matchers to Jasmine, please write tests.  

Contributing and Tests
----------------------

Sometimes it's hard to test a framework with the framework itself.  Either the framework isn't mature enough or it just hurts your head.  Jasmine is affected by both.

So we made a little bootstrappy test reporter that lets us test Jasmine's pieces in isolation.  See test/bootstrap.js.  Feel free to use the bootstrap test suite to test your custom Matchers or extensions/changes to Jasmine.

Your contributions are welcome.  Please submit tests with your pull request.

## Maintainers

* [Davis W. Frank](dwfrank@pivotallabs.com), Pivotal Labs
* [Rajan Agaskar](rajan@pivotallabs.com), Pivotal Labs

## TODO List

In no particular order:

* protect the global-ness of some variables & functions
* Suite beforeAll and afterAll functions
* add a description to runs()
* suite.beforeAll and suite.afterAll
* JSON reporter
* HTML reporter
* HTML reporter (callback driven)



