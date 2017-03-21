getJasmineRequireObj().interface = function(jasmine, env) {
  var jasmineInterface = {
    /**
     * Create a suite of specs
     *
     * @name describe
     * @function
     * @global
     * @param {String} description Textual description of the group
     * @param {Function} specDefinitions Function for Jasmine to invoke that will define inner suites a specs
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
     * @param {Function} specDefinitions Function for Jasmine to invoke that will define inner suites a specs
     */
    xdescribe: function(description, specDefinitions) {
      return env.xdescribe(description, specDefinitions);
    },

    /**
     * A focused [`describe`]{@link describe}
     *
     * If suites or specs are focused, only those that are focused will be executed
     * @see {fit}
     * @name fdescribe
     * @function
     * @global
     * @param {String} description Textual description of the group
     * @param {Function} specDefinitions Function for Jasmine to invoke that will define inner suites a specs
     */
    fdescribe: function(description, specDefinitions) {
      return env.fdescribe(description, specDefinitions);
    },

    /**
     * A single spec
     * @name it
     * @function
     * @global
     * @param {String} description Textual description of what this spec is checking
     * @param {Function} [testFunction] Function that contains the code of your test. If not provided the test will be `pending`.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async spec.
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
     * @param {Function} [testFunction] Function that contains the code of your test. Will not be executed.
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
     * @param {Function} testFunction Function that contains the code of your test.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async spec.
     */
    fit: function() {
      return env.fit.apply(env, arguments);
    },

    /**
     * Run some shared setup before each of the specs in the {@link describe} in which it is called.
     * @name beforeEach
     * @function
     * @global
     * @param {Function} [function] Function that contains the code to setup your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async beforeEach.
     */
    beforeEach: function() {
      return env.beforeEach.apply(env, arguments);
    },

    /**
     * Run some shared teardown after each of the specs in the {@link describe} in which it is called.
     * @name afterEach
     * @function
     * @global
     * @param {Function} [function] Function that contains the code to teardown your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async afterEach.
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
     * @param {Function} [function] Function that contains the code to setup your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async beforeAll.
     */
    beforeAll: function() {
      return env.beforeAll.apply(env, arguments);
    },

    /**
     * Run some shared teardown once before all of the specs in the {@link describe} are run.
     *
     * _Note:_ Be careful, sharing the teardown from a afterAll makes it easy to accidentally leak state between your specs so that they erroneously pass or fail.
     * @name afterAll
     * @function
     * @global
     * @param {Function} [function] Function that contains the code to teardown your specs.
     * @param {Int} [timeout={@link jasmine.DEFAULT_TIMEOUT_INTERVAL}] Custom timeout for an async afterAll.
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
     * @returns {Spy}
     */
    spyOn: function(obj, methodName) {
      return env.spyOn(obj, methodName);
    },

    /**
     * Install a spy on a property onto an existing object.
     * @name spyOnProperty
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

    jsApiReporter: new jasmine.JsApiReporter({
      timer: new jasmine.Timer()
    }),

    /**
     * @namespace jasmine
     */
    jasmine: jasmine
  };

  /**
   * @name jasmine.addCustomEqualityTester
   * @function
   * @tutorial addCustomEqualityTester
   */
  jasmine.addCustomEqualityTester = function(tester) {
    env.addCustomEqualityTester(tester);
  };

  /**
   * @name jasmine.addMatchers
   * @function
   * @tutorial addMatchers
   */
  jasmine.addMatchers = function(matchers) {
    return env.addMatchers(matchers);
  };

  /**
   * @name jasmine.clock
   * @function
   * @returns {Clock}
   */
  jasmine.clock = function() {
    return env.clock;
  };

  return jasmineInterface;
};
