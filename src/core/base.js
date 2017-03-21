getJasmineRequireObj().base = function(j$, jasmineGlobal) {
  j$.unimplementedMethod_ = function() {
    throw new Error('unimplemented method');
  };

  /**
   * @name jasmine.MAX_PRETTY_PRINT_DEPTH
   */
  j$.MAX_PRETTY_PRINT_DEPTH = 40;
  /**
   * @name jasmine.MAX_PRETTY_PRINT_ARRAY_LENGTH
   */
  j$.MAX_PRETTY_PRINT_ARRAY_LENGTH = 100;
  /**
   * @name jasmine.DEFAULT_TIMEOUT_INTERVAL
   */
  j$.DEFAULT_TIMEOUT_INTERVAL = 5000;

  j$.getGlobal = function() {
    return jasmineGlobal;
  };

  /**
   * Get the currently booted Jasmine Environment.
   *
   * @name jasmine.getEnv
   * @function
   * @return {Env}
   */
  j$.getEnv = function(options) {
    var env = j$.currentEnv_ = j$.currentEnv_ || new j$.Env(options);
    //jasmine. singletons in here (setTimeout blah blah).
    return env;
  };

  j$.isArray_ = function(value) {
    return j$.isA_('Array', value);
  };

  j$.isObject_ = function(value) {
    return !j$.util.isUndefined(value) && value !== null && j$.isA_('Object', value);
  };

  j$.isString_ = function(value) {
    return j$.isA_('String', value);
  };

  j$.isNumber_ = function(value) {
    return j$.isA_('Number', value);
  };

  j$.isFunction_ = function(value) {
    return j$.isA_('Function', value);
  };

  j$.isA_ = function(typeName, value) {
    return j$.getType_(value) === '[object ' + typeName + ']';
  };

  j$.getType_ = function(value) {
    return Object.prototype.toString.apply(value);
  };

  j$.isDomNode = function(obj) {
    return obj.nodeType > 0;
  };

  j$.fnNameFor = function(func) {
    if (func.name) {
      return func.name;
    }

    var matches = func.toString().match(/^\s*function\s*(\w*)\s*\(/);
    return matches ? matches[1] : '<anonymous>';
  };

  /**
   * @name jasmine.any
   * @function
   */
  j$.any = function(clazz) {
    return new j$.Any(clazz);
  };

  /**
   * @name jasmine.anything
   * @function
   */
  j$.anything = function() {
    return new j$.Anything();
  };

  /**
   * @name jasmine.objectContaining
   * @function
   */
  j$.objectContaining = function(sample) {
    return new j$.ObjectContaining(sample);
  };

  /**
   * @name jasmine.stringMatching
   * @function
   */
  j$.stringMatching = function(expected) {
    return new j$.StringMatching(expected);
  };

  /**
   * @name jasmine.arrayContaining
   * @function
   */
  j$.arrayContaining = function(sample) {
    return new j$.ArrayContaining(sample);
  };

  /**
   * @name jasmine.createSpy
   * @function
   * @return {Spy}
   */
  j$.createSpy = function(name, originalFn) {
    return j$.Spy(name, originalFn);
  };

  j$.isSpy = function(putativeSpy) {
    if (!putativeSpy) {
      return false;
    }
    return putativeSpy.and instanceof j$.SpyStrategy &&
      putativeSpy.calls instanceof j$.CallTracker;
  };

  /**
   * @name jasmine.createSpyObj
   * @function
   */
  j$.createSpyObj = function(baseName, methodNames) {
    var baseNameIsCollection = j$.isObject_(baseName) || j$.isArray_(baseName);

    if (baseNameIsCollection && j$.util.isUndefined(methodNames)) {
      methodNames = baseName;
      baseName = 'unknown';
    }

    var obj = {};
    var spiesWereSet = false;

    if (j$.isArray_(methodNames)) {
      for (var i = 0; i < methodNames.length; i++) {
        obj[methodNames[i]] = j$.createSpy(baseName + '.' + methodNames[i]);
        spiesWereSet = true;
      }
    } else if (j$.isObject_(methodNames)) {
      for (var key in methodNames) {
        if (methodNames.hasOwnProperty(key)) {
          obj[key] = j$.createSpy(baseName + '.' + key);
          obj[key].and.returnValue(methodNames[key]);
          spiesWereSet = true;
        }
      }
    }

    if (!spiesWereSet) {
      throw 'createSpyObj requires a non-empty array or object of method names to create spies for';
    }

    return obj;
  };
};
