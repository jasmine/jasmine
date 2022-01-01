getJasmineRequireObj().SpyFactory = function(j$) {
  function SpyFactory(
    getCustomStrategies,
    getDefaultStrategyFn,
    getMatchersUtil
  ) {
    var self = this;

    this.createSpy = function(name, originalFn) {
      return j$.Spy(name, getMatchersUtil(), {
        originalFn,
        customStrategies: getCustomStrategies(),
        defaultStrategyFn: getDefaultStrategyFn()
      });
    };

    this.createSpyObj = function(baseName, methodNames, propertyNames) {
      var baseNameIsCollection =
        j$.isObject_(baseName) || j$.isArray_(baseName);

      if (baseNameIsCollection) {
        propertyNames = methodNames;
        methodNames = baseName;
        baseName = 'unknown';
      }

      var obj = {};
      var spy, descriptor;

      var methods = normalizeKeyValues(methodNames);
      for (var i = 0; i < methods.length; i++) {
        spy = obj[methods[i][0]] = self.createSpy(
          baseName + '.' + methods[i][0]
        );
        if (methods[i].length > 1) {
          spy.and.returnValue(methods[i][1]);
        }
      }

      var properties = normalizeKeyValues(propertyNames);
      for (var i = 0; i < properties.length; i++) {
        descriptor = {
          enumerable: true,
          get: self.createSpy(baseName + '.' + properties[i][0] + '.get'),
          set: self.createSpy(baseName + '.' + properties[i][0] + '.set')
        };
        if (properties[i].length > 1) {
          descriptor.get.and.returnValue(properties[i][1]);
          descriptor.set.and.returnValue(properties[i][1]);
        }
        Object.defineProperty(obj, properties[i][0], descriptor);
      }

      if (methods.length === 0 && properties.length === 0) {
        throw 'createSpyObj requires a non-empty array or object of method names to create spies for';
      }

      return obj;
    };
  }

  function normalizeKeyValues(object) {
    var result = [];
    if (j$.isArray_(object)) {
      for (var i = 0; i < object.length; i++) {
        result.push([object[i]]);
      }
    } else if (j$.isObject_(object)) {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          result.push([key, object[key]]);
        }
      }
    }
    return result;
  }

  return SpyFactory;
};
