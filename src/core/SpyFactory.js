getJasmineRequireObj().SpyFactory = function(j$) {
  function SpyFactory(
    getCustomStrategies,
    getDefaultStrategyFn,
    getMatchersUtil
  ) {
    this.createSpy = function(name, originalFn) {
      if (j$.private.isFunction(name) && originalFn === undefined) {
        originalFn = name;
        name = originalFn.name;
      }

      return j$.private.Spy(name, getMatchersUtil(), {
        originalFn,
        customStrategies: getCustomStrategies(),
        defaultStrategyFn: getDefaultStrategyFn()
      });
    };

    this.createSpyObj = function(baseName, methodNames, propertyNames) {
      const baseNameIsCollection =
        j$.private.isObject(baseName) || j$.private.isArray(baseName);

      if (baseNameIsCollection) {
        propertyNames = methodNames;
        methodNames = baseName;
        baseName = 'unknown';
      }

      const obj = {};

      const methods = normalizeKeyValues(methodNames);
      for (let i = 0; i < methods.length; i++) {
        const spy = (obj[methods[i][0]] = this.createSpy(
          baseName + '.' + methods[i][0]
        ));
        if (methods[i].length > 1) {
          spy.and.returnValue(methods[i][1]);
        }
      }

      const properties = normalizeKeyValues(propertyNames);
      for (let i = 0; i < properties.length; i++) {
        const descriptor = {
          enumerable: true,
          get: this.createSpy(baseName + '.' + properties[i][0] + '.get'),
          set: this.createSpy(baseName + '.' + properties[i][0] + '.set')
        };
        if (properties[i].length > 1) {
          descriptor.get.and.returnValue(properties[i][1]);
          descriptor.set.and.returnValue(properties[i][1]);
        }
        Object.defineProperty(obj, properties[i][0], descriptor);
      }

      if (methods.length === 0 && properties.length === 0) {
        throw new Error(
          'createSpyObj requires a non-empty array or object of method names to create spies for'
        );
      }

      return obj;
    };
  }

  function normalizeKeyValues(object) {
    const result = [];
    if (j$.private.isArray(object)) {
      for (let i = 0; i < object.length; i++) {
        result.push([object[i]]);
      }
    } else if (j$.private.isObject(object)) {
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          result.push([key, object[key]]);
        }
      }
    }
    return result;
  }

  return SpyFactory;
};
