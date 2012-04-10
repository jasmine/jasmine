# How to work on a Jasmine Release

## Development
___Jasmine Core Maintainers Only___

Follow the instructions in `Contribute.markdown` during development.

### Git Rules

Please work on feature branches.

Please attempt to keep commits to `master` small, but cohesive. If a feature is contained in a bunch of small commits (e.g., it has several wip commits), please squash them when merging back to `master`.

### Version

We attempt to stick to [Semantic Versioning](). Most of the time, development should be against a new minor version - fixing bugs and adding new features that are backwards compatible.

The current version lives in the file `src/version.json`. This file should be set to the version that is _currently_ under development. That is, if version 1.0.0 is the current release then version should be incremented say, to 1.1.0.

This version is used by both `jasmine.js` and the `jasmine-core` Ruby gem.

Note that Jasmine should *not* use the "patch" version number. Let downstream projects rev their patch versions as needed, keeping their major and minor version numbers in sync with Jasmine core.
                 
### Update the Github Pages (as needed)

Github pages have to exist in a branch called `gh-pages` in order for their app to serve them. This repo adds that branch as a submodule under the `pages` directory. This is a bit of a hack, but it allows us to work with the pages and the source at the same time and with one set of rake tasks.

If you want to submit changes to this repo and aren't a Pivotal Labs employee, you can fork and work in the `gh-pages` branch. You won't be able to edit the pages in the submodule off of master.

The pages are built with [Frank](https://github.com/blahed/frank). All the source for these pages live in the `pages/pages_source` directory.

## Release

When ready to release - specs are all green and the stories are done:

1. Update the version in `version.json` to a release candidate - add a `release_candidate` property with a value of 1
1. Update any comments on the public interfaces 
1. Update any links or top-level landing page for the Github Pages
1. `thor jasmine_dev:release_prep` - updates the version, builds the `.js` files, builds the standalone release, and builds the Github pages
1. `rake release` - tags the repo with the version, builds the `jasmine-core` gem, pushes the gem to Rubygems.org

There should be a post to Pivotal Labs blog and a tweet to that link.
