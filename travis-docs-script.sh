#!/bin/bash -e

git clone https://github.com/jasmine/jasmine.github.io.git

cd jasmine.github.io
bundle

rake update_edge_jasmine
rake phantom
