getJasmineRequireObj().SpyRegistry = function(j$) {

  function SpyRegistry(options) {
    options = options || {};
    var currentSpies = options.currentSpies || function() { return []; };

    this.spyOn = function(obj, methodName) {
      if (j$.util.isUndefined(obj)) {
        throw new Error('spyOn could not find an object to spy upon for ' + methodName + '()');
      }

      if (j$.util.isUndefined(methodName)) {
        throw new Error('No method name supplied');
      }

      if (j$.util.isUndefined(obj[methodName])) {
        throw new Error(methodName + '() method does not exist');
      }

      if (obj[methodName] && j$.isSpy(obj[methodName])) {
        //TODO?: should this return the current spy? Downside: may cause user confusion about spy state
        throw new Error(methodName + ' has already been spied upon');
      }

      var descriptor;
      try {
        descriptor = Object.getOwnPropertyDescriptor(obj, methodName);
      } catch(e) {
        // IE 8 doesn't support `definePropery` on non-DOM nodes
      }

      if (descriptor && !(descriptor.writable || descriptor.set)) {
        throw new Error(methodName + ' is not declared writable or has no setter');
      }

      var spy = j$.createSpy(methodName, obj[methodName]);

      currentSpies().push({
        spy: spy,
        baseObj: obj,
        methodName: methodName,
        originalValue: obj[methodName]
      });

      obj[methodName] = spy;

      return spy;
    };

    this.spyPromise = function(obj, methodName, args) {
      var result;
      var isResolved = false;
      var isRejected = false;
      var promiseCheck = {};

      if (typeof obj !== 'object' || typeof obj[methodName] !== 'function') {
        throw new Error(methodName + ' should be a function');
      }

      if (typeof args === 'undefined') {
        args = [];
      }

      result = obj[methodName].apply(null, args);

      if (typeof result.then !== 'function' || typeof result.catch !== 'function') {
        throw new Error(methodName + ' should return a Promise');
      }

      promiseCheck.baseMethod = methodName;
      promiseCheck.isResolved = function() {
        return isResolved;
      };
      promiseCheck.isRejected = function() {
        return isRejected;
      };

      result
        .then(resolve)
        .catch(reject);

      obj[methodName] = promiseCheck;

      return promiseCheck;

      function resolve() {
        isResolved = true;
      }

      function reject() {
        isRejected = true;
      }
    };

    this.clearSpies = function() {
      var spies = currentSpies();
      for (var i = 0; i < spies.length; i++) {
        var spyEntry = spies[i];
        spyEntry.baseObj[spyEntry.methodName] = spyEntry.originalValue;
      }
    };
  }

  return SpyRegistry;
};
