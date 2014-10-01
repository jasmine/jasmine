#!/bin/bash -e

git clone https://github.com/jasmine/jasmine.github.io.git

cd jasmine.github.io
bundle

bundle exec rake update_edge_jasmine
bundle exec rake phantom
