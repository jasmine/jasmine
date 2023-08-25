/*
Copyright (c) 2008-2023 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// eslint-disable-next-line no-unused-vars,no-var
var getJasmineRequireObj = (function(jasmineGlobal) {
  let jasmineRequire;

  if (
    typeof module !== 'undefined' &&
    module.exports &&
    typeof exports !== 'undefined'
  ) {
    if (typeof global !== 'undefined') {
      jasmineGlobal = global;
    } else {
      jasmineGlobal = {};
    }
    jasmineRequire = exports;
  } else {
    if (
      typeof window !== 'undefined' &&
      typeof window.toString === 'function' &&
      window.toString() === '[object GjsGlobal]'
    ) {
      jasmineGlobal = window;
    }
    jasmineRequire = jasmineGlobal.jasmineRequire = {};
  }

  function getJasmineRequire() {
    return jasmineRequire;
  }

  getJasmineRequire().core = function(jRequire) {
    const j$ = {};

    jRequire.base(j$, jasmineGlobal);
    j$.util = jRequire.util(j$);
    j$.errors = jRequire.errors();
    j$.formatErrorMsg = jRequire.formatErrorMsg();
    j$.Any = jRequire.Any(j$);
    j$.Anything = jRequire.Anything(j$);
    j$.CallTracker = jRequire.CallTracker(j$);
    j$.MockDate = jRequire.MockDate(j$);
    j$.getClearStack = jRequire.clearStack(j$);
    j$.Clock = jRequire.Clock();
    j$.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler(j$);
    j$.Deprecator = jRequire.Deprecator(j$);
    j$.Env = jRequire.Env(j$);
    j$.StackTrace = jRequire.StackTrace(j$);
    j$.ExceptionFormatter = jRequire.ExceptionFormatter(j$);
    j$.ExpectationFilterChain = jRequire.ExpectationFilterChain();
    j$.Expector = jRequire.Expector(j$);
    j$.Expectation = jRequire.Expectation(j$);
    j$.buildExpectationResult = jRequire.buildExpectationResult(j$);
    j$.JsApiReporter = jRequire.JsApiReporter(j$);
    j$.makePrettyPrinter = jRequire.makePrettyPrinter(j$);
    j$.basicPrettyPrinter_ = j$.makePrettyPrinter();
    j$.MatchersUtil = jRequire.MatchersUtil(j$);
    j$.ObjectContaining = jRequire.ObjectContaining(j$);
    j$.ArrayContaining = jRequire.ArrayContaining(j$);
    j$.ArrayWithExactContents = jRequire.ArrayWithExactContents(j$);
    j$.MapContaining = jRequire.MapContaining(j$);
    j$.SetContaining = jRequire.SetContaining(j$);
    j$.QueueRunner = jRequire.QueueRunner(j$);
    j$.NeverSkipPolicy = jRequire.NeverSkipPolicy(j$);
    j$.SkipAfterBeforeAllErrorPolicy = jRequire.SkipAfterBeforeAllErrorPolicy(
      j$
    );
    j$.CompleteOnFirstErrorSkipPolicy = jRequire.CompleteOnFirstErrorSkipPolicy(
      j$
    );
    j$.reporterEvents = jRequire.reporterEvents(j$);
    j$.ReportDispatcher = jRequire.ReportDispatcher(j$);
    j$.ParallelReportDispatcher = jRequire.ParallelReportDispatcher(j$);
    j$.RunableResources = jRequire.RunableResources(j$);
    j$.Runner = jRequire.Runner(j$);
    j$.Spec = jRequire.Spec(j$);
    j$.Spy = jRequire.Spy(j$);
    j$.SpyFactory = jRequire.SpyFactory(j$);
    j$.SpyRegistry = jRequire.SpyRegistry(j$);
    j$.SpyStrategy = jRequire.SpyStrategy(j$);
    j$.StringMatching = jRequire.StringMatching(j$);
    j$.StringContaining = jRequire.StringContaining(j$);
    j$.UserContext = jRequire.UserContext(j$);
    j$.Suite = jRequire.Suite(j$);
    j$.SuiteBuilder = jRequire.SuiteBuilder(j$);
    j$.Timer = jRequire.Timer();
    j$.TreeProcessor = jRequire.TreeProcessor();
    j$.version = jRequire.version();
    j$.Order = jRequire.Order();
    j$.DiffBuilder = jRequire.DiffBuilder(j$);
    j$.NullDiffBuilder = jRequire.NullDiffBuilder(j$);
    j$.ObjectPath = jRequire.ObjectPath(j$);
    j$.MismatchTree = jRequire.MismatchTree(j$);
    j$.GlobalErrors = jRequire.GlobalErrors(j$);

    j$.Truthy = jRequire.Truthy(j$);
    j$.Falsy = jRequire.Falsy(j$);
    j$.Empty = jRequire.Empty(j$);
    j$.NotEmpty = jRequire.NotEmpty(j$);
    j$.Is = jRequire.Is(j$);

    j$.matchers = jRequire.requireMatchers(jRequire, j$);
    j$.asyncMatchers = jRequire.requireAsyncMatchers(jRequire, j$);

    return j$;
  };

  return getJasmineRequire;
})(this);

getJasmineRequireObj().requireMatchers = function(jRequire, j$) {
  const availableMatchers = [
      'nothing',
      'toBe',
      'toBeCloseTo',
      'toBeDefined',
      'toBeInstanceOf',
      'toBeFalse',
      'toBeFalsy',
      'toBeGreaterThan',
      'toBeGreaterThanOrEqual',
      'toBeLessThan',
      'toBeLessThanOrEqual',
      'toBeNaN',
      'toBeNegativeInfinity',
      'toBeNull',
      'toBePositiveInfinity',
      'toBeTrue',
      'toBeTruthy',
      'toBeUndefined',
      'toContain',
      'toEqual',
      'toHaveSize',
      'toHaveBeenCalled',
      'toHaveBeenCalledBefore',
      'toHaveBeenCalledOnceWith',
      'toHaveBeenCalledTimes',
      'toHaveBeenCalledWith',
      'toHaveClass',
      'toHaveSpyInteractions',
      'toMatch',
      'toThrow',
      'toThrowError',
      'toThrowMatching'
    ],
    matchers = {};

  for (const name of availableMatchers) {
    matchers[name] = jRequire[name](j$);
  }

  return matchers;
};

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
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
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
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is not `null` and not `undefined`.
   * @name jasmine.anything
   * @since 2.2.0
   * @function
   */
  j$.anything = function() {
    return new j$.Anything();
  };

  /**
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is `true` or anything truthy.
   * @name jasmine.truthy
   * @since 3.1.0
   * @function
   */
  j$.truthy = function() {
    return new j$.Truthy();
  };

  /**
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is  `null`, `undefined`, `0`, `false` or anything falsey.
   * @name jasmine.falsy
   * @since 3.1.0
   * @function
   */
  j$.falsy = function() {
    return new j$.Falsy();
  };

  /**
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is empty.
   * @name jasmine.empty
   * @since 3.1.0
   * @function
   */
  j$.empty = function() {
    return new j$.Empty();
  };

  /**
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher}
   * that passes if the actual value is the same as the sample as determined
   * by the `===` operator.
   * @name jasmine.is
   * @function
   * @param {Object} sample - The value to compare the actual to.
   */
  j$.is = function(sample) {
    return new j$.Is(sample);
  };

  /**
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value being compared is not empty.
   * @name jasmine.notEmpty
   * @since 3.1.0
   * @function
   */
  j$.notEmpty = function() {
    return new j$.NotEmpty();
  };

  /**
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
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
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
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
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
   * that will succeed if the actual value is a `String` that contains the specified `String`.
   * @name jasmine.stringContaining
   * @since 3.10.0
   * @function
   * @param {String} expected
   */
  j$.stringContaining = function(expected) {
    return new j$.StringContaining(expected);
  };

  /**
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
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
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
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
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
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
   * Get an {@link AsymmetricEqualityTester}, usable in any {@link matchers|matcher} that uses Jasmine's equality (e.g. {@link matchers#toEqual|toEqual}, {@link matchers#toContain|toContain}, or {@link matchers#toHaveBeenCalledWith|toHaveBeenCalledWith}),
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
   * will be included in the {@link SpecResult|result} passed to the
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
   * Note: The JavaScript runtime may deliver uncaught error events and unhandled
   * rejection events asynchronously, especially in browsers. If the event
   * occurs after the promise returned from the callback is settled, it won't
   * be routed to the spy even if the underlying error occurred previously.
   * It's up to you to ensure that the returned promise isn't resolved until
   * all of the error/rejection events that you want to handle have occurred.
   *
   * You must await the return value of spyOnGlobalErrorsAsync.
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

getJasmineRequireObj().util = function(j$) {
  const util = {};

  util.isUndefined = function(obj) {
    return obj === void 0;
  };

  util.clone = function(obj) {
    if (Object.prototype.toString.apply(obj) === '[object Array]') {
      return obj.slice();
    }

    const cloned = {};
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        cloned[prop] = obj[prop];
      }
    }

    return cloned;
  };

  util.cloneArgs = function(args) {
    return Array.from(args).map(function(arg) {
      const str = Object.prototype.toString.apply(arg),
        primitives = /^\[object (Boolean|String|RegExp|Number)/;

      // All falsey values are either primitives, `null`, or `undefined.
      if (!arg || str.match(primitives)) {
        return arg;
      } else if (str === '[object Date]') {
        return new Date(arg.valueOf());
      } else {
        return j$.util.clone(arg);
      }
    });
  };

  util.getPropertyDescriptor = function(obj, methodName) {
    let descriptor,
      proto = obj;

    do {
      descriptor = Object.getOwnPropertyDescriptor(proto, methodName);
      proto = Object.getPrototypeOf(proto);
    } while (!descriptor && proto);

    return descriptor;
  };

  util.has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  util.errorWithStack = function errorWithStack() {
    // Don't throw and catch. That makes it harder for users to debug their
    // code with exception breakpoints, and it's unnecessary since all
    // supported environments populate new Error().stack
    return new Error();
  };

  function callerFile() {
    const trace = new j$.StackTrace(util.errorWithStack());
    return trace.frames[2].file;
  }

  util.jasmineFile = (function() {
    let result;

    return function() {
      if (!result) {
        result = callerFile();
      }

      return result;
    };
  })();

  util.validateTimeout = function(timeout, msgPrefix) {
    // Timeouts are implemented with setTimeout, which only supports a limited
    // range of values. The limit is unspecified, as is the behavior when it's
    // exceeded. But on all currently supported JS runtimes, setTimeout calls
    // the callback immediately when the timeout is greater than 2147483647
    // (the maximum value of a signed 32 bit integer).
    const max = 2147483647;

    if (timeout > max) {
      throw new Error(
        (msgPrefix || 'Timeout value') + ' cannot be greater than ' + max
      );
    }
  };

  return util;
};

getJasmineRequireObj().Spec = function(j$) {
  function Spec(attrs) {
    this.expectationFactory = attrs.expectationFactory;
    this.asyncExpectationFactory = attrs.asyncExpectationFactory;
    this.resultCallback = attrs.resultCallback || function() {};
    this.id = attrs.id;
    this.filename = attrs.filename;
    this.parentSuiteId = attrs.parentSuiteId;
    this.description = attrs.description || '';
    this.queueableFn = attrs.queueableFn;
    this.beforeAndAfterFns =
      attrs.beforeAndAfterFns ||
      function() {
        return { befores: [], afters: [] };
      };
    this.userContext =
      attrs.userContext ||
      function() {
        return {};
      };
    this.onStart = attrs.onStart || function() {};
    this.autoCleanClosures =
      attrs.autoCleanClosures === undefined ? true : !!attrs.autoCleanClosures;
    this.getSpecName =
      attrs.getSpecName ||
      function() {
        return '';
      };
    this.onLateError = attrs.onLateError || function() {};
    this.catchingExceptions =
      attrs.catchingExceptions ||
      function() {
        return true;
      };
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;
    this.timer = attrs.timer || new j$.Timer();

    if (!this.queueableFn.fn) {
      this.exclude();
    }

    this.reset();
  }

  Spec.prototype.addExpectationResult = function(passed, data, isError) {
    const expectationResult = j$.buildExpectationResult(data);

    if (passed) {
      this.result.passedExpectations.push(expectationResult);
    } else {
      if (this.reportedDone) {
        this.onLateError(expectationResult);
      } else {
        this.result.failedExpectations.push(expectationResult);

        // TODO: refactor so that we don't need to override cached status
        if (this.result.status) {
          this.result.status = 'failed';
        }
      }

      if (this.throwOnExpectationFailure && !isError) {
        throw new j$.errors.ExpectationFailed();
      }
    }
  };

  Spec.prototype.setSpecProperty = function(key, value) {
    this.result.properties = this.result.properties || {};
    this.result.properties[key] = value;
  };

  Spec.prototype.execute = function(
    queueRunnerFactory,
    onComplete,
    excluded,
    failSpecWithNoExp
  ) {
    const onStart = {
      fn: done => {
        this.timer.start();
        this.onStart(this, done);
      }
    };

    const complete = {
      fn: done => {
        if (this.autoCleanClosures) {
          this.queueableFn.fn = null;
        }
        this.result.status = this.status(excluded, failSpecWithNoExp);
        this.result.duration = this.timer.elapsed();

        if (this.result.status !== 'failed') {
          this.result.debugLogs = null;
        }

        this.resultCallback(this.result, done);
      },
      type: 'specCleanup'
    };

    const fns = this.beforeAndAfterFns();

    const runnerConfig = {
      isLeaf: true,
      queueableFns: [...fns.befores, this.queueableFn, ...fns.afters],
      onException: e => this.handleException(e),
      onMultipleDone: () => {
        // Issue a deprecation. Include the context ourselves and pass
        // ignoreRunnable: true, since getting here always means that we've already
        // moved on and the current runnable isn't the one that caused the problem.
        this.onLateError(
          new Error(
            'An asynchronous spec, beforeEach, or afterEach function called its ' +
              "'done' callback more than once.\n(in spec: " +
              this.getFullName() +
              ')'
          )
        );
      },
      onComplete: () => {
        if (this.result.status === 'failed') {
          onComplete(new j$.StopExecutionError('spec failed'));
        } else {
          onComplete();
        }
      },
      userContext: this.userContext(),
      runnableName: this.getFullName.bind(this)
    };

    if (this.markedPending || excluded === true) {
      runnerConfig.queueableFns = [];
    }

    runnerConfig.queueableFns.unshift(onStart);
    runnerConfig.queueableFns.push(complete);

    queueRunnerFactory(runnerConfig);
  };

  Spec.prototype.reset = function() {
    /**
     * @typedef SpecResult
     * @property {String} id - The unique id of this spec.
     * @property {String} description - The description passed to the {@link it} that created this spec.
     * @property {String} fullName - The full description including all ancestors of this spec.
     * @property {String|null} parentSuiteId - The ID of the suite containing this spec, or null if this spec is not in a describe().
     * @property {String} filename - The name of the file the spec was defined in.
     * @property {Expectation[]} failedExpectations - The list of expectations that failed during execution of this spec.
     * @property {Expectation[]} passedExpectations - The list of expectations that passed during execution of this spec.
     * @property {Expectation[]} deprecationWarnings - The list of deprecation warnings that occurred during execution this spec.
     * @property {String} pendingReason - If the spec is {@link pending}, this will be the reason.
     * @property {String} status - Once the spec has completed, this string represents the pass/fail status of this spec.
     * @property {number} duration - The time in ms used by the spec execution, including any before/afterEach.
     * @property {Object} properties - User-supplied properties, if any, that were set using {@link Env#setSpecProperty}
     * @property {DebugLogEntry[]|null} debugLogs - Messages, if any, that were logged using {@link jasmine.debugLog} during a failing spec.
     * @since 2.0.0
     */
    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      parentSuiteId: this.parentSuiteId,
      filename: this.filename,
      failedExpectations: [],
      passedExpectations: [],
      deprecationWarnings: [],
      pendingReason: this.excludeMessage || '',
      duration: null,
      properties: null,
      debugLogs: null
    };
    this.markedPending = this.markedExcluding;
    this.reportedDone = false;
  };

  Spec.prototype.handleException = function handleException(e) {
    if (Spec.isPendingSpecException(e)) {
      this.pend(extractCustomPendingMessage(e));
      return;
    }

    if (e instanceof j$.errors.ExpectationFailed) {
      return;
    }

    this.addExpectationResult(
      false,
      {
        matcherName: '',
        passed: false,
        expected: '',
        actual: '',
        error: e
      },
      true
    );
  };

  /*
   * Marks state as pending
   * @param {string} [message] An optional reason message
   */
  Spec.prototype.pend = function(message) {
    this.markedPending = true;
    if (message) {
      this.result.pendingReason = message;
    }
  };

  /*
   * Like {@link Spec#pend}, but pending state will survive {@link Spec#reset}
   * Useful for fit, xit, where pending state remains.
   * @param {string} [message] An optional reason message
   */
  Spec.prototype.exclude = function(message) {
    this.markedExcluding = true;
    if (this.message) {
      this.excludeMessage = message;
    }
    this.pend(message);
  };

  Spec.prototype.getResult = function() {
    this.result.status = this.status();
    return this.result;
  };

  Spec.prototype.status = function(excluded, failSpecWithNoExpectations) {
    if (excluded === true) {
      return 'excluded';
    }

    if (this.markedPending) {
      return 'pending';
    }

    if (
      this.result.failedExpectations.length > 0 ||
      (failSpecWithNoExpectations &&
        this.result.failedExpectations.length +
          this.result.passedExpectations.length ===
          0)
    ) {
      return 'failed';
    }

    return 'passed';
  };

  Spec.prototype.getFullName = function() {
    return this.getSpecName(this);
  };

  Spec.prototype.addDeprecationWarning = function(deprecation) {
    if (typeof deprecation === 'string') {
      deprecation = { message: deprecation };
    }
    this.result.deprecationWarnings.push(
      j$.buildExpectationResult(deprecation)
    );
  };

  Spec.prototype.debugLog = function(msg) {
    if (!this.result.debugLogs) {
      this.result.debugLogs = [];
    }

    /**
     * @typedef DebugLogEntry
     * @property {String} message - The message that was passed to {@link jasmine.debugLog}.
     * @property {number} timestamp - The time when the entry was added, in
     * milliseconds from the spec's start time
     */
    this.result.debugLogs.push({
      message: msg,
      timestamp: this.timer.elapsed()
    });
  };

  const extractCustomPendingMessage = function(e) {
    const fullMessage = e.toString(),
      boilerplateStart = fullMessage.indexOf(Spec.pendingSpecExceptionMessage),
      boilerplateEnd =
        boilerplateStart + Spec.pendingSpecExceptionMessage.length;

    return fullMessage.slice(boilerplateEnd);
  };

  Spec.pendingSpecExceptionMessage = '=> marked Pending';

  Spec.isPendingSpecException = function(e) {
    return !!(
      e &&
      e.toString &&
      e.toString().indexOf(Spec.pendingSpecExceptionMessage) !== -1
    );
  };

  /**
   * @interface Spec
   * @see Configuration#specFilter
   * @since 2.0.0
   */
  Object.defineProperty(Spec.prototype, 'metadata', {
    get: function() {
      if (!this.metadata_) {
        this.metadata_ = {
          /**
           * The unique ID of this spec.
           * @name Spec#id
           * @readonly
           * @type {string}
           * @since 2.0.0
           */
          id: this.id,

          /**
           * The description passed to the {@link it} that created this spec.
           * @name Spec#description
           * @readonly
           * @type {string}
           * @since 2.0.0
           */
          description: this.description,

          /**
           * The full description including all ancestors of this spec.
           * @name Spec#getFullName
           * @function
           * @returns {string}
           * @since 2.0.0
           */
          getFullName: this.getFullName.bind(this)
        };
      }

      return this.metadata_;
    }
  });

  return Spec;
};

getJasmineRequireObj().Order = function() {
  function Order(options) {
    this.random = 'random' in options ? options.random : true;
    const seed = (this.seed = options.seed || generateSeed());
    this.sort = this.random ? randomOrder : naturalOrder;

    function naturalOrder(items) {
      return items;
    }

    function randomOrder(items) {
      const copy = items.slice();
      copy.sort(function(a, b) {
        return jenkinsHash(seed + a.id) - jenkinsHash(seed + b.id);
      });
      return copy;
    }

    function generateSeed() {
      return String(Math.random()).slice(-5);
    }

    // Bob Jenkins One-at-a-Time Hash algorithm is a non-cryptographic hash function
    // used to get a different output when the key changes slightly.
    // We use your return to sort the children randomly in a consistent way when
    // used in conjunction with a seed

    function jenkinsHash(key) {
      let hash, i;
      for (hash = i = 0; i < key.length; ++i) {
        hash += key.charCodeAt(i);
        hash += hash << 10;
        hash ^= hash >> 6;
      }
      hash += hash << 3;
      hash ^= hash >> 11;
      hash += hash << 15;
      return hash;
    }
  }

  return Order;
};

