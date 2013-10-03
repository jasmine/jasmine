#!/bin/bash -e

if [ $USE_SAUCE == true ]
then
  if [ $TRAVIS_SECURE_ENV_VARS == true ]
  then
    curl https://gist.github.com/santiycr/5139565/raw/sauce_connect_setup.sh | bash
  else
    echo "skipping tests since we can't use sauce"
    exit 0
  fi
fi

bundle exec rake jasmine:ci
