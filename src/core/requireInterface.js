getJasmineRequireObj().interface = function(jasmine, env) {
  var jasmineInterface = {
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
     * @name it
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
     * Create an expectation for a spec.
     * @name expect
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
     * Mark a spec as pending, expectation results will be ignored.
     * @name pending
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
     * @function
     * @global
     * @param {Object} obj - The object upon which to install the {@link Spy}.
     * @param {String} methodName - The name of the method to replace with a {@link Spy}.
     * @param {boolean} [allowRespy] - Whether to allow respying if the method is already a {@link Spy}.
     * @returns {Spy}
     */
    spyOn: function(obj, methodName, allowRespy) {
      return env.spyOn(obj, methodName, allowRespy);
    },

    /**
     * Install a spy on a property installed with `Object.defineProperty` onto an existing object.
     * @name spyOnProperty
     * @function
     * @global
     * @param {Object} obj - The object upon which to install the {@link Spy}
     * @param {String} propertyName - The name of the property to replace with a {@link Spy}.
     * @param {String} [accessType=get] - The access type (get|set) of the property to {@link Spy} on.
     * @param {boolean} [allowRespy] - Whether to allow respying if the method is already a {@link Spy}.
     * @returns {Spy}
     */
    spyOnProperty: function(obj, methodName, accessType, allowRespy) {
      return env.spyOnProperty(obj, methodName, accessType, allowRespy);
    },

    /**
     * Installs spies on all writable and configurable properties of an object.
     * @name spyOnAllFunctions
     * @function
     * @global
     * @param {Object} obj - The object upon which to install the {@link Spy}s
     * @returns {Object} the spied object
     */
    spyOnAllFunctions: function(obj) {
      return env.spyOnAllFunctions(obj);
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
   * @function
   * @param {Object} matchers - Keys from this object will be the new matcher names.
   * @see custom_matcher
   */
  jasmine.addMatchers = function(matchers) {
    return env.addMatchers(matchers);
  };

  /**
   * Get the currently booted mock {Clock} for this Jasmine environment.
   * @name jasmine.clock
   * @function
   * @returns {Clock}
   */
  jasmine.clock = function() {
    return env.clock;
  };

  /**
   * Create a bare {@link Spy} object. This won't be installed anywhere and will not have any implementation behind it.
   * @name jasmine.createSpy
   * @function
   * @param {String} [name] - Name to give the spy. This will be displayed in failure messages.
   * @param {Function} [originalFn] - Function to act as the real implementation.
   * @return {Spy}
   */
  jasmine.createSpy = function(name, originalFn) {
    return env.createSpy(name, originalFn);
  };

  /**
   * Create an object with multiple {@link Spy}s as its members.
   * @name jasmine.createSpyObj
   * @function
   * @param {String} [baseName] - Base name for the spies in the object.
   * @param {String[]|Object} methodNames - Array of method names to create spies for, or Object whose keys will be method names and values the {@link Spy#and#returnValue|returnValue}.
   * @return {Object}
   */
  jasmine.createSpyObj = function(baseName, methodNames) {
    return env.createSpyObj(baseName, methodNames);
  };

  /**
   * Add a custom spy strategy for the current scope of specs.
   *
   * _Note:_ This is only callable from within a {@link beforeEach}, {@link it}, or {@link beforeAll}.
   * @name jasmine.addSpyStrategy
   * @function
   * @param {String} name - The name of the strategy (i.e. what you call from `and`)
   * @param {Function} factory - Factory function that returns the plan to be executed.
   */
  jasmine.addSpyStrategy = function(name, factory) {
    return env.addSpyStrategy(name, factory);
  };

  return jasmineInterface;
};
