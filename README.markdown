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

Jasmine has a simple set of matchers - currently just should\_equal and should\_not\_equal.  But Matchers can be extended simply to add new expectations.  We use Douglas Crockford's Function.method() helper to define new Matchers.

A Matcher has a method name, takes an expected value as it's only parameter, has access to the actual value in this, and then makes a call to this.report with true/false with a failure message.  Here's the definition of should\_equal():

	Matchers.method('should_equal', function (expected) {
	  return this.report((this.actual === expected),
	      'Expected ' + expected + ' but got ' + this.actual + '.');
	});
	
Feel free to define your own matcher as needed in your code.  If you'd like to add Matchers to Jasmine, please write tests.  

### Limitations

You can only have one instance of Jasmine (which is a container for a runner) running at any given time.  As you can see from `bootstrap.js`, this means you have to wait until a runner is done before defining suites & specs for another runner.  

This is a bit sloppy and will be fixed at some point - but it allows for a nicer syntax when defining your specs.  For now we expect this to be fine as most of the time having multiple suites is sufficient for isolating application-level code.


## Contributing and Tests

Sometimes it's hard to test a framework with the framework itself.  Either the framework isn't mature enough or it just hurts your head.  Jasmine is affected by both.

So we made a little bootstrappy test reporter that lets us test Jasmine's pieces in isolation.  See test/bootstrap.js.  Feel free to use the bootstrap test suite to test your custom Matchers or extensions/changes to Jasmine.

Your contributions are welcome.  Please submit tests with your pull request.

### Mailing List
[http://groups.google.com/group/pivotallabsopensource](http://groups.google.com/group/pivotallabsopensource)
  
### Pivotal Tracker Bug/Feature Tracker
[http://www.pivotaltracker.com/projects/10606](http://www.pivotaltracker.com/projects/10606)


## Maintainers

* [Davis W. Frank](dwfrank@pivotallabs.com), Pivotal Labs
* [Rajan Agaskar](rajan@pivotallabs.com), Pivotal Labs

## Acknowledgments
* A big shout out to the various JavaScript test framework authors, especially TJ for [JSpec](http://github.com/visionmedia/jspec/tree/master) - we played with it a bit before deciding that we really needed to roll our own.
* Thanks to Pivot [Jessica Miller](http://www.jessicamillerworks.com/) for our fancy pass/fail/pending icons

## TODO List

In no particular order:

* Maybe add a description to `runs()` that gets incorporated in the message somehow?
* Empty specs - calls to `it()` without a function - should be considered Pending specs and have their numbers rolled up for reporting.
* Exception catching doesn't work after a call to `waits()`
* Add it `xit()` convention for disabled specs
* Pending & Disabled counts should be included in results
