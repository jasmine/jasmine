getJasmineRequireObj().base = function(j$, jasmineGlobal) {
  /**
   * Maximum object depth the pretty printer will print to.
   * Set this to a lower value to speed up pretty printing if you have large objects.
   * @name jasmine.MAX_PRETTY_PRINT_DEPTH
   * @default 8
   * @since 1.3.0
   */
  j$.MAX_PRETTY_PRINT_DEPTH = 8;
  /**
   * Maximum number of array elements to display when pretty printing objects.
   * This will also limit the number of keys and values displayed for an object.
   * Elements past this number will be ellipised.
   * @name jasmine.MAX_PRETTY_PRINT_ARRAY_LENGTH
   * @default 50
   * @since 2.7.0
   */
  j$.MAX_PRETTY_PRINT_ARRAY_LENGTH = 50;
  /**
   * Maximum number of characters to display when pretty printing objects.
   * Characters past this number will be ellipised.
   * @name jasmine.MAX_PRETTY_PRINT_CHARS
   * @default 100
   * @since 2.9.0
   */
  j$.MAX_PRETTY_PRINT_CHARS = 1000;
  /**
   * Default number of milliseconds Jasmine will wait for an asynchronous spec,
   * before, or after function to complete. This can be overridden on a case by
   * case basis by passing a time limit as the third argument to {@link it},
   * {@link beforeEach}, {@link afterEach}, {@link beforeAll}, or
   * {@link afterAll}. The value must be no greater than the largest number of
   * milliseconds supported by setTimeout, which is usually 2147483647.
   *
   * While debugging tests, you may want to set this to a large number (or pass
   * a large number to one of the functions mentioned above) so that Jasmine
   * does not move on to after functions or the next spec while you're debugging.
   * @name jasmine.DEFAULT_TIMEOUT_INTERVAL
   * @default 5000
   * @since 1.3.0
   */
  let DEFAULT_TIMEOUT_INTERVAL = 5000;
  Object.defineProperty(j$, 'DEFAULT_TIMEOUT_INTERVAL', {
    get: function() {
      return DEFAULT_TIMEOUT_INTERVAL;
    },
    set: function(newValue) {
      j$.util.validateTimeout(newValue, 'jasmine.DEFAULT_TIMEOUT_INTERVAL');
      DEFAULT_TIMEOUT_INTERVAL = newValue;
    }
  });

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
    const env = (j$.currentEnv_ = j$.currentEnv_ || new j$.Env(options));
    //jasmine. singletons in here (setTimeout blah blah).
    return env;
  };

  j$.isArray_ = function(value) {
    return j$.isA_('Array', value);
  };

  j$.isObject_ = function(value) {
    return value !== undefined && value !== null && j$.isA_('Object', value);
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

  j$.isGeneratorFunction_ = function(value) {
    return j$.isA_('GeneratorFunction', value);
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
    if (!value) {
      return false;
    }

    if (value instanceof Error) {
      return true;
    }

    return typeof value.stack === 'string' && typeof value.message === 'string';
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
      obj.constructor === jasmineGlobal.Map
    );
  };

  j$.isSet = function(obj) {
    return (
      obj !== null &&
      typeof obj !== 'undefined' &&
      obj.constructor === jasmineGlobal.Set
    );
  };

  j$.isWeakMap = function(obj) {
    return (
      obj !== null &&
      typeof obj !== 'undefined' &&
      obj.constructor === jasmineGlobal.WeakMap
    );
  };

  j$.isURL = function(obj) {
    return (
      obj !== null &&
      typeof obj !== 'undefined' &&
      obj.constructor === jasmineGlobal.URL
    );
  };

  j$.isIterable_ = function(value) {
    return value && !!value[Symbol.iterator];
  };

  j$.isDataView = function(obj) {
    return (
      obj !== null &&
      typeof obj !== 'undefined' &&
      obj.constructor === jasmineGlobal.DataView
    );
  };

  j$.isPromise = function(obj) {
    return !!obj && obj.constructor === jasmineGlobal.Promise;
  };

  j$.isPromiseLike = function(obj) {
    return !!obj && j$.isFunction_(obj.then);
  };

  j$.fnNameFor = function(func) {
    if (func.name) {
      return func.name;
    }

    const matches =
      func.toString().match(/^\s*function\s*(\w+)\s*\(/) ||
      func.toString().match(/^\s*\[object\s*(\w+)Constructor\]/);

    return matches ? matches[1] : '<anonymous>';
  };

  j$.isPending_ = function(promise) {
    const sentinel = {};
    return Promise.race([promise, Promise.resolve(sentinel)]).then(
      function(result) {
        return result === sentinel;
      },
      function() {
        return false;
      }
    );
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value being compared is an instance of the specified class/constructor.
   * @name asymmetricEqualityTesters.any
   * @emittedName jasmine.any
   * @since 1.3.0
   * @function
   * @param {Constructor} clazz - The constructor to check against.
   */
  j$.any = function(clazz) {
    return new j$.Any(clazz);
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value being compared is not `null` and not `undefined`.
   * @name asymmetricEqualityTesters.anything
   * @emittedName jasmine.anything
   * @since 2.2.0
   * @function
   */
  j$.anything = function() {
    return new j$.Anything();
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value being compared is `true` or anything truthy.
   * @name asymmetricEqualityTesters.truthy
   * @emittedName jasmine.truthy
   * @since 3.1.0
   * @function
   */
  j$.truthy = function() {
    return new j$.Truthy();
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value being compared is  `null`, `undefined`, `0`, `false` or anything
   * falsy.
   * @name asymmetricEqualityTesters.falsy
   * @emittedName jasmine.falsy
   * @since 3.1.0
   * @function
   */
  j$.falsy = function() {
    return new j$.Falsy();
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value being compared is empty.
   * @name asymmetricEqualityTesters.empty
   * @emittedName jasmine.empty
   * @since 3.1.0
   * @function
   */
  j$.empty = function() {
    return new j$.Empty();
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that passes if the actual value is
   * the same as the sample as determined by the `===` operator.
   * @name asymmetricEqualityTesters.is
   * @emittedName jasmine.is
   * @function
   * @param {Object} sample - The value to compare the actual to.
   */
  j$.is = function(sample) {
    return new j$.Is(sample);
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value being compared is not empty.
   * @name asymmetricEqualityTesters.notEmpty
   * @emittedName jasmine.notEmpty
   * @since 3.1.0
   * @function
   */
  j$.notEmpty = function() {
    return new j$.NotEmpty();
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value being compared contains at least the specified keys and values.
   * @name asymmetricEqualityTesters.objectContaining
   * @emittedName jasmine.objectContaining
   * @since 1.3.0
   * @function
   * @param {Object} sample - The subset of properties that _must_ be in the actual.
   */
  j$.objectContaining = function(sample) {
    return new j$.ObjectContaining(sample);
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value is a `String` that matches the `RegExp` or `String`.
   * @name asymmetricEqualityTesters.stringMatching
   * @emittedName jasmine.stringMatching
   * @since 2.2.0
   * @function
   * @param {RegExp|String} expected
   */
  j$.stringMatching = function(expected) {
    return new j$.StringMatching(expected);
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value is a `String` that contains the specified `String`.
   * @name asymmetricEqualityTesters.stringContaining
   * @emittedName jasmine.stringContaining
   * @since 3.10.0
   * @function
   * @param {String} expected
   */
  j$.stringContaining = function(expected) {
    return new j$.StringContaining(expected);
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value is an `Array` that contains at least the elements in the sample.
   * @name asymmetricEqualityTesters.arrayContaining
   * @emittedName jasmine.arrayContaining
   * @since 2.2.0
   * @function
   * @param {Array} sample
   */
  j$.arrayContaining = function(sample) {
    return new j$.ArrayContaining(sample);
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if the actual
   * value is an `Array` that contains all of the elements in the sample in
   * any order.
   * @name asymmetricEqualityTesters.arrayWithExactContents
   * @emittedName jasmine.arrayWithExactContents
   * @since 2.8.0
   * @function
   * @param {Array} sample
   */
  j$.arrayWithExactContents = function(sample) {
    return new j$.ArrayWithExactContents(sample);
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if every
   * key/value pair in the sample passes the deep equality comparison
   * with at least one key/value pair in the actual value being compared
   * @name asymmetricEqualityTesters.mapContaining
   * @emittedName jasmine.mapContaining
   * @since 3.5.0
   * @function
   * @param {Map} sample - The subset of items that _must_ be in the actual.
   */
  j$.mapContaining = function(sample) {
    return new j$.MapContaining(sample);
  };

  /**
   * Get an {@link AsymmetricEqualityTester} that will succeed if every item
   * in the sample passes the deep equality comparison
   * with at least one item in the actual value being compared
   * @name asymmetricEqualityTesters.setContaining
   * @emittedName jasmine.setContaining
   * @since 3.5.0
   * @function
   * @param {Set} sample - The subset of items that _must_ be in the actual.
   */
  j$.setContaining = function(sample) {
    return new j$.SetContaining(sample);
  };

  /**
   * Determines whether the provided function is a Jasmine spy.
   * @name jasmine.isSpy
   * @since 2.0.0
   * @function
   * @param {Function} putativeSpy - The function to check.
   * @return {Boolean}
   */
  j$.isSpy = function(putativeSpy) {
    if (!putativeSpy) {
      return false;
    }
    return (
      putativeSpy.and instanceof j$.SpyStrategy &&
      putativeSpy.calls instanceof j$.CallTracker
    );
  };

  /**
   * Logs a message for use in debugging. If the spec fails, trace messages
   * will be included in the {@link SpecDoneEvent|result} passed to the
   * reporter's specDone method.
   *
   * This method should be called only when a spec (including any associated
   * beforeEach or afterEach functions) is running.
   * @function
   * @name jasmine.debugLog
   * @since 4.0.0
   * @param {String} msg - The message to log
   */
  j$.debugLog = function(msg) {
    j$.getEnv().debugLog(msg);
  };

  /**
   * Replaces Jasmine's global error handling with a spy. This prevents Jasmine
   * from treating uncaught exceptions and unhandled promise rejections
   * as spec failures and allows them to be inspected using the spy's
   * {@link Spy#calls|calls property} and related matchers such as
   * {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}.
   *
   * After installing the spy, spyOnGlobalErrorsAsync immediately calls its
   * argument, which must be an async or promise-returning function. The spy
   * will be passed as the first argument to that callback. Normal error
   * handling will be restored when the promise returned from the callback is
   * settled.
   *
   * When the JavaScript runtime reports an uncaught error or unhandled rejection,
   * the spy will be called with a single parameter representing Jasmine's best
   * effort at describing the error. This parameter may be of any type, because
   * JavaScript allows anything to be thrown or used as the reason for a
   * rejected promise, but Error instances and strings are most common.
   *
   * Note: The JavaScript runtime may deliver uncaught error events and unhandled
   * rejection events asynchronously, especially in browsers. If the event
   * occurs after the promise returned from the callback is settled, it won't
   * be routed to the spy even if the underlying error occurred previously.
   * It's up to you to ensure that all of the error/rejection events that you
   * want to handle have occurred before you resolve the promise returned from
   * the callback.
   *
   * You must ensure that the `it`/`beforeEach`/etc fn that called
   * `spyOnGlobalErrorsAsync` does not signal completion until after the
   * promise returned by `spyOnGlobalErrorsAsync` is resolved. Normally this is
   * done by `await`ing the returned promise. Leaving the global error spy
   * installed after the `it`/`beforeEach`/etc fn that installed it signals
   * completion is likely to cause problems and is not supported.
   * @name jasmine.spyOnGlobalErrorsAsync
   * @function
   * @async
   * @param {AsyncFunction} fn - A function to run, during which the global error spy will be effective
   * @example
   * it('demonstrates global error spies', async function() {
   *   await jasmine.spyOnGlobalErrorsAsync(async function(globalErrorSpy) {
   *     setTimeout(function() {
   *       throw new Error('the expected error');
   *     });
   *     await new Promise(function(resolve) {
   *       setTimeout(resolve);
   *     });
   *     const expected = new Error('the expected error');
   *     expect(globalErrorSpy).toHaveBeenCalledWith(expected);
   *   });
   * });
   */
  j$.spyOnGlobalErrorsAsync = async function(fn) {
    await jasmine.getEnv().spyOnGlobalErrorsAsync(fn);
  };
};
