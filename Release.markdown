# How to work on a Jasmine Release

## Development
___Jasmine Core Maintainers Only___

Follow the instructions in `CONTRIBUTING.md` during development.

### Git Rules

Please work on feature branches.

Please attempt to keep commits to `master` small, but cohesive. If a feature is contained in a bunch of small commits (e.g., it has several wip commits or small work), please squash them when merging back to `master`.

### Version

We attempt to stick to [Semantic Versioning](http://semver.org/). Most of the time, development should be against a new minor version - fixing bugs and adding new features that are backwards compatible.

The current version lives in the file `/package.json`. This file should be set to the version that is _currently_ under development. That is, if version 1.0.0 is the current release then version should be incremented say, to 1.1.0.

This version is used by both `jasmine.js` and the `jasmine-core` Ruby gem.

Note that Jasmine should *not* use the "patch" version number. Let downstream projects rev their patch versions as needed, keeping their major and minor version numbers in sync with Jasmine core.
                 
### Update the Github Pages (as needed)

___Note: This is going to change right after 2.0___

Github pages have to exist in a branch called `gh-pages` in order for their app to serve them. This repo adds that branch as a submodule under the `pages` directory. This is a bit of a hack, but it allows us to work with the pages and the source at the same time and with one set of rake tasks.

If you want to submit changes to this repo and aren't a Pivotal Labs employee, you can fork and work in the `gh-pages` branch. You won't be able to edit the pages in the submodule off of master.

## Release

When ready to release - specs are all green and the stories are done:

1. Update the release notes in `release_notes` - use the Anchorman gem to generate the markdown file and edit accordingly
1. Update the version in `package.json` to a release candidate
1. Update any links or top-level landing page for the Github Pages
1. Build the standalone distribution with `grunt buildStandaloneDist`
1. Make sure you add the new ZIP file to git
1. Copy version to the Ruby gem with `grunt build:copyVersionToGem`
1. __NOTE__: You will likely need to point to a local jasmine gem in order to run tests locally. _Do not_ push this version of the Gemfile.
1. __NOTE__: You will likely need to push a new jasmine gem with a dependent version right after this release.
1. Push these changes to GitHub and verify that this SHA is green
1. `rake release` - tags the repo with the version, builds the `jasmine-core` gem, pushes the gem to Rubygems.org. In order to release you will have to ensure you have rubygems creds locally.
1. Visit the [Releases page for Jasmine](https://github.com/pivotal/jasmine/releases), find the tag just pushed. Paste in a link to the correct release notes for this release. The link should reference the blob and tag correctly, and the markdown file for the notes. If it is a pre-release, mark it as such.


There should be a post to Pivotal Labs blog and a tweet to that link.
