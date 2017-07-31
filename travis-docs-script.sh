#!/bin/bash -e

set -e

git clone https://github.com/jasmine/jasmine.github.io.git

cd jasmine.github.io
export BUNDLE_GEMFILE=$PWD/Gemfile
bundle

bundle exec rake update_edge_jasmine
bundle exec rake phantom
