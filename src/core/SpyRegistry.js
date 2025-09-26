getJasmineRequireObj().SpyRegistry = function(j$) {
  const spyOnMsg = j$.formatErrorMsg(
    '<spyOn>',
    'spyOn(<object>, <methodName>)'
  );
  const spyOnPropertyMsg = j$.formatErrorMsg(
    '<spyOnProperty>',
    'spyOnProperty(<object>, <propName>, [accessType])'
  );

  function SpyRegistry(options) {
    options = options || {};
    const global = options.global || j$.getGlobal();
    const createSpy = options.createSpy;
    const currentSpies =
      options.currentSpies ||
      function() {
        return [];
      };

    this.allowRespy = function(allow) {
      this.respy = allow;
    };

    this.spyOn = function(obj, methodName) {
      const getErrorMsg = spyOnMsg;

      if (obj === undefined || obj === null) {
        throw new Error(
          getErrorMsg(
            'could not find an object to spy upon for ' + methodName + '()'
          )
        );
      }

      if (methodName === undefined || methodName === null) {
        throw new Error(getErrorMsg('No method name supplied'));
      }

      if (obj[methodName] === undefined) {
        throw new Error(getErrorMsg(methodName + '() method does not exist'));
      }

      // Spying on mock clock timing fns would prevent the real ones from being
      // restored.
      if (obj[methodName] && obj[methodName][j$.Clock.IsMockClockTimingFn]) {
        throw new Error("Mock clock timing functions can't be spied on");
      }

      if (obj[methodName] && j$.isSpy(obj[methodName])) {
        if (this.respy) {
          return obj[methodName];
        } else {
          throw new Error(
            getErrorMsg(methodName + ' has already been spied upon')
          );
        }
      }

      const descriptor = Object.getOwnPropertyDescriptor(obj, methodName);

      if (descriptor && !(descriptor.writable || descriptor.set)) {
        throw new Error(
          getErrorMsg(methodName + ' is not declared writable or has no setter')
        );
      }

      const originalMethod = obj[methodName];
      const spiedMethod = createSpy(methodName, originalMethod);
      let restoreStrategy;

      if (
        Object.prototype.hasOwnProperty.call(obj, methodName) ||
        (obj === global && methodName === 'onerror')
      ) {
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

      // Check if setting the property actually worked. Some objects, such as
      // localStorage in Firefox and later Safari versions, have no-op setters.
      if (obj[methodName] !== spiedMethod) {
        throw new Error(
          j$.formatErrorMsg('<spyOn>')(
            `Can't spy on ${methodName} because assigning to it had no effect`
          )
        );
      }

      return spiedMethod;
    };

    this.spyOnProperty = function(obj, propertyName, accessType) {
      const getErrorMsg = spyOnPropertyMsg;

      accessType = accessType || 'get';

      if (!obj) {
        throw new Error(
          getErrorMsg(
            'spyOn could not find an object to spy upon for ' +
              propertyName +
              ''
          )
        );
      }

      if (propertyName === undefined) {
        throw new Error(getErrorMsg('No property name supplied'));
      }

      const descriptor = j$.util.getPropertyDescriptor(obj, propertyName);

      if (!descriptor) {
        throw new Error(getErrorMsg(propertyName + ' property does not exist'));
      }

      if (!descriptor.configurable) {
        throw new Error(
          getErrorMsg(propertyName + ' is not declared configurable')
        );
      }

      if (!descriptor[accessType]) {
        throw new Error(
          getErrorMsg(
            'Property ' +
              propertyName +
              ' does not have access type ' +
              accessType
          )
        );
      }

      if (j$.isSpy(descriptor[accessType])) {
        if (this.respy) {
          return descriptor[accessType];
        } else {
          throw new Error(
            getErrorMsg(
              propertyName + '#' + accessType + ' has already been spied upon'
            )
          );
        }
      }

      const originalDescriptor = j$.util.clone(descriptor);
      const spy = createSpy(propertyName, descriptor[accessType]);
      let restoreStrategy;

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

    this.spyOnAllFunctions = function(obj, includeNonEnumerable) {
      if (!obj) {
        throw new Error(
          'spyOnAllFunctions could not find an object to spy upon'
        );
      }

      let pointer = obj,
        propsToSpyOn = [],
        properties,
        propertiesToSkip = [];

      while (
        pointer &&
        (!includeNonEnumerable || pointer !== Object.prototype)
      ) {
        properties = getProps(pointer, includeNonEnumerable);
        properties = properties.filter(function(prop) {
          return propertiesToSkip.indexOf(prop) === -1;
        });
        propertiesToSkip = propertiesToSkip.concat(properties);
        propsToSpyOn = propsToSpyOn.concat(
          getSpyableFunctionProps(pointer, properties)
        );
        pointer = Object.getPrototypeOf(pointer);
      }

      for (const prop of propsToSpyOn) {
        this.spyOn(obj, prop);
      }

      return obj;
    };

    this.clearSpies = function() {
      const spies = currentSpies();
      for (let i = spies.length - 1; i >= 0; i--) {
        const spyEntry = spies[i];
        spyEntry.restoreObjectToOriginalState();
      }
    };
  }

  function getProps(obj, includeNonEnumerable) {
    const enumerableProperties = Object.keys(obj);

    if (!includeNonEnumerable) {
      return enumerableProperties;
    }

    return Object.getOwnPropertyNames(obj).filter(function(prop) {
      return (
        prop !== 'constructor' ||
        enumerableProperties.indexOf('constructor') > -1
      );
    });
  }

  function getSpyableFunctionProps(obj, propertiesToCheck) {
    const props = [];

    for (const prop of propertiesToCheck) {
      if (
        Object.prototype.hasOwnProperty.call(obj, prop) &&
        isSpyableProp(obj, prop)
      ) {
        props.push(prop);
      }
    }
    return props;
  }

  function isSpyableProp(obj, prop) {
    let value;
    try {
      value = obj[prop];
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return false;
    }

    if (value instanceof Function) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      return (descriptor.writable || descriptor.set) && descriptor.configurable;
    }
    return false;
  }

  return SpyRegistry;
};
