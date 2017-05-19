#!/bin/bash -e

rm -rf ~/.nvm
git clone https://github.com/creationix/nvm.git ~/.nvm
(cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`)
source ~/.nvm/nvm.sh
nvm install v0.12.18

npm install
npm test
