getJasmineRequireObj().SpyRegistry = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<spyOn>', 'spyOn(<object>, <methodName>)');

  function SpyRegistry(options) {
    options = options || {};
    var createSpy = options.createSpy;
    var currentSpies = options.currentSpies || function() { return []; };

    this.allowRespy = function(allow){
      this.respy = allow;
    };

    this.spyOn = function(obj, methodName) {

      if (j$.util.isUndefined(obj) || obj === null) {
        throw new Error(getErrorMsg('could not find an object to spy upon for ' + methodName + '()'));
      }

      if (j$.util.isUndefined(methodName) || methodName === null) {
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

      var descriptor = Object.getOwnPropertyDescriptor(obj, methodName);

      if (descriptor && !(descriptor.writable || descriptor.set)) {
        throw new Error(getErrorMsg(methodName + ' is not declared writable or has no setter'));
      }

      var originalMethod = obj[methodName],
        spiedMethod = createSpy(methodName, originalMethod),
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

    this.spyOnProperty = function (obj, propertyName, accessType) {
      accessType = accessType || 'get';

      if (j$.util.isUndefined(obj)) {
        throw new Error('spyOn could not find an object to spy upon for ' + propertyName + '');
      }

      if (j$.util.isUndefined(propertyName)) {
        throw new Error('No property name supplied');
      }

      var descriptor = j$.util.getPropertyDescriptor(obj, propertyName);

      if (!descriptor) {
        throw new Error(propertyName + ' property does not exist');
      }

      if (!descriptor.configurable) {
        throw new Error(propertyName + ' is not declared configurable');
      }

      if(!descriptor[accessType]) {
        throw new Error('Property ' + propertyName + ' does not have access type ' + accessType);
      }

      if (j$.isSpy(descriptor[accessType])) {
        //TODO?: should this return the current spy? Downside: may cause user confusion about spy state
        throw new Error(propertyName + ' has already been spied upon');
      }

      var originalDescriptor = j$.util.clone(descriptor),
        spy = createSpy(propertyName, descriptor[accessType]),
        restoreStrategy;

      if (Object.prototype.hasOwnProperty.call(obj, propertyName)) {
        restoreStrategy = function() {
          Object.defineProperty(obj, propertyName, originalDescriptor);
        };
      } else {
        restoreStrategy = function() {
          delete obj[propertyName];
        };
      }

      currentSpies().push({
        restoreObjectToOriginalState: restoreStrategy
      });

      descriptor[accessType] = spy;

      Object.defineProperty(obj, propertyName, descriptor);

      return spy;
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
