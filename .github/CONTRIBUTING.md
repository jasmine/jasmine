# Developing for Jasmine Core

We welcome your contributions! Thanks for helping make Jasmine a better project for everyone. Please review the backlog and discussion lists before starting work.  What you're looking for may already have been done. If it hasn't, the community can help make your contribution better. If you want to contribute but don't know what to work on, [issues tagged ready for work](https://github.com/jasmine/jasmine/labels/ready%20for%20work) should have enough detail to get started.

## Links

- [Jasmine Google Group](http://groups.google.com/group/jasmine-js)
- [Jasmine-dev Google Group](http://groups.google.com/group/jasmine-js-dev)
- [Jasmine on PivotalTracker](https://www.pivotaltracker.com/n/projects/10606)

## General Workflow

Please submit pull requests via feature branches using the semi-standard workflow of:

```bash
git clone git@github.com:yourUserName/jasmine.git              # Clone your fork
cd jasmine                                                     # Change directory
git remote add upstream https://github.com/jasmine/jasmine.git # Assign original repository to a remote named 'upstream'
git fetch upstream                                             # Fetch changes not present in your local repository
git merge upstream/main                                      # Sync local main with upstream repository
git checkout -b my-new-feature                                 # Create your feature branch
git commit -am 'Add some feature'                              # Commit your changes
git push origin my-new-feature                                 # Push to the branch
```

Once you've pushed a feature branch to your forked repo, you're ready to open a pull request. We favor pull requests with very small, single commits with a single purpose.

## Background

### Directory Structure

* `/src` contains all of the source files
    * `/src/core` - generic source files
    * `/src/html` - browser-specific files
* `/spec` contains all of the tests
    * mirrors the source directory
    * there are some additional files
* `/dist` contains the standalone distributions as zip files
* `/lib` contains the generated files for distribution as the Jasmine Rubygem and the Python package

### Self-testing

Note that Jasmine tests itself. The files in `lib` are loaded first, defining the reference `jasmine`. Then the files in `src` are loaded, defining the reference `jasmineUnderTest`. So there are two copies of the code loaded under test.

The tests should always use `jasmineUnderTest` to refer to the objects and functions that are being tested. But the tests can use functions on `jasmine` as needed. _Be careful how you structure any new test code_. Copy the patterns you see in the existing code - this ensures that the code you're testing is not leaking into the `jasmine` reference and vice-versa.

### `boot.js`

This file does all of the setup necessary for Jasmine to work. It loads all of the code, creates an `Env`, attaches the global functions, and builds the reporter. It also sets up the execution of the `Env` - for browsers this is in `window.onload`. While the default in `lib` is appropriate for browsers, projects may wish to customize this file.

For example, for Jasmine development there is a different `dev_boot.js` for Jasmine development that does more work.

### Compatibility

Jasmine supports the following environments:

* Browsers
  * IE10+
  * Edge Latest
  * Firefox Latest
  * Chrome Latest
  * Safari 8+

* Node.js
  * 8
  * 10
  * 12

## Development

All source code belongs in `src/`. The `core/` directory contains the bulk of Jasmine's functionality. This code should remain browser- and environment-agnostic. If your feature or fix cannot be, as mentioned above, please degrade gracefully. Any code that depends on a browser (specifically, it expects `window` to be the global or `document` is present) should live in `src/html/`.

### Install Dependencies

Jasmine Core relies on Node.js.

To install the Node dependencies, you will need Node.js, Npm, and [Grunt](http://gruntjs.com/), the [grunt-cli](https://github.com/gruntjs/grunt-cli) and ensure that `grunt` is on your path.

    $ npm install --local

...will install all of the node modules locally. Now run

    $ npm test

...you should see tests run and eslint checking formatting.

### How to write new Jasmine code

Or, How to make a successful pull request

* _Do not change the public interface_. Lots of projects depend on Jasmine and if you aren't careful you'll break them
* _Be environment agnostic_ - server-side developers are just as important as browser developers
* _Be browser agnostic_ - if you must rely on browser-specific functionality, please write it in a way that degrades gracefully
* _Write specs_ - Jasmine's a testing framework; don't add functionality without test-driving it
* _Write code in the style of the rest of the repo_ - Jasmine should look like a cohesive whole
* _Ensure the *entire* test suite is green_ in all the big browsers, Node, and ESLint - your contribution shouldn't break Jasmine for other users

Follow these tips and your pull request, patch, or suggestion is much more likely to be integrated.

### Running Specs

Jasmine uses some internal tooling to test itself in browser on Travis. This tooling _should_ work locally as well.

    $ node spec/support/ci.js

You can also set the `JASMINE_BROWSER` environment variable to specify which browser should be used.

The easiest way to run the tests in **Internet Explorer** is to run a VM that has IE installed. It's easy to do this with VirtualBox.

1. Download and install [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
1. Download a VM image [from Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/). Select "VirtualBox" as the platform.
1. Unzip the downloaded archive. There should be an OVA file inside.
1. In VirtualBox, choose `File > Import Appliance` and select the OVA file. Accept the default settings in the dialog that appears. Now you have a Windows VM!
1. Run the VM and start IE.
1. With `npm run serve` running on your host machine, navigate to `http://10.0.2.2:8888` in IE.

## Before Committing or Submitting a Pull Request

1. Ensure all specs are green in browser *and* node
1. Ensure eslint and prettier are clean as part of your `npm test` command. You can run `npm run cleanup` to have prettier re-write the files.
1. Build `jasmine.js` with `npm run build` and run all specs again - this ensures that your changes self-test well
1. Revert your changes to `jasmine.js` and `jasmine-html.js`
    * We do this because `jasmine.js` and `jasmine-html.js` are auto-generated (as you've seen in the previous steps) and accepting multiple pull requests when this auto-generated file changes causes lots of headaches
    * When we accept your pull request, we will generate these files as a separate commit and merge the entire branch into main

Note that we use Travis for Continuous Integration. We only accept green pull requests.

