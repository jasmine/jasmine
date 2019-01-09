#!/bin/bash -e

rm -rf ~/.nvm
git clone https://github.com/creationix/nvm.git ~/.nvm
(cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`)
source ~/.nvm/nvm.sh
nvm install ${1:-"v0.12.18"}

if [ "$1" = "v4" ]; then
  node -e "pack=require('./package.json');pack.devDependencies['grunt-contrib-jshint']='^1.1.0';require('fs').writeFileSync('./package.json', JSON.stringify(pack, null, 2));"
fi

npm install
npm test
