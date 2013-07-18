#!/bin/bash -e

sudo apt-get update
sudo apt-get install chromium-browser
wget https://chromedriver.googlecode.com/files/chromedriver_linux64_2.1.zip
unzip chromedriver_linux64_2.1.zip
sudo mv chromedriver /usr/local/bin/