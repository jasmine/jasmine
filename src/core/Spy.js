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
    var numArgs = (typeof originalFn === 'function' ? originalFn.length : 0),
      wrapper = makeFunc(numArgs, function () {
        return spy.apply(this, Array.prototype.slice.call(arguments));
      }),
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

    function makeFunc(length, fn) {
      switch (length) {
        case 1 : return function (a) { return fn.apply(this, arguments); };
        case 2 : return function (a,b) { return fn.apply(this, arguments); };
        case 3 : return function (a,b,c) { return fn.apply(this, arguments); };
        case 4 : return function (a,b,c,d) { return fn.apply(this, arguments); };
        case 5 : return function (a,b,c,d,e) { return fn.apply(this, arguments); };
        case 6 : return function (a,b,c,d,e,f) { return fn.apply(this, arguments); };
        case 7 : return function (a,b,c,d,e,f,g) { return fn.apply(this, arguments); };
        case 8 : return function (a,b,c,d,e,f,g,h) { return fn.apply(this, arguments); };
        case 9 : return function (a,b,c,d,e,f,g,h,i) { return fn.apply(this, arguments); };
        default : return function () { return fn.apply(this, arguments); };
      }
    }

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
