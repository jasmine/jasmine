Jasmine  
=======
**yet another JavaScript testing framework**

Why another frickin' JS tdd/bdd framework?
-----------

There are some situations when you want to test-drive JavaScript, but you don't want to be bothered with or even have an explicit document.  You have no DOM to work with and so don't have HTML elements on which to hang events handlers.  You may need to make asynchronous calls (say, to an AJAX API) and cannot mock/stub them.  

But you still need to write tests.

What's an Agile Engineer to do?

Enter Jasmine
------------

Jasmine is yet another JavaScript testing framework.  It's *heavily* influenced by JSSpec, ScrewUnit & [JSpec](http://github.com/visionmedia/jspec/tree/master), which are all influenced by RSpec.  But each of those was lacking in some way: JSSpec & ScrewUnit required a DOM.  JSpec's DOM-less assumption was a great start, but it needed asynchronous support.

So we started over.  And TDD'd a whole new framework.  Enjoy.

How To
------

### Runner

Jasmine()

You don't need a DOM, but you do need a page on which to load & execute your JS.

### Suites

Group your specs via describe

### Specs

call it() and provide a desc & a function

call runs

alias of runs to then

#### Asynchronous support

call waits

### Custom Matchers

use Matchers.method('name', function ()).  Write TESTS!

### Reports

no reporting yet other than Runner.results, which is walkable

### Tests

There is a VERY simple test reporter - it's not even a framework at all - that allows you to write tests.  

Contributing
-----------

Contributions are welcome.  Please submit tests with your pull request.

### TODO
* protect the global-ness of some variables & functions
* suite.beforeAll and suite.afterAll
* JSON reporter
* HTML reporter (callback driven)



