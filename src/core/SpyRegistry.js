getJasmineRequireObj().SpyRegistry = function(j$) {

  var spyOnMsg = j$.formatErrorMsg('<spyOn>', 'spyOn(<object>, <methodName>)');
  var spyOnPropertyMsg = j$.formatErrorMsg('<spyOnProperty>', 'spyOnProperty(<object>, <propName>, [accessType])');

  function SpyRegistry(options) {
    options = options || {};
    var global = options.global || j$.getGlobal();
    var createSpy = options.createSpy;
    var currentSpies = options.currentSpies || function() { return []; };

    this.allowRespy = function(allow) {
      this.respy = allow;
    };

    this.spyOn = function(obj, methodName) {
      var getErrorMsg = spyOnMsg;

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
        if (this.respy) {
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

      if (Object.prototype.hasOwnProperty.call(obj, methodName) || (obj === global && methodName === 'onerror')) {
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
      var getErrorMsg = spyOnPropertyMsg;

      accessType = accessType || 'get';

      if (j$.util.isUndefined(obj)) {
        throw new Error(getErrorMsg('spyOn could not find an object to spy upon for ' + propertyName + ''));
      }

      if (j$.util.isUndefined(propertyName)) {
        throw new Error(getErrorMsg('No property name supplied'));
      }

      var descriptor = j$.util.getPropertyDescriptor(obj, propertyName);

      if (!descriptor) {
        throw new Error(getErrorMsg(propertyName + ' property does not exist'));
      }

      if (!descriptor.configurable) {
        throw new Error(getErrorMsg(propertyName + ' is not declared configurable'));
      }

      if(!descriptor[accessType]) {
        throw new Error(getErrorMsg('Property ' + propertyName + ' does not have access type ' + accessType));
      }

      if (j$.isSpy(descriptor[accessType])) {
        if (this.respy) {
          return descriptor[accessType];
        } else {
          throw new Error(getErrorMsg(propertyName + '#' + accessType + ' has already been spied upon'));
        }
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

    this.spyOnAllFunctions = function(obj) {
      if (j$.util.isUndefined(obj)) {
        throw new Error('spyOnAllFunctions could not find an object to spy upon');
      }

      var pointer = obj,
          props = [],
          prop,
          descriptor;

      while (pointer) {
        for (prop in pointer) {
          if (Object.prototype.hasOwnProperty.call(pointer, prop) && pointer[prop] instanceof Function) {
            descriptor = Object.getOwnPropertyDescriptor(pointer, prop);
            if ((descriptor.writable || descriptor.set) && descriptor.configurable) {
              props.push(prop);
            }
          }
        }
        pointer = Object.getPrototypeOf(pointer);
      }

      for (var i = 0; i < props.length; i++) {
        this.spyOn(obj, props[i]);
      }

      return obj;
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
