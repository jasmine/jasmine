getJasmineRequireObj().base = function(j$, jasmineGlobal) {
  j$.unimplementedMethod_ = function() {
    throw new Error('unimplemented method');
  };

  /**
   * Maximum object depth the pretty printer will print to.
   * Set this to a lower value to speed up pretty printing if you have large objects.
   * @name jasmine.MAX_PRETTY_PRINT_DEPTH
   * @since 1.3.0
   */
  j$.MAX_PRETTY_PRINT_DEPTH = 8;
  /**
   * Maximum number of array elements to display when pretty printing objects.
   * This will also limit the number of keys and values displayed for an object.
   * Elements past this number will be ellipised.
   * @name jasmine.MAX_PRETTY_PRINT_ARRAY_LENGTH
   * @since 2.7.0
   */
  j$.MAX_PRETTY_PRINT_ARRAY_LENGTH = 50;
  /**
   * Maximum number of characters to display when pretty printing objects.
   * Characters past this number will be ellipised.
   * @name jasmine.MAX_PRETTY_PRINT_CHARS
   * @since 2.9.0
   */
  j$.MAX_PRETTY_PRINT_CHARS = 1000;
  /**
   * Default number of milliseconds Jasmine will wait for an asynchronous spec to complete.
   * @name jasmine.DEFAULT_TIMEOUT_INTERVAL
   * @since 1.3.0
   */
  j$.DEFAULT_TIMEOUT_INTERVAL = 5000;

  j$.getGlobal = function() {
    return jasmineGlobal;
  };

  /**
   * Get the currently booted Jasmine Environment.
   *
   * @name jasmine.getEnv
   * @since 1.3.0
   * @function
   * @return {Env}
   */
  j$.getEnv = function(options) {
    var env = (j$.currentEnv_ = j$.currentEnv_ || new j$.Env(options));
    //jasmine. singletons in here (setTimeout blah blah).
    return env;
  };

  j$.isArray_ = function(value) {
    return j$.isA_('Array', value);
  };

  j$.isObject_ = function(value) {
    return (
      !j$.util.isUndefined(value) && value !== null && j$.isA_('Object', value)
    );
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

  j$.isAsyncFunction_ = function(value) {
    return j$.isA_('AsyncFunction', value);
  };

  j$.isTypedArray_ = function(value) {
    return (
      j$.isA_('Float32Array', value) ||
      j$.isA_('Float64Array', value) ||
      j$.isA_('Int16Array', value) ||
      j$.isA_('Int32Array', value) ||
      j$.isA_('Int8Array', value) ||
      j$.isA_('Uint16Array', value) ||
      j$.isA_('Uint32Array', value) ||
      j$.isA_('Uint8Array', value) ||
      j$.isA_('Uint8ClampedArray', value)
    );
  };

  j$.isA_ = function(typeName, value) {
    return j$.getType_(value) === '[object ' + typeName + ']';
  };

  j$.isError_ = function(value) {
    if (value instanceof Error) {
      return true;
    }
    if (value && value.constructor && value.constructor.constructor) {
      var valueGlobal = value.constructor.constructor('return this');
      if (j$.isFunction_(valueGlobal)) {
        valueGlobal = valueGlobal();
      }

      if (valueGlobal.Error && value instanceof valueGlobal.Error) {
        return true;
      }
    }
    return false;
  };

  j$.isAsymmetricEqualityTester_ = function(obj) {
    return obj ? j$.isA_('Function', obj.asymmetricMatch) : false;
  };

  j$.getType_ = function(value) {
    return Object.prototype.toString.apply(value);
  };

  j$.isDomNode = function(obj) {
    // Node is a function, because constructors
    return typeof jasmineGlobal.Node !== 'undefined'
      ? obj instanceof jasmineGlobal.Node
      : obj !== null &&
          typeof obj === 'object' &&
          typeof obj.nodeType === 'number' &&
          typeof obj.nodeName === 'string';
    // return obj.nodeType > 0;
  };

  j$.isMap = function(obj) {
    return (
      obj !== null &&
      typeof obj !== 'undefined' &&
      typeof jasmineGlobal.Map !== 'undefined' &&
      obj.constructor === jasmineGlobal.Map
    );
  };

  j$.isSet = function(obj) {
    return (
      obj !== null &&
      typeof obj !== 'undefined' &&
      typeof jasmineGlobal.Set !== 'undefined' &&
      obj.constructor === jasmineGlobal.Set
    );
  };

  j$.isWeakMap = function(obj) {
    return (
      obj !== null &&
      typeof obj !== 'undefined' &&
      typeof jasmineGlobal.WeakMap !== 'undefined' &&
      obj.constructor === jasmineGlobal.WeakMap
    );
  };

  j$.isDataView = function(obj) {
    return (
      obj !== null &&
      typeof obj !== 'undefined' &&
      typeof jasmineGlobal.DataView !== 'undefined' &&
      obj.constructor === jasmineGlobal.DataView
    );
  };

  j$.isPromise = function(obj) {
    return (
      typeof jasmineGlobal.Promise !== 'undefined' &&
      !!obj &&
      obj.constructor === jasmineGlobal.Promise
    );
  };

  j$.isPromiseLike = function(obj) {
    return !!obj && j$.isFunction_(obj.then);
  };

  j$.fnNameFor = function(func) {
    if (func.name) {
      return func.name;
    }

    var matches =
      func.toString().match(/^\s*function\s*(\w+)\s*\(/) ||
      func.toString().match(/^\s*\[object\s*(\w+)Constructor\]/);

    return matches ? matches[1] : '<anonymous>';
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is an instance of the specified class/constructor.
   * @name jasmine.any
   * @since 1.3.0
   * @function
   * @param {Constructor} clazz - The constructor to check against.
   */
  j$.any = function(clazz) {
    return new j$.Any(clazz);
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is not `null` and not `undefined`.
   * @name jasmine.anything
   * @since 2.2.0
   * @function
   */
  j$.anything = function() {
    return new j$.Anything();
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is `true` or anything truthy.
   * @name jasmine.truthy
   * @since 3.1.0
   * @function
   */
  j$.truthy = function() {
    return new j$.Truthy();
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is  `null`, `undefined`, `0`, `false` or anything falsey.
   * @name jasmine.falsy
   * @since 3.1.0
   * @function
   */
  j$.falsy = function() {
    return new j$.Falsy();
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is empty.
   * @name jasmine.empty
   * @since 3.1.0
   * @function
   */
  j$.empty = function() {
    return new j$.Empty();
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is not empty.
   * @name jasmine.notEmpty
   * @since 3.1.0
   * @function
   */
  j$.notEmpty = function() {
    return new j$.NotEmpty();
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared contains at least the keys and values.
   * @name jasmine.objectContaining
   * @since 1.3.0
   * @function
   * @param {Object} sample - The subset of properties that _must_ be in the actual.
   */
  j$.objectContaining = function(sample) {
    return new j$.ObjectContaining(sample);
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value is a `String` that matches the `RegExp` or `String`.
   * @name jasmine.stringMatching
   * @since 2.2.0
   * @function
   * @param {RegExp|String} expected
   */
  j$.stringMatching = function(expected) {
    return new j$.StringMatching(expected);
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value is an `Array` that contains at least the elements in the sample.
   * @name jasmine.arrayContaining
   * @since 2.2.0
   * @function
   * @param {Array} sample
   */
  j$.arrayContaining = function(sample) {
    return new j$.ArrayContaining(sample);
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value is an `Array` that contains all of the elements in the sample in any order.
   * @name jasmine.arrayWithExactContents
   * @since 2.8.0
   * @function
   * @param {Array} sample
   */
  j$.arrayWithExactContents = function(sample) {
    return new j$.ArrayWithExactContents(sample);
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if every key/value pair in the sample passes the deep equality comparison
   * with at least one key/value pair in the actual value being compared
   * @name jasmine.mapContaining
   * @since 3.5.0
   * @function
   * @param {Map} sample - The subset of items that _must_ be in the actual.
   */
  j$.mapContaining = function(sample) {
    return new j$.MapContaining(sample);
  };

  /**
   * Get a matcher, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if every item in the sample passes the deep equality comparison
   * with at least one item in the actual value being compared
   * @name jasmine.setContaining
   * @since 3.5.0
   * @function
   * @param {Set} sample - The subset of items that _must_ be in the actual.
   */
  j$.setContaining = function(sample) {
    return new j$.SetContaining(sample);
  };

  j$.isSpy = function(putativeSpy) {
    if (!putativeSpy) {
      return false;
    }
    return (
      putativeSpy.and instanceof j$.SpyStrategy &&
      putativeSpy.calls instanceof j$.CallTracker
    );
  };
};
