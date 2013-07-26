#!/bin/bash -e

export DISPLAY=:99.0

bundle exec rake core_spec