getJasmineRequireObj().Env = function(j$) {
  /**
   * @class Env
   * @since 2.0.0
   * @classdesc The Jasmine environment.<br>
   * _Note:_ Do not construct this directly. You can obtain the Env instance by
   * calling {@link jasmine.getEnv}.
   * @hideconstructor
   */
  function Env(options) {
    options = options || {};

    const self = this;
    const global = options.global || j$.getGlobal();

    const realSetTimeout = global.setTimeout;
    const realClearTimeout = global.clearTimeout;
    const clearStack = j$.getClearStack(global);
    this.clock = new j$.Clock(
      global,
      function() {
        return new j$.DelayedFunctionScheduler();
      },
      new j$.MockDate(global)
    );

    const globalErrors = new j$.GlobalErrors();
    const installGlobalErrors = (function() {
      let installed = false;
      return function() {
        if (!installed) {
          globalErrors.install();
          installed = true;
        }
      };
    })();

    const runableResources = new j$.RunableResources({
      getCurrentRunableId: function() {
        const r = runner.currentRunable();
        return r ? r.id : null;
      },
      globalErrors
    });

    let reporter;
    let topSuite;
    let runner;
    let parallelLoadingState = null; // 'specs', 'helpers', or null for non-parallel

    /**
     * This represents the available options to configure Jasmine.
     * Options that are not provided will use their default values.
     * @see Env#configure
     * @interface Configuration
     * @since 3.3.0
     */
    const config = {
      /**
       * Whether to randomize spec execution order
       * @name Configuration#random
       * @since 3.3.0
       * @type Boolean
       * @default true
       */
      random: true,
      /**
       * Seed to use as the basis of randomization.
       * Null causes the seed to be determined randomly at the start of execution.
       * @name Configuration#seed
       * @since 3.3.0
       * @type (number|string)
       * @default null
       */
      seed: null,
      /**
       * Whether to stop execution of the suite after the first spec failure
       *
       * <p>In parallel mode, `stopOnSpecFailure` works on a "best effort"
       * basis. Jasmine will stop execution as soon as practical after a failure
       * but it might not be immediate.</p>
       * @name Configuration#stopOnSpecFailure
       * @since 3.9.0
       * @type Boolean
       * @default false
       */
      stopOnSpecFailure: false,
      /**
       * Whether to fail the spec if it ran no expectations. By default
       * a spec that ran no expectations is reported as passed. Setting this
       * to true will report such spec as a failure.
       * @name Configuration#failSpecWithNoExpectations
       * @since 3.5.0
       * @type Boolean
       * @default false
       */
      failSpecWithNoExpectations: false,
      /**
       * Whether to cause specs to only have one expectation failure.
       * @name Configuration#stopSpecOnExpectationFailure
       * @since 3.3.0
       * @type Boolean
       * @default false
       */
      stopSpecOnExpectationFailure: false,
      /**
       * A function that takes a spec and returns true if it should be executed
       * or false if it should be skipped.
       * @callback SpecFilter
       * @param {Spec} spec - The spec that the filter is being applied to.
       * @return boolean
       */
      /**
       * Function to use to filter specs
       * @name Configuration#specFilter
       * @since 3.3.0
       * @type SpecFilter
       * @default A function that always returns true.
       */
      specFilter: function() {
        return true;
      },
      /**
       * Whether or not reporters should hide disabled specs from their output.
       * Currently only supported by Jasmine's HTMLReporter
       * @name Configuration#hideDisabled
       * @since 3.3.0
       * @type Boolean
       * @default false
       */
      hideDisabled: false,
      /**
       * Clean closures when a suite is done running (done by clearing the stored function reference).
       * This prevents memory leaks, but you won't be able to run jasmine multiple times.
       * @name Configuration#autoCleanClosures
       * @since 3.10.0
       * @type boolean
       * @default true
       */
      autoCleanClosures: true,
      /**
       * Whether or not to issue warnings for certain deprecated functionality
       * every time it's used. If not set or set to false, deprecation warnings
       * for methods that tend to be called frequently will be issued only once
       * or otherwise throttled to to prevent the suite output from being flooded
       * with warnings.
       * @name Configuration#verboseDeprecations
       * @since 3.6.0
       * @type Boolean
       * @default false
       */
      verboseDeprecations: false
    };

    if (!options.suppressLoadErrors) {
      installGlobalErrors();
      globalErrors.pushListener(function loadtimeErrorHandler(error, event) {
        topSuite.result.failedExpectations.push({
          passed: false,
          globalErrorType: 'load',
          message: error ? error.message : event.message,
          stack: error && error.stack,
          filename: event && event.filename,
          lineno: event && event.lineno
        });
      });
    }

    /**
     * Configure your jasmine environment
     * @name Env#configure
     * @since 3.3.0
     * @argument {Configuration} configuration
     * @function
     */
    this.configure = function(configuration) {
      if (parallelLoadingState) {
        throw new Error(
          'Jasmine cannot be configured via Env in parallel mode'
        );
      }

      const booleanProps = [
        'random',
        'failSpecWithNoExpectations',
        'hideDisabled',
        'stopOnSpecFailure',
        'stopSpecOnExpectationFailure',
        'autoCleanClosures'
      ];

      booleanProps.forEach(function(prop) {
        if (typeof configuration[prop] !== 'undefined') {
          config[prop] = !!configuration[prop];
        }
      });

      if (configuration.specFilter) {
        config.specFilter = configuration.specFilter;
      }

      if (typeof configuration.seed !== 'undefined') {
        config.seed = configuration.seed;
      }

      if (configuration.hasOwnProperty('verboseDeprecations')) {
        config.verboseDeprecations = configuration.verboseDeprecations;
        deprecator.verboseDeprecations(config.verboseDeprecations);
      }
    };

    /**
     * Get the current configuration for your jasmine environment
     * @name Env#configuration
     * @since 3.3.0
     * @function
     * @returns {Configuration}
     */
    this.configuration = function() {
      const result = {};
      for (const property in config) {
        result[property] = config[property];
      }
      return result;
    };

    this.setDefaultSpyStrategy = function(defaultStrategyFn) {
      runableResources.setDefaultSpyStrategy(defaultStrategyFn);
    };

    this.addSpyStrategy = function(name, fn) {
      runableResources.customSpyStrategies()[name] = fn;
    };

    this.addCustomEqualityTester = function(tester) {
      runableResources.customEqualityTesters().push(tester);
    };

    this.addMatchers = function(matchersToAdd) {
      runableResources.addCustomMatchers(matchersToAdd);
    };

    this.addAsyncMatchers = function(matchersToAdd) {
      runableResources.addCustomAsyncMatchers(matchersToAdd);
    };

    this.addCustomObjectFormatter = function(formatter) {
      runableResources.customObjectFormatters().push(formatter);
    };

    j$.Expectation.addCoreMatchers(j$.matchers);
    j$.Expectation.addAsyncCoreMatchers(j$.asyncMatchers);

    const expectationFactory = function(actual, spec) {
      return j$.Expectation.factory({
        matchersUtil: runableResources.makeMatchersUtil(),
        customMatchers: runableResources.customMatchers(),
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
      }
    };

    const handleThrowUnlessFailure = function(passed, result) {
      if (!passed) {
        /**
         * @interface
         * @name ThrowUnlessFailure
         * @extends Error
         * @description Represents a failure of an expectation evaluated with
         * {@link throwUnless}. Properties of this error are a subset of the
         * properties of {@link Expectation} and have the same values.
         * @property {String} matcherName - The name of the matcher that was executed for this expectation.
         * @property {String} message - The failure message for the expectation.
         * @property {Boolean} passed - Whether the expectation passed or failed.
         * @property {Object} expected - If the expectation failed, what was the expected value.
         * @property {Object} actual - If the expectation failed, what actual value was produced.
         */
        const error = new Error(result.message);
        error.passed = result.passed;
        error.message = result.message;
        error.expected = result.expected;
        error.actual = result.actual;
        error.matcherName = result.matcherName;
        throw error;
      }
    };

    const throwUnlessFactory = function(actual, spec) {
      return j$.Expectation.factory({
        matchersUtil: runableResources.makeMatchersUtil(),
        customMatchers: runableResources.customMatchers(),
        actual: actual,
        addExpectationResult: handleThrowUnlessFailure
      });
    };

    const throwUnlessAsyncFactory = function(actual, spec) {
      return j$.Expectation.asyncFactory({
        matchersUtil: runableResources.makeMatchersUtil(),
        customAsyncMatchers: runableResources.customAsyncMatchers(),
        actual: actual,
        addExpectationResult: handleThrowUnlessFailure
      });
    };

    // TODO: Unify recordLateError with recordLateExpectation? The extra
    // diagnostic info added by the latter is probably useful in most cases.
    function recordLateError(error) {
      const isExpectationResult =
        error.matcherName !== undefined && error.passed !== undefined;
      const result = isExpectationResult
        ? error
        : j$.buildExpectationResult({
            error,
            passed: false,
            matcherName: '',
            expected: '',
            actual: ''
          });
      routeLateFailure(result);
    }

    function recordLateExpectation(runable, runableType, result) {
      const delayedExpectationResult = {};
      Object.keys(result).forEach(function(k) {
        delayedExpectationResult[k] = result[k];
      });
      delayedExpectationResult.passed = false;
      delayedExpectationResult.globalErrorType = 'lateExpectation';
      delayedExpectationResult.message =
        runableType +
        ' "' +
        runable.getFullName() +
        '" ran a "' +
        result.matcherName +
        '" expectation after it finished.\n';

      if (result.message) {
        delayedExpectationResult.message +=
          'Message: "' + result.message + '"\n';
      }

      delayedExpectationResult.message +=
        '1. Did you forget to return or await the result of expectAsync?\n' +
        '2. Was done() invoked before an async operation completed?\n' +
        '3. Did an expectation follow a call to done()?';

      topSuite.result.failedExpectations.push(delayedExpectationResult);
    }

    function routeLateFailure(expectationResult) {
      // Report the result on the nearest ancestor suite that hasn't already
      // been reported done.
      for (let r = runner.currentRunable(); r; r = r.parentSuite) {
        if (!r.reportedDone) {
          if (r === topSuite) {
            expectationResult.globalErrorType = 'lateError';
          }

          r.result.failedExpectations.push(expectationResult);
          return;
        }
      }

      // If we get here, all results have been reported and there's nothing we
      // can do except log the result and hope the user sees it.
      console.error('Jasmine received a result after the suite finished:');
      console.error(expectationResult);
    }

    const asyncExpectationFactory = function(actual, spec, runableType) {
      return j$.Expectation.asyncFactory({
        matchersUtil: runableResources.makeMatchersUtil(),
        customAsyncMatchers: runableResources.customAsyncMatchers(),
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        if (runner.currentRunable() !== spec) {
          recordLateExpectation(spec, runableType, result);
        }
        return spec.addExpectationResult(passed, result);
      }
    };

    /**
     * Causes a deprecation warning to be logged to the console and reported to
     * reporters.
     *
     * The optional second parameter is an object that can have either of the
     * following properties:
     *
     * omitStackTrace: Whether to omit the stack trace. Optional. Defaults to
     * false. This option is ignored if the deprecation is an Error. Set this
     * when the stack trace will not contain anything that helps the user find
     * the source of the deprecation.
     *
     * ignoreRunnable: Whether to log the deprecation on the root suite, ignoring
     * the spec or suite that's running when it happens. Optional. Defaults to
     * false.
     *
     * @name Env#deprecated
     * @since 2.99
     * @function
     * @param {String|Error} deprecation The deprecation message
     * @param {Object} [options] Optional extra options, as described above
     */
    this.deprecated = function(deprecation, options) {
      const runable = runner.currentRunable() || topSuite;
      deprecator.addDeprecationWarning(runable, deprecation, options);
    };

    function queueRunnerFactory(options) {
      options.clearStack = options.clearStack || clearStack;
      options.timeout = {
        setTimeout: realSetTimeout,
        clearTimeout: realClearTimeout
      };
      options.fail = self.fail;
      options.globalErrors = globalErrors;
      options.onException =
        options.onException ||
        function(e) {
          (runner.currentRunable() || topSuite).handleException(e);
        };

      new j$.QueueRunner(options).execute();
    }

    const suiteBuilder = new j$.SuiteBuilder({
      env: this,
      expectationFactory,
      asyncExpectationFactory,
      onLateError: recordLateError,
      specResultCallback,
      specStarted,
      queueRunnerFactory
    });
    topSuite = suiteBuilder.topSuite;
    const deprecator = new j$.Deprecator(topSuite);

    /**
     * Provides the root suite, through which all suites and specs can be
     * accessed.
     * @function
     * @name Env#topSuite
     * @return {Suite} the root suite
     * @since 2.0.0
     */
    this.topSuite = function() {
      ensureNonParallel('topSuite');
      return topSuite.metadata;
    };

    /**
     * This represents the available reporter callback for an object passed to {@link Env#addReporter}.
     * @interface Reporter
     * @see custom_reporter
     */
    reporter = new j$.ReportDispatcher(
      j$.reporterEvents,
      function(options) {
        options.SkipPolicy = j$.NeverSkipPolicy;
        return queueRunnerFactory(options);
      },
      recordLateError
    );

    runner = new j$.Runner({
      topSuite,
      totalSpecsDefined: () => suiteBuilder.totalSpecsDefined,
      focusedRunables: () => suiteBuilder.focusedRunables,
      runableResources,
      reporter,
      queueRunnerFactory,
      getConfig: () => config,
      reportSpecDone
    });

    this.setParallelLoadingState = function(state) {
      parallelLoadingState = state;
    };

    this.parallelReset = function() {
      suiteBuilder.parallelReset();
      runner.parallelReset();
    };

    /**
     * Executes the specs.
     *
     * If called with no parameter or with a falsy parameter,
     * all specs will be executed except those that are excluded by a
     * [spec filter]{@link Configuration#specFilter} or other mechanism. If the
     * parameter is a list of spec/suite IDs, only those specs/suites will
     * be run.
     *
     * execute should not be called more than once unless the env has been
     * configured with `{autoCleanClosures: false}`.
     *
     * execute returns a promise. The promise will be resolved to the same
     * {@link JasmineDoneInfo|overall result} that's passed to a reporter's
     * `jasmineDone` method, even if the suite did not pass. To determine
     * whether the suite passed, check the value that the promise resolves to
     * or use a {@link Reporter}. The promise will be rejected in the case of
     * certain serious errors that prevent execution from starting.
     *
     * @name Env#execute
     * @since 2.0.0
     * @function
     * @async
     * @param {(string[])=} runablesToRun IDs of suites and/or specs to run
     * @return {Promise<JasmineDoneInfo>}
     */
    this.execute = async function(runablesToRun) {
      installGlobalErrors();

      if (parallelLoadingState) {
        validateConfigForParallel();
      }

      const result = await runner.execute(runablesToRun);
      this.cleanup_();
      return result;
    };

    /**
     * Add a custom reporter to the Jasmine environment.
     * @name Env#addReporter
     * @since 2.0.0
     * @function
     * @param {Reporter} reporterToAdd The reporter to be added.
     * @see custom_reporter
     */
    this.addReporter = function(reporterToAdd) {
      if (parallelLoadingState) {
        throw new Error('Reporters cannot be added via Env in parallel mode');
      }

      reporter.addReporter(reporterToAdd);
    };

    /**
     * Provide a fallback reporter if no other reporters have been specified.
     * @name Env#provideFallbackReporter
     * @since 2.5.0
     * @function
     * @param {Reporter} reporterToAdd The reporter
     * @see custom_reporter
     */
    this.provideFallbackReporter = function(reporterToAdd) {
      reporter.provideFallbackReporter(reporterToAdd);
    };

    /**
     * Clear all registered reporters
     * @name Env#clearReporters
     * @since 2.5.2
     * @function
     */
    this.clearReporters = function() {
      if (parallelLoadingState) {
        throw new Error('Reporters cannot be removed via Env in parallel mode');
      }

      reporter.clearReporters();
    };

    /**
     * Configures whether Jasmine should allow the same function to be spied on
     * more than once during the execution of a spec. By default, spying on
     * a function that is already a spy will cause an error.
     * @name Env#allowRespy
     * @function
     * @since 2.5.0
     * @param {boolean} allow Whether to allow respying
     */
    this.allowRespy = function(allow) {
      runableResources.spyRegistry.allowRespy(allow);
    };

    this.spyOn = function() {
      return runableResources.spyRegistry.spyOn.apply(
        runableResources.spyRegistry,
        arguments
      );
    };

    this.spyOnProperty = function() {
      return runableResources.spyRegistry.spyOnProperty.apply(
        runableResources.spyRegistry,
        arguments
      );
    };

    this.spyOnAllFunctions = function() {
      return runableResources.spyRegistry.spyOnAllFunctions.apply(
        runableResources.spyRegistry,
        arguments
      );
    };

    this.createSpy = function(name, originalFn) {
      return runableResources.spyFactory.createSpy(name, originalFn);
    };

    this.createSpyObj = function(baseName, methodNames, propertyNames) {
      return runableResources.spyFactory.createSpyObj(
        baseName,
        methodNames,
        propertyNames
      );
    };

    this.spyOnGlobalErrorsAsync = async function(fn) {
      const spy = this.createSpy('global error handler');
      const associatedRunable = runner.currentRunable();
      let cleanedUp = false;

      globalErrors.setOverrideListener(spy, () => {
        if (!cleanedUp) {
          const message =
            'Global error spy was not uninstalled. (Did you ' +
            'forget to await the return value of spyOnGlobalErrorsAsync?)';
          associatedRunable.addExpectationResult(false, {
            matcherName: '',
            passed: false,
            expected: '',
            actual: '',
            message,
            error: null
          });
        }

        cleanedUp = true;
      });

      try {
        const maybePromise = fn(spy);

        if (!j$.isPromiseLike(maybePromise)) {
          throw new Error(
            'The callback to spyOnGlobalErrorsAsync must be an async or promise-returning function'
          );
        }

        await maybePromise;
      } finally {
        if (!cleanedUp) {
          cleanedUp = true;
          globalErrors.removeOverrideListener();
        }
      }
    };

    function ensureIsNotNested(method) {
      const runable = runner.currentRunable();
      if (runable !== null && runable !== undefined) {
        throw new Error(
          "'" + method + "' should only be used in 'describe' function"
        );
      }
    }

    function ensureNonParallel(method) {
      if (parallelLoadingState) {
        throw new Error(`'${method}' is not available in parallel mode`);
      }
    }

    function ensureNonParallelOrInDescribe(msg) {
      if (parallelLoadingState && !suiteBuilder.inDescribe()) {
        throw new Error(msg);
      }
    }

    function ensureNonParallelOrInHelperOrInDescribe(method) {
      if (parallelLoadingState === 'specs' && !suiteBuilder.inDescribe()) {
        throw new Error(
          'In parallel mode, ' +
            method +
            ' must be in a describe block or in a helper file'
        );
      }
    }

    function validateConfigForParallel() {
      if (!config.random) {
        throw new Error('Randomization cannot be disabled in parallel mode');
      }

      if (config.seed !== null && config.seed !== undefined) {
        throw new Error('Random seed cannot be set in parallel mode');
      }
    }

    this.describe = function(description, definitionFn) {
      ensureIsNotNested('describe');
      const filename = callerCallerFilename();
      return suiteBuilder.describe(description, definitionFn, filename)
        .metadata;
    };

    this.xdescribe = function(description, definitionFn) {
      ensureIsNotNested('xdescribe');
      const filename = callerCallerFilename();
      return suiteBuilder.xdescribe(description, definitionFn, filename)
        .metadata;
    };

    this.fdescribe = function(description, definitionFn) {
      ensureIsNotNested('fdescribe');
      ensureNonParallel('fdescribe');
      const filename = callerCallerFilename();
      return suiteBuilder.fdescribe(description, definitionFn, filename)
        .metadata;
    };

    function specResultCallback(spec, result, next) {
      runableResources.clearForRunable(spec.id);
      runner.currentSpec = null;

      if (result.status === 'failed') {
        runner.hasFailures = true;
      }

      reportSpecDone(spec, result, next);
    }

    function specStarted(spec, suite, next) {
      runner.currentSpec = spec;
      runableResources.initForRunable(spec.id, suite.id);
      reporter.specStarted(spec.result).then(next);
    }

    function reportSpecDone(spec, result, next) {
      spec.reportedDone = true;
      reporter.specDone(result).then(next);
    }

    this.it = function(description, fn, timeout) {
      ensureIsNotNested('it');
      const filename = callerCallerFilename();
      return suiteBuilder.it(description, fn, timeout, filename).metadata;
    };

    this.xit = function(description, fn, timeout) {
      ensureIsNotNested('xit');
      const filename = callerCallerFilename();
      return suiteBuilder.xit(description, fn, timeout, filename).metadata;
    };

    this.fit = function(description, fn, timeout) {
      ensureIsNotNested('fit');
      ensureNonParallel('fit');
      const filename = callerCallerFilename();
      return suiteBuilder.fit(description, fn, timeout, filename).metadata;
    };

    /**
     * Sets a user-defined property that will be provided to reporters as part of the properties field of {@link SpecResult}
     * @name Env#setSpecProperty
     * @since 3.6.0
     * @function
     * @param {String} key The name of the property
     * @param {*} value The value of the property
     */
    this.setSpecProperty = function(key, value) {
      if (
        !runner.currentRunable() ||
        runner.currentRunable() == runner.currentSuite()
      ) {
        throw new Error(
          "'setSpecProperty' was used when there was no current spec"
        );
      }
      runner.currentRunable().setSpecProperty(key, value);
    };

    /**
     * Sets a user-defined property that will be provided to reporters as part of the properties field of {@link SuiteResult}
     * @name Env#setSuiteProperty
     * @since 3.6.0
     * @function
     * @param {String} key The name of the property
     * @param {*} value The value of the property
     */
    this.setSuiteProperty = function(key, value) {
      if (!runner.currentSuite()) {
        throw new Error(
          "'setSuiteProperty' was used when there was no current suite"
        );
      }
      runner.currentSuite().setSuiteProperty(key, value);
    };

    this.debugLog = function(msg) {
      const maybeSpec = runner.currentRunable();

      if (!maybeSpec || !maybeSpec.debugLog) {
        throw new Error("'debugLog' was called when there was no current spec");
      }

      maybeSpec.debugLog(msg);
    };

    this.expect = function(actual) {
      const runable = runner.currentRunable();

      if (!runable) {
        throw new Error(
          "'expect' was used when there was no current spec, this could be because an asynchronous test timed out"
        );
      }

      return runable.expectationFactory(actual, runable);
    };

    this.expectAsync = function(actual) {
      const runable = runner.currentRunable();

      if (!runable) {
        throw new Error(
          "'expectAsync' was used when there was no current spec, this could be because an asynchronous test timed out"
        );
      }

      return runable.asyncExpectationFactory(actual, runable);
    };

    this.throwUnless = function(actual) {
      const runable = runner.currentRunable();
      return throwUnlessFactory(actual, runable);
    };

    this.throwUnlessAsync = function(actual) {
      const runable = runner.currentRunable();
      return throwUnlessAsyncFactory(actual, runable);
    };

    this.beforeEach = function(beforeEachFunction, timeout) {
      ensureIsNotNested('beforeEach');
      ensureNonParallelOrInHelperOrInDescribe('beforeEach');
      suiteBuilder.beforeEach(beforeEachFunction, timeout);
    };

    this.beforeAll = function(beforeAllFunction, timeout) {
      ensureIsNotNested('beforeAll');
      // This message is -npm-specific, but currently parallel operation is
      // only supported via -npm.
      ensureNonParallelOrInDescribe(
        "In parallel mode, 'beforeAll' " +
          'must be in a describe block. Use the globalSetup config ' +
          'property for exactly-once setup in parallel mode.'
      );
      suiteBuilder.beforeAll(beforeAllFunction, timeout);
    };

    this.afterEach = function(afterEachFunction, timeout) {
      ensureIsNotNested('afterEach');
      ensureNonParallelOrInHelperOrInDescribe('afterEach');
      suiteBuilder.afterEach(afterEachFunction, timeout);
    };

    this.afterAll = function(afterAllFunction, timeout) {
      ensureIsNotNested('afterAll');
      // This message is -npm-specific, but currently parallel operation is
      // only supported via -npm.
      ensureNonParallelOrInDescribe(
        "In parallel mode, 'afterAll' " +
          'must be in a describe block. Use the globalTeardown config ' +
          'property for exactly-once teardown in parallel mode.'
      );
      suiteBuilder.afterAll(afterAllFunction, timeout);
    };

    this.pending = function(message) {
      let fullMessage = j$.Spec.pendingSpecExceptionMessage;
      if (message) {
        fullMessage += message;
      }
      throw fullMessage;
    };

    this.fail = function(error) {
      if (!runner.currentRunable()) {
        throw new Error(
          "'fail' was used when there was no current spec, this could be because an asynchronous test timed out"
        );
      }

      let message = 'Failed';
      if (error) {
        message += ': ';
        if (error.message) {
          message += error.message;
        } else if (j$.isString_(error)) {
          message += error;
        } else {
          // pretty print all kind of objects. This includes arrays.
          const pp = runableResources.makePrettyPrinter();
          message += pp(error);
        }
      }

      runner.currentRunable().addExpectationResult(false, {
        matcherName: '',
        passed: false,
        expected: '',
        actual: '',
        message: message,
        error: error && error.message ? error : null
      });

      if (config.stopSpecOnExpectationFailure) {
        throw new Error(message);
      }
    };

    this.cleanup_ = function() {
      if (globalErrors) {
        globalErrors.uninstall();
      }
    };
  }

  function callerCallerFilename() {
    const frames = new j$.StackTrace(new Error()).frames;
    // frames[3] should always exist except in Jasmine's own tests, which bypass
    // the global it/describe layer, but don't crash if it doesn't.
    return frames[3] && frames[3].file;
  }

  return Env;
};

getJasmineRequireObj().JsApiReporter = function(j$) {
  /**
   * @name jsApiReporter
   * @classdesc {@link Reporter} added by default in `boot.js` to record results for retrieval in javascript code. An instance is made available as `jsApiReporter` on the global object.
   * @class
   * @hideconstructor
   */
  function JsApiReporter(options) {
    const timer = options.timer || new j$.Timer();
    let status = 'loaded';

    this.started = false;
    this.finished = false;
    this.runDetails = {};

    this.jasmineStarted = function() {
      this.started = true;
      status = 'started';
      timer.start();
    };

    let executionTime;

    this.jasmineDone = function(runDetails) {
      this.finished = true;
      this.runDetails = runDetails;
      executionTime = timer.elapsed();
      status = 'done';
    };

    /**
     * Get the current status for the Jasmine environment.
     * @name jsApiReporter#status
     * @since 2.0.0
     * @function
     * @return {String} - One of `loaded`, `started`, or `done`
     */
    this.status = function() {
      return status;
    };

    const suites = [],
      suites_hash = {};

    this.suiteStarted = function(result) {
      suites_hash[result.id] = result;
    };

    this.suiteDone = function(result) {
      storeSuite(result);
    };

    /**
     * Get the results for a set of suites.
     *
     * Retrievable in slices for easier serialization.
     * @name jsApiReporter#suiteResults
     * @since 2.1.0
     * @function
     * @param {Number} index - The position in the suites list to start from.
     * @param {Number} length - Maximum number of suite results to return.
     * @return {SuiteResult[]}
     */
    this.suiteResults = function(index, length) {
      return suites.slice(index, index + length);
    };

    function storeSuite(result) {
      suites.push(result);
      suites_hash[result.id] = result;
    }

    /**
     * Get all of the suites in a single object, with their `id` as the key.
     * @name jsApiReporter#suites
     * @since 2.0.0
     * @function
     * @return {Object} - Map of suite id to {@link SuiteResult}
     */
    this.suites = function() {
      return suites_hash;
    };

    const specs = [];

    this.specDone = function(result) {
      specs.push(result);
    };

    /**
     * Get the results for a set of specs.
     *
     * Retrievable in slices for easier serialization.
     * @name jsApiReporter#specResults
     * @since 2.0.0
     * @function
     * @param {Number} index - The position in the specs list to start from.
     * @param {Number} length - Maximum number of specs results to return.
     * @return {SpecResult[]}
     */
    this.specResults = function(index, length) {
      return specs.slice(index, index + length);
    };

    /**
     * Get all spec results.
     * @name jsApiReporter#specs
     * @since 2.0.0
     * @function
     * @return {SpecResult[]}
     */
    this.specs = function() {
      return specs;
    };

    /**
     * Get the number of milliseconds it took for the full Jasmine suite to run.
     * @name jsApiReporter#executionTime
     * @since 2.0.0
     * @function
     * @return {Number}
     */
    this.executionTime = function() {
      return executionTime;
    };
  }

  return JsApiReporter;
};

getJasmineRequireObj().Any = function(j$) {
  function Any(expectedObject) {
    if (typeof expectedObject === 'undefined') {
      throw new TypeError(
        'jasmine.any() expects to be passed a constructor function. ' +
          'Please pass one or use jasmine.anything() to match any object.'
      );
    }
    this.expectedObject = expectedObject;
  }

  Any.prototype.asymmetricMatch = function(other) {
    if (this.expectedObject == String) {
      return typeof other == 'string' || other instanceof String;
    }

    if (this.expectedObject == Number) {
      return typeof other == 'number' || other instanceof Number;
    }

    if (this.expectedObject == Function) {
      return typeof other == 'function' || other instanceof Function;
    }

    if (this.expectedObject == Object) {
      return other !== null && typeof other == 'object';
    }

    if (this.expectedObject == Boolean) {
      return typeof other == 'boolean';
    }

    if (typeof Symbol != 'undefined' && this.expectedObject == Symbol) {
      return typeof other == 'symbol';
    }

    return other instanceof this.expectedObject;
  };

  Any.prototype.jasmineToString = function() {
    return '<jasmine.any(' + j$.fnNameFor(this.expectedObject) + ')>';
  };

  return Any;
};

getJasmineRequireObj().Anything = function(j$) {
  function Anything() {}

  Anything.prototype.asymmetricMatch = function(other) {
    return !j$.util.isUndefined(other) && other !== null;
  };

  Anything.prototype.jasmineToString = function() {
    return '<jasmine.anything>';
  };

  return Anything;
};

getJasmineRequireObj().ArrayContaining = function(j$) {
  function ArrayContaining(sample) {
    this.sample = sample;
  }

  ArrayContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.isArray_(this.sample)) {
      throw new Error(
        'You must provide an array to arrayContaining, not ' +
          j$.basicPrettyPrinter_(this.sample) +
          '.'
      );
    }

    // If the actual parameter is not an array, we can fail immediately, since it couldn't
    // possibly be an "array containing" anything. However, we also want an empty sample
    // array to match anything, so we need to double-check we aren't in that case
    if (!j$.isArray_(other) && this.sample.length > 0) {
      return false;
    }

    for (const item of this.sample) {
      if (!matchersUtil.contains(other, item)) {
        return false;
      }
    }

    return true;
  };

  ArrayContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.arrayContaining(' + pp(this.sample) + ')>';
  };

  return ArrayContaining;
};

getJasmineRequireObj().ArrayWithExactContents = function(j$) {
  function ArrayWithExactContents(sample) {
    this.sample = sample;
  }

  ArrayWithExactContents.prototype.asymmetricMatch = function(
    other,
    matchersUtil
  ) {
    if (!j$.isArray_(this.sample)) {
      throw new Error(
        'You must provide an array to arrayWithExactContents, not ' +
          j$.basicPrettyPrinter_(this.sample) +
          '.'
      );
    }

    if (this.sample.length !== other.length) {
      return false;
    }

    for (const item of this.sample) {
      if (!matchersUtil.contains(other, item)) {
        return false;
      }
    }

    return true;
  };

  ArrayWithExactContents.prototype.jasmineToString = function(pp) {
    return '<jasmine.arrayWithExactContents(' + pp(this.sample) + ')>';
  };

  return ArrayWithExactContents;
};

getJasmineRequireObj().Empty = function(j$) {
  function Empty() {}

  Empty.prototype.asymmetricMatch = function(other) {
    if (j$.isString_(other) || j$.isArray_(other) || j$.isTypedArray_(other)) {
      return other.length === 0;
    }

    if (j$.isMap(other) || j$.isSet(other)) {
      return other.size === 0;
    }

    if (j$.isObject_(other)) {
      return Object.keys(other).length === 0;
    }
    return false;
  };

  Empty.prototype.jasmineToString = function() {
    return '<jasmine.empty>';
  };

  return Empty;
};

getJasmineRequireObj().Falsy = function(j$) {
  function Falsy() {}

  Falsy.prototype.asymmetricMatch = function(other) {
    return !other;
  };

  Falsy.prototype.jasmineToString = function() {
    return '<jasmine.falsy>';
  };

  return Falsy;
};

getJasmineRequireObj().Is = function(j$) {
  class Is {
    constructor(expected) {
      this.expected_ = expected;
    }

    asymmetricMatch(actual) {
      return actual === this.expected_;
    }

    jasmineToString(pp) {
      return `<jasmine.is(${pp(this.expected_)})>`;
    }
  }

  return Is;
};

getJasmineRequireObj().MapContaining = function(j$) {
  function MapContaining(sample) {
    if (!j$.isMap(sample)) {
      throw new Error(
        'You must provide a map to `mapContaining`, not ' +
          j$.basicPrettyPrinter_(sample)
      );
    }

    this.sample = sample;
  }

  MapContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.isMap(other)) return false;

    for (const [key, value] of this.sample) {
      // for each key/value pair in `sample`
      // there should be at least one pair in `other` whose key and value both match
      let hasMatch = false;
      for (const [oKey, oValue] of other) {
        if (
          matchersUtil.equals(oKey, key) &&
          matchersUtil.equals(oValue, value)
        ) {
          hasMatch = true;
          break;
        }
      }

      if (!hasMatch) {
        return false;
      }
    }

    return true;
  };

  MapContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.mapContaining(' + pp(this.sample) + ')>';
  };

  return MapContaining;
};

getJasmineRequireObj().NotEmpty = function(j$) {
  function NotEmpty() {}

  NotEmpty.prototype.asymmetricMatch = function(other) {
    if (j$.isString_(other) || j$.isArray_(other) || j$.isTypedArray_(other)) {
      return other.length !== 0;
    }

    if (j$.isMap(other) || j$.isSet(other)) {
      return other.size !== 0;
    }

    if (j$.isObject_(other)) {
      return Object.keys(other).length !== 0;
    }

    return false;
  };

  NotEmpty.prototype.jasmineToString = function() {
    return '<jasmine.notEmpty>';
  };

  return NotEmpty;
};

getJasmineRequireObj().ObjectContaining = function(j$) {
  function ObjectContaining(sample) {
    this.sample = sample;
  }

  function hasProperty(obj, property) {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      return true;
    }

    return hasProperty(Object.getPrototypeOf(obj), property);
  }

  ObjectContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (typeof this.sample !== 'object') {
      throw new Error(
        "You must provide an object to objectContaining, not '" +
          this.sample +
          "'."
      );
    }
    if (typeof other !== 'object') {
      return false;
    }

    for (const property in this.sample) {
      if (
        !hasProperty(other, property) ||
        !matchersUtil.equals(this.sample[property], other[property])
      ) {
        return false;
      }
    }

    return true;
  };

  ObjectContaining.prototype.valuesForDiff_ = function(other, pp) {
    if (!j$.isObject_(other)) {
      return {
        self: this.jasmineToString(pp),
        other: other
      };
    }

    const filteredOther = {};
    Object.keys(this.sample).forEach(function(k) {
      // eq short-circuits comparison of objects that have different key sets,
      // so include all keys even if undefined.
      filteredOther[k] = other[k];
    });

    return {
      self: this.sample,
      other: filteredOther
    };
  };

  ObjectContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.objectContaining(' + pp(this.sample) + ')>';
  };

  return ObjectContaining;
};

getJasmineRequireObj().SetContaining = function(j$) {
  function SetContaining(sample) {
    if (!j$.isSet(sample)) {
      throw new Error(
        'You must provide a set to `setContaining`, not ' +
          j$.basicPrettyPrinter_(sample)
      );
    }

    this.sample = sample;
  }

  SetContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.isSet(other)) return false;

    for (const item of this.sample) {
      // for each item in `sample` there should be at least one matching item in `other`
      // (not using `matchersUtil.contains` because it compares set members by reference,
      // not by deep value equality)
      let hasMatch = false;
      for (const oItem of other) {
        if (matchersUtil.equals(oItem, item)) {
          hasMatch = true;
          break;
        }
      }

      if (!hasMatch) {
        return false;
      }
    }

    return true;
  };

  SetContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.setContaining(' + pp(this.sample) + ')>';
  };

  return SetContaining;
};

getJasmineRequireObj().StringContaining = function(j$) {
  function StringContaining(expected) {
    if (!j$.isString_(expected)) {
      throw new Error('Expected is not a String');
    }

    this.expected = expected;
  }

  StringContaining.prototype.asymmetricMatch = function(other) {
    if (!j$.isString_(other)) {
      // Arrays, etc. don't match no matter what their indexOf returns.
      return false;
    }

    return other.indexOf(this.expected) !== -1;
  };

  StringContaining.prototype.jasmineToString = function() {
    return '<jasmine.stringContaining("' + this.expected + '")>';
  };

  return StringContaining;
};

getJasmineRequireObj().StringMatching = function(j$) {
  function StringMatching(expected) {
    if (!j$.isString_(expected) && !j$.isA_('RegExp', expected)) {
      throw new Error('Expected is not a String or a RegExp');
    }

    this.regexp = new RegExp(expected);
  }

  StringMatching.prototype.asymmetricMatch = function(other) {
    return this.regexp.test(other);
  };

  StringMatching.prototype.jasmineToString = function() {
    return '<jasmine.stringMatching(' + this.regexp + ')>';
  };

  return StringMatching;
};

getJasmineRequireObj().Truthy = function(j$) {
  function Truthy() {}

  Truthy.prototype.asymmetricMatch = function(other) {
    return !!other;
  };

  Truthy.prototype.jasmineToString = function() {
    return '<jasmine.truthy>';
  };

  return Truthy;
};

//TODO: expectation result may make more sense as a presentation of an expectation.
getJasmineRequireObj().buildExpectationResult = function(j$) {
  function buildExpectationResult(options) {
    const exceptionFormatter = new j$.ExceptionFormatter();

    /**
     * @typedef Expectation
     * @property {String} matcherName - The name of the matcher that was executed for this expectation.
     * @property {String} message - The failure message for the expectation.
     * @property {String} stack - The stack trace for the failure if available.
     * @property {Boolean} passed - Whether the expectation passed or failed.
     * @property {Object} expected - If the expectation failed, what was the expected value.
     * @property {Object} actual - If the expectation failed, what actual value was produced.
     * @property {String|undefined} globalErrorType - The type of an error that
     * is reported on the top suite. Valid values are undefined, "afterAll",
     * "load", "lateExpectation", and "lateError".
     */
    const result = {
      matcherName: options.matcherName,
      message: message(),
      stack: options.omitStackTrace ? '' : stack(),
      passed: options.passed
    };

    if (!result.passed) {
      result.expected = options.expected;
      result.actual = options.actual;

      if (options.error && !j$.isString_(options.error)) {
        if ('code' in options.error) {
          result.code = options.error.code;
        }

        if (
          options.error.code === 'ERR_ASSERTION' &&
          options.expected === '' &&
          options.actual === ''
        ) {
          result.expected = options.error.expected;
          result.actual = options.error.actual;
          result.matcherName = 'assert ' + options.error.operator;
        }
      }
    }

    return result;

    function message() {
      if (options.passed) {
        return 'Passed.';
      } else if (options.message) {
        return options.message;
      } else if (options.error) {
        return exceptionFormatter.message(options.error);
      }
      return '';
    }

    function stack() {
      if (options.passed) {
        return '';
      }

      let error = options.error;

      if (!error) {
        if (options.errorForStack) {
          error = options.errorForStack;
        } else if (options.stack) {
          error = options;
        } else {
          error = new Error(message());
        }
      }
      // Omit the message from the stack trace because it will be
      // included elsewhere.
      return exceptionFormatter.stack(error, { omitMessage: true });
    }
  }

  return buildExpectationResult;
};

getJasmineRequireObj().CallTracker = function(j$) {
  /**
   * @namespace Spy#calls
   * @since 2.0.0
   */
  function CallTracker() {
    let calls = [];
    const opts = {};

    this.track = function(context) {
      if (opts.cloneArgs) {
        context.args = j$.util.cloneArgs(context.args);
      }
      calls.push(context);
    };

    /**
     * Check whether this spy has been invoked.
     * @name Spy#calls#any
     * @since 2.0.0
     * @function
     * @return {Boolean}
     */
    this.any = function() {
      return !!calls.length;
    };

    /**
     * Get the number of invocations of this spy.
     * @name Spy#calls#count
     * @since 2.0.0
     * @function
     * @return {Integer}
     */
    this.count = function() {
      return calls.length;
    };

    /**
     * Get the arguments that were passed to a specific invocation of this spy.
     * @name Spy#calls#argsFor
     * @since 2.0.0
     * @function
     * @param {Integer} index The 0-based invocation index.
     * @return {Array}
     */
    this.argsFor = function(index) {
      const call = calls[index];
      return call ? call.args : [];
    };

    /**
     * Get the "this" object that was passed to a specific invocation of this spy.
     * @name Spy#calls#thisFor
     * @since 3.8.0
     * @function
     * @param {Integer} index The 0-based invocation index.
     * @return {Object?}
     */
    this.thisFor = function(index) {
      const call = calls[index];
      return call ? call.object : undefined;
    };

    /**
     * Get the raw calls array for this spy.
     * @name Spy#calls#all
     * @since 2.0.0
     * @function
     * @return {Spy.callData[]}
     */
    this.all = function() {
      return calls;
    };

    /**
     * Get all of the arguments for each invocation of this spy in the order they were received.
     * @name Spy#calls#allArgs
     * @since 2.0.0
     * @function
     * @return {Array}
     */
    this.allArgs = function() {
      return calls.map(c => c.args);
    };

    /**
     * Get the first invocation of this spy.
     * @name Spy#calls#first
     * @since 2.0.0
     * @function
     * @return {ObjecSpy.callData}
     */
    this.first = function() {
      return calls[0];
    };

    /**
     * Get the most recent invocation of this spy.
     * @name Spy#calls#mostRecent
     * @since 2.0.0
     * @function
     * @return {ObjecSpy.callData}
     */
    this.mostRecent = function() {
      return calls[calls.length - 1];
    };

    /**
     * Reset this spy as if it has never been called.
     * @name Spy#calls#reset
     * @since 2.0.0
     * @function
     */
    this.reset = function() {
      calls = [];
    };

    /**
     * Set this spy to do a shallow clone of arguments passed to each invocation.
     * @name Spy#calls#saveArgumentsByValue
     * @since 2.5.0
     * @function
     */
    this.saveArgumentsByValue = function() {
      opts.cloneArgs = true;
    };
  }

  return CallTracker;
};

