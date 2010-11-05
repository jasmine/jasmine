---
  layout: default
  title: Background & History
---

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
