getJasmineRequireObj().SpyDelegate = function(j$) {

  function SpyDelegate(options) {
    var identity = (options && options.name) || "unknown",
        originalFn = (options && options.fn) || function() {
        },
        plan = function() {
        },
        callCount,
        calls;

    this.identity = function() {
      return identity;
    };

    this.exec = function() {
      callCount++;
      calls.push({
        object: this,
        args: Array.prototype.slice.call(arguments)
      });

      return plan.apply(this, arguments);
    };

    this.wasCalled = function() {
      return callCount > 0;
    };

    this.callCount = function() {
      return callCount;
    };

    this.argsForCall = function(index) {
      var call = calls[index];
      return call ? call.args : [];
    };

    this.calls = function() {
      return calls;
    };

    this.mostRecentCall = function() {
      var mostRecentCall = calls[calls.length - 1];
      return mostRecentCall && mostRecentCall;
    };

    this.reset = function() {
      callCount = 0;
      calls = [];
    };

    this.callThrough = function() {
      plan = originalFn;
    };

    this.return = function(value) {
      plan = function() {
        return value;
      };
    };

    this.throw = function(something) {
      plan = function() {
        throw something;
      }
    };

    this.callFake = function(fn) {
      plan = fn;
    };

    this.reset();
  }

  j$.createSpyObj = function(baseName, methodNames) {
    if (!j$.isArray_(methodNames) || methodNames.length === 0) {
      throw "createSpyObj requires a non-empty array of method names to create spies for";
    }
    var obj = {};
    for (var i = 0; i < methodNames.length; i++) {
      obj[methodNames[i]] = j$.createSpy(baseName + '.' + methodNames[i]);
    }
    return obj;
  };

  return SpyDelegate;
};
