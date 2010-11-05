---
  layout: default
  title: Spies
---

### Spies

Jasmine integrates 'spies' that permit many spying, mocking, and faking behaviors.

Here are a few examples:

{% highlight javascript %}
var Klass = function () {
};

Klass.staticMethod = function (arg) {
  return arg;
};

Klass.prototype.method = function (arg) {
  return arg;
};

Klass.prototype.methodWithCallback = function (callback) {
  return callback('foo');
};

...

describe("spy behavior", function() {
  it('should spy on a static method of Klass', function() {
    spyOn(Klass, 'staticMethod');
    Klass.staticMethod('foo argument');

    expect(Klass.staticMethod).toHaveBeenCalledWith('foo argument');
  });

  it('should spy on an instance method of a Klass', function() {
    var obj = new Klass();
    spyOn(obj, 'method');
    obj.method('foo argument');

    expect(obj.method).toHaveBeenCalledWith('foo argument');

    var obj2 = new Klass();
    spyOn(obj2, 'method');
    expect(obj2.method).not.toHaveBeenCalled();
  });

  it('should spy on Klass#methodWithCallback', function() {
    var callback = jasmine.createSpy();
    new Klass().methodWithCallback(callback);

    expect(callback).toHaveBeenCalledWith('foo');
  });
});
{% endhighlight %}

Spies can be very useful for testing AJAX or other asynchronous behaviors that take callbacks by faking the method firing an async call.

{% highlight javascript %}
var Klass = function () {
};

var Klass.prototype.asyncMethod = function (callback) {
  someAsyncCall(callback);
};

...

it('should test async call') {
  spyOn(Klass, 'asyncMethod');
  var callback = jasmine.createSpy();

  Klass.asyncMethod(callback);
  expect(callback).not.toHaveBeenCalled();

  var someResponseData = 'foo';
  Klass.asyncMethod.mostRecentCall.args[0](someResponseData);
  expect(callback).toHaveBeenCalledWith(someResponseData);

});
{% endhighlight %}

There are spy-specfic matchers that are very handy.

`expect(x).toHaveBeenCalled()` passes if `x` is a spy and was called

`expect(x).toHaveBeenCalledWith(arguments)` passes if `x` is a spy and was called with the specified arguments

`expect(x).not.toHaveBeenCalled()` passes if `x` is a spy and was not called

`expect(x).not.toHaveBeenCalledWith(arguments)` passes if `x` is a spy and was not called with the specified arguments

<small>The old matchers `wasCalled`, `wasNotCalled`, `wasCalledWith`, and `wasNotCalledWith` have been deprecated and will be removed in a future release. Please change your specs to use `toHaveBeenCalled`, `not.toHaveBeenCalled`, `toHaveBeenCalledWith`, and `not.toHaveBeenCalledWith` respectively.</small>

Spies can be trained to respond in a variety of ways when invoked:

`spyOn(x, 'method').andCallThrough()`: spies on AND calls the original function spied on

`spyOn(x, 'method').andReturn(arguments)`: returns passed arguments when spy is called

`spyOn(x, 'method').andThrow(exception)`: throws passed exception when spy is called

`spyOn(x, 'method').andCallFake(function)`: calls passed function when spy is called

Spies have some useful properties:

`callCount`: returns number of times spy was called

`mostRecentCall.args`: returns argument array from last call to spy.

`argsForCall[i]` returns arguments array for call `i` to spy.

Spies are automatically removed after each spec. They may be set in the beforeEach function.

