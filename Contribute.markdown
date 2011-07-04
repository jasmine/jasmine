# Developing for Jasmine Core     

## How to Contribute

We welcome your contributions - Thanks for helping make Jasmine a better project for everyone. Please review the backlog and discussion lists (the main group - [http://groups.google.com/group/jasmine-js](http://groups.google.com/group/jasmine-js) and the developer's list - [http://groups.google.com/group/jasmine-js-dev](http://groups.google.com/group/jasmine-js-dev)) before starting work - what you're looking for may already have been done. If it hasn't, the community can help make your contribution better.

## How to write new Jasmine code     

Or, How to make a successful pull request

* _Do not change the public interface_. Lots of projects depend on Jasmine and if you aren't careful you'll break them
* _Be environment agnostic_ - server-side developers are just as important as browser developers
* _Be browser agnostic_ - if you must rely on browser-specific functionality, please write it in a way that degrades gracefully
* _Write specs_ - Jasmine's a testing framework; don't add functionality without test-driving it
* _Ensure the *entire* test suite is green_ in all the big browsers, Node, and JSHint - your contribution shouldn't break Jasmine for other users                                     

Follow these tips and your pull request, patch, or suggestion is much more likely to be integrated.

## Environment

Ruby, RubyGems and Rake are used in order to script the various file interactions. You will need to run on a system that supports Ruby in order to run Jasmine's specs.

Node.js is used to run most of the specs (the HTML-independent code) and should be present. Additionally, the JS Hint project scrubs the source code as part of the spec process.

## Development

All source code belongs in `src/`. The `core/` directory contains the bulk of Jasmine's functionality. This code should remain browser- and environment-agnostic. If your feature or fix cannot be, as mentioned above, please degrade gracefully. Any code that should only be in a non-browser environment should live in `src/console/`. Any code that depends on a browser (specifically, it expects `window` to be the global or `document` is present) should live in `src/html/`.

Please respect the code patterns as possible. For example, using `jasmine.getGlobal()` to get the global object so as to remain environment agnostic.

## Running Specs

As in all good projects, the `spec/` directory mirrors `src/` and follows the same rules. The browser runner will include and attempt to run all specs. The node runner will exclude any html-dependent specs (those in `spec/html/`).

You will notice that all specs are run against the built `jasmine.js` instead of the component source files. This is intentional as a way to ensure that the concatenation code is working correctly.

Please ensure all specs are green before committing.

There are rake tasks to help with getting green:
* `rake spec` outputs the expected number of specs that should be run and attempts to run in browser and Node
* `rake spec:browser` opens `spec/runner.html` in the default browser on MacOS. Please run this in at least Firefox and Chrome before committing
* `rake spec:node` runs all the Jasmine specs in Node.js - it will complain if Node is not installed
* `rake hint` runs all the files through JSHint and will complain about potential viable issues with your code. Fix them.