getJasmineRequireObj().clearStack = function(j$) {
  const maxInlineCallCount = 10;

  function browserQueueMicrotaskImpl(global) {
    const { setTimeout, queueMicrotask } = global;
    let currentCallCount = 0;
    return function clearStack(fn) {
      currentCallCount++;

      if (currentCallCount < maxInlineCallCount) {
        queueMicrotask(fn);
      } else {
        currentCallCount = 0;
        setTimeout(fn);
      }
    };
  }

  function nodeQueueMicrotaskImpl(global) {
    const { queueMicrotask } = global;

    return function(fn) {
      queueMicrotask(fn);
    };
  }

  function messageChannelImpl(global) {
    const { MessageChannel, setTimeout } = global;
    const channel = new MessageChannel();
    let head = {};
    let tail = head;

    let taskRunning = false;
    channel.port1.onmessage = function() {
      head = head.next;
      const task = head.task;
      delete head.task;

      if (taskRunning) {
        setTimeout(task, 0);
      } else {
        try {
          taskRunning = true;
          task();
        } finally {
          taskRunning = false;
        }
      }
    };

    let currentCallCount = 0;
    return function clearStack(fn) {
      currentCallCount++;

      if (currentCallCount < maxInlineCallCount) {
        tail = tail.next = { task: fn };
        channel.port2.postMessage(0);
      } else {
        currentCallCount = 0;
        setTimeout(fn);
      }
    };
  }

  function getClearStack(global) {
    const NODE_JS =
      global.process &&
      global.process.versions &&
      typeof global.process.versions.node === 'string';

    const SAFARI =
      global.navigator &&
      /^((?!chrome|android).)*safari/i.test(global.navigator.userAgent);

    if (NODE_JS) {
      // Unlike browsers, Node doesn't require us to do a periodic setTimeout
      // so we avoid the overhead.
      return nodeQueueMicrotaskImpl(global);
    } else if (
      SAFARI ||
      j$.util.isUndefined(global.MessageChannel) /* tests */
    ) {
      // queueMicrotask is dramatically faster than MessageChannel in Safari,
      // at least through version 16.
      // Some of our own integration tests provide a mock queueMicrotask in all
      // environments because it's simpler to mock than MessageChannel.
      return browserQueueMicrotaskImpl(global);
    } else {
      // MessageChannel is faster than queueMicrotask in supported browsers
      // other than Safari.
      return messageChannelImpl(global);
    }
  }

  return getClearStack;
};

getJasmineRequireObj().Clock = function() {
  /* global process */
  const NODE_JS =
    typeof process !== 'undefined' &&
    process.versions &&
    typeof process.versions.node === 'string';

  /**
   * @class Clock
   * @since 1.3.0
   * @classdesc Jasmine's mock clock is used when testing time dependent code.<br>
   * _Note:_ Do not construct this directly. You can get the current clock with
   * {@link jasmine.clock}.
   * @hideconstructor
   */
  function Clock(global, delayedFunctionSchedulerFactory, mockDate) {
    const realTimingFunctions = {
      setTimeout: global.setTimeout,
      clearTimeout: global.clearTimeout,
      setInterval: global.setInterval,
      clearInterval: global.clearInterval
    };
    const fakeTimingFunctions = {
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval
    };
    let installed = false;
    let delayedFunctionScheduler;
    let timer;

    this.FakeTimeout = FakeTimeout;

    /**
     * Install the mock clock over the built-in methods.
     * @name Clock#install
     * @since 2.0.0
     * @function
     * @return {Clock}
     */
    this.install = function() {
      if (!originalTimingFunctionsIntact()) {
        throw new Error(
          'Jasmine Clock was unable to install over custom global timer functions. Is the clock already installed?'
        );
      }
      replace(global, fakeTimingFunctions);
      timer = fakeTimingFunctions;
      delayedFunctionScheduler = delayedFunctionSchedulerFactory();
      installed = true;

      return this;
    };

    /**
     * Uninstall the mock clock, returning the built-in methods to their places.
     * @name Clock#uninstall
     * @since 2.0.0
     * @function
     */
    this.uninstall = function() {
      delayedFunctionScheduler = null;
      mockDate.uninstall();
      replace(global, realTimingFunctions);

      timer = realTimingFunctions;
      installed = false;
    };

    /**
     * Execute a function with a mocked Clock
     *
     * The clock will be {@link Clock#install|install}ed before the function is called and {@link Clock#uninstall|uninstall}ed in a `finally` after the function completes.
     * @name Clock#withMock
     * @since 2.3.0
     * @function
     * @param {Function} closure The function to be called.
     */
    this.withMock = function(closure) {
      this.install();
      try {
        closure();
      } finally {
        this.uninstall();
      }
    };

    /**
     * Instruct the installed Clock to also mock the date returned by `new Date()`
     * @name Clock#mockDate
     * @since 2.1.0
     * @function
     * @param {Date} [initialDate=now] The `Date` to provide.
     */
    this.mockDate = function(initialDate) {
      mockDate.install(initialDate);
    };

    this.setTimeout = function(fn, delay, params) {
      return Function.prototype.apply.apply(timer.setTimeout, [
        global,
        arguments
      ]);
    };

    this.setInterval = function(fn, delay, params) {
      return Function.prototype.apply.apply(timer.setInterval, [
        global,
        arguments
      ]);
    };

    this.clearTimeout = function(id) {
      return Function.prototype.call.apply(timer.clearTimeout, [global, id]);
    };

    this.clearInterval = function(id) {
      return Function.prototype.call.apply(timer.clearInterval, [global, id]);
    };

    /**
     * Tick the Clock forward, running any enqueued timeouts along the way
     * @name Clock#tick
     * @since 1.3.0
     * @function
     * @param {int} millis The number of milliseconds to tick.
     */
    this.tick = function(millis) {
      if (installed) {
        delayedFunctionScheduler.tick(millis, function(millis) {
          mockDate.tick(millis);
        });
      } else {
        throw new Error(
          'Mock clock is not installed, use jasmine.clock().install()'
        );
      }
    };

    return this;

    function originalTimingFunctionsIntact() {
      return (
        global.setTimeout === realTimingFunctions.setTimeout &&
        global.clearTimeout === realTimingFunctions.clearTimeout &&
        global.setInterval === realTimingFunctions.setInterval &&
        global.clearInterval === realTimingFunctions.clearInterval
      );
    }

    function replace(dest, source) {
      for (const prop in source) {
        dest[prop] = source[prop];
      }
    }

    function setTimeout(fn, delay) {
      if (!NODE_JS) {
        return delayedFunctionScheduler.scheduleFunction(
          fn,
          delay,
          argSlice(arguments, 2)
        );
      }

      const timeout = new FakeTimeout();

      delayedFunctionScheduler.scheduleFunction(
        fn,
        delay,
        argSlice(arguments, 2),
        false,
        timeout
      );

      return timeout;
    }

    function clearTimeout(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function setInterval(fn, interval) {
      if (!NODE_JS) {
        return delayedFunctionScheduler.scheduleFunction(
          fn,
          interval,
          argSlice(arguments, 2),
          true
        );
      }

      const timeout = new FakeTimeout();

      delayedFunctionScheduler.scheduleFunction(
        fn,
        interval,
        argSlice(arguments, 2),
        true,
        timeout
      );

      return timeout;
    }

    function clearInterval(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function argSlice(argsObj, n) {
      return Array.prototype.slice.call(argsObj, n);
    }
  }

  /**
   * Mocks Node.js Timeout class
   */
  function FakeTimeout() {}

  FakeTimeout.prototype.ref = function() {
    return this;
  };

  FakeTimeout.prototype.unref = function() {
    return this;
  };

  return Clock;
};

getJasmineRequireObj().CompleteOnFirstErrorSkipPolicy = function(j$) {
  function CompleteOnFirstErrorSkipPolicy(queueableFns) {
    this.queueableFns_ = queueableFns;
    this.erroredFnIx_ = null;
  }

  CompleteOnFirstErrorSkipPolicy.prototype.skipTo = function(lastRanFnIx) {
    let i;

    for (
      i = lastRanFnIx + 1;
      i < this.queueableFns_.length && this.shouldSkip_(i);
      i++
    ) {}
    return i;
  };

  CompleteOnFirstErrorSkipPolicy.prototype.fnErrored = function(fnIx) {
    this.erroredFnIx_ = fnIx;
  };

  CompleteOnFirstErrorSkipPolicy.prototype.shouldSkip_ = function(fnIx) {
    if (this.erroredFnIx_ === null) {
      return false;
    }

    const fn = this.queueableFns_[fnIx];
    const candidateSuite = fn.suite;
    const errorSuite = this.queueableFns_[this.erroredFnIx_].suite;
    const wasCleanupFn =
      fn.type === 'afterEach' ||
      fn.type === 'afterAll' ||
      fn.type === 'specCleanup';
    return (
      !wasCleanupFn ||
      (candidateSuite && isDescendent(candidateSuite, errorSuite))
    );
  };

  function isDescendent(candidate, ancestor) {
    if (!candidate.parentSuite) {
      return false;
    } else if (candidate.parentSuite === ancestor) {
      return true;
    } else {
      return isDescendent(candidate.parentSuite, ancestor);
    }
  }

  return CompleteOnFirstErrorSkipPolicy;
};

// Warning: don't add "use strict" to this file. Doing so potentially changes
// the behavior of user code that does things like setTimeout("var x = 1;")
// while the mock clock is installed.
getJasmineRequireObj().DelayedFunctionScheduler = function(j$) {
  function DelayedFunctionScheduler() {
    this.scheduledLookup_ = [];
    this.scheduledFunctions_ = {};
    this.currentTime_ = 0;
    this.delayedFnCount_ = 0;
    this.deletedKeys_ = [];

    this.tick = function(millis, tickDate) {
      millis = millis || 0;
      const endTime = this.currentTime_ + millis;

      this.runScheduledFunctions_(endTime, tickDate);
    };

    this.scheduleFunction = function(
      funcToCall,
      millis,
      params,
      recurring,
      timeoutKey,
      runAtMillis
    ) {
      let f;
      if (typeof funcToCall === 'string') {
        // setTimeout("some code") and setInterval("some code") are legal, if
        // not recommended. We don't do that ourselves, but user code might.
        // This allows such code to work when the mock clock is installed.
        f = function() {
          // eslint-disable-next-line no-eval
          return eval(funcToCall);
        };
      } else {
        f = funcToCall;
      }

      millis = millis || 0;
      timeoutKey = timeoutKey || ++this.delayedFnCount_;
      runAtMillis = runAtMillis || this.currentTime_ + millis;

      const funcToSchedule = {
        runAtMillis: runAtMillis,
        funcToCall: f,
        recurring: recurring,
        params: params,
        timeoutKey: timeoutKey,
        millis: millis
      };

      if (runAtMillis in this.scheduledFunctions_) {
        this.scheduledFunctions_[runAtMillis].push(funcToSchedule);
      } else {
        this.scheduledFunctions_[runAtMillis] = [funcToSchedule];
        this.scheduledLookup_.push(runAtMillis);
        this.scheduledLookup_.sort(function(a, b) {
          return a - b;
        });
      }

      return timeoutKey;
    };

    this.removeFunctionWithId = function(timeoutKey) {
      this.deletedKeys_.push(timeoutKey);

      for (const runAtMillis in this.scheduledFunctions_) {
        const funcs = this.scheduledFunctions_[runAtMillis];
        const i = indexOfFirstToPass(funcs, function(func) {
          return func.timeoutKey === timeoutKey;
        });

        if (i > -1) {
          if (funcs.length === 1) {
            delete this.scheduledFunctions_[runAtMillis];
            this.deleteFromLookup_(runAtMillis);
          } else {
            funcs.splice(i, 1);
          }

          // intervals get rescheduled when executed, so there's never more
          // than a single scheduled function with a given timeoutKey
          break;
        }
      }
    };

    return this;
  }

  DelayedFunctionScheduler.prototype.runScheduledFunctions_ = function(
    endTime,
    tickDate
  ) {
    tickDate = tickDate || function() {};
    if (
      this.scheduledLookup_.length === 0 ||
      this.scheduledLookup_[0] > endTime
    ) {
      if (endTime >= this.currentTime_) {
        tickDate(endTime - this.currentTime_);
        this.currentTime_ = endTime;
      }
      return;
    }

    do {
      this.deletedKeys_ = [];
      const newCurrentTime = this.scheduledLookup_.shift();
      if (newCurrentTime >= this.currentTime_) {
        tickDate(newCurrentTime - this.currentTime_);
        this.currentTime_ = newCurrentTime;
      }

      const funcsToRun = this.scheduledFunctions_[this.currentTime_];

      delete this.scheduledFunctions_[this.currentTime_];

      for (const fn of funcsToRun) {
        if (fn.recurring) {
          this.reschedule_(fn);
        }
      }

      for (const fn of funcsToRun) {
        if (this.deletedKeys_.includes(fn.timeoutKey)) {
          // skip a timeoutKey deleted whilst we were running
          return;
        }
        fn.funcToCall.apply(null, fn.params || []);
      }
      this.deletedKeys_ = [];
    } while (
      this.scheduledLookup_.length > 0 &&
      // checking first if we're out of time prevents setTimeout(0)
      // scheduled in a funcToRun from forcing an extra iteration
      this.currentTime_ !== endTime &&
      this.scheduledLookup_[0] <= endTime
    );

    // ran out of functions to call, but still time left on the clock
    if (endTime >= this.currentTime_) {
      tickDate(endTime - this.currentTime_);
      this.currentTime_ = endTime;
    }
  };

  DelayedFunctionScheduler.prototype.reschedule_ = function(scheduledFn) {
    this.scheduleFunction(
      scheduledFn.funcToCall,
      scheduledFn.millis,
      scheduledFn.params,
      true,
      scheduledFn.timeoutKey,
      scheduledFn.runAtMillis + scheduledFn.millis
    );
  };

  DelayedFunctionScheduler.prototype.deleteFromLookup_ = function(key) {
    const value = Number(key);
    const i = indexOfFirstToPass(this.scheduledLookup_, function(millis) {
      return millis === value;
    });

    if (i > -1) {
      this.scheduledLookup_.splice(i, 1);
    }
  };

  function indexOfFirstToPass(array, testFn) {
    let index = -1;

    for (let i = 0; i < array.length; ++i) {
      if (testFn(array[i])) {
        index = i;
        break;
      }
    }

    return index;
  }

  return DelayedFunctionScheduler;
};

getJasmineRequireObj().Deprecator = function(j$) {
  function Deprecator(topSuite) {
    this.topSuite_ = topSuite;
    this.verbose_ = false;
    this.toSuppress_ = [];
  }

  const verboseNote =
    'Note: This message will be shown only once. Set the verboseDeprecations ' +
    'config property to true to see every occurrence.';

  Deprecator.prototype.verboseDeprecations = function(enabled) {
    this.verbose_ = enabled;
  };

  // runnable is a spec or a suite.
  // deprecation is a string or an Error.
  // See Env#deprecated for a description of the options argument.
  Deprecator.prototype.addDeprecationWarning = function(
    runnable,
    deprecation,
    options
  ) {
    options = options || {};

    if (!this.verbose_ && !j$.isError_(deprecation)) {
      if (this.toSuppress_.indexOf(deprecation) !== -1) {
        return;
      }
      this.toSuppress_.push(deprecation);
    }

    this.log_(runnable, deprecation, options);
    this.report_(runnable, deprecation, options);
  };

  Deprecator.prototype.log_ = function(runnable, deprecation, options) {
    if (j$.isError_(deprecation)) {
      console.error(deprecation);
      return;
    }

    let context;

    if (runnable === this.topSuite_ || options.ignoreRunnable) {
      context = '';
    } else if (runnable.children) {
      context = ' (in suite: ' + runnable.getFullName() + ')';
    } else {
      context = ' (in spec: ' + runnable.getFullName() + ')';
    }

    if (!options.omitStackTrace) {
      context += '\n' + this.stackTrace_();
    }

    if (!this.verbose_) {
      context += '\n' + verboseNote;
    }

    console.error('DEPRECATION: ' + deprecation + context);
  };

  Deprecator.prototype.stackTrace_ = function() {
    const formatter = new j$.ExceptionFormatter();
    return formatter.stack(j$.util.errorWithStack()).replace(/^Error\n/m, '');
  };

  Deprecator.prototype.report_ = function(runnable, deprecation, options) {
    if (options.ignoreRunnable) {
      runnable = this.topSuite_;
    }

    if (j$.isError_(deprecation)) {
      runnable.addDeprecationWarning(deprecation);
      return;
    }

    if (!this.verbose_) {
      deprecation += '\n' + verboseNote;
    }

    runnable.addDeprecationWarning({
      message: deprecation,
      omitStackTrace: options.omitStackTrace || false
    });
  };

  return Deprecator;
};

getJasmineRequireObj().errors = function() {
  function ExpectationFailed() {}

  ExpectationFailed.prototype = new Error();
  ExpectationFailed.prototype.constructor = ExpectationFailed;

  return {
    ExpectationFailed: ExpectationFailed
  };
};

getJasmineRequireObj().ExceptionFormatter = function(j$) {
  const ignoredProperties = [
    'name',
    'message',
    'stack',
    'fileName',
    'sourceURL',
    'line',
    'lineNumber',
    'column',
    'description',
    'jasmineMessage'
  ];

  function ExceptionFormatter(options) {
    const jasmineFile =
      (options && options.jasmineFile) || j$.util.jasmineFile();
    this.message = function(error) {
      let message = '';

      if (error.jasmineMessage) {
        message += error.jasmineMessage;
      } else if (error.name && error.message) {
        message += error.name + ': ' + error.message;
      } else if (error.message) {
        message += error.message;
      } else {
        message += error.toString() + ' thrown';
      }

      if (error.fileName || error.sourceURL) {
        message += ' in ' + (error.fileName || error.sourceURL);
      }

      if (error.line || error.lineNumber) {
        message += ' (line ' + (error.line || error.lineNumber) + ')';
      }

      return message;
    };

    this.stack = function(error, { omitMessage } = {}) {
      if (!error || !error.stack) {
        return null;
      }

      const lines = this.stack_(error, {
        messageHandling: omitMessage ? 'omit' : undefined
      });
      return lines.join('\n');
    };

    // messageHandling can be falsy (unspecified), 'omit', or 'require'
    this.stack_ = function(error, { messageHandling }) {
      let lines = formatProperties(error).split('\n');

      if (lines[lines.length - 1] === '') {
        lines.pop();
      }

      const stackTrace = new j$.StackTrace(error);
      lines = lines.concat(filterJasmine(stackTrace));

      if (messageHandling === 'require') {
        lines.unshift(stackTrace.message || 'Error: ' + error.message);
      } else if (messageHandling !== 'omit' && stackTrace.message) {
        lines.unshift(stackTrace.message);
      }

      if (error.cause && error.cause instanceof Error) {
        const substack = this.stack_(error.cause, {
          messageHandling: 'require'
        });
        substack[0] = 'Caused by: ' + substack[0];
        lines = lines.concat(substack);
      }

      return lines;
    };

    function filterJasmine(stackTrace) {
      const result = [];
      const jasmineMarker =
        stackTrace.style === 'webkit' ? '<Jasmine>' : '    at <Jasmine>';

      stackTrace.frames.forEach(function(frame) {
        if (frame.file !== jasmineFile) {
          result.push(frame.raw);
        } else if (result[result.length - 1] !== jasmineMarker) {
          result.push(jasmineMarker);
        }
      });

      return result;
    }

    function formatProperties(error) {
      if (!(error instanceof Object)) {
        return;
      }

      const result = {};
      let empty = true;

      for (const prop of Object.keys(error)) {
        if (ignoredProperties.includes(prop)) {
          continue;
        }
        result[prop] = error[prop];
        empty = false;
      }

      if (!empty) {
        return 'error properties: ' + j$.basicPrettyPrinter_(result) + '\n';
      }

      return '';
    }
  }

  return ExceptionFormatter;
};

getJasmineRequireObj().Expectation = function(j$) {
  /**
   * Matchers that come with Jasmine out of the box.
   * @namespace matchers
   */
  function Expectation(options) {
    this.expector = new j$.Expector(options);

    const customMatchers = options.customMatchers || {};
    for (const matcherName in customMatchers) {
      this[matcherName] = wrapSyncCompare(
        matcherName,
        customMatchers[matcherName]
      );
    }
  }

  /**
   * Add some context for an {@link expect}
   * @function
   * @name matchers#withContext
   * @since 3.3.0
   * @param {String} message - Additional context to show when the matcher fails
   * @return {matchers}
   */
  Expectation.prototype.withContext = function withContext(message) {
    return addFilter(this, new ContextAddingFilter(message));
  };

  /**
   * Invert the matcher following this {@link expect}
   * @member
   * @name matchers#not
   * @since 1.3.0
   * @type {matchers}
   * @example
   * expect(something).not.toBe(true);
   */
  Object.defineProperty(Expectation.prototype, 'not', {
    get: function() {
      return addFilter(this, syncNegatingFilter);
    }
  });

  /**
   * Asynchronous matchers that operate on an actual value which is a promise,
   * and return a promise.
   *
   * Most async matchers will wait indefinitely for the promise to be resolved
   * or rejected, resulting in a spec timeout if that never happens. If you
   * expect that the promise will already be resolved or rejected at the time
   * the matcher is called, you can use the {@link async-matchers#already}
   * modifier to get a faster failure with a more helpful message.
   *
   * Note: Specs must await the result of each async matcher, return the
   * promise returned by the matcher, or return a promise that's derived from
   * the one returned by the matcher. Otherwise the matcher will not be
   * evaluated before the spec completes.
   *
   * @example
   * // Good
   * await expectAsync(aPromise).toBeResolved();
   * @example
   * // Good
   * return expectAsync(aPromise).toBeResolved();
   * @example
   * // Good
   * return expectAsync(aPromise).toBeResolved()
   *  .then(function() {
   *    // more spec code
   *  });
   * @example
   * // Bad
   * expectAsync(aPromise).toBeResolved();
   * @namespace async-matchers
   */
  function AsyncExpectation(options) {
    this.expector = new j$.Expector(options);

    const customAsyncMatchers = options.customAsyncMatchers || {};
    for (const matcherName in customAsyncMatchers) {
      this[matcherName] = wrapAsyncCompare(
        matcherName,
        customAsyncMatchers[matcherName]
      );
    }
  }

  /**
   * Add some context for an {@link expectAsync}
   * @function
   * @name async-matchers#withContext
   * @since 3.3.0
   * @param {String} message - Additional context to show when the async matcher fails
   * @return {async-matchers}
   */
  AsyncExpectation.prototype.withContext = function withContext(message) {
    return addFilter(this, new ContextAddingFilter(message));
  };

  /**
   * Invert the matcher following this {@link expectAsync}
   * @member
   * @name async-matchers#not
   * @type {async-matchers}
   * @example
   * await expectAsync(myPromise).not.toBeResolved();
   * @example
   * return expectAsync(myPromise).not.toBeResolved();
   */
  Object.defineProperty(AsyncExpectation.prototype, 'not', {
    get: function() {
      return addFilter(this, asyncNegatingFilter);
    }
  });

  /**
   * Fail as soon as possible if the actual is pending.
   * Otherwise evaluate the matcher.
   * @member
   * @name async-matchers#already
   * @since 3.8.0
   * @type {async-matchers}
   * @example
   * await expectAsync(myPromise).already.toBeResolved();
   * @example
   * return expectAsync(myPromise).already.toBeResolved();
   */
  Object.defineProperty(AsyncExpectation.prototype, 'already', {
    get: function() {
      return addFilter(this, expectSettledPromiseFilter);
    }
  });

  function wrapSyncCompare(name, matcherFactory) {
    return function() {
      const result = this.expector.compare(name, matcherFactory, arguments);
      this.expector.processResult(result);
    };
  }

  function wrapAsyncCompare(name, matcherFactory) {
    return function() {
      // Capture the call stack here, before we go async, so that it will contain
      // frames that are relevant to the user instead of just parts of Jasmine.
      const errorForStack = j$.util.errorWithStack();

      return this.expector
        .compare(name, matcherFactory, arguments)
        .then(result => {
          this.expector.processResult(result, errorForStack);
        });
    };
  }

  function addCoreMatchers(prototype, matchers, wrapper) {
    for (const matcherName in matchers) {
      const matcher = matchers[matcherName];
      prototype[matcherName] = wrapper(matcherName, matcher);
    }
  }

  function addFilter(source, filter) {
    const result = Object.create(source);
    result.expector = source.expector.addFilter(filter);
    return result;
  }

  function negatedFailureMessage(result, matcherName, args, matchersUtil) {
    if (result.message) {
      if (j$.isFunction_(result.message)) {
        return result.message();
      } else {
        return result.message;
      }
    }

    args = args.slice();
    args.unshift(true);
    args.unshift(matcherName);
    return matchersUtil.buildFailureMessage.apply(matchersUtil, args);
  }

  function negate(result) {
    result.pass = !result.pass;
    return result;
  }

  const syncNegatingFilter = {
    selectComparisonFunc: function(matcher) {
      function defaultNegativeCompare() {
        return negate(matcher.compare.apply(null, arguments));
      }

      return matcher.negativeCompare || defaultNegativeCompare;
    },
    buildFailureMessage: negatedFailureMessage
  };

  const asyncNegatingFilter = {
    selectComparisonFunc: function(matcher) {
      function defaultNegativeCompare() {
        return matcher.compare.apply(this, arguments).then(negate);
      }

      return matcher.negativeCompare || defaultNegativeCompare;
    },
    buildFailureMessage: negatedFailureMessage
  };

  const expectSettledPromiseFilter = {
    selectComparisonFunc: function(matcher) {
      return function(actual) {
        const matcherArgs = arguments;

        return j$.isPending_(actual).then(function(isPending) {
          if (isPending) {
            return {
              pass: false,
              message:
                'Expected a promise to be settled (via ' +
                'expectAsync(...).already) but it was pending.'
            };
          } else {
            return matcher.compare.apply(null, matcherArgs);
          }
        });
      };
    }
  };

  function ContextAddingFilter(message) {
    this.message = message;
  }

  ContextAddingFilter.prototype.modifyFailureMessage = function(msg) {
    if (msg.indexOf('\n') === -1) {
      return this.message + ': ' + msg;
    } else {
      return this.message + ':\n' + indent(msg);
    }
  };

  function indent(s) {
    return s.replace(/^/gm, '    ');
  }

  return {
    factory: function(options) {
      return new Expectation(options || {});
    },
    addCoreMatchers: function(matchers) {
      addCoreMatchers(Expectation.prototype, matchers, wrapSyncCompare);
    },
    asyncFactory: function(options) {
      return new AsyncExpectation(options || {});
    },
    addAsyncCoreMatchers: function(matchers) {
      addCoreMatchers(AsyncExpectation.prototype, matchers, wrapAsyncCompare);
    }
  };
};

getJasmineRequireObj().ExpectationFilterChain = function() {
  function ExpectationFilterChain(maybeFilter, prev) {
    this.filter_ = maybeFilter;
    this.prev_ = prev;
  }

  ExpectationFilterChain.prototype.addFilter = function(filter) {
    return new ExpectationFilterChain(filter, this);
  };

  ExpectationFilterChain.prototype.selectComparisonFunc = function(matcher) {
    return this.callFirst_('selectComparisonFunc', arguments).result;
  };

  ExpectationFilterChain.prototype.buildFailureMessage = function(
    result,
    matcherName,
    args,
    matchersUtil
  ) {
    return this.callFirst_('buildFailureMessage', arguments).result;
  };

  ExpectationFilterChain.prototype.modifyFailureMessage = function(msg) {
    const result = this.callFirst_('modifyFailureMessage', arguments).result;
    return result || msg;
  };

  ExpectationFilterChain.prototype.callFirst_ = function(fname, args) {
    if (this.prev_) {
      const prevResult = this.prev_.callFirst_(fname, args);

      if (prevResult.found) {
        return prevResult;
      }
    }

    if (this.filter_ && this.filter_[fname]) {
      return {
        found: true,
        result: this.filter_[fname].apply(this.filter_, args)
      };
    }

    return { found: false };
  };

  return ExpectationFilterChain;
};

getJasmineRequireObj().Expector = function(j$) {
  function Expector(options) {
    this.matchersUtil = options.matchersUtil || {
      buildFailureMessage: function() {}
    };
    this.actual = options.actual;
    this.addExpectationResult = options.addExpectationResult || function() {};
    this.filters = new j$.ExpectationFilterChain();
  }

  Expector.prototype.instantiateMatcher = function(
    matcherName,
    matcherFactory,
    args
  ) {
    this.matcherName = matcherName;
    this.args = Array.prototype.slice.call(args, 0);
    this.expected = this.args.slice(0);

    this.args.unshift(this.actual);

    const matcher = matcherFactory(this.matchersUtil);

    const comparisonFunc = this.filters.selectComparisonFunc(matcher);
    return comparisonFunc || matcher.compare;
  };

  Expector.prototype.buildMessage = function(result) {
    if (result.pass) {
      return '';
    }

    const defaultMessage = () => {
      if (!result.message) {
        const args = this.args.slice();
        args.unshift(false);
        args.unshift(this.matcherName);
        return this.matchersUtil.buildFailureMessage.apply(
          this.matchersUtil,
          args
        );
      } else if (j$.isFunction_(result.message)) {
        return result.message();
      } else {
        return result.message;
      }
    };

    const msg = this.filters.buildFailureMessage(
      result,
      this.matcherName,
      this.args,
      this.matchersUtil,
      defaultMessage
    );
    return this.filters.modifyFailureMessage(msg || defaultMessage());
  };

  Expector.prototype.compare = function(matcherName, matcherFactory, args) {
    const matcherCompare = this.instantiateMatcher(
      matcherName,
      matcherFactory,
      args
    );
    return matcherCompare.apply(null, this.args);
  };

  Expector.prototype.addFilter = function(filter) {
    const result = Object.create(this);
    result.filters = this.filters.addFilter(filter);
    return result;
  };

  Expector.prototype.processResult = function(result, errorForStack) {
    const message = this.buildMessage(result);

    if (this.expected.length === 1) {
      this.expected = this.expected[0];
    }

    this.addExpectationResult(result.pass, {
      matcherName: this.matcherName,
      passed: result.pass,
      message: message,
      error: errorForStack ? undefined : result.error,
      errorForStack: errorForStack || undefined,
      actual: this.actual,
      expected: this.expected // TODO: this may need to be arrayified/sliced
    });
  };

  return Expector;
};

getJasmineRequireObj().formatErrorMsg = function() {
  function generateErrorMsg(domain, usage) {
    const usageDefinition = usage ? '\nUsage: ' + usage : '';

    return function errorMsg(msg) {
      return domain + ' : ' + msg + usageDefinition;
    };
  }

  return generateErrorMsg;
};

getJasmineRequireObj().GlobalErrors = function(j$) {
  function GlobalErrors(global) {
    global = global || j$.getGlobal();

    const handlers = [];
    let overrideHandler = null,
      onRemoveOverrideHandler = null;

    function onBrowserError(event) {
      dispatchBrowserError(event.error, event);
    }

    function dispatchBrowserError(error, event) {
      if (overrideHandler) {
        overrideHandler(error);
        return;
      }

      const handler = handlers[handlers.length - 1];

      if (handler) {
        handler(error, event);
      } else {
        throw error;
      }
    }

    this.originalHandlers = {};
    this.jasmineHandlers = {};
    this.installOne_ = function installOne_(errorType, jasmineMessage) {
      function taggedOnError(error) {
        if (j$.isError_(error)) {
          error.jasmineMessage = jasmineMessage + ': ' + error;
        } else {
          let substituteMsg;

          if (error) {
            substituteMsg = jasmineMessage + ': ' + error;
          } else {
            substituteMsg = jasmineMessage + ' with no error or message';
          }

          if (errorType === 'unhandledRejection') {
            substituteMsg +=
              '\n' +
              '(Tip: to get a useful stack trace, use ' +
              'Promise.reject(new Error(...)) instead of Promise.reject(' +
              (error ? '...' : '') +
              ').)';
          }

          error = new Error(substituteMsg);
        }

        const handler = handlers[handlers.length - 1];

        if (overrideHandler) {
          overrideHandler(error);
          return;
        }

        if (handler) {
          handler(error);
        } else {
          throw error;
        }
      }

      this.originalHandlers[errorType] = global.process.listeners(errorType);
      this.jasmineHandlers[errorType] = taggedOnError;

      global.process.removeAllListeners(errorType);
      global.process.on(errorType, taggedOnError);

      this.uninstall = function uninstall() {
        const errorTypes = Object.keys(this.originalHandlers);
        for (const errorType of errorTypes) {
          global.process.removeListener(
            errorType,
            this.jasmineHandlers[errorType]
          );

          for (let i = 0; i < this.originalHandlers[errorType].length; i++) {
            global.process.on(errorType, this.originalHandlers[errorType][i]);
          }
          delete this.originalHandlers[errorType];
          delete this.jasmineHandlers[errorType];
        }
      };
    };

    this.install = function install() {
      if (
        global.process &&
        global.process.listeners &&
        j$.isFunction_(global.process.on)
      ) {
        this.installOne_('uncaughtException', 'Uncaught exception');
        this.installOne_('unhandledRejection', 'Unhandled promise rejection');
      } else {
        global.addEventListener('error', onBrowserError);

        const browserRejectionHandler = function browserRejectionHandler(
          event
        ) {
          if (j$.isError_(event.reason)) {
            event.reason.jasmineMessage =
              'Unhandled promise rejection: ' + event.reason;
            dispatchBrowserError(event.reason, event);
          } else {
            dispatchBrowserError(
              'Unhandled promise rejection: ' + event.reason,
              event
            );
          }
        };

        global.addEventListener('unhandledrejection', browserRejectionHandler);

        this.uninstall = function uninstall() {
          global.removeEventListener('error', onBrowserError);
          global.removeEventListener(
            'unhandledrejection',
            browserRejectionHandler
          );
        };
      }
    };

    // The listener at the top of the stack will be called with two arguments:
    // the error and the event. Either of them may be falsy.
    // The error will normally be provided, but will be falsy in the case of
    // some browser load-time errors. The event will normally be provided in
    // browsers but will be falsy in Node.
    // Listeners that are pushed after spec files have been loaded should be
    // able to just use the error parameter.
    this.pushListener = function pushListener(listener) {
      handlers.push(listener);
    };

    this.popListener = function popListener(listener) {
      if (!listener) {
        throw new Error('popListener expects a listener');
      }

      handlers.pop();
    };

    this.setOverrideListener = function(listener, onRemove) {
      if (overrideHandler) {
        throw new Error("Can't set more than one override listener at a time");
      }

      overrideHandler = listener;
      onRemoveOverrideHandler = onRemove;
    };

    this.removeOverrideListener = function() {
      if (onRemoveOverrideHandler) {
        onRemoveOverrideHandler();
      }

      overrideHandler = null;
      onRemoveOverrideHandler = null;
    };
  }

  return GlobalErrors;
};

getJasmineRequireObj().toBePending = function(j$) {
  /**
   * Expect a promise to be pending, i.e. the promise is neither resolved nor rejected.
   * @function
   * @async
   * @name async-matchers#toBePending
   * @since 3.6
   * @example
   * await expectAsync(aPromise).toBePending();
   */
  return function toBePending() {
    return {
      compare: function(actual) {
        if (!j$.isPromiseLike(actual)) {
          throw new Error('Expected toBePending to be called on a promise.');
        }
        const want = {};
        return Promise.race([actual, Promise.resolve(want)]).then(
          function(got) {
            return { pass: want === got };
          },
          function() {
            return { pass: false };
          }
        );
      }
    };
  };
};

getJasmineRequireObj().toBeRejected = function(j$) {
  /**
   * Expect a promise to be rejected.
   * @function
   * @async
   * @name async-matchers#toBeRejected
   * @since 3.1.0
   * @example
   * await expectAsync(aPromise).toBeRejected();
   * @example
   * return expectAsync(aPromise).toBeRejected();
   */
  return function toBeRejected() {
    return {
      compare: function(actual) {
        if (!j$.isPromiseLike(actual)) {
          throw new Error('Expected toBeRejected to be called on a promise.');
        }
        return actual.then(
          function() {
            return { pass: false };
          },
          function() {
            return { pass: true };
          }
        );
      }
    };
  };
};

getJasmineRequireObj().toBeRejectedWith = function(j$) {
  /**
   * Expect a promise to be rejected with a value equal to the expected, using deep equality comparison.
   * @function
   * @async
   * @name async-matchers#toBeRejectedWith
   * @since 3.3.0
   * @param {Object} expected - Value that the promise is expected to be rejected with
   * @example
   * await expectAsync(aPromise).toBeRejectedWith({prop: 'value'});
   * @example
   * return expectAsync(aPromise).toBeRejectedWith({prop: 'value'});
   */
  return function toBeRejectedWith(matchersUtil) {
    return {
      compare: function(actualPromise, expectedValue) {
        if (!j$.isPromiseLike(actualPromise)) {
          throw new Error(
            'Expected toBeRejectedWith to be called on a promise.'
          );
        }

        function prefix(passed) {
          return (
            'Expected a promise ' +
            (passed ? 'not ' : '') +
            'to be rejected with ' +
            matchersUtil.pp(expectedValue)
          );
        }

        return actualPromise.then(
          function() {
            return {
              pass: false,
              message: prefix(false) + ' but it was resolved.'
            };
          },
          function(actualValue) {
            if (matchersUtil.equals(actualValue, expectedValue)) {
              return {
                pass: true,
                message: prefix(true) + '.'
              };
            } else {
              return {
                pass: false,
                message:
                  prefix(false) +
                  ' but it was rejected with ' +
                  matchersUtil.pp(actualValue) +
                  '.'
              };
            }
          }
        );
      }
    };
  };
};

getJasmineRequireObj().toBeRejectedWithError = function(j$) {
  /**
   * Expect a promise to be rejected with a value matched to the expected
   * @function
   * @async
   * @name async-matchers#toBeRejectedWithError
   * @since 3.5.0
   * @param {Error} [expected] - `Error` constructor the object that was thrown needs to be an instance of. If not provided, `Error` will be used.
   * @param {RegExp|String} [message] - The message that should be set on the thrown `Error`
   * @example
   * await expectAsync(aPromise).toBeRejectedWithError(MyCustomError, 'Error message');
   * await expectAsync(aPromise).toBeRejectedWithError(MyCustomError, /Error message/);
   * await expectAsync(aPromise).toBeRejectedWithError(MyCustomError);
   * await expectAsync(aPromise).toBeRejectedWithError('Error message');
   * return expectAsync(aPromise).toBeRejectedWithError(/Error message/);
   */
  return function toBeRejectedWithError(matchersUtil) {
    return {
      compare: function(actualPromise, arg1, arg2) {
        if (!j$.isPromiseLike(actualPromise)) {
          throw new Error(
            'Expected toBeRejectedWithError to be called on a promise.'
          );
        }

        const expected = getExpectedFromArgs(arg1, arg2, matchersUtil);

        return actualPromise.then(
          function() {
            return {
              pass: false,
              message: 'Expected a promise to be rejected but it was resolved.'
            };
          },
          function(actualValue) {
            return matchError(actualValue, expected, matchersUtil);
          }
        );
      }
    };
  };

  function matchError(actual, expected, matchersUtil) {
    if (!j$.isError_(actual)) {
      return fail(expected, 'rejected with ' + matchersUtil.pp(actual));
    }

    if (!(actual instanceof expected.error)) {
      return fail(
        expected,
        'rejected with type ' + j$.fnNameFor(actual.constructor)
      );
    }

    const actualMessage = actual.message;

    if (
      actualMessage === expected.message ||
      typeof expected.message === 'undefined'
    ) {
      return pass(expected);
    }

    if (
      expected.message instanceof RegExp &&
      expected.message.test(actualMessage)
    ) {
      return pass(expected);
    }

    return fail(expected, 'rejected with ' + matchersUtil.pp(actual));
  }

  function pass(expected) {
    return {
      pass: true,
      message:
        'Expected a promise not to be rejected with ' +
        expected.printValue +
        ', but it was.'
    };
  }

  function fail(expected, message) {
    return {
      pass: false,
      message:
        'Expected a promise to be rejected with ' +
        expected.printValue +
        ' but it was ' +
        message +
        '.'
    };
  }

  function getExpectedFromArgs(arg1, arg2, matchersUtil) {
    let error, message;

    if (isErrorConstructor(arg1)) {
      error = arg1;
      message = arg2;
    } else {
      error = Error;
      message = arg1;
    }

    return {
      error: error,
      message: message,
      printValue:
        j$.fnNameFor(error) +
        (typeof message === 'undefined' ? '' : ': ' + matchersUtil.pp(message))
    };
  }

  function isErrorConstructor(value) {
    return (
      typeof value === 'function' &&
      (value === Error || j$.isError_(value.prototype))
    );
  }
};

getJasmineRequireObj().toBeResolved = function(j$) {
  /**
   * Expect a promise to be resolved.
   * @function
   * @async
   * @name async-matchers#toBeResolved
   * @since 3.1.0
   * @example
   * await expectAsync(aPromise).toBeResolved();
   * @example
   * return expectAsync(aPromise).toBeResolved();
   */
  return function toBeResolved(matchersUtil) {
    return {
      compare: function(actual) {
        if (!j$.isPromiseLike(actual)) {
          throw new Error('Expected toBeResolved to be called on a promise.');
        }

        return actual.then(
          function() {
            return { pass: true };
          },
          function(e) {
            return {
              pass: false,
              message:
                'Expected a promise to be resolved but it was ' +
                'rejected with ' +
                matchersUtil.pp(e) +
                '.'
            };
          }
        );
      }
    };
  };
};

getJasmineRequireObj().toBeResolvedTo = function(j$) {
  /**
   * Expect a promise to be resolved to a value equal to the expected, using deep equality comparison.
   * @function
   * @async
   * @name async-matchers#toBeResolvedTo
   * @since 3.1.0
   * @param {Object} expected - Value that the promise is expected to resolve to
   * @example
   * await expectAsync(aPromise).toBeResolvedTo({prop: 'value'});
   * @example
   * return expectAsync(aPromise).toBeResolvedTo({prop: 'value'});
   */
  return function toBeResolvedTo(matchersUtil) {
    return {
      compare: function(actualPromise, expectedValue) {
        if (!j$.isPromiseLike(actualPromise)) {
          throw new Error('Expected toBeResolvedTo to be called on a promise.');
        }

        function prefix(passed) {
          return (
            'Expected a promise ' +
            (passed ? 'not ' : '') +
            'to be resolved to ' +
            matchersUtil.pp(expectedValue)
          );
        }

        return actualPromise.then(
          function(actualValue) {
            if (matchersUtil.equals(actualValue, expectedValue)) {
              return {
                pass: true,
                message: prefix(true) + '.'
              };
            } else {
              return {
                pass: false,
                message:
                  prefix(false) +
                  ' but it was resolved to ' +
                  matchersUtil.pp(actualValue) +
                  '.'
              };
            }
          },
          function(e) {
            return {
              pass: false,
              message:
                prefix(false) +
                ' but it was rejected with ' +
                matchersUtil.pp(e) +
                '.'
            };
          }
        );
      }
    };
  };
};

getJasmineRequireObj().DiffBuilder = function(j$) {
  class DiffBuilder {
    constructor(config) {
      this.prettyPrinter_ =
        (config || {}).prettyPrinter || j$.makePrettyPrinter();
      this.mismatches_ = new j$.MismatchTree();
      this.path_ = new j$.ObjectPath();
      this.actualRoot_ = undefined;
      this.expectedRoot_ = undefined;
    }

    setRoots(actual, expected) {
      this.actualRoot_ = actual;
      this.expectedRoot_ = expected;
    }

    recordMismatch(formatter) {
      this.mismatches_.add(this.path_, formatter);
    }

    getMessage() {
      const messages = [];

      this.mismatches_.traverse((path, isLeaf, formatter) => {
        const { actual, expected } = this.dereferencePath_(path);

        if (formatter) {
          messages.push(formatter(actual, expected, path, this.prettyPrinter_));
          return true;
        }

        const actualCustom = this.prettyPrinter_.customFormat_(actual);
        const expectedCustom = this.prettyPrinter_.customFormat_(expected);
        const useCustom = !(
          j$.util.isUndefined(actualCustom) &&
          j$.util.isUndefined(expectedCustom)
        );

        if (useCustom) {
          messages.push(wrapPrettyPrinted(actualCustom, expectedCustom, path));
          return false; // don't recurse further
        }

        if (isLeaf) {
          messages.push(this.defaultFormatter_(actual, expected, path));
        }

        return true;
      });

      return messages.join('\n');
    }

    withPath(pathComponent, block) {
      const oldPath = this.path_;
      this.path_ = this.path_.add(pathComponent);
      block();
      this.path_ = oldPath;
    }

    dereferencePath_(objectPath) {
      let actual = this.actualRoot_;
      let expected = this.expectedRoot_;

      const handleAsymmetricExpected = () => {
        if (
          j$.isAsymmetricEqualityTester_(expected) &&
          j$.isFunction_(expected.valuesForDiff_)
        ) {
          const asymmetricResult = expected.valuesForDiff_(
            actual,
            this.prettyPrinter_
          );
          expected = asymmetricResult.self;
          actual = asymmetricResult.other;
        }
      };

      handleAsymmetricExpected();

      for (const pc of objectPath.components) {
        actual = actual[pc];
        expected = expected[pc];
        handleAsymmetricExpected();
      }

      return { actual: actual, expected: expected };
    }

    defaultFormatter_(actual, expected, path) {
      return wrapPrettyPrinted(
        this.prettyPrinter_(actual),
        this.prettyPrinter_(expected),
        path
      );
    }
  }

  function wrapPrettyPrinted(actual, expected, path) {
    return (
      'Expected ' +
      path +
      (path.depth() ? ' = ' : '') +
      actual +
      ' to equal ' +
      expected +
      '.'
    );
  }

  return DiffBuilder;
};

getJasmineRequireObj().MatchersUtil = function(j$) {
  /**
   * @class MatchersUtil
   * @classdesc Utilities for use in implementing matchers.<br>
   * _Note:_ Do not construct this directly. Jasmine will construct one and
   * pass it to matchers and asymmetric equality testers.
   * @hideconstructor
   */
  function MatchersUtil(options) {
    options = options || {};
    this.customTesters_ = options.customTesters || [];
    /**
     * Formats a value for use in matcher failure messages and similar contexts,
     * taking into account the current set of custom value formatters.
     * @function
     * @name MatchersUtil#pp
     * @since 3.6.0
     * @param {*} value The value to pretty-print
     * @return {string} The pretty-printed value
     */
    this.pp = options.pp || function() {};
  }

  /**
   * Determines whether `haystack` contains `needle`, using the same comparison
   * logic as {@link MatchersUtil#equals}.
   * @function
   * @name MatchersUtil#contains
   * @since 2.0.0
   * @param {*} haystack The collection to search
   * @param {*} needle The value to search for
   * @returns {boolean} True if `needle` was found in `haystack`
   */
  MatchersUtil.prototype.contains = function(haystack, needle) {
    if (!haystack) {
      return false;
    }

    if (j$.isSet(haystack)) {
      // Try .has() first. It should be faster in cases where
      // needle === something in haystack. Fall back to .equals() comparison
      // if that fails.
      if (haystack.has(needle)) {
        return true;
      }
    }

    if (j$.isIterable_(haystack) && !j$.isString_(haystack)) {
      // Arrays, Sets, etc.
      for (const candidate of haystack) {
        if (this.equals(candidate, needle)) {
          return true;
        }
      }

      return false;
    }

    if (haystack.indexOf) {
      // Mainly strings
      return haystack.indexOf(needle) >= 0;
    }

    if (j$.isNumber_(haystack.length)) {
      // Objects that are shaped like arrays but aren't iterable
      for (let i = 0; i < haystack.length; i++) {
        if (this.equals(haystack[i], needle)) {
          return true;
        }
      }
    }

    return false;
  };

  MatchersUtil.prototype.buildFailureMessage = function() {
    const args = Array.prototype.slice.call(arguments, 0),
      matcherName = args[0],
      isNot = args[1],
      actual = args[2],
      expected = args.slice(3),
      englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) {
        return ' ' + s.toLowerCase();
      });

    let message =
      'Expected ' +
      this.pp(actual) +
      (isNot ? ' not ' : ' ') +
      englishyPredicate;

    if (expected.length > 0) {
      for (let i = 0; i < expected.length; i++) {
        if (i > 0) {
          message += ',';
        }
        message += ' ' + this.pp(expected[i]);
      }
    }

    return message + '.';
  };

  MatchersUtil.prototype.asymmetricDiff_ = function(
    a,
    b,
    aStack,
    bStack,
    diffBuilder
  ) {
    if (j$.isFunction_(b.valuesForDiff_)) {
      const values = b.valuesForDiff_(a, this.pp);
      this.eq_(values.other, values.self, aStack, bStack, diffBuilder);
    } else {
      diffBuilder.recordMismatch();
    }
  };

  MatchersUtil.prototype.asymmetricMatch_ = function(
    a,
    b,
    aStack,
    bStack,
    diffBuilder
  ) {
    const asymmetricA = j$.isAsymmetricEqualityTester_(a);
    const asymmetricB = j$.isAsymmetricEqualityTester_(b);

    if (asymmetricA === asymmetricB) {
      return undefined;
    }

    let result;

    if (asymmetricA) {
      result = a.asymmetricMatch(b, this);
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }

    if (asymmetricB) {
      result = b.asymmetricMatch(a, this);
      if (!result) {
        this.asymmetricDiff_(a, b, aStack, bStack, diffBuilder);
      }
      return result;
    }
  };

  /**
   * Determines whether two values are deeply equal to each other.
   * @function
   * @name MatchersUtil#equals
   * @since 2.0.0
   * @param {*} a The first value to compare
   * @param {*} b The second value to compare
   * @returns {boolean} True if the values are equal
   */
  MatchersUtil.prototype.equals = function(a, b, diffBuilder) {
    diffBuilder = diffBuilder || j$.NullDiffBuilder();
    diffBuilder.setRoots(a, b);

    return this.eq_(a, b, [], [], diffBuilder);
  };

  // Equality function lovingly adapted from isEqual in
  //   [Underscore](http://underscorejs.org)
  MatchersUtil.prototype.eq_ = function(a, b, aStack, bStack, diffBuilder) {
    let result = true;

    const asymmetricResult = this.asymmetricMatch_(
      a,
      b,
      aStack,
      bStack,
      diffBuilder
    );
    if (!j$.util.isUndefined(asymmetricResult)) {
      return asymmetricResult;
    }

    for (const tester of this.customTesters_) {
      const customTesterResult = tester(a, b);
      if (!j$.util.isUndefined(customTesterResult)) {
        if (!customTesterResult) {
          diffBuilder.recordMismatch();
        }
        return customTesterResult;
      }
    }

    if (a instanceof Error && b instanceof Error) {
      result = a.message == b.message;
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) {
      result = a !== 0 || 1 / a == 1 / b;
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }
    // A strict comparison is necessary because `null == undefined`.
    if (a === null || b === null) {
      result = a === b;
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }
    const className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)) {
      diffBuilder.recordMismatch();
      return false;
    }
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        result = a == String(b);
        if (!result) {
          diffBuilder.recordMismatch();
        }
        return result;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        result =
          a != +a ? b != +b : a === 0 && b === 0 ? 1 / a == 1 / b : a == +b;
        if (!result) {
          diffBuilder.recordMismatch();
        }
        return result;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        result = +a == +b;
        if (!result) {
          diffBuilder.recordMismatch();
        }
        return result;
      case '[object ArrayBuffer]':
        // If we have an instance of ArrayBuffer the Uint8Array ctor
        // will be defined as well
        return this.eq_(
          new Uint8Array(a),
          new Uint8Array(b),
          aStack,
          bStack,
          diffBuilder
        );
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return (
          a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase
        );
    }
    if (typeof a != 'object' || typeof b != 'object') {
      diffBuilder.recordMismatch();
      return false;
    }

    const aIsDomNode = j$.isDomNode(a);
    const bIsDomNode = j$.isDomNode(b);
    if (aIsDomNode && bIsDomNode) {
      // At first try to use DOM3 method isEqualNode
      result = a.isEqualNode(b);
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }
    if (aIsDomNode || bIsDomNode) {
      diffBuilder.recordMismatch();
      return false;
    }

    const aIsPromise = j$.isPromise(a);
    const bIsPromise = j$.isPromise(b);
    if (aIsPromise && bIsPromise) {
      return a === b;
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    let length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) {
        return bStack[length] == b;
      }
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    let size = 0;
    // Recursively compare objects and arrays.
    // Compare array lengths to determine if a deep comparison is necessary.
    if (className == '[object Array]') {
      const aLength = a.length;
      const bLength = b.length;

      diffBuilder.withPath('length', function() {
        if (aLength !== bLength) {
          diffBuilder.recordMismatch();
          result = false;
        }
      });

      for (let i = 0; i < aLength || i < bLength; i++) {
        diffBuilder.withPath(i, () => {
          if (i >= bLength) {
            diffBuilder.recordMismatch(
              actualArrayIsLongerFormatter.bind(null, this.pp)
            );
            result = false;
          } else {
            result =
              this.eq_(
                i < aLength ? a[i] : void 0,
                i < bLength ? b[i] : void 0,
                aStack,
                bStack,
                diffBuilder
              ) && result;
          }
        });
      }
      if (!result) {
        return false;
      }
    } else if (j$.isMap(a) && j$.isMap(b)) {
      if (a.size != b.size) {
        diffBuilder.recordMismatch();
        return false;
      }

      const keysA = [];
      const keysB = [];
      a.forEach(function(valueA, keyA) {
        keysA.push(keyA);
      });
      b.forEach(function(valueB, keyB) {
        keysB.push(keyB);
      });

      // For both sets of keys, check they map to equal values in both maps.
      // Keep track of corresponding keys (in insertion order) in order to handle asymmetric obj keys.
      const mapKeys = [keysA, keysB];
      const cmpKeys = [keysB, keysA];
      for (let i = 0; result && i < mapKeys.length; i++) {
        const mapIter = mapKeys[i];
        const cmpIter = cmpKeys[i];

        for (let j = 0; result && j < mapIter.length; j++) {
          const mapKey = mapIter[j];
          const cmpKey = cmpIter[j];
          const mapValueA = a.get(mapKey);
          let mapValueB;

          // Only use the cmpKey when one of the keys is asymmetric and the corresponding key matches,
          // otherwise explicitly look up the mapKey in the other Map since we want keys with unique
          // obj identity (that are otherwise equal) to not match.
          if (
            j$.isAsymmetricEqualityTester_(mapKey) ||
            (j$.isAsymmetricEqualityTester_(cmpKey) &&
              this.eq_(mapKey, cmpKey, aStack, bStack, j$.NullDiffBuilder()))
          ) {
            mapValueB = b.get(cmpKey);
          } else {
            mapValueB = b.get(mapKey);
          }
          result = this.eq_(
            mapValueA,
            mapValueB,
            aStack,
            bStack,
            j$.NullDiffBuilder()
          );
        }
      }

      if (!result) {
        diffBuilder.recordMismatch();
        return false;
      }
    } else if (j$.isSet(a) && j$.isSet(b)) {
      if (a.size != b.size) {
        diffBuilder.recordMismatch();
        return false;
      }

      const valuesA = [];
      a.forEach(function(valueA) {
        valuesA.push(valueA);
      });
      const valuesB = [];
      b.forEach(function(valueB) {
        valuesB.push(valueB);
      });

      // For both sets, check they are all contained in the other set
      const setPairs = [[valuesA, valuesB], [valuesB, valuesA]];
      const stackPairs = [[aStack, bStack], [bStack, aStack]];
      for (let i = 0; result && i < setPairs.length; i++) {
        const baseValues = setPairs[i][0];
        const otherValues = setPairs[i][1];
        const baseStack = stackPairs[i][0];
        const otherStack = stackPairs[i][1];
        // For each value in the base set...
        for (const baseValue of baseValues) {
          let found = false;
          // ... test that it is present in the other set
          for (let j = 0; !found && j < otherValues.length; j++) {
            const otherValue = otherValues[j];
            const prevStackSize = baseStack.length;
            // compare by value equality
            found = this.eq_(
              baseValue,
              otherValue,
              baseStack,
              otherStack,
              j$.NullDiffBuilder()
            );
            if (!found && prevStackSize !== baseStack.length) {
              baseStack.splice(prevStackSize);
              otherStack.splice(prevStackSize);
            }
          }
          result = result && found;
        }
      }

      if (!result) {
        diffBuilder.recordMismatch();
        return false;
      }
    } else if (j$.isURL(a) && j$.isURL(b)) {
      // URLs have no enumrable properties, so the default object comparison
      // would consider any two URLs to be equal.
      return a.toString() === b.toString();
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // or `Array`s from different frames are.
      const aCtor = a.constructor,
        bCtor = b.constructor;
      if (
        aCtor !== bCtor &&
        isFunction(aCtor) &&
        isFunction(bCtor) &&
        a instanceof aCtor &&
        b instanceof bCtor &&
        !(aCtor instanceof aCtor && bCtor instanceof bCtor)
      ) {
        diffBuilder.recordMismatch(
          constructorsAreDifferentFormatter.bind(null, this.pp)
        );
        return false;
      }
    }

    // Deep compare objects.
    const aKeys = MatchersUtil.keys(a, className == '[object Array]');
    size = aKeys.length;

    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (MatchersUtil.keys(b, className == '[object Array]').length !== size) {
      diffBuilder.recordMismatch(
        objectKeysAreDifferentFormatter.bind(null, this.pp)
      );
      return false;
    }

    for (const key of aKeys) {
      // Deep compare each member
      if (!j$.util.has(b, key)) {
        diffBuilder.recordMismatch(
          objectKeysAreDifferentFormatter.bind(null, this.pp)
        );
        result = false;
        continue;
      }

      diffBuilder.withPath(key, () => {
        if (!this.eq_(a[key], b[key], aStack, bStack, diffBuilder)) {
          result = false;
        }
      });
    }

    if (!result) {
      return false;
    }

    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();

    return result;
  };

  MatchersUtil.keys = function(obj, isArray) {
    const allKeys = (function(o) {
      const keys = [];
      for (const key in o) {
        if (j$.util.has(o, key)) {
          keys.push(key);
        }
      }

      const symbols = Object.getOwnPropertySymbols(o);
      for (const sym of symbols) {
        if (o.propertyIsEnumerable(sym)) {
          keys.push(sym);
        }
      }

      return keys;
    })(obj);

    if (!isArray) {
      return allKeys;
    }

    if (allKeys.length === 0) {
      return allKeys;
    }

    const extraKeys = [];
    for (const k of allKeys) {
      if (typeof k === 'symbol' || !/^[0-9]+$/.test(k)) {
        extraKeys.push(k);
      }
    }

    return extraKeys;
  };

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  // Returns an array of [k, v] pairs for eacch property that's in objA
  // and not in objB.
  function extraKeysAndValues(objA, objB) {
    return MatchersUtil.keys(objA)
      .filter(key => !j$.util.has(objB, key))
      .map(key => [key, objA[key]]);
  }

  function objectKeysAreDifferentFormatter(pp, actual, expected, path) {
    const missingProperties = extraKeysAndValues(expected, actual),
      extraProperties = extraKeysAndValues(actual, expected),
      missingPropertiesMessage = formatKeyValuePairs(pp, missingProperties),
      extraPropertiesMessage = formatKeyValuePairs(pp, extraProperties),
      messages = [];

    if (!path.depth()) {
      path = 'object';
    }

    if (missingPropertiesMessage.length) {
      messages.push(
        'Expected ' + path + ' to have properties' + missingPropertiesMessage
      );
    }

    if (extraPropertiesMessage.length) {
      messages.push(
        'Expected ' + path + ' not to have properties' + extraPropertiesMessage
      );
    }

    return messages.join('\n');
  }

  function constructorsAreDifferentFormatter(pp, actual, expected, path) {
    if (!path.depth()) {
      path = 'object';
    }

    return (
      'Expected ' +
      path +
      ' to be a kind of ' +
      j$.fnNameFor(expected.constructor) +
      ', but was ' +
      pp(actual) +
      '.'
    );
  }

  function actualArrayIsLongerFormatter(pp, actual, expected, path) {
    return (
      'Unexpected ' +
      path +
      (path.depth() ? ' = ' : '') +
      pp(actual) +
      ' in array.'
    );
  }

  function formatKeyValuePairs(pp, keyValuePairs) {
    let formatted = '';

    for (const [key, value] of keyValuePairs) {
      formatted += '\n    ' + key.toString() + ': ' + pp(value);
    }

    return formatted;
  }

  return MatchersUtil;
};

