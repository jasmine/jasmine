#!/bin/bash -e

git clone https://github.com/jasmine/jasmine.github.io.git

bundle exec rake jasmine:ci JASMINE_CONFIG_PATH=jasmine.github.io/edge/spec/support/jasmine.yml
