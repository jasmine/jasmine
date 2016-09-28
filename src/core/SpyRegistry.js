getJasmineRequireObj().SpyRegistry = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<spyOn>', 'spyOn(<object>, <methodName>)');

  function SpyRegistry(options) {
    options = options || {};
    var currentSpies = options.currentSpies || function() { return []; };

    this.allowRespy = function(allow){
      this.respy = allow;
    };

    this.spyOn = function(obj, methodName) {

      if (j$.util.isUndefined(obj)) {
        throw new Error(getErrorMsg('could not find an object to spy upon for ' + methodName + '()'));
      }

      if (j$.util.isUndefined(methodName)) {
        throw new Error(getErrorMsg('No method name supplied'));
      }

      if (j$.util.isUndefined(obj[methodName])) {
        throw new Error(getErrorMsg(methodName + '() method does not exist'));
      }

      if (obj[methodName] && j$.isSpy(obj[methodName])  ) {
        if ( !!this.respy ){
          return obj[methodName];
        }else {
          throw new Error(getErrorMsg(methodName + ' has already been spied upon'));
        }
      }

      var descriptor;
      try {
        descriptor = Object.getOwnPropertyDescriptor(obj, methodName);
      } catch(e) {
        // IE 8 doesn't support `definePropery` on non-DOM nodes
      }

      if (descriptor && !(descriptor.writable || descriptor.set)) {
        throw new Error(getErrorMsg(methodName + ' is not declared writable or has no setter'));
      }

      var originalMethod = obj[methodName],
        spiedMethod = j$.createSpy(methodName, originalMethod),
        restoreStrategy;

      if (Object.prototype.hasOwnProperty.call(obj, methodName)) {
        restoreStrategy = function() {
          obj[methodName] = originalMethod;
        };
      } else {
        restoreStrategy = function() {
          if (!delete obj[methodName]) {
            obj[methodName] = originalMethod;
          }
        };
      }

      currentSpies().push({
        restoreObjectToOriginalState: restoreStrategy
      });

      obj[methodName] = spiedMethod;

      return spiedMethod;
    };

    this.spyPromise = function(obj, methodName, args) {
      var result;
      var isResolved = false;
      var isRejected = false;
      var promiseCheck = {};

      if (!obj || typeof obj !== 'object' || typeof obj[methodName] !== 'function') {
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
      for (var i = spies.length - 1; i >= 0; i--) {
        var spyEntry = spies[i];
        spyEntry.restoreObjectToOriginalState();
      }
    };
  }

  return SpyRegistry;
};
