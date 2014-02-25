#!/bin/bash -e

git clone https://github.com/jasmine/jasmine.github.io.git

mkdir -p jasmine.github.io/edge/lib
cp lib/jasmine-core/{boot.js,jasmine-html.js,jasmine.js,jasmine.css} jasmine.github.io/edge/lib/
cp lib/console/console.js jasmine.github.io/edge/lib/

cd jasmine.github.io
export JASMINE_VERSION=edge
CODE=`bundle exec rake phantom`

if [ $TRAVIS_PULL_REQUEST == false ]
then
  git push origin master
fi

exit $CODE