/**
 * @interface AsymmetricEqualityTester
 * @classdesc An asymmetric equality tester is an object that can match multiple
 * objects. Examples include jasmine.any() and jasmine.stringMatching(). Jasmine
 * includes a number of built-in asymmetric equality testers, such as
 * {@link jasmine.objectContaining}. User-defined asymmetric equality testers are
 * also supported.
 *
 * Asymmetric equality testers work with any matcher, including user-defined
 * custom matchers, that uses {@link MatchersUtil#equals} or
 * {@link MatchersUtil#contains}.
 *
 * @example
 * function numberDivisibleBy(divisor) {
 *   return {
 *     asymmetricMatch: function(n) {
 *       return typeof n === 'number' && n % divisor === 0;
 *     },
 *     jasmineToString: function() {
 *       return `<a number divisible by ${divisor}>`;
 *     }
 *   };
 * }
 *
 * const actual = {
 *   n: 2,
 *   otherFields: "don't care"
 * };
 *
 * expect(actual).toEqual(jasmine.objectContaining({n: numberDivisibleBy(2)}));
 * @see custom_asymmetric_equality_testers
 * @since 2.0.0
 */
/**
 * Determines whether a value matches this tester
 * @function
 * @name AsymmetricEqualityTester#asymmetricMatch
 * @param value {any} The value to test
 * @param matchersUtil {MatchersUtil} utilities for testing equality, etc
 * @return {Boolean}
 */
/**
 * Returns a string representation of this tester to use in matcher failure messages
 * @function
 * @name AsymmetricEqualityTester#jasmineToString
 * @param pp {function} Function that takes a value and returns a pretty-printed representation
 * @return {String}
 */

getJasmineRequireObj().MismatchTree = function(j$) {
  /*
    To be able to apply custom object formatters at all possible levels of an
    object graph, DiffBuilder needs to be able to know not just where the
    mismatch occurred but also all ancestors of the mismatched value in both
    the expected and actual object graphs. MismatchTree maintains that context
    and provides it via the traverse method.
   */
  class MismatchTree {
    constructor(path) {
      this.path = path || new j$.ObjectPath([]);
      this.formatter = undefined;
      this.children = [];
      this.isMismatch = false;
    }

    add(path, formatter) {
      if (path.depth() === 0) {
        this.formatter = formatter;
        this.isMismatch = true;
      } else {
        const key = path.components[0];
        path = path.shift();
        let child = this.child(key);

        if (!child) {
          child = new MismatchTree(this.path.add(key));
          this.children.push(child);
        }

        child.add(path, formatter);
      }
    }

    traverse(visit) {
      const hasChildren = this.children.length > 0;

      if (this.isMismatch || hasChildren) {
        if (visit(this.path, !hasChildren, this.formatter)) {
          for (const child of this.children) {
            child.traverse(visit);
          }
        }
      }
    }

    child(key) {
      return this.children.find(child => {
        const pathEls = child.path.components;
        return pathEls[pathEls.length - 1] === key;
      });
    }
  }

  return MismatchTree;
};

getJasmineRequireObj().nothing = function() {
  /**
   * {@link expect} nothing explicitly.
   * @function
   * @name matchers#nothing
   * @since 2.8.0
   * @example
   * expect().nothing();
   */
  function nothing() {
    return {
      compare: function() {
        return {
          pass: true
        };
      }
    };
  }

  return nothing;
};

