jasmine-ruby
============

Jasmine Ruby dynamically serves HTML suites for [Jasmine](http://github.com/pivotal/jasmine)

To use:

`(sudo) gem install jasmine`

Post-installation:

For Rails support, use

`script/generate jasmine`

For other projects, use

`jasmine init`

After initializing a project, you may

`rake jasmine`

to set up a server. Opening localhost:8888 in a web browser will now run your jasmine specs.

You may also

`rake jasmine:ci`

which will run your Jasmine suites using selenium and rspec. This task is suitable for running in continuous integration environments.

Simple Configuration:

Customize `spec/javascripts/support/jasmine.yaml` to enumerate the source files, stylesheets, and spec files you would like the Jasmine runner to include.
You may use dir glob strings.

It is also possible to add overrides into the `spec/javascripts/support/jasmine_config.rb` file directly if you require further customization.
