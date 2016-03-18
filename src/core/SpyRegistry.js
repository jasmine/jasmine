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
          delete obj[methodName];
        };
      }

      currentSpies().push({
        restoreObjectToOriginalState: restoreStrategy
      });

      obj[methodName] = spiedMethod;

      return spiedMethod;
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
