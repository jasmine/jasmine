describe('RunableResources', function() {
  describe('#spies', function() {
    behavesLikeAPerRunableMutableArray(
      'spies',
      'Spies must be created in a before function or a spec',
      false
    );
  });

  describe('#customSpyStrategies', function() {
    behavesLikeAPerRunableMutableObject(
      'customSpyStrategies',
      'Custom spy strategies must be added in a before function or a spec'
    );
  });

  describe('#customEqualityTesters', function() {
    behavesLikeAPerRunableMutableArray(
      'customEqualityTesters',
      'Custom Equalities must be added in a before function or a spec'
    );
  });

  describe('#customObjectFormatters', function() {
    behavesLikeAPerRunableMutableArray(
      'customObjectFormatters',
      'Custom object formatters must be added in a before function or a spec'
    );
  });

  describe('#customMatchers', function() {
    behavesLikeAPerRunableMutableObject(
      'customMatchers',
      'Matchers must be added in a before function or a spec'
    );
  });

  describe('#addCustomMatchers', function() {
    it("adds all properties to the current runable's matchers", function() {
      const currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);

      function toBeFoo() {}
      function toBeBar() {}
      function toBeBaz() {}

      runableResources.addCustomMatchers({ toBeFoo });
      expect(runableResources.customMatchers()).toEqual({ toBeFoo });

      runableResources.addCustomMatchers({ toBeBar, toBeBaz });
      expect(runableResources.customMatchers()).toEqual({
        toBeFoo,
        toBeBar,
        toBeBaz
      });
    });
  });

  describe('#customAsyncMatchers', function() {
    behavesLikeAPerRunableMutableObject(
      'customAsyncMatchers',
      'Async Matchers must be added in a before function or a spec'
    );
  });

  describe('#addCustomAsyncMatchers', function() {
    it("adds all properties to the current runable's matchers", function() {
      const currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);

      function toBeFoo() {}
      function toBeBar() {}
      function toBeBaz() {}

      runableResources.addCustomAsyncMatchers({ toBeFoo });
      expect(runableResources.customAsyncMatchers()).toEqual({ toBeFoo });

      runableResources.addCustomAsyncMatchers({ toBeBar, toBeBaz });
      expect(runableResources.customAsyncMatchers()).toEqual({
        toBeFoo,
        toBeBar,
        toBeBaz
      });
    });
  });

  describe('#defaultSpyStrategy', function() {
    it('returns undefined for a newly initialized resource', function() {
      let currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);

      expect(runableResources.defaultSpyStrategy()).toBeUndefined();
    });

    it('returns the value previously set by #setDefaultSpyStrategy', function() {
      let currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);
      const fn = () => {};
      runableResources.setDefaultSpyStrategy(fn);

      expect(runableResources.defaultSpyStrategy()).toBe(fn);
    });

    it('is per-runable', function() {
      let currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);
      runableResources.setDefaultSpyStrategy(() => {});
      currentRunableId = 2;
      runableResources.initForRunable(2);

      expect(runableResources.defaultSpyStrategy()).toBeUndefined();
    });

    it('does not require a current runable', function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => null
      });
      expect(runableResources.defaultSpyStrategy()).toBeUndefined();
    });

    it("inherits the parent runable's value", function() {
      let currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);
      const fn = () => {};
      runableResources.setDefaultSpyStrategy(fn);
      currentRunableId = 2;
      runableResources.initForRunable(2, 1);

      expect(runableResources.defaultSpyStrategy()).toBe(fn);
    });
  });

  describe('#setDefaultSpyStrategy', function() {
    it('throws a user-facing error when there is no current runable', function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => null
      });
      expect(function() {
        runableResources.setDefaultSpyStrategy();
      }).toThrowError(
        'Default spy strategy must be set in a before function or a spec'
      );
    });
  });

  describe('#makePrettyPrinter', function() {
    it('returns a pretty printer configured with the current customObjectFormatters', function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => 1
      });
      runableResources.initForRunable(1);
      function cof() {}
      runableResources.customObjectFormatters().push(cof);
      spyOn(jasmineUnderTest, 'makePrettyPrinter').and.callThrough();
      const pp = runableResources.makePrettyPrinter();

      expect(jasmineUnderTest.makePrettyPrinter).toHaveBeenCalledOnceWith([
        cof
      ]);
      expect(pp).toBe(
        jasmineUnderTest.makePrettyPrinter.calls.first().returnValue
      );
    });
  });

  describe('#makeMatchersUtil', function() {
    describe('When there is a current runable', function() {
      it('returns a MatchersUtil configured with the current resources', function() {
        const runableResources = new jasmineUnderTest.RunableResources({
          globalErrors: stubGlobalErrors(),
          getCurrentRunableId: () => 1
        });
        runableResources.initForRunable(1);
        function cof() {}
        runableResources.customObjectFormatters().push(cof);
        function ceq() {}
        runableResources.customEqualityTesters().push(ceq);
        const expectedPP = {};
        const expectedMatchersUtil = {};
        spyOn(jasmineUnderTest, 'makePrettyPrinter').and.returnValue(
          expectedPP
        );
        spyOn(jasmineUnderTest, 'MatchersUtil').and.returnValue(
          expectedMatchersUtil
        );

        const matchersUtil = runableResources.makeMatchersUtil();

        expect(matchersUtil).toBe(expectedMatchersUtil);
        expect(jasmineUnderTest.makePrettyPrinter).toHaveBeenCalledOnceWith([
          cof
        ]);
        // We need === equality on the pp passed to MatchersUtil
        expect(jasmineUnderTest.MatchersUtil).toHaveBeenCalledOnceWith(
          jasmine.objectContaining({
            customTesters: [ceq]
          })
        );
        expect(jasmineUnderTest.MatchersUtil.calls.argsFor(0)[0].pp).toBe(
          expectedPP
        );
      });
    });

    describe('When there is no current runable', function() {
      it('returns a MatchersUtil configured with defaults', function() {
        const runableResources = new jasmineUnderTest.RunableResources({
          globalErrors: stubGlobalErrors(),
          getCurrentRunableId: () => null
        });
        const expectedMatchersUtil = {};
        spyOn(jasmineUnderTest, 'MatchersUtil').and.returnValue(
          expectedMatchersUtil
        );

        const matchersUtil = runableResources.makeMatchersUtil();

        expect(matchersUtil).toBe(expectedMatchersUtil);
        // We need === equality on the pp passed to MatchersUtil
        expect(jasmineUnderTest.MatchersUtil).toHaveBeenCalledTimes(1);
        expect(jasmineUnderTest.MatchersUtil.calls.argsFor(0)[0].pp).toBe(
          jasmineUnderTest.basicPrettyPrinter_
        );
        expect(
          jasmineUnderTest.MatchersUtil.calls.argsFor(0)[0].customTesters
        ).toBeUndefined();
      });
    });
  });

  describe('.spyFactory', function() {
    describe('When there is no current runable', function() {
      it('is configured with default strategies and matchersUtil', function() {
        const runableResources = new jasmineUnderTest.RunableResources({
          globalErrors: stubGlobalErrors(),
          getCurrentRunableId: () => null
        });
        spyOn(jasmineUnderTest, 'Spy');
        const matchersUtil = {};
        spyOn(runableResources, 'makeMatchersUtil').and.returnValue(
          matchersUtil
        );

        runableResources.spyFactory.createSpy('foo');

        expect(jasmineUnderTest.Spy).toHaveBeenCalledWith(
          'foo',
          is(matchersUtil),
          jasmine.objectContaining({
            customStrategies: {},
            defaultStrategyFn: undefined
          })
        );
      });
    });

    describe('When there is a current runable', function() {
      it("is configured with the current runable's strategies and matchersUtil", function() {
        const runableResources = new jasmineUnderTest.RunableResources({
          globalErrors: stubGlobalErrors(),
          getCurrentRunableId: () => 1
        });
        runableResources.initForRunable(1);
        function customStrategy() {}
        function defaultStrategy() {}
        runableResources.customSpyStrategies().foo = customStrategy;
        runableResources.setDefaultSpyStrategy(defaultStrategy);
        spyOn(jasmineUnderTest, 'Spy');
        const matchersUtil = {};
        spyOn(runableResources, 'makeMatchersUtil').and.returnValue(
          matchersUtil
        );

        runableResources.spyFactory.createSpy('foo');

        expect(jasmineUnderTest.Spy).toHaveBeenCalledWith(
          'foo',
          is(matchersUtil),
          jasmine.objectContaining({
            customStrategies: { foo: customStrategy },
            defaultStrategyFn: defaultStrategy
          })
        );
      });
    });

    function is(expected) {
      return {
        asymmetricMatch: function(actual) {
          return actual === expected;
        },
        jasmineToString: function(pp) {
          return '<same instance as ' + pp(expected) + '>';
        }
      };
    }
  });

  describe('.spyRegistry', function() {
    it("writes to the current runable's spies", function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => 1
      });
      runableResources.initForRunable(1);
      function foo() {}
      const spyObj = { foo };
      runableResources.spyRegistry.spyOn(spyObj, 'foo');

      expect(runableResources.spies()).toEqual([
        jasmine.objectContaining({
          restoreObjectToOriginalState: jasmine.any(Function)
        })
      ]);
      expect(jasmineUnderTest.isSpy(spyObj.foo)).toBeTrue();

      runableResources.spyRegistry.clearSpies();
      expect(spyObj.foo).toBe(foo);
    });
  });

  describe('#clearForRunable', function() {
    it('removes resources for the specified runable', function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => 1
      });
      runableResources.initForRunable(1);
      expect(function() {
        runableResources.spies();
      }).not.toThrow();
      runableResources.clearForRunable(1);
      expect(function() {
        runableResources.spies();
      }).toThrowError('Spies must be created in a before function or a spec');
    });

    it('clears spies', function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => 1
      });
      runableResources.initForRunable(1);
      function foo() {}
      const spyObj = { foo };
      runableResources.spyRegistry.spyOn(spyObj, 'foo');
      expect(spyObj.foo).not.toBe(foo);

      runableResources.clearForRunable(1);
      expect(spyObj.foo).toBe(foo);
    });

    it('clears the global error spy', function() {
      const globalErrors = jasmine.createSpyObj('globalErrors', [
        'removeOverrideListener'
      ]);
      const runableResources = new jasmineUnderTest.RunableResources({
        getCurrentRunableId: () => 1,
        globalErrors
      });
      runableResources.initForRunable(1);

      runableResources.clearForRunable(1);
      expect(globalErrors.removeOverrideListener).toHaveBeenCalled();
    });

    it('does not remove resources for other runables', function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => 1
      });
      runableResources.initForRunable(1);
      function cof() {}
      runableResources.customObjectFormatters().push(cof);
      runableResources.clearForRunable(2);
      expect(runableResources.customObjectFormatters()).toEqual([cof]);
    });
  });

  function behavesLikeAPerRunableMutableArray(
    methodName,
    errorMsg,
    inherits = true
  ) {
    it('is initially empty', function() {
      const currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);

      expect(runableResources[methodName]()).toEqual([]);
    });

    it('is mutable', function() {
      const currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);
      function newItem() {}
      runableResources[methodName]().push(newItem);
      expect(runableResources[methodName]()).toEqual([newItem]);
    });

    it('is per-runable', function() {
      let currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);
      runableResources[methodName]().push(() => {});
      runableResources.initForRunable(2);
      currentRunableId = 2;
      expect(runableResources[methodName]()).toEqual([]);
    });

    it('throws a user-facing error when there is no current runable', function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => null
      });
      expect(function() {
        runableResources[methodName]();
      }).toThrowError(errorMsg);
    });

    if (inherits) {
      it('inherits from the parent runable', function() {
        let currentRunableId = 1;
        const runableResources = new jasmineUnderTest.RunableResources({
          globalErrors: stubGlobalErrors(),
          getCurrentRunableId: () => currentRunableId
        });
        runableResources.initForRunable(1);
        function parentItem() {}
        runableResources[methodName]().push(parentItem);
        runableResources.initForRunable(2, 1);
        currentRunableId = 2;
        function childItem() {}
        runableResources[methodName]().push(childItem);
        expect(runableResources[methodName]()).toEqual([parentItem, childItem]);

        currentRunableId = 1;
        expect(runableResources[methodName]()).toEqual([parentItem]);
      });
    }
  }

  function behavesLikeAPerRunableMutableObject(methodName, errorMsg) {
    it('is initially empty', function() {
      const currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);

      expect(runableResources[methodName]()).toEqual({});
    });

    it('is mutable', function() {
      const currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);
      function newItem() {}
      runableResources[methodName]().foo = newItem;
      expect(runableResources[methodName]()).toEqual({ foo: newItem });
    });

    it('is per-runable', function() {
      let currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);
      runableResources[methodName]().foo = function() {};
      runableResources.initForRunable(2);
      currentRunableId = 2;
      expect(runableResources[methodName]()).toEqual({});
    });

    it('throws a user-facing error when there is no current runable', function() {
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => null
      });
      expect(function() {
        runableResources[methodName]();
      }).toThrowError(errorMsg);
    });

    it('inherits from the parent runable', function() {
      let currentRunableId = 1;
      const runableResources = new jasmineUnderTest.RunableResources({
        globalErrors: stubGlobalErrors(),
        getCurrentRunableId: () => currentRunableId
      });
      runableResources.initForRunable(1);
      function parentItem() {}
      runableResources[methodName]().parentName = parentItem;
      runableResources.initForRunable(2, 1);
      currentRunableId = 2;
      function childItem() {}
      runableResources[methodName]().childName = childItem;
      expect(runableResources[methodName]()).toEqual({
        parentName: parentItem,
        childName: childItem
      });

      currentRunableId = 1;
      expect(runableResources[methodName]()).toEqual({
        parentName: parentItem
      });
    });
  }

  function stubGlobalErrors() {
    return {
      removeOverrideListener() {}
    };
  }
});
