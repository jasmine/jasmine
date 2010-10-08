---
  layout: default
  title: Using the Jasmine Gem
---
It's easy to integrate Jasmine with your Ruby project.

## Setup ##

### For Rails 2 projects ###

Install the Jasmine gem, add example specs to your project, and run them:
{% highlight sh %}
$ gem install jasmine
$ script/generate jasmine
$ rake spec
{% endhighlight %}

### For Rails 3 projects ###

Add jasmine to your Gemfile:
{% highlight ruby %}
gem "jasmine"
{% endhighlight %}

Then update your gems, add example specs to your project, and run them:
{% highlight sh %}
$ bundle install
$ bundle exec jasmine init
{% endhighlight %}

Better Rails 3/RSpec 2 support is coming soon!

### For other Ruby projects ###

Install the Jasmine gem, create an example project, and run your specs:

{% highlight sh %}
$ gem install jasmine
$ jasmine init
$ rake jasmine:ci
{% endhighlight %}

## Running specs ##

The Jasmine gem provides two Rake tasks:

{% highlight sh %}
$ rake jasmine
{% endhighlight %}

This task starts a server which you can connect to through your browser and interactively run specs.

{% highlight sh %}
$ rake jasmine:ci
{% endhighlight %}

This task runs your Jasmine specs automatically (by launching Firefox, by default) and reports the result.

When used with Rails 2, Jasmine gem creates a special RSpec spec which runs all your JavaScript specs and reports the
results as though they were Ruby specs. If you use a compatible IDE (such as RubyMine), you can navigate to the
JavaScript source for your specs directly from the spec runner interface.

## CI/build integration ##

The Jasmine gem makes it easy to include your Jasmine specs in your continuous integration build. If you are using
Rails 2, your Jasmine specs will automatically be included with other specs. Otherwise, you can explicitly run your
Jasmine specs like this:

{% highlight sh %}
$ rake jasmine:ci
{% endhighlight %}

## Configuration ##

Customize spec/javascripts/support/jasmine.yml to enumerate the source files, stylesheets, and spec files you would
like the Jasmine runner to include. You may use dir glob strings.

## Runner ##

The Jasmine gem currently uses Selenium to launch a browser (Firefox by default) in order to run your specs. In the
future, we'll provide other options for running your specs.
