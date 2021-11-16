getJasmineRequireObj().Spy = function(j$) {
  var nextOrder = (function() {
    var order = 0;

    return function() {
      return order++;
    };
  })();

  /**
   * @classdesc _Note:_ Do not construct this directly. Use {@link spyOn},
   * {@link spyOnProperty}, {@link jasmine.createSpy}, or
   * {@link jasmine.createSpyObj} instead.
   * @class Spy
   * @hideconstructor
   */
  function Spy(name, matchersUtil, optionals) {
    const { originalFn, customStrategies, defaultStrategyFn } = optionals || {};

    var numArgs = typeof originalFn === 'function' ? originalFn.length : 0,
      wrapper = makeFunc(numArgs, function(context, args, invokeNew) {
        return spy(context, args, invokeNew);
      }),
      strategyDispatcher = new SpyStrategyDispatcher(
        {
          name: name,
          fn: originalFn,
          getSpy: function() {
            return wrapper;
          },
          customStrategies: customStrategies
        },
        matchersUtil
      ),
      callTracker = new j$.CallTracker(),
      spy = function(context, args, invokeNew) {
        /**
         * @name Spy.callData
         * @property {object} object - `this` context for the invocation.
         * @property {number} invocationOrder - Order of the invocation.
         * @property {Array} args - The arguments passed for this invocation.
         * @property returnValue - The value that was returned from this invocation.
         */
        var callData = {
          object: context,
          invocationOrder: nextOrder(),
          args: Array.prototype.slice.apply(args)
        };

        callTracker.track(callData);
        var returnValue = strategyDispatcher.exec(context, args, invokeNew);
        callData.returnValue = returnValue;

        return returnValue;
      };

    function makeFunc(length, fn) {
      switch (length) {
        case 1:
          return function wrap1(a) {
            return fn(this, arguments, this instanceof wrap1);
          };
        case 2:
          return function wrap2(a, b) {
            return fn(this, arguments, this instanceof wrap2);
          };
        case 3:
          return function wrap3(a, b, c) {
            return fn(this, arguments, this instanceof wrap3);
          };
        case 4:
          return function wrap4(a, b, c, d) {
            return fn(this, arguments, this instanceof wrap4);
          };
        case 5:
          return function wrap5(a, b, c, d, e) {
            return fn(this, arguments, this instanceof wrap5);
          };
        case 6:
          return function wrap6(a, b, c, d, e, f) {
            return fn(this, arguments, this instanceof wrap6);
          };
        case 7:
          return function wrap7(a, b, c, d, e, f, g) {
            return fn(this, arguments, this instanceof wrap7);
          };
        case 8:
          return function wrap8(a, b, c, d, e, f, g, h) {
            return fn(this, arguments, this instanceof wrap8);
          };
        case 9:
          return function wrap9(a, b, c, d, e, f, g, h, i) {
            return fn(this, arguments, this instanceof wrap9);
          };
        default:
          return function wrap() {
            return fn(this, arguments, this instanceof wrap);
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
     * @since 2.0.0
     * @example
     * spyOn(someObj, 'func').and.returnValue(42);
     */
    wrapper.and = strategyDispatcher.and;
    /**
     * Specifies a strategy to be used for calls to the spy that have the
     * specified arguments.
     * @name Spy#withArgs
     * @since 3.0.0
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

  function SpyStrategyDispatcher(strategyArgs, matchersUtil) {
    var baseStrategy = new j$.SpyStrategy(strategyArgs);
    var argsStrategies = new StrategyDict(function() {
      return new j$.SpyStrategy(strategyArgs);
    }, matchersUtil);

    this.and = baseStrategy;

    this.exec = function(spy, args, invokeNew) {
      var strategy = argsStrategies.get(args);

      if (!strategy) {
        if (argsStrategies.any() && !baseStrategy.isConfigured()) {
          throw new Error(
            "Spy '" +
              strategyArgs.name +
              "' received a call with arguments " +
              j$.basicPrettyPrinter_(Array.prototype.slice.call(args)) +
              ' but all configured strategies specify other arguments.'
          );
        } else {
          strategy = baseStrategy;
        }
      }

      return strategy.exec(spy, args, invokeNew);
    };

    this.withArgs = function() {
      return { and: argsStrategies.getOrCreate(arguments) };
    };
  }

  function StrategyDict(strategyFactory, matchersUtil) {
    this.strategies = [];
    this.strategyFactory = strategyFactory;
    this.matchersUtil = matchersUtil;
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
      if (this.matchersUtil.equals(args, this.strategies[i].args)) {
        return this.strategies[i].strategy;
      }
    }
  };

  return Spy;
};
