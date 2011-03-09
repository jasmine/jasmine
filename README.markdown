<a name="README">[Jasmine](http://pivotal.github.com/jasmine/)</a>
=======
**A JavaScript Testing Framework**

Jasmine is a Behavior Driven Development testing framework for JavaScript. It does not rely on browsers, DOM, or any JavaScript framework. Thus it's suited for websites, [Node.js](http://nodejs.org) projects, or anywhere that JavaScript can run.

Documentation & guides live here: [http://pivotal.github.com/jasmine/](http://pivotal.github.com/jasmine/)

## Support

* Search past discussions: [http://groups.google.com/group/jasmine-js](http://groups.google.com/group/jasmine-js)
* Send an email to the list: [jasmine-js@googlegroups.com](jasmine-js@googlegroups.com)
* Check the current build status: [ci.pivotallabs.com](http://ci.pivotallabs.com)
* View the project backlog at Pivotal Tracker: [http://www.pivotaltracker.com/projects/10606](http://www.pivotaltracker.com/projects/10606)
* Follow us on Twitter: [@JasmineBDD](http://twitter.com/JasmineBDD)

## How to Contribute

We welcome your contributions - Thanks for helping make Jasmine a better project for everyone. Please review the backlog and discussion lists (the main group and the developer's list at [http://groups.google.com/group/jasmine-js](http://groups.google.com/group/jasmine-js)) before starting work - what you're looking for may already have been done. If it hasn't, the community can help make your contribution better.

### Development Environment

Jasmine Core relies on Ruby for executing the test suite and building the project for release. The spec suite runs in any major, modern browser (Firefox, Safari, Chrome, and yes various IE's) and in Node.js.

### How to Develop for Jasmine Core

* Write specs
* Make them pass in a browser (or three):
  * open `spec/runner.html` in your browsers
  * `rake spec:browser` will run in the default browser on MacOS
* Make them pass in Node: `rake spec:node`
* Fix any warnings or errors from JSHint: `rake jasmine:lint`

Running `rake spec` will run the browser tests, then run specs in Node, then run JSHint. But this will only run in the default browser and only on MacOS (for now).


### Making a Successful Pull Request

* __Include specs for your work__ - it helps us understand your intent and makes sure that future development doesn't break your work
* __Ensure the full test suite is green__ in all the big browsers, Node, and JSHint - your contribution shouldn't break Jasmine for other users

Do these things and we'll take a look.

## Maintainers

* [Davis W. Frank](mailto:dwfrank@pivotallabs.com), Pivotal Labs
* [Rajan Agaskar](mailto:rajan@pivotallabs.com), Pivotal Labs
* [Christian Williams](mailto:antixian666@gmail.com), Square

Copyright (c) 2008-2011 Pivotal Labs. This software is licensed under the MIT License.