getJasmineRequireObj().NullDiffBuilder = function(j$) {
  return function() {
    return {
      withPath: function(_, block) {
        block();
      },
      setRoots: function() {},
      recordMismatch: function() {}
    };
  };
};

getJasmineRequireObj().ObjectPath = function(j$) {
  class ObjectPath {
    constructor(components) {
      this.components = components || [];
    }

    toString() {
      if (this.components.length) {
        return '$' + this.components.map(formatPropertyAccess).join('');
      } else {
        return '';
      }
    }

    add(component) {
      return new ObjectPath(this.components.concat([component]));
    }

    shift() {
      return new ObjectPath(this.components.slice(1));
    }

    depth() {
      return this.components.length;
    }
  }

  function formatPropertyAccess(prop) {
    if (typeof prop === 'number' || typeof prop === 'symbol') {
      return '[' + prop.toString() + ']';
    }

    if (isValidIdentifier(prop)) {
      return '.' + prop;
    }

    return `['${prop}']`;
  }

  function isValidIdentifier(string) {
    return /^[A-Za-z\$_][A-Za-z0-9\$_]*$/.test(string);
  }

  return ObjectPath;
};

getJasmineRequireObj().requireAsyncMatchers = function(jRequire, j$) {
  const availableMatchers = [
      'toBePending',
      'toBeResolved',
      'toBeRejected',
      'toBeResolvedTo',
      'toBeRejectedWith',
      'toBeRejectedWithError'
    ],
    matchers = {};

  for (const name of availableMatchers) {
    matchers[name] = jRequire[name](j$);
  }

  return matchers;
};

getJasmineRequireObj().toBe = function(j$) {
  /**
   * {@link expect} the actual value to be `===` to the expected value.
   * @function
   * @name matchers#toBe
   * @since 1.3.0
   * @param {Object} expected - The expected value to compare against.
   * @example
   * expect(thing).toBe(realThing);
   */
  function toBe(matchersUtil) {
    const tip =
      ' Tip: To check for deep equality, use .toEqual() instead of .toBe().';

    return {
      compare: function(actual, expected) {
        const result = {
          pass: actual === expected
        };

        if (typeof expected === 'object') {
          result.message =
            matchersUtil.buildFailureMessage(
              'toBe',
              result.pass,
              actual,
              expected
            ) + tip;
        }

        return result;
      }
    };
  }

  return toBe;
};

getJasmineRequireObj().toBeCloseTo = function() {
  /**
   * {@link expect} the actual value to be within a specified precision of the expected value.
   * @function
   * @name matchers#toBeCloseTo
   * @since 1.3.0
   * @param {Object} expected - The expected value to compare against.
   * @param {Number} [precision=2] - The number of decimal points to check.
   * @example
   * expect(number).toBeCloseTo(42.2, 3);
   */
  function toBeCloseTo() {
    return {
      compare: function(actual, expected, precision) {
        if (precision !== 0) {
          precision = precision || 2;
        }

        if (expected === null || actual === null) {
          throw new Error(
            'Cannot use toBeCloseTo with null. Arguments evaluated to: ' +
              'expect(' +
              actual +
              ').toBeCloseTo(' +
              expected +
              ').'
          );
        }

        // Infinity is close to Infinity and -Infinity is close to -Infinity,
        // regardless of the precision.
        if (expected === Infinity || expected === -Infinity) {
          return {
            pass: actual === expected
          };
        }

        const pow = Math.pow(10, precision + 1);
        const delta = Math.abs(expected - actual);
        const maxDelta = Math.pow(10, -precision) / 2;

        return {
          pass: Math.round(delta * pow) <= maxDelta * pow
        };
      }
    };
  }

  return toBeCloseTo;
};

getJasmineRequireObj().toBeDefined = function() {
  /**
   * {@link expect} the actual value to be defined. (Not `undefined`)
   * @function
   * @name matchers#toBeDefined
   * @since 1.3.0
   * @example
   * expect(result).toBeDefined();
   */
  function toBeDefined() {
    return {
      compare: function(actual) {
        return {
          pass: void 0 !== actual
        };
      }
    };
  }

  return toBeDefined;
};

getJasmineRequireObj().toBeFalse = function() {
  /**
   * {@link expect} the actual value to be `false`.
   * @function
   * @name matchers#toBeFalse
   * @since 3.5.0
   * @example
   * expect(result).toBeFalse();
   */
  function toBeFalse() {
    return {
      compare: function(actual) {
        return {
          pass: actual === false
        };
      }
    };
  }

  return toBeFalse;
};

getJasmineRequireObj().toBeFalsy = function() {
  /**
   * {@link expect} the actual value to be falsy
   * @function
   * @name matchers#toBeFalsy
   * @since 2.0.0
   * @example
   * expect(result).toBeFalsy();
   */
  function toBeFalsy() {
    return {
      compare: function(actual) {
        return {
          pass: !actual
        };
      }
    };
  }

  return toBeFalsy;
};

getJasmineRequireObj().toBeGreaterThan = function() {
  /**
   * {@link expect} the actual value to be greater than the expected value.
   * @function
   * @name matchers#toBeGreaterThan
   * @since 2.0.0
   * @param {Number} expected - The value to compare against.
   * @example
   * expect(result).toBeGreaterThan(3);
   */
  function toBeGreaterThan() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual > expected
        };
      }
    };
  }

  return toBeGreaterThan;
};

getJasmineRequireObj().toBeGreaterThanOrEqual = function() {
  /**
   * {@link expect} the actual value to be greater than or equal to the expected value.
   * @function
   * @name matchers#toBeGreaterThanOrEqual
   * @since 2.0.0
   * @param {Number} expected - The expected value to compare against.
   * @example
   * expect(result).toBeGreaterThanOrEqual(25);
   */
  function toBeGreaterThanOrEqual() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual >= expected
        };
      }
    };
  }

  return toBeGreaterThanOrEqual;
};

getJasmineRequireObj().toBeInstanceOf = function(j$) {
  const usageError = j$.formatErrorMsg(
    '<toBeInstanceOf>',
    'expect(value).toBeInstanceOf(<ConstructorFunction>)'
  );

  /**
   * {@link expect} the actual to be an instance of the expected class
   * @function
   * @name matchers#toBeInstanceOf
   * @since 3.5.0
   * @param {Object} expected - The class or constructor function to check for
   * @example
   * expect('foo').toBeInstanceOf(String);
   * expect(3).toBeInstanceOf(Number);
   * expect(new Error()).toBeInstanceOf(Error);
   */
  function toBeInstanceOf(matchersUtil) {
    return {
      compare: function(actual, expected) {
        const actualType =
          actual && actual.constructor
            ? j$.fnNameFor(actual.constructor)
            : matchersUtil.pp(actual);
        const expectedType = expected
          ? j$.fnNameFor(expected)
          : matchersUtil.pp(expected);
        let expectedMatcher;
        let pass;

        try {
          expectedMatcher = new j$.Any(expected);
          pass = expectedMatcher.asymmetricMatch(actual);
        } catch (error) {
          throw new Error(
            usageError('Expected value is not a constructor function')
          );
        }

        if (pass) {
          return {
            pass: true,
            message:
              'Expected instance of ' +
              actualType +
              ' not to be an instance of ' +
              expectedType
          };
        } else {
          return {
            pass: false,
            message:
              'Expected instance of ' +
              actualType +
              ' to be an instance of ' +
              expectedType
          };
        }
      }
    };
  }

  return toBeInstanceOf;
};

getJasmineRequireObj().toBeLessThan = function() {
  /**
   * {@link expect} the actual value to be less than the expected value.
   * @function
   * @name matchers#toBeLessThan
   * @since 2.0.0
   * @param {Number} expected - The expected value to compare against.
   * @example
   * expect(result).toBeLessThan(0);
   */
  function toBeLessThan() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual < expected
        };
      }
    };
  }

  return toBeLessThan;
};

getJasmineRequireObj().toBeLessThanOrEqual = function() {
  /**
   * {@link expect} the actual value to be less than or equal to the expected value.
   * @function
   * @name matchers#toBeLessThanOrEqual
   * @since 2.0.0
   * @param {Number} expected - The expected value to compare against.
   * @example
   * expect(result).toBeLessThanOrEqual(123);
   */
  function toBeLessThanOrEqual() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual <= expected
        };
      }
    };
  }

  return toBeLessThanOrEqual;
};

getJasmineRequireObj().toBeNaN = function(j$) {
  /**
   * {@link expect} the actual value to be `NaN` (Not a Number).
   * @function
   * @name matchers#toBeNaN
   * @since 1.3.0
   * @example
   * expect(thing).toBeNaN();
   */
  function toBeNaN(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {
          pass: actual !== actual
        };

        if (result.pass) {
          result.message = 'Expected actual not to be NaN.';
        } else {
          result.message = function() {
            return 'Expected ' + matchersUtil.pp(actual) + ' to be NaN.';
          };
        }

        return result;
      }
    };
  }

  return toBeNaN;
};

getJasmineRequireObj().toBeNegativeInfinity = function(j$) {
  /**
   * {@link expect} the actual value to be `-Infinity` (-infinity).
   * @function
   * @name matchers#toBeNegativeInfinity
   * @since 2.6.0
   * @example
   * expect(thing).toBeNegativeInfinity();
   */
  function toBeNegativeInfinity(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {
          pass: actual === Number.NEGATIVE_INFINITY
        };

        if (result.pass) {
          result.message = 'Expected actual not to be -Infinity.';
        } else {
          result.message = function() {
            return 'Expected ' + matchersUtil.pp(actual) + ' to be -Infinity.';
          };
        }

        return result;
      }
    };
  }

  return toBeNegativeInfinity;
};

getJasmineRequireObj().toBeNull = function() {
  /**
   * {@link expect} the actual value to be `null`.
   * @function
   * @name matchers#toBeNull
   * @since 1.3.0
   * @example
   * expect(result).toBeNull();
   */
  function toBeNull() {
    return {
      compare: function(actual) {
        return {
          pass: actual === null
        };
      }
    };
  }

  return toBeNull;
};

getJasmineRequireObj().toBePositiveInfinity = function(j$) {
  /**
   * {@link expect} the actual value to be `Infinity` (infinity).
   * @function
   * @name matchers#toBePositiveInfinity
   * @since 2.6.0
   * @example
   * expect(thing).toBePositiveInfinity();
   */
  function toBePositiveInfinity(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {
          pass: actual === Number.POSITIVE_INFINITY
        };

        if (result.pass) {
          result.message = 'Expected actual not to be Infinity.';
        } else {
          result.message = function() {
            return 'Expected ' + matchersUtil.pp(actual) + ' to be Infinity.';
          };
        }

        return result;
      }
    };
  }

  return toBePositiveInfinity;
};

getJasmineRequireObj().toBeTrue = function() {
  /**
   * {@link expect} the actual value to be `true`.
   * @function
   * @name matchers#toBeTrue
   * @since 3.5.0
   * @example
   * expect(result).toBeTrue();
   */
  function toBeTrue() {
    return {
      compare: function(actual) {
        return {
          pass: actual === true
        };
      }
    };
  }

  return toBeTrue;
};

getJasmineRequireObj().toBeTruthy = function() {
  /**
   * {@link expect} the actual value to be truthy.
   * @function
   * @name matchers#toBeTruthy
   * @since 2.0.0
   * @example
   * expect(thing).toBeTruthy();
   */
  function toBeTruthy() {
    return {
      compare: function(actual) {
        return {
          pass: !!actual
        };
      }
    };
  }

  return toBeTruthy;
};

getJasmineRequireObj().toBeUndefined = function() {
  /**
   * {@link expect} the actual value to be `undefined`.
   * @function
   * @name matchers#toBeUndefined
   * @since 1.3.0
   * @example
   * expect(result).toBeUndefined():
   */
  function toBeUndefined() {
    return {
      compare: function(actual) {
        return {
          pass: void 0 === actual
        };
      }
    };
  }

  return toBeUndefined;
};

getJasmineRequireObj().toContain = function() {
  /**
   * {@link expect} the actual value to contain a specific value.
   * @function
   * @name matchers#toContain
   * @since 2.0.0
   * @param {Object} expected - The value to look for.
   * @example
   * expect(array).toContain(anElement);
   * expect(string).toContain(substring);
   */
  function toContain(matchersUtil) {
    return {
      compare: function(actual, expected) {
        return {
          pass: matchersUtil.contains(actual, expected)
        };
      }
    };
  }

  return toContain;
};

getJasmineRequireObj().toEqual = function(j$) {
  /**
   * {@link expect} the actual value to be equal to the expected, using deep equality comparison.
   * @function
   * @name matchers#toEqual
   * @since 1.3.0
   * @param {Object} expected - Expected value
   * @example
   * expect(bigObject).toEqual({"foo": ['bar', 'baz']});
   */
  function toEqual(matchersUtil) {
    return {
      compare: function(actual, expected) {
        const result = {
            pass: false
          },
          diffBuilder = new j$.DiffBuilder({ prettyPrinter: matchersUtil.pp });

        result.pass = matchersUtil.equals(actual, expected, diffBuilder);

        // TODO: only set error message if test fails
        result.message = diffBuilder.getMessage();

        return result;
      }
    };
  }

  return toEqual;
};

getJasmineRequireObj().toHaveBeenCalled = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toHaveBeenCalled>',
    'expect(<spyObj>).toHaveBeenCalled()'
  );

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called.
   * @function
   * @name matchers#toHaveBeenCalled
   * @since 1.3.0
   * @example
   * expect(mySpy).toHaveBeenCalled();
   * expect(mySpy).not.toHaveBeenCalled();
   */
  function toHaveBeenCalled(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {};

        if (!j$.isSpy(actual)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(actual) + '.'
            )
          );
        }

        if (arguments.length > 1) {
          throw new Error(
            getErrorMsg('Does not take arguments, use toHaveBeenCalledWith')
          );
        }

        result.pass = actual.calls.any();

        result.message = result.pass
          ? 'Expected spy ' + actual.and.identity + ' not to have been called.'
          : 'Expected spy ' + actual.and.identity + ' to have been called.';

        return result;
      }
    };
  }

  return toHaveBeenCalled;
};

getJasmineRequireObj().toHaveBeenCalledBefore = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toHaveBeenCalledBefore>',
    'expect(<spyObj>).toHaveBeenCalledBefore(<spyObj>)'
  );

  /**
   * {@link expect} the actual value (a {@link Spy}) to have been called before another {@link Spy}.
   * @function
   * @name matchers#toHaveBeenCalledBefore
   * @since 2.6.0
   * @param {Spy} expected - {@link Spy} that should have been called after the `actual` {@link Spy}.
   * @example
   * expect(mySpy).toHaveBeenCalledBefore(otherSpy);
   */
  function toHaveBeenCalledBefore(matchersUtil) {
    return {
      compare: function(firstSpy, latterSpy) {
        if (!j$.isSpy(firstSpy)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(firstSpy) + '.'
            )
          );
        }
        if (!j$.isSpy(latterSpy)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(latterSpy) + '.'
            )
          );
        }

        const result = { pass: false };

        if (!firstSpy.calls.count()) {
          result.message =
            'Expected spy ' + firstSpy.and.identity + ' to have been called.';
          return result;
        }
        if (!latterSpy.calls.count()) {
          result.message =
            'Expected spy ' + latterSpy.and.identity + ' to have been called.';
          return result;
        }

        const latest1stSpyCall = firstSpy.calls.mostRecent().invocationOrder;
        const first2ndSpyCall = latterSpy.calls.first().invocationOrder;

        result.pass = latest1stSpyCall < first2ndSpyCall;

        if (result.pass) {
          result.message =
            'Expected spy ' +
            firstSpy.and.identity +
            ' to not have been called before spy ' +
            latterSpy.and.identity +
            ', but it was';
        } else {
          const first1stSpyCall = firstSpy.calls.first().invocationOrder;
          const latest2ndSpyCall = latterSpy.calls.mostRecent().invocationOrder;

          if (first1stSpyCall < first2ndSpyCall) {
            result.message =
              'Expected latest call to spy ' +
              firstSpy.and.identity +
              ' to have been called before first call to spy ' +
              latterSpy.and.identity +
              ' (no interleaved calls)';
          } else if (latest2ndSpyCall > latest1stSpyCall) {
            result.message =
              'Expected first call to spy ' +
              latterSpy.and.identity +
              ' to have been called after latest call to spy ' +
              firstSpy.and.identity +
              ' (no interleaved calls)';
          } else {
            result.message =
              'Expected spy ' +
              firstSpy.and.identity +
              ' to have been called before spy ' +
              latterSpy.and.identity;
          }
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledBefore;
};

getJasmineRequireObj().toHaveBeenCalledOnceWith = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toHaveBeenCalledOnceWith>',
    'expect(<spyObj>).toHaveBeenCalledOnceWith(...arguments)'
  );

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called exactly once, and exactly with the particular arguments.
   * @function
   * @name matchers#toHaveBeenCalledOnceWith
   * @since 3.6.0
   * @param {...Object} - The arguments to look for
   * @example
   * expect(mySpy).toHaveBeenCalledOnceWith('foo', 'bar', 2);
   */
  function toHaveBeenCalledOnceWith(util) {
    return {
      compare: function() {
        const args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1);

        if (!j$.isSpy(actual)) {
          throw new Error(
            getErrorMsg('Expected a spy, but got ' + util.pp(actual) + '.')
          );
        }

        const prettyPrintedCalls = actual.calls
          .allArgs()
          .map(function(argsForCall) {
            return '  ' + util.pp(argsForCall);
          });

        if (
          actual.calls.count() === 1 &&
          util.contains(actual.calls.allArgs(), expectedArgs)
        ) {
          return {
            pass: true,
            message:
              'Expected spy ' +
              actual.and.identity +
              ' to have been called 0 times, multiple times, or once, but with arguments different from:\n' +
              '  ' +
              util.pp(expectedArgs) +
              '\n' +
              'But the actual call was:\n' +
              prettyPrintedCalls.join(',\n') +
              '.\n\n'
          };
        }

        function getDiffs() {
          return actual.calls.allArgs().map(function(argsForCall, callIx) {
            const diffBuilder = new j$.DiffBuilder();
            util.equals(argsForCall, expectedArgs, diffBuilder);
            return diffBuilder.getMessage();
          });
        }

        function butString() {
          switch (actual.calls.count()) {
            case 0:
              return 'But it was never called.\n\n';
            case 1:
              return (
                'But the actual call was:\n' +
                prettyPrintedCalls.join(',\n') +
                '.\n' +
                getDiffs().join('\n') +
                '\n\n'
              );
            default:
              return (
                'But the actual calls were:\n' +
                prettyPrintedCalls.join(',\n') +
                '.\n\n'
              );
          }
        }

        return {
          pass: false,
          message:
            'Expected spy ' +
            actual.and.identity +
            ' to have been called only once, and with given args:\n' +
            '  ' +
            util.pp(expectedArgs) +
            '\n' +
            butString()
        };
      }
    };
  }

  return toHaveBeenCalledOnceWith;
};

getJasmineRequireObj().toHaveBeenCalledTimes = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toHaveBeenCalledTimes>',
    'expect(<spyObj>).toHaveBeenCalledTimes(<Number>)'
  );

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called the specified number of times.
   * @function
   * @name matchers#toHaveBeenCalledTimes
   * @since 2.4.0
   * @param {Number} expected - The number of invocations to look for.
   * @example
   * expect(mySpy).toHaveBeenCalledTimes(3);
   */
  function toHaveBeenCalledTimes(matchersUtil) {
    return {
      compare: function(actual, expected) {
        if (!j$.isSpy(actual)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(actual) + '.'
            )
          );
        }

        const args = Array.prototype.slice.call(arguments, 0),
          result = { pass: false };

        if (!j$.isNumber_(expected)) {
          throw new Error(
            getErrorMsg(
              'The expected times failed is a required argument and must be a number.'
            )
          );
        }

        actual = args[0];
        const calls = actual.calls.count();
        const timesMessage = expected === 1 ? 'once' : expected + ' times';
        result.pass = calls === expected;
        result.message = result.pass
          ? 'Expected spy ' +
            actual.and.identity +
            ' not to have been called ' +
            timesMessage +
            '. It was called ' +
            calls +
            ' times.'
          : 'Expected spy ' +
            actual.and.identity +
            ' to have been called ' +
            timesMessage +
            '. It was called ' +
            calls +
            ' times.';
        return result;
      }
    };
  }

  return toHaveBeenCalledTimes;
};

getJasmineRequireObj().toHaveBeenCalledWith = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toHaveBeenCalledWith>',
    'expect(<spyObj>).toHaveBeenCalledWith(...arguments)'
  );

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called with particular arguments at least once.
   * @function
   * @name matchers#toHaveBeenCalledWith
   * @since 1.3.0
   * @param {...Object} - The arguments to look for
   * @example
   * expect(mySpy).toHaveBeenCalledWith('foo', 'bar', 2);
   */
  function toHaveBeenCalledWith(matchersUtil) {
    return {
      compare: function() {
        const args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1),
          result = { pass: false };

        if (!j$.isSpy(actual)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(actual) + '.'
            )
          );
        }

        if (!actual.calls.any()) {
          result.message = function() {
            return (
              'Expected spy ' +
              actual.and.identity +
              ' to have been called with:\n' +
              '  ' +
              matchersUtil.pp(expectedArgs) +
              '\nbut it was never called.'
            );
          };
          return result;
        }

        if (matchersUtil.contains(actual.calls.allArgs(), expectedArgs)) {
          result.pass = true;
          result.message = function() {
            return (
              'Expected spy ' +
              actual.and.identity +
              ' not to have been called with:\n' +
              '  ' +
              matchersUtil.pp(expectedArgs) +
              '\nbut it was.'
            );
          };
        } else {
          result.message = function() {
            const prettyPrintedCalls = actual.calls
              .allArgs()
              .map(function(argsForCall) {
                return '  ' + matchersUtil.pp(argsForCall);
              });

            const diffs = actual.calls
              .allArgs()
              .map(function(argsForCall, callIx) {
                const diffBuilder = new j$.DiffBuilder();
                matchersUtil.equals(argsForCall, expectedArgs, diffBuilder);
                return (
                  'Call ' +
                  callIx +
                  ':\n' +
                  diffBuilder.getMessage().replace(/^/gm, '  ')
                );
              });

            return (
              'Expected spy ' +
              actual.and.identity +
              ' to have been called with:\n' +
              '  ' +
              matchersUtil.pp(expectedArgs) +
              '\n' +
              '' +
              'but actual calls were:\n' +
              prettyPrintedCalls.join(',\n') +
              '.\n\n' +
              diffs.join('\n')
            );
          };
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledWith;
};

getJasmineRequireObj().toHaveClass = function(j$) {
  /**
   * {@link expect} the actual value to be a DOM element that has the expected class
   * @function
   * @name matchers#toHaveClass
   * @since 3.0.0
   * @param {Object} expected - The class name to test for
   * @example
   * const el = document.createElement('div');
   * el.className = 'foo bar baz';
   * expect(el).toHaveClass('bar');
   */
  function toHaveClass(matchersUtil) {
    return {
      compare: function(actual, expected) {
        if (!isElement(actual)) {
          throw new Error(matchersUtil.pp(actual) + ' is not a DOM element');
        }

        return {
          pass: actual.classList.contains(expected)
        };
      }
    };
  }

  function isElement(maybeEl) {
    return (
      maybeEl && maybeEl.classList && j$.isFunction_(maybeEl.classList.contains)
    );
  }

  return toHaveClass;
};

getJasmineRequireObj().toHaveSize = function(j$) {
  /**
   * {@link expect} the actual size to be equal to the expected, using array-like length or object keys size.
   * @function
   * @name matchers#toHaveSize
   * @since 3.6.0
   * @param {Object} expected - Expected size
   * @example
   * array = [1,2];
   * expect(array).toHaveSize(2);
   */
  function toHaveSize() {
    return {
      compare: function(actual, expected) {
        const result = {
          pass: false
        };

        if (
          j$.isA_('WeakSet', actual) ||
          j$.isWeakMap(actual) ||
          j$.isDataView(actual)
        ) {
          throw new Error('Cannot get size of ' + actual + '.');
        }

        if (j$.isSet(actual) || j$.isMap(actual)) {
          result.pass = actual.size === expected;
        } else if (isLength(actual.length)) {
          result.pass = actual.length === expected;
        } else {
          result.pass = Object.keys(actual).length === expected;
        }

        return result;
      }
    };
  }

  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  function isLength(value) {
    return (
      typeof value == 'number' &&
      value > -1 &&
      value % 1 === 0 &&
      value <= MAX_SAFE_INTEGER
    );
  }

  return toHaveSize;
};

getJasmineRequireObj().toHaveSpyInteractions = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toHaveSpyInteractions>',
    'expect(<spyObj>).toHaveSpyInteractions()'
  );

  /**
   * {@link expect} the actual (a {@link SpyObj}) spies to have been called.
   * @function
   * @name matchers#toHaveSpyInteractions
   * @since 4.1.0
   * @example
   * expect(mySpyObj).toHaveSpyInteractions();
   * expect(mySpyObj).not.toHaveSpyInteractions();
   */
  function toHaveSpyInteractions(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {};

        if (!j$.isObject_(actual)) {
          throw new Error(
            getErrorMsg('Expected a spy object, but got ' + typeof actual + '.')
          );
        }

        if (arguments.length > 1) {
          throw new Error(getErrorMsg('Does not take arguments'));
        }

        result.pass = false;
        let hasSpy = false;
        const calledSpies = [];
        for (const spy of Object.values(actual)) {
          if (!j$.isSpy(spy)) continue;
          hasSpy = true;

          if (spy.calls.any()) {
            result.pass = true;
            calledSpies.push([spy.and.identity, spy.calls.count()]);
          }
        }

        if (!hasSpy) {
          throw new Error(
            getErrorMsg(
              'Expected a spy object with spies, but object has no spies.'
            )
          );
        }

        let resultMessage;
        if (result.pass) {
          resultMessage =
            'Expected spy object spies not to have been called, ' +
            'but the following spies were called: ';
          resultMessage += calledSpies
            .map(([spyName, spyCount]) => {
              return `${spyName} called ${spyCount} time(s)`;
            })
            .join(', ');
        } else {
          resultMessage =
            'Expected spy object spies to have been called, ' +
            'but no spies were called.';
        }
        result.message = resultMessage;

        return result;
      }
    };
  }

  return toHaveSpyInteractions;
};

getJasmineRequireObj().toMatch = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toMatch>',
    'expect(<expectation>).toMatch(<string> || <regexp>)'
  );

  /**
   * {@link expect} the actual value to match a regular expression
   * @function
   * @name matchers#toMatch
   * @since 1.3.0
   * @param {RegExp|String} expected - Value to look for in the string.
   * @example
   * expect("my string").toMatch(/string$/);
   * expect("other string").toMatch("her");
   */
  function toMatch() {
    return {
      compare: function(actual, expected) {
        if (!j$.isString_(expected) && !j$.isA_('RegExp', expected)) {
          throw new Error(getErrorMsg('Expected is not a String or a RegExp'));
        }

        const regexp = new RegExp(expected);

        return {
          pass: regexp.test(actual)
        };
      }
    };
  }

  return toMatch;
};

getJasmineRequireObj().toThrow = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toThrow>',
    'expect(function() {<expectation>}).toThrow()'
  );

  /**
   * {@link expect} a function to `throw` something.
   * @function
   * @name matchers#toThrow
   * @since 2.0.0
   * @param {Object} [expected] - Value that should be thrown. If not provided, simply the fact that something was thrown will be checked.
   * @example
   * expect(function() { return 'things'; }).toThrow('foo');
   * expect(function() { return 'stuff'; }).toThrow();
   */
  function toThrow(matchersUtil) {
    return {
      compare: function(actual, expected) {
        const result = { pass: false };
        let threw = false;
        let thrown;

        if (typeof actual != 'function') {
          throw new Error(getErrorMsg('Actual is not a Function'));
        }

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          result.message = 'Expected function to throw an exception.';
          return result;
        }

        if (arguments.length == 1) {
          result.pass = true;
          result.message = function() {
            return (
              'Expected function not to throw, but it threw ' +
              matchersUtil.pp(thrown) +
              '.'
            );
          };

          return result;
        }

        if (matchersUtil.equals(thrown, expected)) {
          result.pass = true;
          result.message = function() {
            return (
              'Expected function not to throw ' +
              matchersUtil.pp(expected) +
              '.'
            );
          };
        } else {
          result.message = function() {
            return (
              'Expected function to throw ' +
              matchersUtil.pp(expected) +
              ', but it threw ' +
              matchersUtil.pp(thrown) +
              '.'
            );
          };
        }

        return result;
      }
    };
  }

  return toThrow;
};

getJasmineRequireObj().toThrowError = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toThrowError>',
    'expect(function() {<expectation>}).toThrowError(<ErrorConstructor>, <message>)'
  );

  /**
   * {@link expect} a function to `throw` an `Error`.
   * @function
   * @name matchers#toThrowError
   * @since 2.0.0
   * @param {Error} [expected] - `Error` constructor the object that was thrown needs to be an instance of. If not provided, `Error` will be used.
   * @param {RegExp|String} [message] - The message that should be set on the thrown `Error`
   * @example
   * expect(function() { return 'things'; }).toThrowError(MyCustomError, 'message');
   * expect(function() { return 'things'; }).toThrowError(MyCustomError, /bar/);
   * expect(function() { return 'stuff'; }).toThrowError(MyCustomError);
   * expect(function() { return 'other'; }).toThrowError(/foo/);
   * expect(function() { return 'other'; }).toThrowError();
   */
  function toThrowError(matchersUtil) {
    return {
      compare: function(actual) {
        const errorMatcher = getMatcher.apply(null, arguments);

        if (typeof actual != 'function') {
          throw new Error(getErrorMsg('Actual is not a Function'));
        }

        let thrown;

        try {
          actual();
          return fail('Expected function to throw an Error.');
        } catch (e) {
          thrown = e;
        }

        if (!j$.isError_(thrown)) {
          return fail(function() {
            return (
              'Expected function to throw an Error, but it threw ' +
              matchersUtil.pp(thrown) +
              '.'
            );
          });
        }

        return errorMatcher.match(thrown);
      }
    };

    function getMatcher() {
      let expected, errorType;

      if (arguments[2]) {
        errorType = arguments[1];
        expected = arguments[2];
        if (!isAnErrorType(errorType)) {
          throw new Error(getErrorMsg('Expected error type is not an Error.'));
        }

        return exactMatcher(expected, errorType);
      } else if (arguments[1]) {
        expected = arguments[1];

        if (isAnErrorType(arguments[1])) {
          return exactMatcher(null, arguments[1]);
        } else {
          return exactMatcher(arguments[1], null);
        }
      } else {
        return anyMatcher();
      }
    }

    function anyMatcher() {
      return {
        match: function(error) {
          return pass(
            'Expected function not to throw an Error, but it threw ' +
              j$.fnNameFor(error) +
              '.'
          );
        }
      };
    }

    function exactMatcher(expected, errorType) {
      if (expected && !isStringOrRegExp(expected)) {
        if (errorType) {
          throw new Error(
            getErrorMsg('Expected error message is not a string or RegExp.')
          );
        } else {
          throw new Error(
            getErrorMsg('Expected is not an Error, string, or RegExp.')
          );
        }
      }

      function messageMatch(message) {
        if (typeof expected == 'string') {
          return expected == message;
        } else {
          return expected.test(message);
        }
      }

      const errorTypeDescription = errorType
        ? j$.fnNameFor(errorType)
        : 'an exception';

      function thrownDescription(thrown) {
        const thrownName = errorType
          ? j$.fnNameFor(thrown.constructor)
          : 'an exception';
        let thrownMessage = '';

        if (expected) {
          thrownMessage = ' with message ' + matchersUtil.pp(thrown.message);
        }

        return thrownName + thrownMessage;
      }

      function messageDescription() {
        if (expected === null) {
          return '';
        } else if (expected instanceof RegExp) {
          return ' with a message matching ' + matchersUtil.pp(expected);
        } else {
          return ' with message ' + matchersUtil.pp(expected);
        }
      }

      function matches(error) {
        return (
          (errorType === null || error instanceof errorType) &&
          (expected === null || messageMatch(error.message))
        );
      }

      return {
        match: function(thrown) {
          if (matches(thrown)) {
            return pass(function() {
              return (
                'Expected function not to throw ' +
                errorTypeDescription +
                messageDescription() +
                '.'
              );
            });
          } else {
            return fail(function() {
              return (
                'Expected function to throw ' +
                errorTypeDescription +
                messageDescription() +
                ', but it threw ' +
                thrownDescription(thrown) +
                '.'
              );
            });
          }
        }
      };
    }

    function isStringOrRegExp(potential) {
      return potential instanceof RegExp || typeof potential == 'string';
    }

    function isAnErrorType(type) {
      if (typeof type !== 'function') {
        return false;
      }

      const Surrogate = function() {};
      Surrogate.prototype = type.prototype;
      return j$.isError_(new Surrogate());
    }
  }

  function pass(message) {
    return {
      pass: true,
      message: message
    };
  }

  function fail(message) {
    return {
      pass: false,
      message: message
    };
  }

  return toThrowError;
};

