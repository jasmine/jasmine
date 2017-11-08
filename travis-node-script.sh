#!/bin/bash -e

rm -rf ~/.nvm
git clone https://github.com/creationix/nvm.git ~/.nvm
(cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`)
source ~/.nvm/nvm.sh
nvm install $NODE_VERSION

npm install
npm test
