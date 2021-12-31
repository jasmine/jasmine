# Developing for Jasmine Core

We welcome your contributions! Thanks for helping make Jasmine a better project
for everyone. Please review the backlog and discussion lists before starting
work. What you're looking for may already have been done. If it hasn't, the
community can help make your contribution better. If you want to contribute but
don't know what to work on, 
[issues tagged help needed](https://github.com/jasmine/jasmine/labels/help%20needed)
should have enough detail to get started.

## Links

- [Jasmine Google Group](http://groups.google.com/group/jasmine-js)
- [Jasmine-dev Google Group](http://groups.google.com/group/jasmine-js-dev)
- [Jasmine backlog](https://www.pivotaltracker.com/n/projects/10606)

## Before Submitting a Pull Request

1. Ensure all specs are green in browsers *and* node.
   * Use `npm test` to test in Node.
   * Use `npm run serve` to test in browsers.
2. Fix any eslint or prettier errors reported at the end of `npm test`. Prettier
   errors can be automatically fixed by running `npm run cleanup`.
3. Build `jasmine.js` with `npm run build` and run all specs again. This
   ensures that your changes self-test well.
5. Revert your changes to `jasmine.js` and `jasmine-html.js`. When we accept 
   your pull request, we will generate these files as a separate commit and
   merge the entire branch into master.

We only accept green pull requests. If you see that the CI build failed, please
fix it. Feel free to ask for help if you're stuck.

## Background

### Directory Structure

* `/src` contains all of the source files
    * `/src/core` - generic source files
    * `/src/html` - browser-specific files
    * `/src/boot` - sources for boot files (see below)
* `/spec` contains all of the tests
    * mirrors the source directory
    * there are some additional files
* `/lib` contains the compiled copy of Jasmine. This is used to self-test and
  distributed as the `jasmine-core` Node, and Ruby packages.

### Self-testing

Jasmine tests itself. The files in `lib` are loaded first, defining the reference `jasmine`. Then the files in `src` are loaded, defining the reference `jasmineUnderTest`. So there are two copies of the code loaded under test.

The tests should always use `jasmineUnderTest` to refer to the objects and functions that are being tested. But the tests can use functions on `jasmine` as needed. _Be careful how you structure any new test code_. Copy the patterns you see in the existing code - this ensures that the code you're testing is not leaking into the `jasmine` reference and vice-versa.

### `boot0.js` and `boot1.js`

These files file does all of the setup necessary for Jasmine to work in a
browser. They load all of the code, create an `Env`, attach the global
functions, and build the reporter. It also sets up the execution of the 
`Env` - for browsers this is in `window.onload`. While the default in `lib`
is appropriate for browsers, projects may wish to customize this file.

### Compatibility

Jasmine runs in both Node and a variety of browsers. See the README for the
list of currently supported environments.

## Development

All source code belongs in `src/`. The `core/` directory contains the bulk of Jasmine's functionality. This code should remain browser- and environment-agnostic. If your feature or fix cannot be, as mentioned above, please degrade gracefully. Any code that depends on a browser (specifically, it expects `window` to be the global or `document` is present) should live in `src/html/`.

### Install Dev Dependencies

Jasmine Core relies on Node.js.

To install the Node dependencies, you will need Node.js and npm.

    $ npm install

...will install all of the node modules locally. Now run

    $ npm test

...you should see tests run and eslint checking formatting.

### How to write new Jasmine code

Or, How to make a successful pull request

* _Do not change the public interface_. Lots of projects depend on Jasmine and
  if you aren't careful you'll break them.
* _Be environment agnostic_. Some people run their specs in browsers, others in
  Node. Jasmine should support them all as much as possible.
* _Be browser agnostic_ - if you must rely on browser-specific functionality, 
  please write it in a way that degrades gracefully.
* _Write specs_ - Jasmine's a testing framework. Don't add functionality 
  without test-driving it.
* _Write code in the style of the rest of the repo_ - Jasmine should look like
  a cohesive whole.
  
  Key exceptions:
  * Use `const` or `let` for new variable declarations, even if nearby code
    uses `var`.
  * New async specs should usually be async/await or promise-returning, not
    callback based.
  
* _Ensure the *entire* test suite is green_ in all the big browsers, Node, and
  ESLint/Prettier. Your contribution shouldn't break Jasmine for other users.

Follow these tips and your pull request, patch, or suggestion is much more likely to be integrated.

### Running Specs

Be sure to run the tests in at least one supported Node version and at least a
couple of supported browsers. To run the tests in Node, simply use `npm test`
as described above. To run the tests in a browser, run `npm run serve` and then
visit `http://localhost:8888`.

If you have the necessary Selenium drivers installed (e.g. geckodriver or 
chromedriver), you can also use Jasmine's CI tooling: 

    $ JASMINE_BROWSER=<name of browser> npm run ci