getJasmineRequireObj().toThrowMatching = function(j$) {
  const usageError = j$.formatErrorMsg(
    '<toThrowMatching>',
    'expect(function() {<expectation>}).toThrowMatching(<Predicate>)'
  );

  /**
   * {@link expect} a function to `throw` something matching a predicate.
   * @function
   * @name matchers#toThrowMatching
   * @since 3.0.0
   * @param {Function} predicate - A function that takes the thrown exception as its parameter and returns true if it matches.
   * @example
   * expect(function() { throw new Error('nope'); }).toThrowMatching(function(thrown) { return thrown.message === 'nope'; });
   */
  function toThrowMatching(matchersUtil) {
    return {
      compare: function(actual, predicate) {
        if (typeof actual !== 'function') {
          throw new Error(usageError('Actual is not a Function'));
        }

        if (typeof predicate !== 'function') {
          throw new Error(usageError('Predicate is not a Function'));
        }

        let thrown;

        try {
          actual();
          return fail('Expected function to throw an exception.');
        } catch (e) {
          thrown = e;
        }

        if (predicate(thrown)) {
          return pass(
            'Expected function not to throw an exception matching a predicate.'
          );
        } else {
          return fail(function() {
            return (
              'Expected function to throw an exception matching a predicate, ' +
              'but it threw ' +
              thrownDescription(thrown) +
              '.'
            );
          });
        }
      }
    };

    function thrownDescription(thrown) {
      if (thrown && thrown.constructor) {
        return (
          j$.fnNameFor(thrown.constructor) +
          ' with message ' +
          matchersUtil.pp(thrown.message)
        );
      } else {
        return matchersUtil.pp(thrown);
      }
    }
  }

  function pass(message) {
    return {
      pass: true,
      message: message
    };
  }

  function fail(message) {
    return {
      pass: false,
      message: message
    };
  }

  return toThrowMatching;
};

getJasmineRequireObj().MockDate = function(j$) {
  function MockDate(global) {
    let currentTime = 0;

    if (!global || !global.Date) {
      this.install = function() {};
      this.tick = function() {};
      this.uninstall = function() {};
      return this;
    }

    const GlobalDate = global.Date;

    this.install = function(mockDate) {
      if (mockDate instanceof GlobalDate) {
        currentTime = mockDate.getTime();
      } else {
        if (!j$.util.isUndefined(mockDate)) {
          throw new Error(
            'The argument to jasmine.clock().mockDate(), if specified, ' +
              'should be a Date instance.'
          );
        }

        currentTime = new GlobalDate().getTime();
      }

      global.Date = FakeDate;
    };

    this.tick = function(millis) {
      millis = millis || 0;
      currentTime = currentTime + millis;
    };

    this.uninstall = function() {
      currentTime = 0;
      global.Date = GlobalDate;
    };

    createDateProperties();

    return this;

    function FakeDate() {
      switch (arguments.length) {
        case 0:
          return new GlobalDate(currentTime);
        case 1:
          return new GlobalDate(arguments[0]);
        case 2:
          return new GlobalDate(arguments[0], arguments[1]);
        case 3:
          return new GlobalDate(arguments[0], arguments[1], arguments[2]);
        case 4:
          return new GlobalDate(
            arguments[0],
            arguments[1],
            arguments[2],
            arguments[3]
          );
        case 5:
          return new GlobalDate(
            arguments[0],
            arguments[1],
            arguments[2],
            arguments[3],
            arguments[4]
          );
        case 6:
          return new GlobalDate(
            arguments[0],
            arguments[1],
            arguments[2],
            arguments[3],
            arguments[4],
            arguments[5]
          );
        default:
          return new GlobalDate(
            arguments[0],
            arguments[1],
            arguments[2],
            arguments[3],
            arguments[4],
            arguments[5],
            arguments[6]
          );
      }
    }

    function createDateProperties() {
      FakeDate.prototype = GlobalDate.prototype;

      FakeDate.now = function() {
        return currentTime;
      };

      FakeDate.toSource = GlobalDate.toSource;
      FakeDate.toString = GlobalDate.toString;
      FakeDate.parse = GlobalDate.parse;
      FakeDate.UTC = GlobalDate.UTC;
    }
  }

  return MockDate;
};

getJasmineRequireObj().NeverSkipPolicy = function(j$) {
  function NeverSkipPolicy(queueableFns) {}

  NeverSkipPolicy.prototype.skipTo = function(lastRanFnIx) {
    return lastRanFnIx + 1;
  };

  NeverSkipPolicy.prototype.fnErrored = function(fnIx) {};

  return NeverSkipPolicy;
};

getJasmineRequireObj().ParallelReportDispatcher = function(j$) {
  'use strict';

  /**
   * @class ParallelReportDispatcher
   * @implements Reporter
   * @classdesc A report dispatcher packaged for convenient use from outside jasmine-core.
   *
   * This is intended to help packages like `jasmine` (the Jasmine runner for
   * Node.js) do their own report dispatching in order to support parallel
   * execution. If you aren't implementing a runner package that supports
   * parallel execution, this class probably isn't what you're looking for.
   *
   * Warning: Do not use ParallelReportDispatcher in the same process that
   * Jasmine specs run in. Doing so will break Jasmine's error handling.
   * @param onError {function} Function called when an unhandled exception, unhandled promise rejection, or explicit reporter failure occurs
   */
  function ParallelReportDispatcher(onError, deps = {}) {
    const ReportDispatcher = deps.ReportDispatcher || j$.ReportDispatcher;
    const QueueRunner = deps.QueueRunner || j$.QueueRunner;
    const globalErrors = deps.globalErrors || new j$.GlobalErrors();
    const dispatcher = new ReportDispatcher(
      j$.reporterEvents,
      function(queueRunnerOptions) {
        queueRunnerOptions = {
          ...queueRunnerOptions,
          globalErrors,
          timeout: { setTimeout, clearTimeout },
          fail: function(error) {
            // A callback-style async reporter called either done.fail()
            // or done(anError).
            if (!error) {
              error = new Error('A reporter called done.fail()');
            }

            onError(error);
          },
          onException: function(error) {
            // A reporter method threw an exception or returned a rejected
            // promise, or there was an unhandled exception or unhandled promise
            // rejection while an asynchronous reporter method was running.
            onError(error);
          }
        };
        new QueueRunner(queueRunnerOptions).execute();
      },
      function(error) {
        // A reporter called done() more than once.
        onError(error);
      }
    );

    const self = {
      /**
       * Adds a reporter to the list of reporters that events will be dispatched to.
       * @function
       * @name ParallelReportDispatcher#addReporter
       * @param {Reporter} reporterToAdd The reporter to be added.
       * @see custom_reporter
       */
      addReporter: dispatcher.addReporter.bind(dispatcher),
      /**
       * Clears all registered reporters.
       * @function
       * @name ParallelReportDispatcher#clearReporters
       */
      clearReporters: dispatcher.clearReporters.bind(dispatcher),
      /**
       * Installs a global error handler. After this method is called, any
       * unhandled exceptions or unhandled promise rejections will be passed to
       * the onError callback that was passed to the constructor.
       * @function
       * @name ParallelReportDispatcher#installGlobalErrors
       */
      installGlobalErrors: globalErrors.install.bind(globalErrors),
      /**
       * Uninstalls the global error handler.
       * @function
       * @name ParallelReportDispatcher#uninstallGlobalErrors
       */
      uninstallGlobalErrors: function() {
        // late-bind uninstall because it doesn't exist until install is called
        globalErrors.uninstall(globalErrors);
      }
    };

    for (const eventName of j$.reporterEvents) {
      self[eventName] = dispatcher[eventName].bind(dispatcher);
    }

    return self;
  }

  return ParallelReportDispatcher;
};

getJasmineRequireObj().makePrettyPrinter = function(j$) {
  class SinglePrettyPrintRun {
    constructor(customObjectFormatters, pp) {
      this.customObjectFormatters_ = customObjectFormatters;
      this.ppNestLevel_ = 0;
      this.seen = [];
      this.length = 0;
      this.stringParts = [];
      this.pp_ = pp;
    }

    format(value) {
      this.ppNestLevel_++;
      try {
        const customFormatResult = this.applyCustomFormatters_(value);

        if (customFormatResult) {
          this.emitScalar(customFormatResult);
        } else if (j$.util.isUndefined(value)) {
          this.emitScalar('undefined');
        } else if (value === null) {
          this.emitScalar('null');
        } else if (value === 0 && 1 / value === -Infinity) {
          this.emitScalar('-0');
        } else if (value === j$.getGlobal()) {
          this.emitScalar('<global>');
        } else if (value.jasmineToString) {
          this.emitScalar(value.jasmineToString(this.pp_));
        } else if (j$.isString_(value)) {
          this.emitString(value);
        } else if (j$.isSpy(value)) {
          this.emitScalar('spy on ' + value.and.identity);
        } else if (j$.isSpy(value.toString)) {
          this.emitScalar('spy on ' + value.toString.and.identity);
        } else if (value instanceof RegExp) {
          this.emitScalar(value.toString());
        } else if (typeof value === 'function') {
          this.emitScalar('Function');
        } else if (j$.isDomNode(value)) {
          if (value.tagName) {
            this.emitDomElement(value);
          } else {
            this.emitScalar('HTMLNode');
          }
        } else if (value instanceof Date) {
          this.emitScalar('Date(' + value + ')');
        } else if (j$.isSet(value)) {
          this.emitSet(value);
        } else if (j$.isMap(value)) {
          this.emitMap(value);
        } else if (j$.isTypedArray_(value)) {
          this.emitTypedArray(value);
        } else if (
          value.toString &&
          typeof value === 'object' &&
          !j$.isArray_(value) &&
          hasCustomToString(value)
        ) {
          try {
            this.emitScalar(value.toString());
          } catch (e) {
            this.emitScalar('has-invalid-toString-method');
          }
        } else if (this.seen.includes(value)) {
          this.emitScalar(
            '<circular reference: ' +
              (j$.isArray_(value) ? 'Array' : 'Object') +
              '>'
          );
        } else if (j$.isArray_(value) || j$.isA_('Object', value)) {
          this.seen.push(value);
          if (j$.isArray_(value)) {
            this.emitArray(value);
          } else {
            this.emitObject(value);
          }
          this.seen.pop();
        } else {
          this.emitScalar(value.toString());
        }
      } catch (e) {
        if (this.ppNestLevel_ > 1 || !(e instanceof MaxCharsReachedError)) {
          throw e;
        }
      } finally {
        this.ppNestLevel_--;
      }
    }

    applyCustomFormatters_(value) {
      return customFormat(value, this.customObjectFormatters_);
    }

    iterateObject(obj, fn) {
      const objKeys = j$.MatchersUtil.keys(obj, j$.isArray_(obj));
      const length = Math.min(objKeys.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);

      for (let i = 0; i < length; i++) {
        fn(objKeys[i]);
      }

      return objKeys.length > length;
    }

    emitScalar(value) {
      this.append(value);
    }

    emitString(value) {
      this.append("'" + value + "'");
    }

    emitArray(array) {
      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        this.append('Array');
        return;
      }

      const length = Math.min(array.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
      this.append('[ ');

      for (let i = 0; i < length; i++) {
        if (i > 0) {
          this.append(', ');
        }
        this.format(array[i]);
      }
      if (array.length > length) {
        this.append(', ...');
      }

      let first = array.length === 0;
      const wasTruncated = this.iterateObject(array, property => {
        if (first) {
          first = false;
        } else {
          this.append(', ');
        }

        this.formatProperty(array, property);
      });

      if (wasTruncated) {
        this.append(', ...');
      }

      this.append(' ]');
    }

    emitSet(set) {
      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        this.append('Set');
        return;
      }
      this.append('Set( ');
      const size = Math.min(set.size, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
      let i = 0;
      set.forEach(function(value, key) {
        if (i >= size) {
          return;
        }
        if (i > 0) {
          this.append(', ');
        }
        this.format(value);

        i++;
      }, this);
      if (set.size > size) {
        this.append(', ...');
      }
      this.append(' )');
    }

    emitMap(map) {
      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        this.append('Map');
        return;
      }
      this.append('Map( ');
      const size = Math.min(map.size, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
      let i = 0;
      map.forEach(function(value, key) {
        if (i >= size) {
          return;
        }
        if (i > 0) {
          this.append(', ');
        }
        this.format([key, value]);

        i++;
      }, this);
      if (map.size > size) {
        this.append(', ...');
      }
      this.append(' )');
    }

    emitObject(obj) {
      const ctor = obj.constructor;
      const constructorName =
        typeof ctor === 'function' && obj instanceof ctor
          ? j$.fnNameFor(obj.constructor)
          : 'null';

      this.append(constructorName);

      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        return;
      }

      this.append('({ ');
      let first = true;

      const wasTruncated = this.iterateObject(obj, property => {
        if (first) {
          first = false;
        } else {
          this.append(', ');
        }

        this.formatProperty(obj, property);
      });

      if (wasTruncated) {
        this.append(', ...');
      }

      this.append(' })');
    }

    emitTypedArray(arr) {
      const constructorName = j$.fnNameFor(arr.constructor);
      const limitedArray = Array.prototype.slice.call(
        arr,
        0,
        j$.MAX_PRETTY_PRINT_ARRAY_LENGTH
      );
      let itemsString = Array.prototype.join.call(limitedArray, ', ');

      if (limitedArray.length !== arr.length) {
        itemsString += ', ...';
      }

      this.append(constructorName + ' [ ' + itemsString + ' ]');
    }

    emitDomElement(el) {
      const tagName = el.tagName.toLowerCase();
      let out = '<' + tagName;

      for (const attr of el.attributes) {
        out += ' ' + attr.name;

        if (attr.value !== '') {
          out += '="' + attr.value + '"';
        }
      }

      out += '>';

      if (el.childElementCount !== 0 || el.textContent !== '') {
        out += '...</' + tagName + '>';
      }

      this.append(out);
    }

    formatProperty(obj, property) {
      if (typeof property === 'symbol') {
        this.append(property.toString());
      } else {
        this.append(property);
      }

      this.append(': ');
      this.format(obj[property]);
    }

    append(value) {
      // This check protects us from the rare case where an object has overriden
      // `toString()` with an invalid implementation (returning a non-string).
      if (typeof value !== 'string') {
        value = Object.prototype.toString.call(value);
      }

      const result = truncate(value, j$.MAX_PRETTY_PRINT_CHARS - this.length);
      this.length += result.value.length;
      this.stringParts.push(result.value);

      if (result.truncated) {
        throw new MaxCharsReachedError();
      }
    }
  }

  function hasCustomToString(value) {
    // value.toString !== Object.prototype.toString if value has no custom toString but is from another context (e.g.
    // iframe, web worker)
    try {
      return (
        j$.isFunction_(value.toString) &&
        value.toString !== Object.prototype.toString &&
        value.toString() !== Object.prototype.toString.call(value)
      );
    } catch (e) {
      // The custom toString() threw.
      return true;
    }
  }

  function truncate(s, maxlen) {
    if (s.length <= maxlen) {
      return { value: s, truncated: false };
    }

    s = s.substring(0, maxlen - 4) + ' ...';
    return { value: s, truncated: true };
  }

  function MaxCharsReachedError() {
    this.message =
      'Exceeded ' +
      j$.MAX_PRETTY_PRINT_CHARS +
      ' characters while pretty-printing a value';
  }

  MaxCharsReachedError.prototype = new Error();

  function customFormat(value, customObjectFormatters) {
    for (const formatter of customObjectFormatters) {
      const result = formatter(value);

      if (result !== undefined) {
        return result;
      }
    }
  }

  return function(customObjectFormatters) {
    customObjectFormatters = customObjectFormatters || [];

    const pp = function(value) {
      const prettyPrinter = new SinglePrettyPrintRun(
        customObjectFormatters,
        pp
      );
      prettyPrinter.format(value);
      return prettyPrinter.stringParts.join('');
    };

    pp.customFormat_ = function(value) {
      return customFormat(value, customObjectFormatters);
    };

    return pp;
  };
};

getJasmineRequireObj().QueueRunner = function(j$) {
  let nextid = 1;

  function StopExecutionError() {}
  StopExecutionError.prototype = new Error();
  j$.StopExecutionError = StopExecutionError;

  function once(fn, onTwice) {
    let called = false;
    return function(arg) {
      if (called) {
        if (onTwice) {
          onTwice();
        }
      } else {
        called = true;
        // Direct call using single parameter, because cleanup/next does not need more
        fn(arg);
      }
      return null;
    };
  }

  function fallbackOnMultipleDone() {
    console.error(
      new Error(
        "An asynchronous function called its 'done' " +
          'callback more than once, in a QueueRunner without a onMultipleDone ' +
          'handler.'
      )
    );
  }

  function emptyFn() {}

  function QueueRunner(attrs) {
    this.id_ = nextid++;
    this.queueableFns = attrs.queueableFns || [];
    this.onComplete = attrs.onComplete || emptyFn;
    this.clearStack =
      attrs.clearStack ||
      function(fn) {
        fn();
      };
    this.onException = attrs.onException || emptyFn;
    this.onMultipleDone = attrs.onMultipleDone || fallbackOnMultipleDone;
    this.userContext = attrs.userContext || new j$.UserContext();
    this.timeout = attrs.timeout || {
      setTimeout: setTimeout,
      clearTimeout: clearTimeout
    };
    this.fail = attrs.fail || emptyFn;
    this.globalErrors = attrs.globalErrors || {
      pushListener: emptyFn,
      popListener: emptyFn
    };

    const SkipPolicy = attrs.SkipPolicy || j$.NeverSkipPolicy;
    this.skipPolicy_ = new SkipPolicy(this.queueableFns);
    this.errored_ = false;

    if (typeof this.onComplete !== 'function') {
      throw new Error('invalid onComplete ' + JSON.stringify(this.onComplete));
    }
  }

  QueueRunner.prototype.execute = function() {
    this.handleFinalError = error => {
      this.onException(error);
    };
    this.globalErrors.pushListener(this.handleFinalError);
    this.run(0);
  };

  QueueRunner.prototype.clearTimeout = function(timeoutId) {
    Function.prototype.apply.apply(this.timeout.clearTimeout, [
      j$.getGlobal(),
      [timeoutId]
    ]);
  };

  QueueRunner.prototype.setTimeout = function(fn, timeout) {
    return Function.prototype.apply.apply(this.timeout.setTimeout, [
      j$.getGlobal(),
      [fn, timeout]
    ]);
  };

  QueueRunner.prototype.attempt = function attempt(iterativeIndex) {
    let timeoutId;
    let timedOut;
    let completedSynchronously = true;

    const onException = e => {
      this.onException(e);
      this.recordError_(iterativeIndex);
    };

    function handleError(error) {
      // TODO probably shouldn't next() right away here.
      // That makes debugging async failures much more confusing.
      onException(error);
    }
    const cleanup = once(() => {
      if (timeoutId !== void 0) {
        this.clearTimeout(timeoutId);
      }
      this.globalErrors.popListener(handleError);
    });
    const next = once(
      err => {
        cleanup();

        if (typeof err !== 'undefined') {
          if (!(err instanceof StopExecutionError) && !err.jasmineMessage) {
            this.fail(err);
          }
          this.recordError_(iterativeIndex);
        }

        const runNext = () => {
          this.run(this.nextFnIx_(iterativeIndex));
        };

        if (completedSynchronously) {
          this.setTimeout(runNext);
        } else {
          runNext();
        }
      },
      () => {
        try {
          if (!timedOut) {
            this.onMultipleDone();
          }
        } catch (error) {
          // Any error we catch here is probably due to a bug in Jasmine,
          // and it's not likely to end up anywhere useful if we let it
          // propagate. Log it so it can at least show up when debugging.
          console.error(error);
        }
      }
    );
    timedOut = false;
    const queueableFn = this.queueableFns[iterativeIndex];

    next.fail = function nextFail() {
      this.fail.apply(null, arguments);
      this.recordError_(iterativeIndex);
      next();
    }.bind(this);

    this.globalErrors.pushListener(handleError);

    if (queueableFn.timeout !== undefined) {
      const timeoutInterval =
        queueableFn.timeout || j$.DEFAULT_TIMEOUT_INTERVAL;
      timeoutId = this.setTimeout(function() {
        timedOut = true;
        const error = new Error(
          'Timeout - Async function did not complete within ' +
            timeoutInterval +
            'ms ' +
            (queueableFn.timeout
              ? '(custom timeout)'
              : '(set by jasmine.DEFAULT_TIMEOUT_INTERVAL)')
        );
        // TODO Need to decide what to do about a successful completion after a
        //   timeout. That should probably not be a deprecation, and maybe not
        //   an error in 4.0. (But a diagnostic of some sort might be helpful.)
        onException(error);
        next();
      }, timeoutInterval);
    }

    try {
      let maybeThenable;

      if (queueableFn.fn.length === 0) {
        maybeThenable = queueableFn.fn.call(this.userContext);

        if (maybeThenable && j$.isFunction_(maybeThenable.then)) {
          maybeThenable.then(
            wrapInPromiseResolutionHandler(next),
            onPromiseRejection
          );
          completedSynchronously = false;
          return { completedSynchronously: false };
        }
      } else {
        maybeThenable = queueableFn.fn.call(this.userContext, next);
        this.diagnoseConflictingAsync_(queueableFn.fn, maybeThenable);
        completedSynchronously = false;
        return { completedSynchronously: false };
      }
    } catch (e) {
      onException(e);
      this.recordError_(iterativeIndex);
    }

    cleanup();
    return { completedSynchronously: true };

    function onPromiseRejection(e) {
      onException(e);
      next();
    }
  };

  QueueRunner.prototype.run = function(recursiveIndex) {
    const length = this.queueableFns.length;

    for (
      let iterativeIndex = recursiveIndex;
      iterativeIndex < length;
      iterativeIndex = this.nextFnIx_(iterativeIndex)
    ) {
      const result = this.attempt(iterativeIndex);

      if (!result.completedSynchronously) {
        return;
      }
    }

    this.clearStack(() => {
      this.globalErrors.popListener(this.handleFinalError);

      if (this.errored_) {
        this.onComplete(new StopExecutionError());
      } else {
        this.onComplete();
      }
    });
  };

  QueueRunner.prototype.nextFnIx_ = function(currentFnIx) {
    const result = this.skipPolicy_.skipTo(currentFnIx);

    if (result === currentFnIx) {
      throw new Error("Can't skip to the same queueable fn that just finished");
    }

    return result;
  };

  QueueRunner.prototype.recordError_ = function(currentFnIx) {
    this.errored_ = true;
    this.skipPolicy_.fnErrored(currentFnIx);
  };

  QueueRunner.prototype.diagnoseConflictingAsync_ = function(fn, retval) {
    if (retval && j$.isFunction_(retval.then)) {
      // Issue a warning that matches the user's code.
      // Omit the stack trace because there's almost certainly no user code
      // on the stack at this point.
      if (j$.isAsyncFunction_(fn)) {
        this.onException(
          new Error(
            'An asynchronous before/it/after ' +
              'function was defined with the async keyword but also took a ' +
              'done callback. Either remove the done callback (recommended) or ' +
              'remove the async keyword.'
          )
        );
      } else {
        this.onException(
          new Error(
            'An asynchronous before/it/after ' +
              'function took a done callback but also returned a promise. ' +
              'Either remove the done callback (recommended) or change the ' +
              'function to not return a promise.'
          )
        );
      }
    }
  };

  function wrapInPromiseResolutionHandler(fn) {
    return function(maybeArg) {
      if (j$.isError_(maybeArg)) {
        fn(maybeArg);
      } else {
        fn();
      }
    };
  }

  return QueueRunner;
};

getJasmineRequireObj().ReportDispatcher = function(j$) {
  'use strict';

  function ReportDispatcher(methods, queueRunnerFactory, onLateError) {
    const dispatchedMethods = methods || [];

    for (const method of dispatchedMethods) {
      this[method] = (function(m) {
        return function() {
          return dispatch(m, arguments);
        };
      })(method);
    }

    let reporters = [];
    let fallbackReporter = null;

    this.addReporter = function(reporter) {
      reporters.push(reporter);
    };

    this.provideFallbackReporter = function(reporter) {
      fallbackReporter = reporter;
    };

    this.clearReporters = function() {
      reporters = [];
    };

    return this;

    function dispatch(method, args) {
      if (reporters.length === 0 && fallbackReporter !== null) {
        reporters.push(fallbackReporter);
      }
      const fns = [];
      for (const reporter of reporters) {
        addFn(fns, reporter, method, args);
      }

      return new Promise(function(resolve) {
        queueRunnerFactory({
          queueableFns: fns,
          onComplete: resolve,
          isReporter: true,
          onMultipleDone: function() {
            onLateError(
              new Error(
                "An asynchronous reporter callback called its 'done' callback " +
                  'more than once.'
              )
            );
          }
        });
      });
    }

    function addFn(fns, reporter, method, args) {
      const fn = reporter[method];
      if (!fn) {
        return;
      }

      const thisArgs = j$.util.cloneArgs(args);
      if (fn.length <= 1) {
        fns.push({
          fn: function() {
            return fn.apply(reporter, thisArgs);
          }
        });
      } else {
        fns.push({
          fn: function(done) {
            return fn.apply(reporter, thisArgs.concat([done]));
          }
        });
      }
    }
  }

  return ReportDispatcher;
};

getJasmineRequireObj().reporterEvents = function() {
  const events = [
    /**
     * `jasmineStarted` is called after all of the specs have been loaded, but just before execution starts.
     * @function
     * @name Reporter#jasmineStarted
     * @param {JasmineStartedInfo} suiteInfo Information about the full Jasmine suite that is being run
     * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
     * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
     * @see async
     */
    'jasmineStarted',
    /**
     * When the entire suite has finished execution `jasmineDone` is called
     * @function
     * @name Reporter#jasmineDone
     * @param {JasmineDoneInfo} suiteInfo Information about the full Jasmine suite that just finished running.
     * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
     * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
     * @see async
     */
    'jasmineDone',
    /**
     * `suiteStarted` is invoked when a `describe` starts to run
     * @function
     * @name Reporter#suiteStarted
     * @param {SuiteResult} result Information about the individual {@link describe} being run
     * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
     * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
     * @see async
     */
    'suiteStarted',
    /**
     * `suiteDone` is invoked when all of the child specs and suites for a given suite have been run
     *
     * While jasmine doesn't require any specific functions, not defining a `suiteDone` will make it impossible for a reporter to know when a suite has failures in an `afterAll`.
     * @function
     * @name Reporter#suiteDone
     * @param {SuiteResult} result
     * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
     * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
     * @see async
     */
    'suiteDone',
    /**
     * `specStarted` is invoked when an `it` starts to run (including associated `beforeEach` functions)
     * @function
     * @name Reporter#specStarted
     * @param {SpecResult} result Information about the individual {@link it} being run
     * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
     * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
     * @see async
     */
    'specStarted',
    /**
     * `specDone` is invoked when an `it` and its associated `beforeEach` and `afterEach` functions have been run.
     *
     * While jasmine doesn't require any specific functions, not defining a `specDone` will make it impossible for a reporter to know when a spec has failed.
     * @function
     * @name Reporter#specDone
     * @param {SpecResult} result
     * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
     * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
     * @see async
     */
    'specDone'
  ];
  Object.freeze(events);
  return events;
};

