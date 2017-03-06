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

    it("checks that the object is not `null`", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry();
      expect(function() {
        spyRegistry.spyOn(null, 'pants');
      }).toThrowError(/could not find an object/);
    });

    it("checks that the method name is not `null`", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      expect(function() {
        spyRegistry.spyOn(subject, null);
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

    it("saves the object and methodName for the spied-upon objects", function() {
      var spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
        subject = { spiedFunc: function() {} };

      spyRegistry.spyOn(subject, 'spiedFunc');

      expect(spies[0].obj).toBe(subject);
      expect(spies[0].name).toBe('spiedFunc');
    });
  });

  describe("#spyOnProperty", function() {
    // IE 8 doesn't support `definePropery` on non-DOM nodes
    if (jasmine.getEnv().ieVersion < 9) { return; }

    it("checks for the existence of the object", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry();
      expect(function() {
        spyRegistry.spyOnProperty(void 0, 'pants');
      }).toThrowError(/could not find an object/);
    });

    it("checks that a property name was passed", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

        expect(function() {
          spyRegistry.spyOnProperty(subject);
        }).toThrowError(/No property name supplied/);
    });

    it("checks for the existence of the method", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'pants');
      }).toThrowError(/property does not exist/);
    });

    it("checks for the existence of access type", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      Object.defineProperty(subject, 'pants', {
        get: function() { return 1; },
        configurable: true
      });

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'pants', 'set');
      }).toThrowError(/does not have access type/);
    });

    it("checks if it has already been spied upon", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      Object.defineProperty(subject, 'spiedProp', {
        get: function() { return 1; },
        configurable: true
      });

      spyRegistry.spyOnProperty(subject, 'spiedProp');

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'spiedProp');
      }).toThrowError(/has already been spied upon/);
    });

    it("checks if it can be spied upon", function() {
      var subject = {};

      Object.defineProperty(subject, 'myProp', {
        get: function() {}
      });

      Object.defineProperty(subject, 'spiedProp', {
        get: function() {},
        configurable: true
      });

      var spyRegistry = new jasmineUnderTest.SpyRegistry();

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'myProp');
      }).toThrowError(/is not declared configurable/);

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'spiedProp');
      }).not.toThrowError(/is not declared configurable/);
    });

    it("overrides the property getter on the object and returns the spy", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {},
        returnValue = 1;

      Object.defineProperty(subject, 'spiedProperty', {
        get: function() { return returnValue; },
        configurable: true
      });

      expect(subject.spiedProperty).toEqual(returnValue);

      var spy = spyRegistry.spyOnProperty(subject, 'spiedProperty');
      var getter = Object.getOwnPropertyDescriptor(subject, 'spiedProperty').get;

      expect(getter).toEqual(spy);
      expect(subject.spiedProperty).toBeUndefined();
    });

    it("overrides the property setter on the object and returns the spy", function() {
      var spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {},
        returnValue = 1;

      Object.defineProperty(subject, 'spiedProperty', {
        get: function() { return returnValue; },
        set: function() {},
        configurable: true
      });

      var spy = spyRegistry.spyOnProperty(subject, 'spiedProperty', 'set');
      var setter = Object.getOwnPropertyDescriptor(subject, 'spiedProperty').set;

      expect(subject.spiedProperty).toEqual(returnValue);
      expect(setter).toEqual(spy);
    });

    it("saves the object and propertyName for the spied-upon objects", function() {
      var spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
        subject = {},
        returnValue = 1;

      Object.defineProperty(subject, 'spiedProperty', {
        get: function() { return returnValue; },
        set: function() {},
        configurable: true
      });

      spyRegistry.spyOnProperty(subject, 'spiedProperty', 'set');

      expect(spies[0].obj).toBe(subject);
      expect(spies[0].name).toBe('spiedProperty');
      expect(spies[0].accessType).toBe('set');
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

    describe('spying on properties', function() {
      it("restores the original properties on the spied-upon objects", function() {
        // IE 8 doesn't support `definePropery` on non-DOM nodes
        if (jasmine.getEnv().ieVersion < 9) { return; }

        var spies = [],
          spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
          originalReturn = 1,
          subject = {};

        Object.defineProperty(subject, 'spiedProp', {
          get: function() { return originalReturn; },
          configurable: true
        });

        spyRegistry.spyOnProperty(subject, 'spiedProp');
        spyRegistry.clearSpies();

        expect(subject.spiedProp).toBe(originalReturn);
      });

      it("does not add a property that the spied-upon object didn't originally have", function() {
        // IE 8 doesn't support `Object.create`
        if (jasmine.getEnv().ieVersion < 9) { return; }

        var spies = [],
          spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() { return spies; }}),
          originalReturn = 1,
          subjectParent = {};

        Object.defineProperty(subjectParent, 'spiedProp', {
          get: function() { return originalReturn; },
          configurable: true
        });

        var subject = Object.create(subjectParent);

        expect(subject.hasOwnProperty('spiedProp')).toBe(false);

        spyRegistry.spyOnProperty(subject, 'spiedProp');
        spyRegistry.clearSpies();

        expect(subject.hasOwnProperty('spiedProp')).toBe(false);
        expect(subject.spiedProp).toBe(originalReturn);
      });
    });
});
