# How to work on a Jasmine Release

## Development
___Jasmine Core Maintainers Only___

Follow the instructions in `CONTRIBUTING.md` during development.

### Git Rules

Please attempt to keep commits to `main` small, but cohesive. If a feature is contained in a bunch of small commits (e.g., it has several wip commits or small work), please squash them when pushing to `main`.

### Version

We attempt to stick to [Semantic Versioning](http://semver.org/). Most of the time, development should be against a new minor version - fixing bugs and adding new features that are backwards compatible.

The current version lives in the file `/package.json`. This version will be
copied to `jasmine.js` when the distribution is built. When releasing a new
version, update `package.json` with the new version and `npm run build` to
update the gem version number.

Note that Jasmine should only use the "patch" version number in the following cases:

* Changes related to packaging for a specific binding library (npm or browser-runner)
* Fixes for regressions.

When jasmine-core revs its major or minor version, the binding libraries should also rev to that version.

## Release

When ready to release - specs are all green and the stories are done:

1. Update the release notes in `release_notes` - use the Anchorman gem to generate the markdown file and edit accordingly. Include a list of supported environments.
1. Update the version in `package.json`
1. Run `npm run build`.

### Commit and push core changes

1. Run the browser tests using `scripts/run-all-browsers`.
1. Commit release notes and version changes (jasmine.js, package.json)
1. Push
1. Wait for Circle CI to go green

### Build standalone distribution

1. Build the standalone distribution with `grunt buildStandaloneDist`
1. This will generate `dist/jasmine-standalone-<version>.zip`, which you will upload later (see "Finally" below).

### Release the core NPM module

1. Run the tests on Windows. (CI only tests on Linux.)
1. `npm adduser` to save your credentials locally
1. `npm publish .` to publish what's in `package.json`

### Release the docs

Probably only need to do this when releasing a minor version, and not a patch version.

1. `rake update_edge_jasmine`
1. `npm run jsdoc`
1. `rake release[${version}]` to copy the current edge docs to the new version
1. Commit and push.

### Release the binding libraries

#### NPM

1. Create release notes using Anchorman as above
1. In `package.json`, update both the package version and the jasmine-core dependency version
1. Commit and push.
1. Wait for Circle CI to go green again.
1. Run the tests on Windows locally.
1. `grunt release `. (Note: This will publish the package by running `npm publish`.)

### Finally

For each of the above GitHub repos:
1. Visit the releases page and find the tag just published.
1. Paste in a link to the correct release notes for this release. The link should reference the blob and tag correctly, and the markdown file for the notes.
1. If it is a pre-release, mark it as such.
1. For core, attach the standalone zipfile.
