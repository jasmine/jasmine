#!/bin/bash -e

export DISPLAY=:99.0

/etc/init.d/xvfb start

if [ $USE_SAUCE == true ]
then
    curl https://gist.github.com/santiycr/5139565/raw/sauce_connect_setup.sh | bash
fi

bundle exec rake core_spec
