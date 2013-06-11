describe("SpyDelegate", function() {

  it("defaults its name to unknown", function() {
    var spyDelegate = new j$.SpyDelegate();

    expect(spyDelegate.identity()).toEqual("unknown");
  });

  it("takes a name", function() {
    var spyDelegate = new j$.SpyDelegate({name: "foo"});

    expect(spyDelegate.identity()).toEqual("foo");
  });

  it("tracks that it was called when executed", function() {
    var spyDelegate = new j$.SpyDelegate();

    expect(spyDelegate.wasCalled()).toBe(false);

    spyDelegate.exec();

    expect(spyDelegate.wasCalled()).toBe(true);
  });

  it("tracks that number of times that it is executed", function() {
    var spyDelegate = new j$.SpyDelegate();

    expect(spyDelegate.callCount()).toEqual(0);

    spyDelegate.exec();

    expect(spyDelegate.callCount()).toEqual(1);
  });

  it("tracks the params from each execution", function() {
    var spyDelegate = new j$.SpyDelegate(),
      args;

    spyDelegate.exec();
    spyDelegate.exec(0, "foo");

    args = spyDelegate.argsForCall(0);
    expect(args).toEqual([]);

    args = spyDelegate.argsForCall(1);
    expect(args).toEqual([0, "foo"]);
  });

  it("returns any empty array when there was no call", function() {
    var spyDelegate = new j$.SpyDelegate();

    expect(spyDelegate.argsForCall(0)).toEqual([]);
  });

  it("tracks the context and arguments for each call", function() {
    var spyDelegate = new j$.SpyDelegate(),
      args;

    spyDelegate.exec();
    spyDelegate.exec(0, "foo");

    args = spyDelegate.calls()[0];
    expect(args).toEqual({object: spyDelegate, args: []});

    args = spyDelegate.calls()[1];
    expect(args).toEqual({object: spyDelegate, args: [0, "foo"]});
  });

  it("simplifies access to the arguments from the most recent call", function() {
    var spyDelegate = new j$.SpyDelegate();

    spyDelegate.exec();
    spyDelegate.exec(0, "foo");

    expect(spyDelegate.mostRecentCall()).toEqual({
      object: spyDelegate,
      args: [0, "foo"]
    });
  });

  it("returns a useful falsy value when there is no most recent call", function() {
    var spyDelegate = new j$.SpyDelegate();

    expect(spyDelegate.mostRecentCall()).toBeFalsy();
  });

  it("allows the tracking to be reset", function() {
    var spyDelegate = new j$.SpyDelegate();

    spyDelegate.exec();
    spyDelegate.exec(0, "foo");
    spyDelegate.reset();

    expect(spyDelegate.wasCalled()).toBe(false);
    expect(spyDelegate.callCount()).toEqual(0);
    expect(spyDelegate.argsForCall(0)).toEqual([]);
    expect(spyDelegate.calls()).toEqual([]);
    expect(spyDelegate.mostRecentCall()).toBeFalsy();
  });

  it("stubs an original function, if provided", function() {
    var originalFn = jasmine.createSpy("original"),
      spyDelegate = new j$.SpyDelegate({fn: originalFn});

    spyDelegate.exec();

    expect(originalFn).not.toHaveBeenCalled();
  });

  it("allows an original function to be called, passed through the params and returns it's value", function() {
    var originalFn = jasmine.createSpy("original").andReturn(42),
      spyDelegate = new j$.SpyDelegate({fn: originalFn}),
      returnValue;

    spyDelegate.callThrough();
    returnValue = spyDelegate.exec("foo");

    expect(originalFn).toHaveBeenCalled();
    expect(originalFn.mostRecentCall.args).toEqual(["foo"]);
    expect(returnValue).toEqual(42);
  });

  it("can return a specified value when executed", function() {
    var originalFn = jasmine.createSpy("original"),
      spyDelegate = new j$.SpyDelegate({fn: originalFn}),
      returnValue;

    spyDelegate.return(17);
    returnValue = spyDelegate.exec();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(17);
  });

  it("allows an exception to be thrown when executed", function() {
    var originalFn = jasmine.createSpy("original"),
      spyDelegate = new j$.SpyDelegate({fn: originalFn});

    spyDelegate.throw("bar");

    expect(function() { spyDelegate.exec(); }).toThrow("bar");
    expect(originalFn).not.toHaveBeenCalled();
  });

  it("allows a fake function to be called instead", function() {
    var originalFn = jasmine.createSpy("original"),
      fakeFn = jasmine.createSpy("fake").andReturn(67),
      spyDelegate = new j$.SpyDelegate({fn: originalFn}),
      returnValue;

    spyDelegate.callFake(fakeFn);
    returnValue = spyDelegate.exec();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(67);
  });
});

describe("createSpy", function() {

  it("returns a function that has a SpyDelegate", function() {
    var spy = j$.createSpy();

    expect(spy instanceof Function).toBe(true);
    expect(spy.and instanceof j$.SpyDelegate).toBe(true);
    expect(spy.get).toEqual(spy.and);
  });

  it("says that it is a spy", function() {
    var spy = j$.createSpy();

    expect(spy.isSpy).toBe(true);
  });

  it("keeps its identity", function() {
    var spy = j$.createSpy("foo");

    expect(spy.get.identity()).toEqual("foo");
  });

  it("acts like a spy for call tracking", function() {
    var spy = j$.createSpy();

    spy("foo");

    expect(spy.get.callCount()).toEqual(1);
    expect(spy.get.mostRecentCall()).toEqual({object: window, args: ["foo"]});
  });

  it("acts like a spy for configuration", function() {
    var originalFn = jasmine.createSpy("original").andReturn(17),
      spy = j$.createSpy("foo", originalFn),
      returnValue;

    spy();

    expect(originalFn).not.toHaveBeenCalled();

    originalFn.reset();
    spy.and.reset();

    spy.and.callThrough();
    returnValue = spy();

    expect(originalFn).toHaveBeenCalled();
    expect(returnValue).toEqual(17);

    originalFn.reset();
    spy.and.reset();

    spy.and.return(42);
    returnValue = spy();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(42);
  });
});

describe("isSpy", function() {
  // TODO: fill this in
});

describe("createSpyObj", function() {
  // TODO: fill this in
});
