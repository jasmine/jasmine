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
  });
});
