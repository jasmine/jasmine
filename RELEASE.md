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

Note that Jasmine should only use the "patch" version number if the new release
contains only bug fixes.

When `jasmine-core` revs its major or minor version, the `jasmine` NPM package
should also rev to that version.

## Release

When ready to release - specs are all green and the stories are done:

1. Update the release notes in `release_notes` - use the Anchorman gem to 
   generate the Markdown file and edit accordingly. Include a list of supported
   environments. Get that information from these places:
   * For Node, see .circleci/config.yml or the README.
   * For Firefox ESR and Safari <=17, see scripts/run-sauce-browsers or the README.
   * For evergreen browsers, trigger a Circle CI run and check the
     [Saucelabs dashboard](https://app.saucelabs.com/dashboard/tests?ownerId=90a771d55857492da3bd5251a2d92457&ownerType=user&ownerName=jasmine-js&start=last7days)
     once it's finished.
   * For Safari >17, trigger the [Safari action](https://github.com/jasmine/jasmine/actions/workflows/safari.yml)
     and get the version from the output.
2. Update the version in `package.json`
3. Run `npm run build`.

### Commit and push core changes

1. Commit release notes and version changes (jasmine.js, package.json)
2. Push
3. Tag the release and push the tag.
4. Wait for Circle CI to go green

### Build standalone distribution

1. Build the standalone distribution with `npm run buildStandaloneDist`
1. This will generate `dist/jasmine-standalone-<version>.zip`, which you will upload later (see "Finally" below).

### Release the core NPM module

1. `npm login` to save your credentials locally
2. `npm publish .` to publish what's in `package.json`

### Release the docs

Probably only need to do this when releasing a minor version, and not a patch
version. See [the README file in the docs repo](https://github.com/jasmine/jasmine.github.io/blob/master/README.md)
for instructions.

### Release the `jasmine` NPM package

See <https://github.com/jasmine/jasmine-npm/blob/main/RELEASE.md>.

### Publish the GitHub release

1. Visit the releases page and find the tag just published.
2. Paste in a link to the correct release notes for this release.
3. If it is a pre-release, mark it as such.
4. Attach the standalone zipfile.
