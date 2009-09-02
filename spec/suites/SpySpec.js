describe('Spies', function () {
  it('should replace the specified function with a spy object', function() {
    var originalFunctionWasCalled = false;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
      }
    };
    this.spyOn(TestClass, 'someFunction');

    expect(TestClass.someFunction.wasCalled).toEqual(false);
    expect(TestClass.someFunction.callCount).toEqual(0);
    TestClass.someFunction('foo');
    expect(TestClass.someFunction.wasCalled).toEqual(true);
    expect(TestClass.someFunction.callCount).toEqual(1);
    expect(TestClass.someFunction.mostRecentCall.args).toEqual(['foo']);
    expect(TestClass.someFunction.mostRecentCall.object).toEqual(TestClass);
    expect(originalFunctionWasCalled).toEqual(false);

    TestClass.someFunction('bar');
    expect(TestClass.someFunction.callCount).toEqual(2);
    expect(TestClass.someFunction.mostRecentCall.args).toEqual(['bar']);
  });

  it('should allow you to view args for a particular call', function() {
    var originalFunctionWasCalled = false;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
      }
    };
    this.spyOn(TestClass, 'someFunction');

    TestClass.someFunction('foo');
    TestClass.someFunction('bar');
    expect(TestClass.someFunction.argsForCall[0]).toEqual(['foo']);
    expect(TestClass.someFunction.argsForCall[1]).toEqual(['bar']);
    expect(TestClass.someFunction.mostRecentCall.args).toEqual(['bar']);
  });

  it('should be possible to call through to the original method, or return a specific result', function() {
    var originalFunctionWasCalled = false;
    var passedArgs;
    var passedObj;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
        passedArgs = arguments;
        passedObj = this;
        return "return value from original function";
      }
    };

    this.spyOn(TestClass, 'someFunction').andCallThrough();
    var result = TestClass.someFunction('arg1', 'arg2');
    expect(result).toEqual("return value from original function");
    expect(originalFunctionWasCalled).toEqual(true);
    expect(passedArgs).toEqual(['arg1', 'arg2']);
    expect(passedObj).toEqual(TestClass);
    expect(TestClass.someFunction.wasCalled).toEqual(true);
  });

  it('should be possible to return a specific value', function() {
    var originalFunctionWasCalled = false;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
        return "return value from original function";
      }
    };

    this.spyOn(TestClass, 'someFunction').andReturn("some value");
    originalFunctionWasCalled = false;
    var result = TestClass.someFunction('arg1', 'arg2');
    expect(result).toEqual("some value");
    expect(originalFunctionWasCalled).toEqual(false);
  });

  it('should be possible to throw a specific error', function() {
    var originalFunctionWasCalled = false;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
        return "return value from original function";
      }
    };

    this.spyOn(TestClass, 'someFunction').andThrow(new Error('fake error'));
    var exception;
    try {
      TestClass.someFunction('arg1', 'arg2');
    } catch (e) {
      exception = e;
    }
    expect(exception.message).toEqual('fake error');
    expect(originalFunctionWasCalled).toEqual(false);
  });

  it('should be possible to call a specified function', function() {
    var originalFunctionWasCalled = false;
    var fakeFunctionWasCalled = false;
    var passedArgs;
    var passedObj;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
        return "return value from original function";
      }
    };

    this.spyOn(TestClass, 'someFunction').andCallFake(function() {
      fakeFunctionWasCalled = true;
      passedArgs = arguments;
      passedObj = this;
      return "return value from fake function";
    });

    var result = TestClass.someFunction('arg1', 'arg2');
    expect(result).toEqual("return value from fake function");
    expect(originalFunctionWasCalled).toEqual(false);
    expect(fakeFunctionWasCalled).toEqual(true);
    expect(passedArgs).toEqual(['arg1', 'arg2']);
    expect(passedObj).toEqual(TestClass);
    expect(TestClass.someFunction.wasCalled).toEqual(true);
  });

  it('is torn down when this.removeAllSpies is called', function() {
    var originalFunctionWasCalled = false;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
      }
    };
    this.spyOn(TestClass, 'someFunction');

    TestClass.someFunction('foo');
    expect(originalFunctionWasCalled).toEqual(false);

    this.removeAllSpies();

    TestClass.someFunction('foo');
    expect(originalFunctionWasCalled).toEqual(true);
  });

  it('calls removeAllSpies during spec finish', function() {
    var test = new jasmine.Spec(new jasmine.Env(), {}, 'sample test');

    this.spyOn(test, 'removeAllSpies');

    test.finish();

    expect(test.removeAllSpies).wasCalled();
  });

  it('throws an exception when some method is spied on twice', function() {
    var TestClass = { someFunction: function() {
    } };
    this.spyOn(TestClass, 'someFunction');
    var exception;
    try {
      this.spyOn(TestClass, 'someFunction');
    } catch (e) {
      exception = e;
    }
    expect(exception).toBeDefined();
  });

  it('should be able to reset a spy', function() {
    var TestClass = { someFunction: function() {} };
    this.spyOn(TestClass, 'someFunction');

    expect(TestClass.someFunction).wasNotCalled();
    TestClass.someFunction();
    expect(TestClass.someFunction).wasCalled();
    TestClass.someFunction.reset();
    expect(TestClass.someFunction).wasNotCalled();
    expect(TestClass.someFunction.callCount).toEqual(0);
  });

  it("should create an object with a bunch of spy methods when you call jasmine.createSpyObj()", function() {
    var spyObj = jasmine.createSpyObj('BaseName', ['method1', 'method2']);
    expect(spyObj).toEqual({ method1: jasmine.any(Function), method2: jasmine.any(Function)});
    expect(spyObj.method1.identity).toEqual('BaseName.method1');
    expect(spyObj.method2.identity).toEqual('BaseName.method2');
  });

});