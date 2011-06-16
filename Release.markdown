## Release
__Jasmine Core Maintainers Only__

The current version lives in the file `src/version.json`. We attempt to stick to Semantic Versioning

## The Github Pages

Github pages have to exist in a branch called gh-pages in order for their app to serve them. This repo adds that branch as a submodule under the `pages` directory. This is a bit of a hack, but it allows us to work with the pages and the source at the same time and with one set of rake tasks.

If you want to submit changes to this repo and aren't a Pivotal Labs employee, you can fork and work in the gh-pages branch. You won't be able to edit the pages in the submodule off of master.

The pages are built with [Frank](https://github.com/blahed/frank). All the source for these pages live in the pages_source directory.
