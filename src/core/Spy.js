getJasmineRequireObj().Spy = function (j$) {

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
  function Spy(name, originalFn) {
    var numArgs = originalFn.length,
      wrapper = function () {
        var args = [];
        for (var i = 0; i < numArgs || i < arguments.length; i++) {
          args[i] = arguments[i];
        }
        return spy.apply(this, args);
      },
      spyStrategy = new j$.SpyStrategy({
        name: name,
        fn: originalFn,
        getSpy: function () {
          return wrapper;
        }
      }),
      callTracker = new j$.CallTracker(),
      spy = function () {
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
        var returnValue = spyStrategy.exec.apply(this, arguments);
        callData.returnValue = returnValue;

        return returnValue;
      };

    for (var prop in originalFn) {
      if (prop === 'and' || prop === 'calls') {
        throw new Error('Jasmine spies would overwrite the \'and\' and \'calls\' properties on the object being spied upon');
      }

      wrapper[prop] = originalFn[prop];
    }

    wrapper.and = spyStrategy;
    wrapper.calls = callTracker;

    return wrapper;
  }

  return Spy;
};
