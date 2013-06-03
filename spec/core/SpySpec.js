describe('Spies', function () {
  var env;
  beforeEach(function() {
    env = new j$.Env();
  });

  it('should replace the specified function with a spy object', function() {
    var originalFunctionWasCalled = false;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
      }
    };
    env.spyOn(TestClass, 'someFunction');

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
    env.spyOn(TestClass, 'someFunction');

    TestClass.someFunction('foo');
    TestClass.someFunction('bar');
    expect(TestClass.someFunction.calls[0].args).toEqual(['foo']);
    expect(TestClass.someFunction.calls[1].args).toEqual(['bar']);
    expect(TestClass.someFunction.mostRecentCall.args).toEqual(['bar']);
  });

  it('should be possible to call through to the original method, or return a specific result', function() {
    var originalFunctionWasCalled = false;
    var passedArgs;
    var passedObj;
    var TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
        passedArgs = Array.prototype.slice.call(arguments, 0);
        passedObj = this;
        return "return value from original function";
      }
    };

    env.spyOn(TestClass, 'someFunction').andCallThrough();
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

    env.spyOn(TestClass, 'someFunction').andReturn("some value");
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

    env.spyOn(TestClass, 'someFunction').andThrow(new Error('fake error'));
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

    env.spyOn(TestClass, 'someFunction').andCallFake(function() {
      fakeFunctionWasCalled = true;
      passedArgs = Array.prototype.slice.call(arguments, 0);
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

  it('is torn down when env.removeAllSpies is called', function() {
    var originalFunctionWasCalled = false,
    env = new j$.Env(),
    TestClass = {
      someFunction: function() {
        originalFunctionWasCalled = true;
      }
    };
    env.spyOn(TestClass, 'someFunction');

    TestClass.someFunction('foo');
    expect(originalFunctionWasCalled).toEqual(false);

    env.removeAllSpies();

    TestClass.someFunction('foo');
    expect(originalFunctionWasCalled).toEqual(true);
  });

  it('calls removeAllSpies during spec finish', function() {
    var env = new j$.Env(),
    originalFoo = function() {},
    testObj = {
      foo: originalFoo
    },
    firstSpec = jasmine.createSpy('firstSpec').andCallFake(function() {
      env.spyOn(testObj, 'foo');
    }),
    secondSpec = jasmine.createSpy('secondSpec').andCallFake(function() {
      expect(testObj.foo).toBe(originalFoo);
    });
    env.describe('test suite', function() {
      env.it('spec 0', firstSpec);
      env.it('spec 1', secondSpec);
    });

    env.execute();
    expect(firstSpec).toHaveBeenCalled();
    expect(secondSpec).toHaveBeenCalled();
  });

  it('throws an exception when some method is spied on twice', function() {
    var TestClass = { someFunction: function() {
    } };
    env.spyOn(TestClass, 'someFunction');
    var exception;
    try {
      env.spyOn(TestClass, 'someFunction');
    } catch (e) {
      exception = e;
    }
    expect(exception).toBeDefined();
  });

  it('to spy on an undefined method throws exception', function() {
    var TestClass = {
      someFunction : function() {
      }
    };
    function efunc() {
      env.spyOn(TestClass, 'someOtherFunction');
    }

    expect(function() {
      efunc();
    }).toThrow('someOtherFunction() method does not exist');
  });

  it('should be able to reset a spy', function() {
    var TestClass = { someFunction: function() {} };
    env.spyOn(TestClass, 'someFunction');

    expect(TestClass.someFunction).not.toHaveBeenCalled();
    TestClass.someFunction();
    expect(TestClass.someFunction).toHaveBeenCalled();
    TestClass.someFunction.reset();
    expect(TestClass.someFunction).not.toHaveBeenCalled();
    expect(TestClass.someFunction.callCount).toEqual(0);
  });

  describe("createSpyObj", function() {
    it("should create an object with a bunch of spy methods when you call jasmine.createSpyObj()", function() {
      var spyObj = j$.createSpyObj('BaseName', ['method1', 'method2']);

      expect(spyObj).toEqual({ method1: jasmine.any(Function), method2: jasmine.any(Function)});
      expect(spyObj.method1.identity).toEqual('BaseName.method1');
      expect(spyObj.method2.identity).toEqual('BaseName.method2');
    });

    it("should throw if you do not pass an array argument", function() {
      expect(function() {
        j$.createSpyObj('BaseName');
      }).toThrow("createSpyObj requires a non-empty array of method names to create spies for");
    });
  });
});