getJasmineRequireObj().interface = function(jasmine, env) {
  const jasmineInterface = {
    /**
     * Callback passed to parts of the Jasmine base interface.
     *
     * By default Jasmine assumes this function completes synchronously.
     * If you have code that you need to test asynchronously, you can declare that you receive a `done` callback, return a Promise, or use the `async` keyword if it is supported in your environment.
     * @callback implementationCallback
     * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
     * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
     */

    /**
     * Create a group of specs (often called a suite).
     *
     * Calls to `describe` can be nested within other calls to compose your suite as a tree.
     * @name describe
     * @since 1.3.0
     * @function
     * @global
     * @param {String} description Textual description of the group
     * @param {Function} specDefinitions Function for Jasmine to invoke that will define inner suites and specs
     */
    describe: function(description, specDefinitions) {
      return env.describe(description, specDefinitions);
    },

    /**
     * A temporarily disabled [`describe`]{@link describe}
     *
     * Specs within an `xdescribe` will be marked pending and not executed
     * @name xdescribe
     * @since 1.3.0
     * @function
     * @global
     * @param {String} description Textual description of the group
     * @param {Function} specDefinitions Function for Jasmine to invoke that will define inner suites and specs
     */
    xdescribe: function(description, specDefinitions) {
      return env.xdescribe(description, specDefinitions);
    },

    /**
     * A focused [`describe`]{@link describe}
     *
     * If suites or specs are focused, only those that are focused will be executed
     * @see fit
     * @name fdescribe
     * @since 2.1.0
     * @function
     * @global
     * @param {String} description Textual description of the group
     * @param {Function} specDefinitions Function for Jasmine to invoke that will define inner suites and specs
     */
    fdescribe: function(description, specDefinitions) {
      return env.fdescribe(description, specDefinitions);
    },

    /**
     * Define a single spec. A spec should contain one or more {@link expect|expectations} that test the state of the code.
     *
     * A spec whose expectations all succeed will be passing and a spec with any failures will fail.
     * The name `it` is a pronoun for the test target, not an abbreviation of anything. It makes the
     * spec more readable by connecting the function name `it` and the argument `description` as a
     * complete sentence.
     * @name it
     * @since 1.3.0
     * @function
     * @global
     * @param {String} description Textual description of what this spec is checking
     * @param {implementationCallback} [testFunction] Function that contains the code of your test. If not provided the test will be `pending`.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async spec.
     * @see async
     */
    it: function() {
      return env.it.apply(env, arguments);
    },

    /**
     * A temporarily disabled [`it`]{@link it}
     *
     * The spec will report as `pending` and will not be executed.
     * @name xit
     * @since 1.3.0
     * @function
     * @global
     * @param {String} description Textual description of what this spec is checking.
     * @param {implementationCallback} [testFunction] Function that contains the code of your test. Will not be executed.
     */
    xit: function() {
      return env.xit.apply(env, arguments);
    },

    /**
     * A focused [`it`]{@link it}
     *
     * If suites or specs are focused, only those that are focused will be executed.
     * @name fit
     * @since 2.1.0
     * @function
     * @global
     * @param {String} description Textual description of what this spec is checking.
     * @param {implementationCallback} testFunction Function that contains the code of your test.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async spec.
     * @see async
     */
    fit: function() {
      return env.fit.apply(env, arguments);
    },

    /**
     * Run some shared setup before each of the specs in the {@link describe} in which it is called.
     * @name beforeEach
     * @since 1.3.0
     * @function
     * @global
     * @param {implementationCallback} [function] Function that contains the code to setup your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async beforeEach.
     * @see async
     */
    beforeEach: function() {
      return env.beforeEach.apply(env, arguments);
    },

    /**
     * Run some shared teardown after each of the specs in the {@link describe} in which it is called.
     * @name afterEach
     * @since 1.3.0
     * @function
     * @global
     * @param {implementationCallback} [function] Function that contains the code to teardown your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async afterEach.
     * @see async
     */
    afterEach: function() {
      return env.afterEach.apply(env, arguments);
    },

    /**
     * Run some shared setup once before all of the specs in the {@link describe} are run.
     *
     * _Note:_ Be careful, sharing the setup from a beforeAll makes it easy to accidentally leak state between your specs so that they erroneously pass or fail.
     * @name beforeAll
     * @since 2.1.0
     * @function
     * @global
     * @param {implementationCallback} [function] Function that contains the code to setup your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async beforeAll.
     * @see async
     */
    beforeAll: function() {
      return env.beforeAll.apply(env, arguments);
    },

    /**
     * Run some shared teardown once after all of the specs in the {@link describe} are run.
     *
     * _Note:_ Be careful, sharing the teardown from a afterAll makes it easy to accidentally leak state between your specs so that they erroneously pass or fail.
     * @name afterAll
     * @since 2.1.0
     * @function
     * @global
     * @param {implementationCallback} [function] Function that contains the code to teardown your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async afterAll.
     * @see async
     */
    afterAll: function() {
      return env.afterAll.apply(env, arguments);
    },

    /**
     * Sets a user-defined property that will be provided to reporters as part of the properties field of {@link SpecResult}
     * @name setSpecProperty
     * @since 3.6.0
     * @function
     * @param {String} key The name of the property
     * @param {*} value The value of the property
     */
    setSpecProperty: function(key, value) {
      return env.setSpecProperty(key, value);
    },

    /**
     * Sets a user-defined property that will be provided to reporters as part of the properties field of {@link SuiteResult}
     * @name setSuiteProperty
     * @since 3.6.0
     * @function
     * @param {String} key The name of the property
     * @param {*} value The value of the property
     */
    setSuiteProperty: function(key, value) {
      return env.setSuiteProperty(key, value);
    },

    /**
     * Create an expectation for a spec.
     * @name expect
     * @since 1.3.0
     * @function
     * @global
     * @param {Object} actual - Actual computed value to test expectations against.
     * @return {matchers}
     */
    expect: function(actual) {
      return env.expect(actual);
    },

    /**
     * Create an asynchronous expectation for a spec. Note that the matchers
     * that are provided by an asynchronous expectation all return promises
     * which must be either returned from the spec or waited for using `await`
     * in order for Jasmine to associate them with the correct spec.
     * @name expectAsync
     * @since 3.3.0
     * @function
     * @global
     * @param {Object} actual - Actual computed value to test expectations against.
     * @return {async-matchers}
     * @example
     * await expectAsync(somePromise).toBeResolved();
     * @example
     * return expectAsync(somePromise).toBeResolved();
     */
    expectAsync: function(actual) {
      return env.expectAsync(actual);
    },

    /**
     * Create an asynchronous expectation for a spec and throw an error if it fails.
     *
     * This is intended to allow Jasmine matchers to be used with tools like
     * testing-library's `waitFor`, which expect matcher failures to throw
     * exceptions and not trigger a spec failure if the exception is caught.
     * It can also be used to integration-test custom matchers.
     *
     * If the resulting expectation fails, a {@link ThrowUnlessFailure} will be
     * thrown. A failed expectation will not result in a spec failure unless the
     * exception propagates back to Jasmine, either via the call stack or via
     * the global unhandled exception/unhandled promise rejection events.
     * @name throwUnlessAsync
     * @since 5.1.0
     * @function
     * @param actual
     * @global
     * @param {Object} actual - Actual computed value to test expectations against.
     * @return {matchers}
     */
    throwUnlessAsync: function(actual) {
      return env.throwUnless(actual);
    },

    /**
     * Create an expectation for a spec and throw an error if it fails.
     *
     * This is intended to allow Jasmine matchers to be used with tools like
     * testing-library's `waitFor`, which expect matcher failures to throw
     * exceptions and not trigger a spec failure if the exception is caught.
     * It can also be used to integration-test custom matchers.
     *
     * If the resulting expectation fails, a {@link ThrowUnlessFailure} will be
     * thrown. A failed expectation will not result in a spec failure unless the
     * exception propagates back to Jasmine, either via the call stack or via
     * the global unhandled exception/unhandled promise rejection events.
     * @name throwUnless
     * @since 5.1.0
     * @function
     * @param actual
     * @global
     * @param {Object} actual - Actual computed value to test expectations against.
     * @return {matchers}
     */
    throwUnless: function(actual) {
      return env.throwUnless(actual);
    },

    /**
     * Mark a spec as pending, expectation results will be ignored.
     * @name pending
     * @since 2.0.0
     * @function
     * @global
     * @param {String} [message] - Reason the spec is pending.
     */
    pending: function() {
      return env.pending.apply(env, arguments);
    },

    /**
     * Explicitly mark a spec as failed.
     * @name fail
     * @since 2.1.0
     * @function
     * @global
     * @param {String|Error} [error] - Reason for the failure.
     */
    fail: function() {
      return env.fail.apply(env, arguments);
    },

    /**
     * Install a spy onto an existing object.
     * @name spyOn
     * @since 1.3.0
     * @function
     * @global
     * @param {Object} obj - The object upon which to install the {@link Spy}.
     * @param {String} methodName - The name of the method to replace with a {@link Spy}.
     * @returns {Spy}
     */
    spyOn: function(obj, methodName) {
      return env.spyOn(obj, methodName);
    },

    /**
     * Install a spy on a property installed with `Object.defineProperty` onto an existing object.
     * @name spyOnProperty
     * @since 2.6.0
     * @function
     * @global
     * @param {Object} obj - The object upon which to install the {@link Spy}
     * @param {String} propertyName - The name of the property to replace with a {@link Spy}.
     * @param {String} [accessType=get] - The access type (get|set) of the property to {@link Spy} on.
     * @returns {Spy}
     */
    spyOnProperty: function(obj, methodName, accessType) {
      return env.spyOnProperty(obj, methodName, accessType);
    },

    /**
     * Installs spies on all writable and configurable properties of an object.
     * @name spyOnAllFunctions
     * @since 3.2.1
     * @function
     * @global
     * @param {Object} obj - The object upon which to install the {@link Spy}s
     * @param {boolean} includeNonEnumerable - Whether or not to add spies to non-enumerable properties
     * @returns {Object} the spied object
     */
    spyOnAllFunctions: function(obj, includeNonEnumerable) {
      return env.spyOnAllFunctions(obj, includeNonEnumerable);
    },

    jsApiReporter: new jasmine.JsApiReporter({
      timer: new jasmine.Timer()
    }),

    /**
     * @namespace jasmine
     */
    jasmine: jasmine
  };

  /**
   * Add a custom equality tester for the current scope of specs.
   *
   * _Note:_ This is only callable from within a {@link beforeEach}, {@link it}, or {@link beforeAll}.
   * @name jasmine.addCustomEqualityTester
   * @since 2.0.0
   * @function
   * @param {Function} tester - A function which takes two arguments to compare and returns a `true` or `false` comparison result if it knows how to compare them, and `undefined` otherwise.
   * @see custom_equality
   */
  jasmine.addCustomEqualityTester = function(tester) {
    env.addCustomEqualityTester(tester);
  };

  /**
   * Add custom matchers for the current scope of specs.
   *
   * _Note:_ This is only callable from within a {@link beforeEach}, {@link it}, or {@link beforeAll}.
   * @name jasmine.addMatchers
   * @since 2.0.0
   * @function
   * @param {Object} matchers - Keys from this object will be the new matcher names.
   * @see custom_matcher
   */
  jasmine.addMatchers = function(matchers) {
    return env.addMatchers(matchers);
  };

  /**
   * Add custom async matchers for the current scope of specs.
   *
   * _Note:_ This is only callable from within a {@link beforeEach}, {@link it}, or {@link beforeAll}.
   * @name jasmine.addAsyncMatchers
   * @since 3.5.0
   * @function
   * @param {Object} matchers - Keys from this object will be the new async matcher names.
   * @see custom_matcher
   */
  jasmine.addAsyncMatchers = function(matchers) {
    return env.addAsyncMatchers(matchers);
  };

  /**
   * Add a custom object formatter for the current scope of specs.
   *
   * _Note:_ This is only callable from within a {@link beforeEach}, {@link it}, or {@link beforeAll}.
   * @name jasmine.addCustomObjectFormatter
   * @since 3.6.0
   * @function
   * @param {Function} formatter - A function which takes a value to format and returns a string if it knows how to format it, and `undefined` otherwise.
   * @see custom_object_formatters
   */
  jasmine.addCustomObjectFormatter = function(formatter) {
    return env.addCustomObjectFormatter(formatter);
  };

  /**
   * Get the currently booted mock {Clock} for this Jasmine environment.
   * @name jasmine.clock
   * @since 2.0.0
   * @function
   * @returns {Clock}
   */
  jasmine.clock = function() {
    return env.clock;
  };

  /**
   * Create a bare {@link Spy} object. This won't be installed anywhere and will not have any implementation behind it.
   * @name jasmine.createSpy
   * @since 1.3.0
   * @function
   * @param {String} [name] - Name to give the spy. This will be displayed in failure messages.
   * @param {Function} [originalFn] - The "real" function. This will
   * be used for subsequent calls to the spy after you call
   * `mySpy.and.callThrough()`. In most cases you should omit this parameter.
   * The usual way to supply an original function is to call {@link spyOn}
   * instead of createSpy.
   * @return {Spy}
   */
  jasmine.createSpy = function(name, originalFn) {
    return env.createSpy(name, originalFn);
  };

  /**
   * Create an object with multiple {@link Spy}s as its members.
   * @name jasmine.createSpyObj
   * @since 1.3.0
   * @function
   * @param {String} [baseName] - Base name for the spies in the object.
   * @param {String[]|Object} methodNames - Array of method names to create spies for, or Object whose keys will be method names and values the {@link Spy#and#returnValue|returnValue}.
   * @param {String[]|Object} [propertyNames] - Array of property names to create spies for, or Object whose keys will be propertynames and values the {@link Spy#and#returnValue|returnValue}.
   * @return {Object}
   */
  jasmine.createSpyObj = function(baseName, methodNames, propertyNames) {
    return env.createSpyObj(baseName, methodNames, propertyNames);
  };

  /**
   * Add a custom spy strategy for the current scope of specs.
   *
   * _Note:_ This is only callable from within a {@link beforeEach}, {@link it}, or {@link beforeAll}.
   * @name jasmine.addSpyStrategy
   * @since 3.5.0
   * @function
   * @param {String} name - The name of the strategy (i.e. what you call from `and`)
   * @param {Function} factory - Factory function that returns the plan to be executed.
   */
  jasmine.addSpyStrategy = function(name, factory) {
    return env.addSpyStrategy(name, factory);
  };

  /**
   * Set the default spy strategy for the current scope of specs.
   *
   * _Note:_ This is only callable from within a {@link beforeEach}, {@link it}, or {@link beforeAll}.
   * @name jasmine.setDefaultSpyStrategy
   * @function
   * @param {Function} defaultStrategyFn - a function that assigns a strategy
   * @example
   * beforeEach(function() {
   *   jasmine.setDefaultSpyStrategy(and => and.returnValue(true));
   * });
   */
  jasmine.setDefaultSpyStrategy = function(defaultStrategyFn) {
    return env.setDefaultSpyStrategy(defaultStrategyFn);
  };

  return jasmineInterface;
};

getJasmineRequireObj().RunableResources = function(j$) {
  class RunableResources {
    constructor(options) {
      this.byRunableId_ = {};
      this.getCurrentRunableId_ = options.getCurrentRunableId;
      this.globalErrors_ = options.globalErrors;

      this.spyFactory = new j$.SpyFactory(
        () => {
          if (this.getCurrentRunableId_()) {
            return this.customSpyStrategies();
          } else {
            return {};
          }
        },
        () => this.defaultSpyStrategy(),
        () => this.makeMatchersUtil()
      );

      this.spyRegistry = new j$.SpyRegistry({
        currentSpies: () => this.spies(),
        createSpy: (name, originalFn) =>
          this.spyFactory.createSpy(name, originalFn)
      });
    }

    initForRunable(runableId, parentId) {
      const newRes = (this.byRunableId_[runableId] = {
        customEqualityTesters: [],
        customMatchers: {},
        customAsyncMatchers: {},
        customSpyStrategies: {},
        customObjectFormatters: [],
        defaultSpyStrategy: undefined,
        spies: []
      });

      const parentRes = this.byRunableId_[parentId];

      if (parentRes) {
        newRes.defaultSpyStrategy = parentRes.defaultSpyStrategy;
        const toClone = [
          'customEqualityTesters',
          'customMatchers',
          'customAsyncMatchers',
          'customObjectFormatters',
          'customSpyStrategies'
        ];

        for (const k of toClone) {
          newRes[k] = j$.util.clone(parentRes[k]);
        }
      }
    }

    clearForRunable(runableId) {
      this.globalErrors_.removeOverrideListener();
      this.spyRegistry.clearSpies();
      delete this.byRunableId_[runableId];
    }

    spies() {
      return this.forCurrentRunable_(
        'Spies must be created in a before function or a spec'
      ).spies;
    }

    defaultSpyStrategy() {
      if (!this.getCurrentRunableId_()) {
        return undefined;
      }

      return this.byRunableId_[this.getCurrentRunableId_()].defaultSpyStrategy;
    }

    setDefaultSpyStrategy(fn) {
      this.forCurrentRunable_(
        'Default spy strategy must be set in a before function or a spec'
      ).defaultSpyStrategy = fn;
    }

    customSpyStrategies() {
      return this.forCurrentRunable_(
        'Custom spy strategies must be added in a before function or a spec'
      ).customSpyStrategies;
    }

    customEqualityTesters() {
      return this.forCurrentRunable_(
        'Custom Equalities must be added in a before function or a spec'
      ).customEqualityTesters;
    }

    customMatchers() {
      return this.forCurrentRunable_(
        'Matchers must be added in a before function or a spec'
      ).customMatchers;
    }

    addCustomMatchers(matchersToAdd) {
      const matchers = this.customMatchers();

      for (const name in matchersToAdd) {
        matchers[name] = matchersToAdd[name];
      }
    }

    customAsyncMatchers() {
      return this.forCurrentRunable_(
        'Async Matchers must be added in a before function or a spec'
      ).customAsyncMatchers;
    }

    addCustomAsyncMatchers(matchersToAdd) {
      const matchers = this.customAsyncMatchers();

      for (const name in matchersToAdd) {
        matchers[name] = matchersToAdd[name];
      }
    }

    customObjectFormatters() {
      return this.forCurrentRunable_(
        'Custom object formatters must be added in a before function or a spec'
      ).customObjectFormatters;
    }

    makePrettyPrinter() {
      return j$.makePrettyPrinter(this.customObjectFormatters());
    }

    makeMatchersUtil() {
      if (this.getCurrentRunableId_()) {
        return new j$.MatchersUtil({
          customTesters: this.customEqualityTesters(),
          pp: this.makePrettyPrinter()
        });
      } else {
        return new j$.MatchersUtil({ pp: j$.basicPrettyPrinter_ });
      }
    }

    forCurrentRunable_(errorMsg) {
      const resources = this.byRunableId_[this.getCurrentRunableId_()];

      if (!resources && errorMsg) {
        throw new Error(errorMsg);
      }

      return resources;
    }
  }

  return RunableResources;
};

getJasmineRequireObj().Runner = function(j$) {
  class Runner {
    constructor(options) {
      this.topSuite_ = options.topSuite;
      // TODO use names that read like getters
      this.totalSpecsDefined_ = options.totalSpecsDefined;
      this.focusedRunables_ = options.focusedRunables;
      this.runableResources_ = options.runableResources;
      this.queueRunnerFactory_ = options.queueRunnerFactory;
      this.reporter_ = options.reporter;
      this.getConfig_ = options.getConfig;
      this.reportSpecDone_ = options.reportSpecDone;
      this.hasFailures = false;
      this.executedBefore_ = false;

      this.currentlyExecutingSuites_ = [];
      this.currentSpec = null;
    }

    currentRunable() {
      return this.currentSpec || this.currentSuite();
    }

    currentSuite() {
      return this.currentlyExecutingSuites_[
        this.currentlyExecutingSuites_.length - 1
      ];
    }

    parallelReset() {
      this.executedBefore_ = false;
    }

    async execute(runablesToRun) {
      if (this.executedBefore_) {
        this.topSuite_.reset();
      }
      this.executedBefore_ = true;

      this.hasFailures = false;
      const focusedRunables = this.focusedRunables_();
      const config = this.getConfig_();

      if (!runablesToRun) {
        if (focusedRunables.length) {
          runablesToRun = focusedRunables;
        } else {
          runablesToRun = [this.topSuite_.id];
        }
      }

      const order = new j$.Order({
        random: config.random,
        seed: j$.isNumber_(config.seed) ? config.seed + '' : config.seed
      });

      const processor = new j$.TreeProcessor({
        tree: this.topSuite_,
        runnableIds: runablesToRun,
        queueRunnerFactory: options => {
          if (options.isLeaf) {
            // A spec
            options.SkipPolicy = j$.CompleteOnFirstErrorSkipPolicy;
          } else {
            // A suite
            if (config.stopOnSpecFailure) {
              options.SkipPolicy = j$.CompleteOnFirstErrorSkipPolicy;
            } else {
              options.SkipPolicy = j$.SkipAfterBeforeAllErrorPolicy;
            }
          }

          return this.queueRunnerFactory_(options);
        },
        failSpecWithNoExpectations: config.failSpecWithNoExpectations,
        nodeStart: (suite, next) => {
          this.currentlyExecutingSuites_.push(suite);
          this.runableResources_.initForRunable(suite.id, suite.parentSuite.id);
          this.reporter_.suiteStarted(suite.result).then(next);
          suite.startTimer();
        },
        nodeComplete: (suite, result, next) => {
          if (suite !== this.currentSuite()) {
            throw new Error('Tried to complete the wrong suite');
          }

          this.runableResources_.clearForRunable(suite.id);
          this.currentlyExecutingSuites_.pop();

          if (result.status === 'failed') {
            this.hasFailures = true;
          }
          suite.endTimer();

          if (suite.hadBeforeAllFailure) {
            this.reportChildrenOfBeforeAllFailure_(suite).then(() => {
              this.reportSuiteDone_(suite, result, next);
            });
          } else {
            this.reportSuiteDone_(suite, result, next);
          }
        },
        orderChildren: function(node) {
          return order.sort(node.children);
        },
        excludeNode: function(spec) {
          return !config.specFilter(spec);
        }
      });

      if (!processor.processTree().valid) {
        throw new Error(
          'Invalid order: would cause a beforeAll or afterAll to be run multiple times'
        );
      }

      return this.execute2_(runablesToRun, order, processor);
    }

    async execute2_(runablesToRun, order, processor) {
      const totalSpecsDefined = this.totalSpecsDefined_();

      this.runableResources_.initForRunable(this.topSuite_.id);
      const jasmineTimer = new j$.Timer();
      jasmineTimer.start();

      /**
       * Information passed to the {@link Reporter#jasmineStarted} event.
       * @typedef JasmineStartedInfo
       * @property {Int} totalSpecsDefined - The total number of specs defined in this suite. Note that this property is not present when Jasmine is run in parallel mode.
       * @property {Order} order - Information about the ordering (random or not) of this execution of the suite. Note that this property is not present when Jasmine is run in parallel mode.
       * @property {Boolean} parallel - Whether Jasmine is being run in parallel mode.
       * @since 2.0.0
       */
      await this.reporter_.jasmineStarted({
        // In parallel mode, the jasmineStarted event is separately dispatched
        // by jasmine-npm. This event only reaches reporters in non-parallel.
        totalSpecsDefined,
        order: order,
        parallel: false
      });

      this.currentlyExecutingSuites_.push(this.topSuite_);
      await processor.execute();

      if (this.topSuite_.hadBeforeAllFailure) {
        await this.reportChildrenOfBeforeAllFailure_(this.topSuite_);
      }

      this.runableResources_.clearForRunable(this.topSuite_.id);
      this.currentlyExecutingSuites_.pop();
      let overallStatus, incompleteReason, incompleteCode;

      if (
        this.hasFailures ||
        this.topSuite_.result.failedExpectations.length > 0
      ) {
        overallStatus = 'failed';
      } else if (this.focusedRunables_().length > 0) {
        overallStatus = 'incomplete';
        incompleteReason = 'fit() or fdescribe() was found';
        incompleteCode = 'focused';
      } else if (totalSpecsDefined === 0) {
        overallStatus = 'incomplete';
        incompleteReason = 'No specs found';
        incompleteCode = 'noSpecsFound';
      } else {
        overallStatus = 'passed';
      }

      /**
       * Information passed to the {@link Reporter#jasmineDone} event.
       * @typedef JasmineDoneInfo
       * @property {OverallStatus} overallStatus - The overall result of the suite: 'passed', 'failed', or 'incomplete'.
       * @property {Int} totalTime - The total time (in ms) that it took to execute the suite
       * @property {String} incompleteReason - Human-readable explanation of why the suite was incomplete.
       * @property {String} incompleteCode - Machine-readable explanation of why the suite was incomplete: 'focused', 'noSpecsFound', or undefined.
       * @property {Order} order - Information about the ordering (random or not) of this execution of the suite.  Note that this property is not present when Jasmine is run in parallel mode.
       * @property {Int} numWorkers - Number of parallel workers.  Note that this property is only present when Jasmine is run in parallel mode.
       * @property {Expectation[]} failedExpectations - List of expectations that failed in an {@link afterAll} at the global level.
       * @property {Expectation[]} deprecationWarnings - List of deprecation warnings that occurred at the global level.
       * @since 2.4.0
       */
      const jasmineDoneInfo = {
        overallStatus: overallStatus,
        totalTime: jasmineTimer.elapsed(),
        incompleteReason: incompleteReason,
        incompleteCode: incompleteCode,
        order: order,
        failedExpectations: this.topSuite_.result.failedExpectations,
        deprecationWarnings: this.topSuite_.result.deprecationWarnings
      };
      this.topSuite_.reportedDone = true;
      await this.reporter_.jasmineDone(jasmineDoneInfo);
      return jasmineDoneInfo;
    }

    reportSuiteDone_(suite, result, next) {
      suite.reportedDone = true;
      this.reporter_.suiteDone(result).then(next);
    }

    async reportChildrenOfBeforeAllFailure_(suite) {
      for (const child of suite.children) {
        if (child instanceof j$.Suite) {
          await this.reporter_.suiteStarted(child.result);
          await this.reportChildrenOfBeforeAllFailure_(child);

          // Marking the suite passed is consistent with how suites that
          // contain failed specs but no suite-level failures are reported.
          child.result.status = 'passed';

          await this.reporter_.suiteDone(child.result);
        } else {
          /* a spec */
          await this.reporter_.specStarted(child.result);

          child.addExpectationResult(
            false,
            {
              passed: false,
              message:
                'Not run because a beforeAll function failed. The ' +
                'beforeAll failure will be reported on the suite that ' +
                'caused it.'
            },
            true
          );
          child.result.status = 'failed';

          await new Promise(resolve => {
            this.reportSpecDone_(child, child.result, resolve);
          });
        }
      }
    }
  }

  return Runner;
};

getJasmineRequireObj().SkipAfterBeforeAllErrorPolicy = function(j$) {
  function SkipAfterBeforeAllErrorPolicy(queueableFns) {
    this.queueableFns_ = queueableFns;
    this.skipping_ = false;
  }

  SkipAfterBeforeAllErrorPolicy.prototype.skipTo = function(lastRanFnIx) {
    if (this.skipping_) {
      return this.nextAfterAllAfter_(lastRanFnIx);
    } else {
      return lastRanFnIx + 1;
    }
  };

  SkipAfterBeforeAllErrorPolicy.prototype.nextAfterAllAfter_ = function(i) {
    for (
      i++;
      i < this.queueableFns_.length &&
      this.queueableFns_[i].type !== 'afterAll';
      i++
    ) {}
    return i;
  };

  SkipAfterBeforeAllErrorPolicy.prototype.fnErrored = function(fnIx) {
    if (this.queueableFns_[fnIx].type === 'beforeAll') {
      this.skipping_ = true;
      // Failures need to be reported for each contained spec. But we can't do
      // that from here because reporting is async. This function isn't async
      // (and can't be without greatly complicating QueueRunner). Mark the
      // failure so that the code that reports the suite result (which is
      // already async) can detect the failure and report the specs.
      this.queueableFns_[fnIx].suite.hadBeforeAllFailure = true;
    }
  };

  return SkipAfterBeforeAllErrorPolicy;
};

getJasmineRequireObj().Spy = function(j$) {
  const nextOrder = (function() {
    let order = 0;

    return function() {
      return order++;
    };
  })();

  /**
   * @classdesc _Note:_ Do not construct this directly. Use {@link spyOn},
   * {@link spyOnProperty}, {@link jasmine.createSpy}, or
   * {@link jasmine.createSpyObj} instead.
   * @class Spy
   * @hideconstructor
   */
  function Spy(name, matchersUtil, optionals) {
    const spy = function(context, args, invokeNew) {
      /**
       * @name Spy.callData
       * @property {object} object - `this` context for the invocation.
       * @property {number} invocationOrder - Order of the invocation.
       * @property {Array} args - The arguments passed for this invocation.
       * @property returnValue - The value that was returned from this invocation.
       */
      const callData = {
        object: context,
        invocationOrder: nextOrder(),
        args: Array.prototype.slice.apply(args)
      };

      callTracker.track(callData);
      const returnValue = strategyDispatcher.exec(context, args, invokeNew);
      callData.returnValue = returnValue;

      return returnValue;
    };
    const { originalFn, customStrategies, defaultStrategyFn } = optionals || {};

    const numArgs = typeof originalFn === 'function' ? originalFn.length : 0,
      wrapper = makeFunc(numArgs, function(context, args, invokeNew) {
        return spy(context, args, invokeNew);
      }),
      strategyDispatcher = new SpyStrategyDispatcher(
        {
          name: name,
          fn: originalFn,
          getSpy: function() {
            return wrapper;
          },
          customStrategies: customStrategies
        },
        matchersUtil
      ),
      callTracker = new j$.CallTracker();

    function makeFunc(length, fn) {
      switch (length) {
        case 1:
          return function wrap1(a) {
            return fn(this, arguments, this instanceof wrap1);
          };
        case 2:
          return function wrap2(a, b) {
            return fn(this, arguments, this instanceof wrap2);
          };
        case 3:
          return function wrap3(a, b, c) {
            return fn(this, arguments, this instanceof wrap3);
          };
        case 4:
          return function wrap4(a, b, c, d) {
            return fn(this, arguments, this instanceof wrap4);
          };
        case 5:
          return function wrap5(a, b, c, d, e) {
            return fn(this, arguments, this instanceof wrap5);
          };
        case 6:
          return function wrap6(a, b, c, d, e, f) {
            return fn(this, arguments, this instanceof wrap6);
          };
        case 7:
          return function wrap7(a, b, c, d, e, f, g) {
            return fn(this, arguments, this instanceof wrap7);
          };
        case 8:
          return function wrap8(a, b, c, d, e, f, g, h) {
            return fn(this, arguments, this instanceof wrap8);
          };
        case 9:
          return function wrap9(a, b, c, d, e, f, g, h, i) {
            return fn(this, arguments, this instanceof wrap9);
          };
        default:
          return function wrap() {
            return fn(this, arguments, this instanceof wrap);
          };
      }
    }

    for (const prop in originalFn) {
      if (prop === 'and' || prop === 'calls') {
        throw new Error(
          "Jasmine spies would overwrite the 'and' and 'calls' properties on the object being spied upon"
        );
      }

      wrapper[prop] = originalFn[prop];
    }

    /**
     * @member {SpyStrategy} - Accesses the default strategy for the spy. This strategy will be used
     * whenever the spy is called with arguments that don't match any strategy
     * created with {@link Spy#withArgs}.
     * @name Spy#and
     * @since 2.0.0
     * @example
     * spyOn(someObj, 'func').and.returnValue(42);
     */
    wrapper.and = strategyDispatcher.and;
    /**
     * Specifies a strategy to be used for calls to the spy that have the
     * specified arguments.
     * @name Spy#withArgs
     * @since 3.0.0
     * @function
     * @param {...*} args - The arguments to match
     * @type {SpyStrategy}
     * @example
     * spyOn(someObj, 'func').withArgs(1, 2, 3).and.returnValue(42);
     * someObj.func(1, 2, 3); // returns 42
     */
    wrapper.withArgs = function() {
      return strategyDispatcher.withArgs.apply(strategyDispatcher, arguments);
    };
    wrapper.calls = callTracker;

    if (defaultStrategyFn) {
      defaultStrategyFn(wrapper.and);
    }

    return wrapper;
  }

  function SpyStrategyDispatcher(strategyArgs, matchersUtil) {
    const baseStrategy = new j$.SpyStrategy(strategyArgs);
    const argsStrategies = new StrategyDict(function() {
      return new j$.SpyStrategy(strategyArgs);
    }, matchersUtil);

    this.and = baseStrategy;

    this.exec = function(spy, args, invokeNew) {
      let strategy = argsStrategies.get(args);

      if (!strategy) {
        if (argsStrategies.any() && !baseStrategy.isConfigured()) {
          throw new Error(
            "Spy '" +
              strategyArgs.name +
              "' received a call with arguments " +
              j$.basicPrettyPrinter_(Array.prototype.slice.call(args)) +
              ' but all configured strategies specify other arguments.'
          );
        } else {
          strategy = baseStrategy;
        }
      }

      return strategy.exec(spy, args, invokeNew);
    };

    this.withArgs = function() {
      return { and: argsStrategies.getOrCreate(arguments) };
    };
  }

  function StrategyDict(strategyFactory, matchersUtil) {
    this.strategies = [];
    this.strategyFactory = strategyFactory;
    this.matchersUtil = matchersUtil;
  }

  StrategyDict.prototype.any = function() {
    return this.strategies.length > 0;
  };

  StrategyDict.prototype.getOrCreate = function(args) {
    let strategy = this.get(args);

    if (!strategy) {
      strategy = this.strategyFactory();
      this.strategies.push({
        args: args,
        strategy: strategy
      });
    }

    return strategy;
  };

  StrategyDict.prototype.get = function(args) {
    for (let i = 0; i < this.strategies.length; i++) {
      if (this.matchersUtil.equals(args, this.strategies[i].args)) {
        return this.strategies[i].strategy;
      }
    }
  };

  return Spy;
};

