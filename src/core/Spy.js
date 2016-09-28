getJasmineRequireObj().Spy = function (j$) {

  function Spy(name, originalFn) {
    var args = buildArgs(),
      /*`eval` is the only option to preserve both this and context:
        - former is needed to work as expected with methods,
        - latter is needed to access real spy function and allows to reduce eval'ed code to absolute minimum
        More explanation here (look at comments): http://www.bennadel.com/blog/1909-javascript-function-constructor-does-not-create-a-closure.htm
       */
      /* jshint evil: true */
      wrapper = eval('(0, function (' + args + ') { return spy.apply(this, Array.prototype.slice.call(arguments)); })'),
      /* jshint evil: false */
      spyStrategy = new j$.SpyStrategy({
        name: name,
        fn: originalFn,
        getSpy: function () {
          return wrapper;
        }
      }),
      callTracker = new j$.CallTracker(),
      spy = function () {
        var callData = {
          object: this,
          args: Array.prototype.slice.apply(arguments)
        };

        callTracker.track(callData);
        var returnValue = spyStrategy.exec.apply(this, arguments);
        callData.returnValue = returnValue;

        return returnValue;
      };

    function buildArgs() {
      var args = [];

      while (originalFn instanceof Function && args.length < originalFn.length) {
        args.push('arg' + args.length);
      }

      return args.join(', ');
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
