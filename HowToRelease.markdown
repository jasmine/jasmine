

1. Ensure all specs are green in browsers & Node.js (via rake tasks)
1. Ensure CI is green
1.




## Development




## Release





# Making a Release of Jasmine Core

'Jasmine' is the Github repo for Jasmine Core and contains all the JavaScript code for the Jasmine BDD framework.

It also contains two HTML pages for the Github Pages at http://pivotal.github.com/jasmine.

## The Repo

All of the JS for Jasmine is in the src directory. The specs for each file are in the specs directory. There are rake tasks to build the various files for distribution.

## Running Specs

There are rake tasks to help with getting green:

* `rake spec:browser` opens `spec/runner.html` in the default browser. Please run this in at least Firefox and Chrome before comitting
* `rake spec:node` runs all the Jasmine specs in Node.js
* `rake jasmine:lint` runs all the files through JSHint and will complain about potential viable issues with your code. Fix them.

## The Pages

Github pages have to exist in a branch called gh-pages in order for their app to serve them. This repo adds that branch as a submodule under the `pages` directory. This is a bit of a hack, but it allows us to work with the pages and the source at the same time and with one set of rake tasks.

If you want to submit changes to this repo and aren't a Pivotal Labs employee, you can fork and work in the gh-pages branch. You won't be able to edit the pages in the submodule off of master.

The pages are built with [Frank](https://github.com/blahed/frank). All the source for these pages live in the pages_source directory.

## Releasing

Once all specs are green and you've updated the version in `version.json`, you need to run the rake task to make a distribution: `rake jasmine:dist`.
