#!/bin/bash -e

if [ $USE_SAUCE == true ]
then
  if [ $TRAVIS_SECURE_ENV_VARS != true ]
  then
    echo "skipping tests since we can't use sauce"
    exit 0
  fi
fi

bundle exec rake jasmine:ci
