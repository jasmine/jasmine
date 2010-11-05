---
  layout: default
  title: Before and After a Spec
---

#### beforeEach

A suite can have a `beforeEach()` declaration. It takes a function that is run before each spec. For example:

{% highlight javascript %}
describe('some suite', function () {
  var suiteWideFoo;

  beforeEach(function () {
    suiteWideFoo = 1;
  });

  it('should equal bar', function () {
    expect(suiteWideFoo).toEqual(1);
  });
});
{% endhighlight %}

A runner can also have `beforeEach()` declarations. Runner `beforeEach()` functions are executed before every spec in all suites, and execute BEFORE suite `beforeEach()` functions. For example:

{% highlight javascript %}
var runnerWideFoo = [];

beforeEach(function () {
  runnerWideFoo.push('runner');
});

describe('some suite', function () {
  beforeEach(function () {
    runnerWideFoo.push('suite');
  });

  it('should equal bar', function () {
    expect(runnerWideFoo).toEqual(['runner', 'suite']);
  });
});
{% endhighlight %}

#### afterEach

Similarly, there is an `afterEach()` declaration.  It takes a function that is run after each spec. For example:

{% highlight javascript %}
describe('some suite', function () {
  var suiteWideFoo;
  afterEach(function () {
    suiteWideFoo = 0;
  });

  it('should equal 1', function () {
    expect(suiteWideFoo).toEqual(1);
  });

  it('should equal 0 after', function () {
    expect(suiteWideFoo).toEqual(0);
  };
});
{% endhighlight %}

A runner can also have an `afterEach()` declarations. Runner `afterEach()` functions are executed after every spec in all suites, and execute AFTER suite `afterEach()` functions. For example:

{% highlight javascript %}
var runnerWideFoo = [];

afterEach(function () {
  runnerWideFoo.push('runner');
});

describe('some suite', function () {
  afterEach(function () {
    runnerWideFoo.push('suite');
  });

  it('should be empty', function () {
    expect(runnerWideFoo).toEqual([]);
  });

  it('should be populated after', function () {
    expect(runnerWideFoo).toEqual(['suite', 'runner']);
  };
});
{% endhighlight %}

### Single-spec After functions

A spec may ask Jasmine to execute some code after the spec has finished running; the code will run whether the spec finishes successfully or not. Multiple after functions may be given.

{% highlight javascript %}
describe('some suite', function () {
  it(function () {
    var originalTitle = window.title;
    this.after(function() { window.title = originalTitle; });
    MyWindow.setTitle("new value");
    expect(window.title).toEqual("new value");
  });
{% endhighlight %}
