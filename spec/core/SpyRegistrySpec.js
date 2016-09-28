describe("SpyRegistry", function() {
  describe("#spyOn", function() {
    it("checks for the existence of the object", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry();
      expect(function() {
        spyRegistry.spyOn(void 0, 'pants');
      }).toThrowError(/could not find an object/);
    });

    it("checks that a method name was passed", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

        expect(function() {
          spyRegistry.spyOn(subject);
        }).toThrowError(/No method name supplied/);
    });

    it("checks for the existence of the method", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      expect(function() {
        spyRegistry.spyOn(subject, 'pants');
      }).toThrowError(/method does not exist/);
    });

    it("checks if it has already been spied upon", function() {
      var spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
        subject = { spiedFunc: function() {} };

      spyRegistry.spyOn(subject, 'spiedFunc');

      expect(function() {
        spyRegistry.spyOn(subject, 'spiedFunc');
      }).toThrowError(/has already been spied upon/);
    });

    it("checks if it can be spied upon", function() {
      // IE 8 doesn't support `definePropery` on non-DOM nodes
      if (jasmine.getEnv().ieVersion < 9) { return; }

      var scope = {};

      function myFunc() {
        return 1;
      }

      Object.defineProperty(scope, 'myFunc', {
        get: function() {
          return myFunc;
        }
      });

      var spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
        subject = { spiedFunc: scope.myFunc };

      expect(function() {
        spyRegistry.spyOn(scope, 'myFunc');
      }).toThrowError(/is not declared writable or has no setter/);

      expect(function() {
        spyRegistry.spyOn(subject, 'spiedFunc');
      }).not.toThrowError(/is not declared writable or has no setter/);
    });

    it("overrides the method on the object and returns the spy", function() {
      var originalFunctionWasCalled = false,
        spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = { spiedFunc: function() { originalFunctionWasCalled = true; } };

      var spy = spyRegistry.spyOn(subject, 'spiedFunc');

      expect(subject.spiedFunc).toEqual(spy);
    });
  });

  describe("#spyPromise", function() {
    var spyRegistry;

    beforeEach(function() {
      spyRegistry = new j$.SpyRegistry();
    });

    it('should be defined', function() {
      expect(spyRegistry.spyPromise).toBeDefined();
    });

    it('should check if object or methodName are defined', function () {
      expect(wrappedSpyPromiseCallObjectNull).toThrowError('undefined should be a function');
      expect(wrappedSpyPromiseCallObjectUndefined).toThrowError('undefined should be a function');
      expect(wrappedSpyPromiseCallMethodNameNull).toThrowError('null should be a function');
      expect(wrappedSpyPromiseCallMethodNameUndefined).toThrowError('undefined should be a function');

      function wrappedSpyPromiseCallObjectNull() {
        spyRegistry.spyPromise(null);
      }

      function wrappedSpyPromiseCallObjectUndefined() {
        spyRegistry.spyPromise();
      }

      function wrappedSpyPromiseCallMethodNameNull() {
        spyRegistry.spyPromise({}, null);
      }

      function wrappedSpyPromiseCallMethodNameUndefined() {
        spyRegistry.spyPromise({});
      }
    });

    it('should throw an error when there is no then or catch method', function() {
      expect(wrappedSpyPromiseCallWithoutThen).toThrowError('test should return a Promise');
      expect(wrappedSpyPromiseCallWithoutCatch).toThrowError('test should return a Promise');

      function wrappedSpyPromiseCallWithoutThen() {
        var obj = {
          test: function() {
            return {
              catch: function() {}
            }
          }
        };

        spyRegistry.spyPromise(obj, 'test');
      }

      function wrappedSpyPromiseCallWithoutCatch() {
        var obj = {
          test: function() {
            return {
              then: function() {}
            }
          }
        };

        spyRegistry.spyPromise(obj, 'test');
      }
    });

    it('should return baseMethod name, resolve and reject method', function() {
      var obj = {
        test: function() {
          return {
            then: function() {return this;},
            catch: function() {return this;}
          }
        }
      };

      var result = spyRegistry.spyPromise(obj, 'test');

      expect(result).toBeDefined();
      expect(result.baseMethod).toBe('test');
      expect(typeof result.isResolved).toBe('function');
      expect(typeof result.isRejected).toBe('function');
    });

    afterEach(function () {
      spyRegistry.clearSpies();
    });
  });

  describe("#clearSpies", function() {
    it("restores the original functions on the spied-upon objects", function() {
      var spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
        originalFunction = function() {},
        subject = { spiedFunc: originalFunction };

      spyRegistry.spyOn(subject, 'spiedFunc');
      spyRegistry.clearSpies();

      expect(subject.spiedFunc).toBe(originalFunction);
    });

    it("restores the original functions, even when that spy has been replace and re-spied upon", function() {
      var spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
        originalFunction = function() {},
        subject = { spiedFunc: originalFunction };

      spyRegistry.spyOn(subject, 'spiedFunc');

      // replace the original spy with some other function
      subject.spiedFunc = function() {};

      // spy on the function in that location again
      spyRegistry.spyOn(subject, 'spiedFunc');

      spyRegistry.clearSpies();

      expect(subject.spiedFunc).toBe(originalFunction);
    });

    it("does not add a property that the spied-upon object didn't originally have", function() {
      // IE 8 doesn't support `Object.create`
      if (jasmine.getEnv().ieVersion < 9) { return; }

      var spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
        originalFunction = function() {},
        subjectParent = {spiedFunc: originalFunction};

      var subject = Object.create(subjectParent);

      expect(subject.hasOwnProperty('spiedFunc')).toBe(false);

      spyRegistry.spyOn(subject, 'spiedFunc');
      spyRegistry.clearSpies();

      expect(subject.hasOwnProperty('spiedFunc')).toBe(false);
      expect(subject.spiedFunc).toBe(originalFunction);
    });

    it("restores the original function when it\'s inherited and cannot be deleted", function() {
      // IE 8 doesn't support `Object.create` or `Object.defineProperty`
      if (jasmine.getEnv().ieVersion < 9) { return; }

      var spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
        originalFunction = function() {},
        subjectParent = {spiedFunc: originalFunction};

      var subject = Object.create(subjectParent);

      spyRegistry.spyOn(subject, 'spiedFunc');

      // simulate a spy that cannot be deleted
      Object.defineProperty(subject, 'spiedFunc', {
        configurable: false
      });

      spyRegistry.clearSpies();

      expect(jasmineUnderTest.isSpy(subject.spiedFunc)).toBe(false);
    });
  });
});
