# How to work on a Jasmine Release

## Development
___Jasmine Core Maintainers Only___

We attempt to stick to [Semantic Versioning](). Most of the time, development should be against a new minor version - fixing bugs and adding new features that are backwards compatible.

The current version lives in the file `src/version.json`. This file should be set to the version that is _currently_ under development. That is, if version 1.0.0 is the current release then version should be incremented say, to 1.1.0.

Follow the instructions in `Contribute.markdown` during development.

## Release

When ready to release - specs are all green and the stories are done:

1. Update the version in `version.json` to a release candidate - add an `rc` property with a value of 1
1. Update any comments on the public interfaces 
1. `rake doc` - builds the `jsdoc` pages
1. Update any links or top-level landing page for the Github Pages
1. `rake build_pages` - builds the Github Pages
1. `rake standalone_safe` - builds the standalone distribution ZIP file


## The Github Pages

Github pages have to exist in a branch called gh-pages in order for their app to serve them. This repo adds that branch as a submodule under the `pages` directory. This is a bit of a hack, but it allows us to work with the pages and the source at the same time and with one set of rake tasks.

If you want to submit changes to this repo and aren't a Pivotal Labs employee, you can fork and work in the gh-pages branch. You won't be able to edit the pages in the submodule off of master.

The pages are built with [Frank](https://github.com/blahed/frank). All the source for these pages live in the pages_source directory.
