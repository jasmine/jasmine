---
layout: default
title: "Jasmine: BDD for Javascript"
---

# BDD for your JavaScript

Jasmine is a behavior-driven development framework for testing your JavaScript code. It does not depend on any other
JavaScript frameworks. It does not require a DOM. And it has a clean, obvious syntax so that you can easily write tests.

{% highlight javascript %}
describe("Jasmine", function() {
  it("makes testing JavaScript awesome!", function() {
    expect(yourCode).toBeLotsBetter();
  });
});
{% endhighlight %}

## Adding Jasmine to your Rails project

{% highlight sh %}
$ gem install jasmine
$ script/generate jasmine
$ rake spec
{% endhighlight %}

Jasmine can be run on a static web page, in your continuous integration environment, or with [node.js](http://nodejs.org).
See more in the documentation. 

## Support

__Discussion:__ [Google Group](http://groups.google.com/group/jasmine-js)<br/>
__Group email:__ [jasmine-js@googlegroups.com](mailto:jasmine-js@googlegroups.com)<br/>
__Current Build Status:__ [Jasmine at Pivotal Labs CI](http://ci.pivotallabs.com)<br/>
__Report bugs__ at GitHub for [Jasmine core](http://github.com/pivotal/jasmine/issues) or [Ruby gem](http://github.com/pivotal/jasmine-gem/issues)<br/>
__Project Backlog:__ [Jasmine on Pivotal Tracker](http://www.pivotaltracker.com/projects/10606)<br/>
__Twitter:__ <img src="http://twitter-badges.s3.amazonaws.com/t_mini-c.png" alt=""/>[@JasmineBDD](http://twitter.com/JasmineBDD)<br/>  
