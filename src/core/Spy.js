getJasmineRequireObj().Spy = function(j$) {
  var nextOrder = (function() {
    var order = 0;

    return function() {
      return order++;
    };
  })();

  /**
   * _Note:_ Do not construct this directly, use {@link spyOn}, {@link spyOnProperty}, {@link jasmine.createSpy}, or {@link jasmine.createSpyObj}
   * @constructor
   * @name Spy
   */
  function Spy(
    name,
    originalFn,
    customStrategies,
    defaultStrategyFn,
    getPromise
  ) {
    var numArgs = typeof originalFn === 'function' ? originalFn.length : 0,
      wrapper = makeFunc(numArgs, function() {
        return spy.apply(this, Array.prototype.slice.call(arguments));
      }),
      strategyDispatcher = new SpyStrategyDispatcher({
        name: name,
        fn: originalFn,
        getSpy: function() {
          return wrapper;
        },
        customStrategies: customStrategies,
        getPromise: getPromise
      }),
      callTracker = new j$.CallTracker(),
      spy = function() {
        /**
         * @name Spy.callData
         * @property {object} object - `this` context for the invocation.
         * @property {number} invocationOrder - Order of the invocation.
         * @property {Array} args - The arguments passed for this invocation.
         */
        var callData = {
          object: this,
          invocationOrder: nextOrder(),
          args: Array.prototype.slice.apply(arguments)
        };

        callTracker.track(callData);
        var returnValue = strategyDispatcher.exec(this, arguments);
        callData.returnValue = returnValue;

        return returnValue;
      };

    function makeFunc(length, fn) {
      switch (length) {
        case 1:
          return function(a) {
            return fn.apply(this, arguments);
          };
        case 2:
          return function(a, b) {
            return fn.apply(this, arguments);
          };
        case 3:
          return function(a, b, c) {
            return fn.apply(this, arguments);
          };
        case 4:
          return function(a, b, c, d) {
            return fn.apply(this, arguments);
          };
        case 5:
          return function(a, b, c, d, e) {
            return fn.apply(this, arguments);
          };
        case 6:
          return function(a, b, c, d, e, f) {
            return fn.apply(this, arguments);
          };
        case 7:
          return function(a, b, c, d, e, f, g) {
            return fn.apply(this, arguments);
          };
        case 8:
          return function(a, b, c, d, e, f, g, h) {
            return fn.apply(this, arguments);
          };
        case 9:
          return function(a, b, c, d, e, f, g, h, i) {
            return fn.apply(this, arguments);
          };
        default:
          return function() {
            return fn.apply(this, arguments);
          };
      }
    }

    for (var prop in originalFn) {
      if (prop === 'and' || prop === 'calls') {
        throw new Error(
          "Jasmine spies would overwrite the 'and' and 'calls' properties on the object being spied upon"
        );
      }

      wrapper[prop] = originalFn[prop];
    }

    /**
     * @member {SpyStrategy} - Accesses the default strategy for the spy. This strategy will be used
     * whenever the spy is called with arguments that don't match any strategy
     * created with {@link Spy#withArgs}.
     * @name Spy#and
     * @example
     * spyOn(someObj, 'func').and.returnValue(42);
     */
    wrapper.and = strategyDispatcher.and;
    /**
     * Specifies a strategy to be used for calls to the spy that have the
     * specified arguments.
     * @name Spy#withArgs
     * @function
     * @param {...*} args - The arguments to match
     * @type {SpyStrategy}
     * @example
     * spyOn(someObj, 'func').withArgs(1, 2, 3).and.returnValue(42);
     * someObj.func(1, 2, 3); // returns 42
     */
    wrapper.withArgs = function() {
      return strategyDispatcher.withArgs.apply(strategyDispatcher, arguments);
    };
    wrapper.calls = callTracker;

    if (defaultStrategyFn) {
      defaultStrategyFn(wrapper.and);
    }

    return wrapper;
  }

  function SpyStrategyDispatcher(strategyArgs) {
    var baseStrategy = new j$.SpyStrategy(strategyArgs);
    var argsStrategies = new StrategyDict(function() {
      return new j$.SpyStrategy(strategyArgs);
    });

    this.and = baseStrategy;

    this.exec = function(spy, args) {
      var strategy = argsStrategies.get(args);

      if (!strategy) {
        if (argsStrategies.any() && !baseStrategy.isConfigured()) {
          throw new Error(
            "Spy '" +
              strategyArgs.name +
              "' received a call with arguments " +
              j$.pp(Array.prototype.slice.call(args)) +
              ' but all configured strategies specify other arguments.'
          );
        } else {
          strategy = baseStrategy;
        }
      }

      return strategy.exec(spy, args);
    };

    this.withArgs = function() {
      return { and: argsStrategies.getOrCreate(arguments) };
    };
  }

  function StrategyDict(strategyFactory) {
    this.strategies = [];
    this.strategyFactory = strategyFactory;
  }

  StrategyDict.prototype.any = function() {
    return this.strategies.length > 0;
  };

  StrategyDict.prototype.getOrCreate = function(args) {
    var strategy = this.get(args);

    if (!strategy) {
      strategy = this.strategyFactory();
      this.strategies.push({
        args: args,
        strategy: strategy
      });
    }

    return strategy;
  };

  StrategyDict.prototype.get = function(args) {
    var i;

    for (i = 0; i < this.strategies.length; i++) {
      if (j$.matchersUtil.equals(args, this.strategies[i].args)) {
        return this.strategies[i].strategy;
      }
    }
  };

  return Spy;
};
