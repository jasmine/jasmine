describe("SpyStrategy", function() {

  it("defaults its name to unknown", function() {
    var spyStrategy = new j$.SpyStrategy();

    expect(spyStrategy.identity()).toEqual("unknown");
  });

  it("takes a name", function() {
    var spyStrategy = new j$.SpyStrategy({name: "foo"});

    expect(spyStrategy.identity()).toEqual("foo");
  });

  it("stubs an original function, if provided", function() {
    var originalFn = jasmine.createSpy("original"),
        spyStrategy = new j$.SpyStrategy({fn: originalFn});

    spyStrategy.exec();

    expect(originalFn).not.toHaveBeenCalled();
  });

  it("allows an original function to be called, passed through the params and returns it's value", function() {
    var originalFn = jasmine.createSpy("original").and.returnValue(42),
        spyStrategy = new j$.SpyStrategy({fn: originalFn}),
        returnValue;

    spyStrategy.callThrough();
    returnValue = spyStrategy.exec("foo");

    expect(originalFn).toHaveBeenCalled();
    expect(originalFn.calls.mostRecent().args).toEqual(["foo"]);
    expect(returnValue).toEqual(42);
  });

  it("can return a specified value when executed", function() {
    var originalFn = jasmine.createSpy("original"),
        spyStrategy = new j$.SpyStrategy({fn: originalFn}),
        returnValue;

    spyStrategy.returnValue(17);
    returnValue = spyStrategy.exec();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(17);
  });

  it("can return specified values in order specified when executed", function() {
    var originalFn = jasmine.createSpy("original"),
        spyStrategy = new j$.SpyStrategy({fn: originalFn});

    spyStrategy.returnValues('value1', 'value2', 'value3');

    expect(spyStrategy.exec()).toEqual('value1');
    expect(spyStrategy.exec()).toEqual('value2');
    expect(spyStrategy.exec()).toBe('value3');
    expect(spyStrategy.exec()).toBeUndefined();
    expect(originalFn).not.toHaveBeenCalled();
  });

  it("allows an exception to be thrown when executed", function() {
    var originalFn = jasmine.createSpy("original"),
        spyStrategy = new j$.SpyStrategy({fn: originalFn});

    spyStrategy.throwError(new TypeError("bar"));

    expect(function() { spyStrategy.exec(); }).toThrowError(TypeError, "bar");
    expect(originalFn).not.toHaveBeenCalled();
  });

  it("allows a non-Error to be thrown, wrapping it into an exception when executed", function() {
    var originalFn = jasmine.createSpy("original"),
        spyStrategy = new j$.SpyStrategy({fn: originalFn});

    spyStrategy.throwError("bar");

    expect(function() { spyStrategy.exec(); }).toThrowError(Error, "bar");
    expect(originalFn).not.toHaveBeenCalled();
  });

  it("allows a fake function to be called instead", function() {
    var originalFn = jasmine.createSpy("original"),
        fakeFn = jasmine.createSpy("fake").and.returnValue(67),
        spyStrategy = new j$.SpyStrategy({fn: originalFn}),
        returnValue;

    spyStrategy.callFake(fakeFn);
    returnValue = spyStrategy.exec();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(67);
  });

  it("allows a return to plan stubbing after another strategy", function() {
    var originalFn = jasmine.createSpy("original"),
        fakeFn = jasmine.createSpy("fake").and.returnValue(67),
        spyStrategy = new j$.SpyStrategy({fn: originalFn}),
        returnValue;

    spyStrategy.callFake(fakeFn);
    returnValue = spyStrategy.exec();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(67);
    
    spyStrategy.stub();
    returnValue = spyStrategy.exec();

    expect(returnValue).toEqual(void 0);
  });

  it("returns the spy after changing the strategy", function(){
    var spy = {},
        spyFn = jasmine.createSpy('spyFn').and.returnValue(spy),
        spyStrategy = new j$.SpyStrategy({getSpy: spyFn});

    expect(spyStrategy.callThrough()).toBe(spy);
    expect(spyStrategy.returnValue()).toBe(spy);
    expect(spyStrategy.throwError()).toBe(spy);
    expect(spyStrategy.callFake()).toBe(spy);
    expect(spyStrategy.stub()).toBe(spy);
  });
});
