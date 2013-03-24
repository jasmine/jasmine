# Jasmine Github Pages

_How to work with the `introduction.js` page_

## Dependencies

* Rubygems 2.0 and compatible bundler
* A local gemset
* Node.js and npm must be installed
* Grunt cli must be installed

    $ bundle
    $ npm install --local

## Adding a new version of Jasmine

These docs are expected to be versioned against Jasmine. So when Jasmine is released, these docs need to rev.

* Ensure that `lib` includes the standalone Jasmine release
* Copy `src/introduction-<version>.js` and make necessary edits
* `grunt` to JSHint all of the source files
* `rake pages` will make a new version of the HTML file
* copy the correct "latest" to `index.html`

__Note that the current repo expects that the only real difference between files based on version is the version number. If this changes, then there are plenty of assumptions that are just plain wrong.__