getJasmineRequireObj().SpyFactory = function(j$) {
  function SpyFactory(
    getCustomStrategies,
    getDefaultStrategyFn,
    getMatchersUtil
  ) {
    this.createSpy = function(name, originalFn) {
      if (j$.isFunction_(name) && originalFn === undefined) {
        originalFn = name;
        name = originalFn.name;
      }

      return j$.Spy(name, getMatchersUtil(), {
        originalFn,
        customStrategies: getCustomStrategies(),
        defaultStrategyFn: getDefaultStrategyFn()
      });
    };

    this.createSpyObj = function(baseName, methodNames, propertyNames) {
      const baseNameIsCollection =
        j$.isObject_(baseName) || j$.isArray_(baseName);

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
        throw 'createSpyObj requires a non-empty array or object of method names to create spies for';
      }

      return obj;
    };
  }

  function normalizeKeyValues(object) {
    const result = [];
    if (j$.isArray_(object)) {
      for (let i = 0; i < object.length; i++) {
        result.push([object[i]]);
      }
    } else if (j$.isObject_(object)) {
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

      if (j$.util.isUndefined(obj) || obj === null) {
        throw new Error(
          getErrorMsg(
            'could not find an object to spy upon for ' + methodName + '()'
          )
        );
      }

      if (j$.util.isUndefined(methodName) || methodName === null) {
        throw new Error(getErrorMsg('No method name supplied'));
      }

      if (j$.util.isUndefined(obj[methodName])) {
        throw new Error(getErrorMsg(methodName + '() method does not exist'));
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

      return spiedMethod;
    };

    this.spyOnProperty = function(obj, propertyName, accessType) {
      const getErrorMsg = spyOnPropertyMsg;

      accessType = accessType || 'get';

      if (j$.util.isUndefined(obj)) {
        throw new Error(
          getErrorMsg(
            'spyOn could not find an object to spy upon for ' +
              propertyName +
              ''
          )
        );
      }

      if (j$.util.isUndefined(propertyName)) {
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
      if (j$.util.isUndefined(obj)) {
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

getJasmineRequireObj().SpyStrategy = function(j$) {
  /**
   * @interface SpyStrategy
   */
  function SpyStrategy(options) {
    options = options || {};

    /**
     * Get the identifying information for the spy.
     * @name SpyStrategy#identity
     * @since 3.0.0
     * @member
     * @type {String}
     */
    this.identity = options.name || 'unknown';
    this.originalFn = options.fn || function() {};
    this.getSpy = options.getSpy || function() {};
    this.plan = this._defaultPlan = function() {};

    const cs = options.customStrategies || {};
    for (const k in cs) {
      if (j$.util.has(cs, k) && !this[k]) {
        this[k] = createCustomPlan(cs[k]);
      }
    }

    /**
     * Tell the spy to return a promise resolving to the specified value when invoked.
     * @name SpyStrategy#resolveTo
     * @since 3.5.0
     * @function
     * @param {*} value The value to return.
     */
    this.resolveTo = function(value) {
      this.plan = function() {
        return Promise.resolve(value);
      };
      return this.getSpy();
    };

    /**
     * Tell the spy to return a promise rejecting with the specified value when invoked.
     * @name SpyStrategy#rejectWith
     * @since 3.5.0
     * @function
     * @param {*} value The value to return.
     */
    this.rejectWith = function(value) {
      this.plan = function() {
        return Promise.reject(value);
      };
      return this.getSpy();
    };
  }

  function createCustomPlan(factory) {
    return function() {
      const plan = factory.apply(null, arguments);

      if (!j$.isFunction_(plan)) {
        throw new Error('Spy strategy must return a function');
      }

      this.plan = plan;
      return this.getSpy();
    };
  }

  /**
   * Execute the current spy strategy.
   * @name SpyStrategy#exec
   * @since 2.0.0
   * @function
   */
  SpyStrategy.prototype.exec = function(context, args, invokeNew) {
    const contextArgs = [context].concat(
      args ? Array.prototype.slice.call(args) : []
    );
    const target = this.plan.bind.apply(this.plan, contextArgs);

    return invokeNew ? new target() : target();
  };

  /**
   * Tell the spy to call through to the real implementation when invoked.
   * @name SpyStrategy#callThrough
   * @since 2.0.0
   * @function
   */
  SpyStrategy.prototype.callThrough = function() {
    this.plan = this.originalFn;
    return this.getSpy();
  };

  /**
   * Tell the spy to return the value when invoked.
   * @name SpyStrategy#returnValue
   * @since 2.0.0
   * @function
   * @param {*} value The value to return.
   */
  SpyStrategy.prototype.returnValue = function(value) {
    this.plan = function() {
      return value;
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to return one of the specified values (sequentially) each time the spy is invoked.
   * @name SpyStrategy#returnValues
   * @since 2.1.0
   * @function
   * @param {...*} values - Values to be returned on subsequent calls to the spy.
   */
  SpyStrategy.prototype.returnValues = function() {
    const values = Array.prototype.slice.call(arguments);
    this.plan = function() {
      return values.shift();
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to throw an error when invoked.
   * @name SpyStrategy#throwError
   * @since 2.0.0
   * @function
   * @param {Error|Object|String} something Thing to throw
   */
  SpyStrategy.prototype.throwError = function(something) {
    const error = j$.isString_(something) ? new Error(something) : something;
    this.plan = function() {
      throw error;
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to call a fake implementation when invoked.
   * @name SpyStrategy#callFake
   * @since 2.0.0
   * @function
   * @param {Function} fn The function to invoke with the passed parameters.
   */
  SpyStrategy.prototype.callFake = function(fn) {
    if (
      !(
        j$.isFunction_(fn) ||
        j$.isAsyncFunction_(fn) ||
        j$.isGeneratorFunction_(fn)
      )
    ) {
      throw new Error(
        'Argument passed to callFake should be a function, got ' + fn
      );
    }
    this.plan = fn;
    return this.getSpy();
  };

  /**
   * Tell the spy to do nothing when invoked. This is the default.
   * @name SpyStrategy#stub
   * @since 2.0.0
   * @function
   */
  SpyStrategy.prototype.stub = function(fn) {
    this.plan = function() {};
    return this.getSpy();
  };

  SpyStrategy.prototype.isConfigured = function() {
    return this.plan !== this._defaultPlan;
  };

  return SpyStrategy;
};

getJasmineRequireObj().StackTrace = function(j$) {
  function StackTrace(error) {
    let lines = error.stack.split('\n').filter(function(line) {
      return line !== '';
    });

    const extractResult = extractMessage(error.message, lines);

    if (extractResult) {
      this.message = extractResult.message;
      lines = extractResult.remainder;
    }

    const parseResult = tryParseFrames(lines);
    this.frames = parseResult.frames;
    this.style = parseResult.style;
  }

  const framePatterns = [
    // Node, Chrome, Edge
    // e.g. "   at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)"
    // Note that the "function name" can include a surprisingly large set of
    // characters, including angle brackets and square brackets.
    {
      re: /^\s*at ([^\)]+) \(([^\)]+)\)$/,
      fnIx: 1,
      fileLineColIx: 2,
      style: 'v8'
    },

    // NodeJS alternate form, often mixed in with the Chrome style
    // e.g. "  at /some/path:4320:20
    { re: /\s*at (.+)$/, fileLineColIx: 1, style: 'v8' },

    // PhantomJS on OS X, Safari, Firefox
    // e.g. "run@http://localhost:8888/__jasmine__/jasmine.js:4320:27"
    // or "http://localhost:8888/__jasmine__/jasmine.js:4320:27"
    {
      re: /^(?:(([^@\s]+)@)|@)?([^\s]+)$/,
      fnIx: 2,
      fileLineColIx: 3,
      style: 'webkit'
    }
  ];

  // regexes should capture the function name (if any) as group 1
  // and the file, line, and column as group 2.
  function tryParseFrames(lines) {
    let style = null;
    const frames = lines.map(function(line) {
      const convertedLine = first(framePatterns, function(pattern) {
        const overallMatch = line.match(pattern.re);
        if (!overallMatch) {
          return null;
        }

        const fileLineColMatch = overallMatch[pattern.fileLineColIx].match(
          /^(.*):(\d+):\d+$/
        );
        if (!fileLineColMatch) {
          return null;
        }

        style = style || pattern.style;
        return {
          raw: line,
          file: fileLineColMatch[1],
          line: parseInt(fileLineColMatch[2], 10),
          func: overallMatch[pattern.fnIx]
        };
      });

      return convertedLine || { raw: line };
    });

    return {
      style: style,
      frames: frames
    };
  }

  function first(items, fn) {
    for (const item of items) {
      const result = fn(item);

      if (result) {
        return result;
      }
    }
  }

  function extractMessage(message, stackLines) {
    const len = messagePrefixLength(message, stackLines);

    if (len > 0) {
      return {
        message: stackLines.slice(0, len).join('\n'),
        remainder: stackLines.slice(len)
      };
    }
  }

  function messagePrefixLength(message, stackLines) {
    if (!stackLines[0].match(/^\w*Error/)) {
      return 0;
    }

    const messageLines = message.split('\n');

    for (let i = 1; i < messageLines.length; i++) {
      if (messageLines[i] !== stackLines[i]) {
        return 0;
      }
    }

    return messageLines.length;
  }

  return StackTrace;
};

getJasmineRequireObj().Suite = function(j$) {
  function Suite(attrs) {
    this.env = attrs.env;
    this.id = attrs.id;
    this.parentSuite = attrs.parentSuite;
    this.description = attrs.description;
    this.reportedParentSuiteId = attrs.reportedParentSuiteId;
    this.filename = attrs.filename;
    this.expectationFactory = attrs.expectationFactory;
    this.asyncExpectationFactory = attrs.asyncExpectationFactory;
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;
    this.autoCleanClosures =
      attrs.autoCleanClosures === undefined ? true : !!attrs.autoCleanClosures;
    this.onLateError = attrs.onLateError || function() {};

    this.beforeFns = [];
    this.afterFns = [];
    this.beforeAllFns = [];
    this.afterAllFns = [];
    this.timer = attrs.timer || new j$.Timer();
    this.children = [];

    this.reset();
  }

  Suite.prototype.setSuiteProperty = function(key, value) {
    this.result.properties = this.result.properties || {};
    this.result.properties[key] = value;
  };

  Suite.prototype.getFullName = function() {
    const fullName = [];
    for (
      let parentSuite = this;
      parentSuite;
      parentSuite = parentSuite.parentSuite
    ) {
      if (parentSuite.parentSuite) {
        fullName.unshift(parentSuite.description);
      }
    }
    return fullName.join(' ');
  };

  /*
   * Mark the suite with "pending" status
   */
  Suite.prototype.pend = function() {
    this.markedPending = true;
  };

  /*
   * Like {@link Suite#pend}, but pending state will survive {@link Spec#reset}
   * Useful for fdescribe, xdescribe, where pending state should remain.
   */
  Suite.prototype.exclude = function() {
    this.pend();
    this.markedExcluding = true;
  };

  Suite.prototype.beforeEach = function(fn) {
    this.beforeFns.unshift({ ...fn, suite: this });
  };

  Suite.prototype.beforeAll = function(fn) {
    this.beforeAllFns.push({ ...fn, type: 'beforeAll', suite: this });
  };

  Suite.prototype.afterEach = function(fn) {
    this.afterFns.unshift({ ...fn, suite: this, type: 'afterEach' });
  };

  Suite.prototype.afterAll = function(fn) {
    this.afterAllFns.unshift({ ...fn, type: 'afterAll' });
  };

  Suite.prototype.startTimer = function() {
    this.timer.start();
  };

  Suite.prototype.endTimer = function() {
    this.result.duration = this.timer.elapsed();
  };

  function removeFns(queueableFns) {
    for (const qf of queueableFns) {
      qf.fn = null;
    }
  }

  Suite.prototype.cleanupBeforeAfter = function() {
    if (this.autoCleanClosures) {
      removeFns(this.beforeAllFns);
      removeFns(this.afterAllFns);
      removeFns(this.beforeFns);
      removeFns(this.afterFns);
    }
  };

  Suite.prototype.reset = function() {
    /**
     * @typedef SuiteResult
     * @property {String} id - The unique id of this suite.
     * @property {String} description - The description text passed to the {@link describe} that made this suite.
     * @property {String} fullName - The full description including all ancestors of this suite.
     * @property {String|null} parentSuiteId - The ID of the suite containing this suite, or null if this is not in another describe().
     * @property {String} filename - The name of the file the suite was defined in.
     * @property {Expectation[]} failedExpectations - The list of expectations that failed in an {@link afterAll} for this suite.
     * @property {Expectation[]} deprecationWarnings - The list of deprecation warnings that occurred on this suite.
     * @property {String} status - Once the suite has completed, this string represents the pass/fail status of this suite.
     * @property {number} duration - The time in ms for Suite execution, including any before/afterAll, before/afterEach.
     * @property {Object} properties - User-supplied properties, if any, that were set using {@link Env#setSuiteProperty}
     * @since 2.0.0
     */
    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      parentSuiteId: this.reportedParentSuiteId,
      filename: this.filename,
      failedExpectations: [],
      deprecationWarnings: [],
      duration: null,
      properties: null
    };
    this.markedPending = this.markedExcluding;
    this.children.forEach(function(child) {
      child.reset();
    });
    this.reportedDone = false;
  };

  Suite.prototype.removeChildren = function() {
    this.children = [];
  };

  Suite.prototype.addChild = function(child) {
    this.children.push(child);
  };

  Suite.prototype.status = function() {
    if (this.markedPending) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'passed';
    }
  };

  Suite.prototype.canBeReentered = function() {
    return this.beforeAllFns.length === 0 && this.afterAllFns.length === 0;
  };

  Suite.prototype.getResult = function() {
    this.result.status = this.status();
    return this.result;
  };

  Suite.prototype.sharedUserContext = function() {
    if (!this.sharedContext) {
      this.sharedContext = this.parentSuite
        ? this.parentSuite.clonedSharedUserContext()
        : new j$.UserContext();
    }

    return this.sharedContext;
  };

  Suite.prototype.clonedSharedUserContext = function() {
    return j$.UserContext.fromExisting(this.sharedUserContext());
  };

  Suite.prototype.handleException = function() {
    if (arguments[0] instanceof j$.errors.ExpectationFailed) {
      return;
    }

    const data = {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: arguments[0]
    };
    const failedExpectation = j$.buildExpectationResult(data);

    if (!this.parentSuite) {
      failedExpectation.globalErrorType = 'afterAll';
    }

    if (this.reportedDone) {
      this.onLateError(failedExpectation);
    } else {
      this.result.failedExpectations.push(failedExpectation);
    }
  };

  Suite.prototype.onMultipleDone = function() {
    let msg;

    // Issue a deprecation. Include the context ourselves and pass
    // ignoreRunnable: true, since getting here always means that we've already
    // moved on and the current runnable isn't the one that caused the problem.
    if (this.parentSuite) {
      msg =
        "An asynchronous beforeAll or afterAll function called its 'done' " +
        'callback more than once.\n' +
        '(in suite: ' +
        this.getFullName() +
        ')';
    } else {
      msg =
        'A top-level beforeAll or afterAll function called its ' +
        "'done' callback more than once.";
    }

    this.onLateError(new Error(msg));
  };

  Suite.prototype.addExpectationResult = function() {
    if (isFailure(arguments)) {
      const data = arguments[1];
      const expectationResult = j$.buildExpectationResult(data);

      if (this.reportedDone) {
        this.onLateError(expectationResult);
      } else {
        this.result.failedExpectations.push(expectationResult);

        // TODO: refactor so that we don't need to override cached status
        if (this.result.status) {
          this.result.status = 'failed';
        }
      }

      if (this.throwOnExpectationFailure) {
        throw new j$.errors.ExpectationFailed();
      }
    }
  };

  Suite.prototype.addDeprecationWarning = function(deprecation) {
    if (typeof deprecation === 'string') {
      deprecation = { message: deprecation };
    }
    this.result.deprecationWarnings.push(
      j$.buildExpectationResult(deprecation)
    );
  };

  Object.defineProperty(Suite.prototype, 'metadata', {
    get: function() {
      if (!this.metadata_) {
        this.metadata_ = new SuiteMetadata(this);
      }

      return this.metadata_;
    }
  });

  /**
   * @interface Suite
   * @see Env#topSuite
   * @since 2.0.0
   */
  function SuiteMetadata(suite) {
    this.suite_ = suite;
    /**
     * The unique ID of this suite.
     * @name Suite#id
     * @readonly
     * @type {string}
     * @since 2.0.0
     */
    this.id = suite.id;

    /**
     * The parent of this suite, or null if this is the top suite.
     * @name Suite#parentSuite
     * @readonly
     * @type {Suite}
     */
    this.parentSuite = suite.parentSuite ? suite.parentSuite.metadata : null;

    /**
     * The description passed to the {@link describe} that created this suite.
     * @name Suite#description
     * @readonly
     * @type {string}
     * @since 2.0.0
     */
    this.description = suite.description;
  }

  /**
   * The full description including all ancestors of this suite.
   * @name Suite#getFullName
   * @function
   * @returns {string}
   * @since 2.0.0
   */
  SuiteMetadata.prototype.getFullName = function() {
    return this.suite_.getFullName();
  };

  /**
   * The suite's children.
   * @name Suite#children
   * @type {Array.<(Spec|Suite)>}
   * @since 2.0.0
   */
  Object.defineProperty(SuiteMetadata.prototype, 'children', {
    get: function() {
      return this.suite_.children.map(child => child.metadata);
    }
  });

  function isFailure(args) {
    return !args[0];
  }

  return Suite;
};

getJasmineRequireObj().SuiteBuilder = function(j$) {
  class SuiteBuilder {
    constructor(options) {
      this.env_ = options.env;
      this.expectationFactory_ = options.expectationFactory;
      this.suiteAsyncExpectationFactory_ = function(actual, suite) {
        return options.asyncExpectationFactory(actual, suite, 'Suite');
      };
      this.specAsyncExpectationFactory_ = function(actual, suite) {
        return options.asyncExpectationFactory(actual, suite, 'Spec');
      };
      this.onLateError_ = options.onLateError;
      this.specResultCallback_ = options.specResultCallback;
      this.specStarted_ = options.specStarted;

      this.nextSuiteId_ = 0;
      this.nextSpecId_ = 0;

      this.topSuite = this.suiteFactory_('Jasmine__TopLevel__Suite');
      this.currentDeclarationSuite_ = this.topSuite;
      this.totalSpecsDefined = 0;
      this.focusedRunables = [];
    }

    inDescribe() {
      return this.currentDeclarationSuite_ !== this.topSuite;
    }

    parallelReset() {
      this.topSuite.removeChildren();
      this.topSuite.reset();
      this.totalSpecsDefined = 0;
      this.focusedRunables = [];
    }

    describe(description, definitionFn, filename) {
      ensureIsFunction(definitionFn, 'describe');
      const suite = this.suiteFactory_(description, filename);
      if (definitionFn.length > 0) {
        throw new Error('describe does not expect any arguments');
      }
      if (this.currentDeclarationSuite_.markedExcluding) {
        suite.exclude();
      }
      this.addSpecsToSuite_(suite, definitionFn);
      return suite;
    }

    fdescribe(description, definitionFn, filename) {
      ensureIsFunction(definitionFn, 'fdescribe');
      const suite = this.suiteFactory_(description, filename);
      suite.isFocused = true;

      this.focusedRunables.push(suite.id);
      this.unfocusAncestor_();
      this.addSpecsToSuite_(suite, definitionFn);

      return suite;
    }

    xdescribe(description, definitionFn, filename) {
      ensureIsFunction(definitionFn, 'xdescribe');
      const suite = this.suiteFactory_(description, filename);
      suite.exclude();
      this.addSpecsToSuite_(suite, definitionFn);

      return suite;
    }

    it(description, fn, timeout, filename) {
      // it() sometimes doesn't have a fn argument, so only check the type if
      // it's given.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'it');
      }

      return this.it_(description, fn, timeout, filename);
    }

    xit(description, fn, timeout, filename) {
      // xit(), like it(), doesn't always have a fn argument, so only check the
      // type when needed.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'xit');
      }
      const spec = this.it_(description, fn, timeout, filename);
      spec.exclude('Temporarily disabled with xit');
      return spec;
    }

    fit(description, fn, timeout, filename) {
      // Unlike it and xit, the function is required because it doesn't make
      // sense to focus on nothing.
      ensureIsFunctionOrAsync(fn, 'fit');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }
      const spec = this.specFactory_(description, fn, timeout, filename);
      this.currentDeclarationSuite_.addChild(spec);
      this.focusedRunables.push(spec.id);
      this.unfocusAncestor_();
      return spec;
    }

    beforeEach(beforeEachFunction, timeout) {
      ensureIsFunctionOrAsync(beforeEachFunction, 'beforeEach');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      this.currentDeclarationSuite_.beforeEach({
        fn: beforeEachFunction,
        timeout: timeout || 0
      });
    }

    beforeAll(beforeAllFunction, timeout) {
      ensureIsFunctionOrAsync(beforeAllFunction, 'beforeAll');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      this.currentDeclarationSuite_.beforeAll({
        fn: beforeAllFunction,
        timeout: timeout || 0
      });
    }

    afterEach(afterEachFunction, timeout) {
      ensureIsFunctionOrAsync(afterEachFunction, 'afterEach');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      afterEachFunction.isCleanup = true;
      this.currentDeclarationSuite_.afterEach({
        fn: afterEachFunction,
        timeout: timeout || 0
      });
    }

    afterAll(afterAllFunction, timeout) {
      ensureIsFunctionOrAsync(afterAllFunction, 'afterAll');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      this.currentDeclarationSuite_.afterAll({
        fn: afterAllFunction,
        timeout: timeout || 0
      });
    }

    it_(description, fn, timeout, filename) {
      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      const spec = this.specFactory_(description, fn, timeout, filename);
      if (this.currentDeclarationSuite_.markedExcluding) {
        spec.exclude();
      }
      this.currentDeclarationSuite_.addChild(spec);

      return spec;
    }

    suiteFactory_(description, filename) {
      const config = this.env_.configuration();
      const parentSuite = this.currentDeclarationSuite_;
      const reportedParentSuiteId =
        parentSuite === this.topSuite ? null : parentSuite.id;
      return new j$.Suite({
        id: 'suite' + this.nextSuiteId_++,
        description,
        filename,
        parentSuite,
        reportedParentSuiteId,
        timer: new j$.Timer(),
        expectationFactory: this.expectationFactory_,
        asyncExpectationFactory: this.suiteAsyncExpectationFactory_,
        throwOnExpectationFailure: config.stopSpecOnExpectationFailure,
        autoCleanClosures: config.autoCleanClosures,
        onLateError: this.onLateError_
      });
    }

    addSpecsToSuite_(suite, definitionFn) {
      const parentSuite = this.currentDeclarationSuite_;
      parentSuite.addChild(suite);
      this.currentDeclarationSuite_ = suite;
      let threw = false;

      try {
        definitionFn();
      } catch (e) {
        suite.handleException(e);
        threw = true;
      }

      if (suite.parentSuite && !suite.children.length && !threw) {
        throw new Error(
          `describe with no children (describe() or it()): ${suite.getFullName()}`
        );
      }

      this.currentDeclarationSuite_ = parentSuite;
    }

    specFactory_(description, fn, timeout, filename) {
      this.totalSpecsDefined++;
      const config = this.env_.configuration();
      const suite = this.currentDeclarationSuite_;
      const parentSuiteId = suite === this.topSuite ? null : suite.id;
      const spec = new j$.Spec({
        id: 'spec' + this.nextSpecId_++,
        filename,
        parentSuiteId,
        beforeAndAfterFns: beforeAndAfterFns(suite),
        expectationFactory: this.expectationFactory_,
        asyncExpectationFactory: this.specAsyncExpectationFactory_,
        onLateError: this.onLateError_,
        resultCallback: (result, next) => {
          this.specResultCallback_(spec, result, next);
        },
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: (spec, next) => this.specStarted_(spec, suite, next),
        description: description,
        userContext: function() {
          return suite.clonedSharedUserContext();
        },
        queueableFn: {
          fn: fn,
          timeout: timeout || 0
        },
        throwOnExpectationFailure: config.stopSpecOnExpectationFailure,
        autoCleanClosures: config.autoCleanClosures,
        timer: new j$.Timer()
      });
      return spec;
    }

    unfocusAncestor_() {
      const focusedAncestor = findFocusedAncestor(
        this.currentDeclarationSuite_
      );

      if (focusedAncestor) {
        for (let i = 0; i < this.focusedRunables.length; i++) {
          if (this.focusedRunables[i] === focusedAncestor) {
            this.focusedRunables.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  function findFocusedAncestor(suite) {
    while (suite) {
      if (suite.isFocused) {
        return suite.id;
      }
      suite = suite.parentSuite;
    }

    return null;
  }

  function ensureIsFunction(fn, caller) {
    if (!j$.isFunction_(fn)) {
      throw new Error(
        caller + ' expects a function argument; received ' + j$.getType_(fn)
      );
    }
  }

  function ensureIsFunctionOrAsync(fn, caller) {
    if (!j$.isFunction_(fn) && !j$.isAsyncFunction_(fn)) {
      throw new Error(
        caller + ' expects a function argument; received ' + j$.getType_(fn)
      );
    }
  }

  function beforeAndAfterFns(targetSuite) {
    return function() {
      let befores = [],
        afters = [],
        suite = targetSuite;

      while (suite) {
        befores = befores.concat(suite.beforeFns);
        afters = afters.concat(suite.afterFns);

        suite = suite.parentSuite;
      }

      return {
        befores: befores.reverse(),
        afters: afters
      };
    };
  }

  function getSpecName(spec, suite) {
    const fullName = [spec.description],
      suiteFullName = suite.getFullName();

    if (suiteFullName !== '') {
      fullName.unshift(suiteFullName);
    }
    return fullName.join(' ');
  }

  return SuiteBuilder;
};

getJasmineRequireObj().Timer = function() {
  const defaultNow = (function(Date) {
    return function() {
      return new Date().getTime();
    };
  })(Date);

  /**
   * @class Timer
   * @classdesc Tracks elapsed time
   * @example
   * const timer = new jasmine.Timer();
   * timer.start();
   * const elapsed = timer.elapsed()
   */
  function Timer(options) {
    options = options || {};

    const now = options.now || defaultNow;
    let startTime;

    /**
     * Starts the timer.
     * @function
     * @name Timer#start
     */
    this.start = function() {
      startTime = now();
    };

    /**
     * Determines the time since the timer was started.
     * @function
     * @name Timer#elapsed
     * @returns {number} Elapsed time in milliseconds, or NaN if the timer has not been started
     */
    this.elapsed = function() {
      return now() - startTime;
    };
  }

  return Timer;
};

getJasmineRequireObj().TreeProcessor = function() {
  function TreeProcessor(attrs) {
    const tree = attrs.tree;
    const runnableIds = attrs.runnableIds;
    const queueRunnerFactory = attrs.queueRunnerFactory;
    const nodeStart = attrs.nodeStart || function() {};
    const nodeComplete = attrs.nodeComplete || function() {};
    const failSpecWithNoExpectations = !!attrs.failSpecWithNoExpectations;
    const orderChildren =
      attrs.orderChildren ||
      function(node) {
        return node.children;
      };
    const excludeNode =
      attrs.excludeNode ||
      function(node) {
        return false;
      };
    let stats = { valid: true };
    let processed = false;
    const defaultMin = Infinity;
    const defaultMax = 1 - Infinity;

    this.processTree = function() {
      processNode(tree, true);
      processed = true;
      return stats;
    };

    this.execute = async function() {
      if (!processed) {
        this.processTree();
      }

      if (!stats.valid) {
        throw 'invalid order';
      }

      const childFns = wrapChildren(tree, 0);

      await new Promise(function(resolve) {
        queueRunnerFactory({
          queueableFns: childFns,
          userContext: tree.sharedUserContext(),
          onException: function() {
            tree.handleException.apply(tree, arguments);
          },
          onComplete: resolve,
          onMultipleDone: tree.onMultipleDone
            ? tree.onMultipleDone.bind(tree)
            : null
        });
      });
    };

    function runnableIndex(id) {
      for (let i = 0; i < runnableIds.length; i++) {
        if (runnableIds[i] === id) {
          return i;
        }
      }
    }

    function processNode(node, parentExcluded) {
      const executableIndex = runnableIndex(node.id);

      if (executableIndex !== undefined) {
        parentExcluded = false;
      }

      if (!node.children) {
        const excluded = parentExcluded || excludeNode(node);
        stats[node.id] = {
          excluded: excluded,
          willExecute: !excluded && !node.markedPending,
          segments: [
            {
              index: 0,
              owner: node,
              nodes: [node],
              min: startingMin(executableIndex),
              max: startingMax(executableIndex)
            }
          ]
        };
      } else {
        let hasExecutableChild = false;

        const orderedChildren = orderChildren(node);

        for (let i = 0; i < orderedChildren.length; i++) {
          const child = orderedChildren[i];

          processNode(child, parentExcluded);

          if (!stats.valid) {
            return;
          }

          const childStats = stats[child.id];

          hasExecutableChild = hasExecutableChild || childStats.willExecute;
        }

        stats[node.id] = {
          excluded: parentExcluded,
          willExecute: hasExecutableChild
        };

        segmentChildren(node, orderedChildren, stats[node.id], executableIndex);

        if (!node.canBeReentered() && stats[node.id].segments.length > 1) {
          stats = { valid: false };
        }
      }
    }

    function startingMin(executableIndex) {
      return executableIndex === undefined ? defaultMin : executableIndex;
    }

    function startingMax(executableIndex) {
      return executableIndex === undefined ? defaultMax : executableIndex;
    }

    function segmentChildren(
      node,
      orderedChildren,
      nodeStats,
      executableIndex
    ) {
      let currentSegment = {
          index: 0,
          owner: node,
          nodes: [],
          min: startingMin(executableIndex),
          max: startingMax(executableIndex)
        },
        result = [currentSegment],
        lastMax = defaultMax,
        orderedChildSegments = orderChildSegments(orderedChildren);

      function isSegmentBoundary(minIndex) {
        return (
          lastMax !== defaultMax &&
          minIndex !== defaultMin &&
          lastMax < minIndex - 1
        );
      }

      for (let i = 0; i < orderedChildSegments.length; i++) {
        const childSegment = orderedChildSegments[i],
          maxIndex = childSegment.max,
          minIndex = childSegment.min;

        if (isSegmentBoundary(minIndex)) {
          currentSegment = {
            index: result.length,
            owner: node,
            nodes: [],
            min: defaultMin,
            max: defaultMax
          };
          result.push(currentSegment);
        }

        currentSegment.nodes.push(childSegment);
        currentSegment.min = Math.min(currentSegment.min, minIndex);
        currentSegment.max = Math.max(currentSegment.max, maxIndex);
        lastMax = maxIndex;
      }

      nodeStats.segments = result;
    }

    function orderChildSegments(children) {
      const specifiedOrder = [],
        unspecifiedOrder = [];

      for (let i = 0; i < children.length; i++) {
        const child = children[i],
          segments = stats[child.id].segments;

        for (let j = 0; j < segments.length; j++) {
          const seg = segments[j];

          if (seg.min === defaultMin) {
            unspecifiedOrder.push(seg);
          } else {
            specifiedOrder.push(seg);
          }
        }
      }

      specifiedOrder.sort(function(a, b) {
        return a.min - b.min;
      });

      return specifiedOrder.concat(unspecifiedOrder);
    }

    function executeNode(node, segmentNumber) {
      if (node.children) {
        return {
          fn: function(done) {
            const onStart = {
              fn: function(next) {
                nodeStart(node, next);
              }
            };

            queueRunnerFactory({
              onComplete: function() {
                const args = Array.prototype.slice.call(arguments, [0]);
                node.cleanupBeforeAfter();
                nodeComplete(node, node.getResult(), function() {
                  done.apply(undefined, args);
                });
              },
              queueableFns: [onStart].concat(wrapChildren(node, segmentNumber)),
              userContext: node.sharedUserContext(),
              onException: function() {
                node.handleException.apply(node, arguments);
              },
              onMultipleDone: node.onMultipleDone
                ? node.onMultipleDone.bind(node)
                : null
            });
          }
        };
      } else {
        return {
          fn: function(done) {
            node.execute(
              queueRunnerFactory,
              done,
              stats[node.id].excluded,
              failSpecWithNoExpectations
            );
          }
        };
      }
    }

    function wrapChildren(node, segmentNumber) {
      const result = [],
        segmentChildren = stats[node.id].segments[segmentNumber].nodes;

      for (let i = 0; i < segmentChildren.length; i++) {
        result.push(
          executeNode(segmentChildren[i].owner, segmentChildren[i].index)
        );
      }

      if (!stats[node.id].willExecute) {
        return result;
      }

      return node.beforeAllFns.concat(result).concat(node.afterAllFns);
    }
  }

  return TreeProcessor;
};

getJasmineRequireObj().UserContext = function(j$) {
  function UserContext() {}

  UserContext.fromExisting = function(oldContext) {
    const context = new UserContext();

    for (const prop in oldContext) {
      if (oldContext.hasOwnProperty(prop)) {
        context[prop] = oldContext[prop];
      }
    }

    return context;
  };

  return UserContext;
};

getJasmineRequireObj().version = function() {
  return '5.1.1';
};
