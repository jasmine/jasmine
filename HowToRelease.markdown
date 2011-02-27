# Making a Release of Jasmine Core

Jasmine Core is this Github repo and contains all the core JavaScript code for the Jasmine BDD framework.

It also contains two HTML pages for the Github Pages at http://pivotal.github.com/jasmine.

## The Repo

All of the JS for Jasmine is in the src directory. The specs for each file are in the specs directory. There are rake
 tasks to concat all these files in the correct order.

## The Pages

Github pages have to exist in a branch called gh-pages in order for their app to serve them. This repo adds that
branch as a submodule under the `pages` directory. This is a bit of a hack, but it allows us to work with the pages
and the source at the same time and with one set of rake tasks.

If you want to submit changes to this repo and aren't a Pivotal Labs employee, you can fork and work in the gh-pages
branch. You won't be able to edit the pages in the submodule off of master.

The pages are built with [Frank](https://github.com/blahed/frank). All the source for these pages live in the
pages_source directory.

## Running Specs

Open the file `spec/runner.html` and all specs will run.

## Releasing

Once all specs are green and you've updated the version in `version.json`, you need to run the rake task to make a
distribution: `rake jasmine:dist`.
