describe('RunnableResources', function() {
  describe('#spies', function() {
    behavesLikeAPerRunnableMutableArray(
      'spies',
      'Spies must be created in a before function or a spec',
      false
    );
  });

  describe('#customSpyStrategies', function() {
    behavesLikeAPerRunnableMutableObject(
      'customSpyStrategies',
      'Custom spy strategies must be added in a before function or a spec'
    );
  });

  describe('#customEqualityTesters', function() {
    behavesLikeAPerRunnableMutableArray(
      'customEqualityTesters',
      'Custom Equalities must be added in a before function or a spec'
    );
  });

  describe('#customObjectFormatters', function() {
    behavesLikeAPerRunnableMutableArray(
      'customObjectFormatters',
      'Custom object formatters must be added in a before function or a spec'
    );
  });

  describe('#customMatchers', function() {
    behavesLikeAPerRunnableMutableObject(
      'customMatchers',
      'Matchers must be added in a before function or a spec'
    );
  });

  describe('#addCustomMatchers', function() {
    it("adds all properties to the current runnable's matchers", function() {
      const currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);

      function toBeFoo() {}
      function toBeBar() {}
      function toBeBaz() {}

      runnableResources.addCustomMatchers({ toBeFoo });
      expect(runnableResources.customMatchers()).toEqual({ toBeFoo });

      runnableResources.addCustomMatchers({ toBeBar, toBeBaz });
      expect(runnableResources.customMatchers()).toEqual({
        toBeFoo,
        toBeBar,
        toBeBaz
      });
    });
  });

  describe('#customAsyncMatchers', function() {
    behavesLikeAPerRunnableMutableObject(
      'customAsyncMatchers',
      'Async Matchers must be added in a before function or a spec'
    );
  });

  describe('#addCustomAsyncMatchers', function() {
    it("adds all properties to the current runnable's matchers", function() {
      const currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);

      function toBeFoo() {}
      function toBeBar() {}
      function toBeBaz() {}

      runnableResources.addCustomAsyncMatchers({ toBeFoo });
      expect(runnableResources.customAsyncMatchers()).toEqual({ toBeFoo });

      runnableResources.addCustomAsyncMatchers({ toBeBar, toBeBaz });
      expect(runnableResources.customAsyncMatchers()).toEqual({
        toBeFoo,
        toBeBar,
        toBeBaz
      });
    });
  });

  describe('#defaultSpyStrategy', function() {
    it('returns undefined for a newly initialized resource', function() {
      let currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);

      expect(runnableResources.defaultSpyStrategy()).toBeUndefined();
    });

    it('returns the value previously set by #setDefaultSpyStrategy', function() {
      let currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);
      const fn = () => {};
      runnableResources.setDefaultSpyStrategy(fn);

      expect(runnableResources.defaultSpyStrategy()).toBe(fn);
    });

    it('is per-runnable', function() {
      let currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);
      runnableResources.setDefaultSpyStrategy(() => {});
      currentRunnableId = 2;
      runnableResources.initForRunnable(2);

      expect(runnableResources.defaultSpyStrategy()).toBeUndefined();
    });

    it('does not require a current runnable', function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => null
      );
      expect(runnableResources.defaultSpyStrategy()).toBeUndefined();
    });

    it("inherits the parent runnable's value", function() {
      let currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);
      const fn = () => {};
      runnableResources.setDefaultSpyStrategy(fn);
      currentRunnableId = 2;
      runnableResources.initForRunnable(2, 1);

      expect(runnableResources.defaultSpyStrategy()).toBe(fn);
    });
  });

  describe('#setDefaultSpyStrategy', function() {
    it('throws a user-facing error when there is no current runnable', function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => null
      );
      expect(function() {
        runnableResources.setDefaultSpyStrategy();
      }).toThrowError(
        'Default spy strategy must be set in a before function or a spec'
      );
    });
  });

  describe('#makePrettyPrinter', function() {
    it('returns a pretty printer configured with the current customObjectFormatters', function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(() => 1);
      runnableResources.initForRunnable(1);
      function cof() {}
      runnableResources.customObjectFormatters().push(cof);
      spyOn(jasmineUnderTest, 'makePrettyPrinter').and.callThrough();
      const pp = runnableResources.makePrettyPrinter();

      expect(jasmineUnderTest.makePrettyPrinter).toHaveBeenCalledOnceWith([
        cof
      ]);
      expect(pp).toBe(
        jasmineUnderTest.makePrettyPrinter.calls.first().returnValue
      );
    });
  });

  describe('#makeMatchersUtil', function() {
    describe('When there is a current runnable', function() {
      it('returns a MatchersUtil configured with the current resources', function() {
        const runnableResources = new jasmineUnderTest.RunnableResources(
          () => 1
        );
        runnableResources.initForRunnable(1);
        function cof() {}
        runnableResources.customObjectFormatters().push(cof);
        function ceq() {}
        runnableResources.customEqualityTesters().push(ceq);
        const expectedPP = {};
        const expectedMatchersUtil = {};
        spyOn(jasmineUnderTest, 'makePrettyPrinter').and.returnValue(
          expectedPP
        );
        spyOn(jasmineUnderTest, 'MatchersUtil').and.returnValue(
          expectedMatchersUtil
        );

        const matchersUtil = runnableResources.makeMatchersUtil();

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

    describe('When there is no current runnable', function() {
      it('returns a MatchersUtil configured with defaults', function() {
        const runnableResources = new jasmineUnderTest.RunnableResources(
          () => null
        );
        const expectedMatchersUtil = {};
        spyOn(jasmineUnderTest, 'MatchersUtil').and.returnValue(
          expectedMatchersUtil
        );

        const matchersUtil = runnableResources.makeMatchersUtil();

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
    describe('When there is no current runnable', function() {
      it('is configured with default strategies and matchersUtil', function() {
        const runnableResources = new jasmineUnderTest.RunnableResources(
          () => null
        );
        spyOn(jasmineUnderTest, 'Spy');
        const matchersUtil = {};
        spyOn(runnableResources, 'makeMatchersUtil').and.returnValue(
          matchersUtil
        );

        runnableResources.spyFactory.createSpy('foo');

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

    describe('When there is a current runnable', function() {
      it("is configured with the current runnable's strategies and matchersUtil", function() {
        const runnableResources = new jasmineUnderTest.RunnableResources(
          () => 1
        );
        runnableResources.initForRunnable(1);
        function customStrategy() {}
        function defaultStrategy() {}
        runnableResources.customSpyStrategies().foo = customStrategy;
        runnableResources.setDefaultSpyStrategy(defaultStrategy);
        spyOn(jasmineUnderTest, 'Spy');
        const matchersUtil = {};
        spyOn(runnableResources, 'makeMatchersUtil').and.returnValue(
          matchersUtil
        );

        runnableResources.spyFactory.createSpy('foo');

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
    it("writes to the current runnable's spies", function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(() => 1);
      runnableResources.initForRunnable(1);
      function foo() {}
      const spyObj = { foo };
      runnableResources.spyRegistry.spyOn(spyObj, 'foo');

      expect(runnableResources.spies()).toEqual([
        jasmine.objectContaining({
          restoreObjectToOriginalState: jasmine.any(Function)
        })
      ]);
      expect(jasmineUnderTest.isSpy(spyObj.foo)).toBeTrue();

      runnableResources.spyRegistry.clearSpies();
      expect(spyObj.foo).toBe(foo);
    });
  });

  describe('#clearForRunnable', function() {
    it('removes resources for the specified runnable', function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(() => 1);
      runnableResources.initForRunnable(1);
      expect(function() {
        runnableResources.spies();
      }).not.toThrow();
      runnableResources.clearForRunnable(1);
      expect(function() {
        runnableResources.spies();
      }).toThrowError('Spies must be created in a before function or a spec');
    });

    it('clears spies', function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(() => 1);
      runnableResources.initForRunnable(1);
      function foo() {}
      const spyObj = { foo };
      runnableResources.spyRegistry.spyOn(spyObj, 'foo');
      expect(spyObj.foo).not.toBe(foo);

      runnableResources.clearForRunnable(1);
      expect(spyObj.foo).toBe(foo);
    });

    it('does not remove resources for other runnables', function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(() => 1);
      runnableResources.initForRunnable(1);
      function cof() {}
      runnableResources.customObjectFormatters().push(cof);
      runnableResources.clearForRunnable(2);
      expect(runnableResources.customObjectFormatters()).toEqual([cof]);
    });
  });

  function behavesLikeAPerRunnableMutableArray(
    methodName,
    errorMsg,
    inherits = true
  ) {
    it('is initially empty', function() {
      const currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);

      expect(runnableResources[methodName]()).toEqual([]);
    });

    it('is mutable', function() {
      const currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);
      function newItem() {}
      runnableResources[methodName]().push(newItem);
      expect(runnableResources[methodName]()).toEqual([newItem]);
    });

    it('is per-runnable', function() {
      let currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);
      runnableResources[methodName]().push(() => {});
      runnableResources.initForRunnable(2);
      currentRunnableId = 2;
      expect(runnableResources[methodName]()).toEqual([]);
    });

    it('throws a user-facing error when there is no current runnable', function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => null
      );
      expect(function() {
        runnableResources[methodName]();
      }).toThrowError(errorMsg);
    });

    if (inherits) {
      it('inherits from the parent runnable', function() {
        let currentRunnableId = 1;
        const runnableResources = new jasmineUnderTest.RunnableResources(
          () => currentRunnableId
        );
        runnableResources.initForRunnable(1);
        function parentItem() {}
        runnableResources[methodName]().push(parentItem);
        runnableResources.initForRunnable(2, 1);
        currentRunnableId = 2;
        function childItem() {}
        runnableResources[methodName]().push(childItem);
        expect(runnableResources[methodName]()).toEqual([
          parentItem,
          childItem
        ]);

        currentRunnableId = 1;
        expect(runnableResources[methodName]()).toEqual([parentItem]);
      });
    }
  }

  function behavesLikeAPerRunnableMutableObject(methodName, errorMsg) {
    it('is initially empty', function() {
      const currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);

      expect(runnableResources[methodName]()).toEqual({});
    });

    it('is mutable', function() {
      const currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);
      function newItem() {}
      runnableResources[methodName]().foo = newItem;
      expect(runnableResources[methodName]()).toEqual({ foo: newItem });
    });

    it('is per-runnable', function() {
      let currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);
      runnableResources[methodName]().foo = function() {};
      runnableResources.initForRunnable(2);
      currentRunnableId = 2;
      expect(runnableResources[methodName]()).toEqual({});
    });

    it('throws a user-facing error when there is no current runnable', function() {
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => null
      );
      expect(function() {
        runnableResources[methodName]();
      }).toThrowError(errorMsg);
    });

    it('inherits from the parent runnable', function() {
      let currentRunnableId = 1;
      const runnableResources = new jasmineUnderTest.RunnableResources(
        () => currentRunnableId
      );
      runnableResources.initForRunnable(1);
      function parentItem() {}
      runnableResources[methodName]().parentName = parentItem;
      runnableResources.initForRunnable(2, 1);
      currentRunnableId = 2;
      function childItem() {}
      runnableResources[methodName]().childName = childItem;
      expect(runnableResources[methodName]()).toEqual({
        parentName: parentItem,
        childName: childItem
      });

      currentRunnableId = 1;
      expect(runnableResources[methodName]()).toEqual({
        parentName: parentItem
      });
    });
  }
});
