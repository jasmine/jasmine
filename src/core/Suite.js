getJasmineRequireObj().Suite = function(j$) {
  /**
   * @interface Suite
   * @see Env#topSuite
   * @since 2.0.0
   */
  function Suite(attrs) {
    this.env = attrs.env;
    /**
     * The unique ID of this suite.
     * @name Suite#id
     * @readonly
     * @type {string}
     * @since 2.0.0
     */
    this.id = attrs.id;
    this.parentSuite = attrs.parentSuite;
    /**
     * The description passed to the {@link describe} that created this suite.
     * @name Suite#description
     * @readonly
     * @type {string}
     * @since 2.0.0
     */
    this.description = attrs.description;
    this.expectationFactory = attrs.expectationFactory;
    this.asyncExpectationFactory = attrs.asyncExpectationFactory;
    this.expectationResultFactory = attrs.expectationResultFactory;
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;
    this.autoCleanClosures =
      attrs.autoCleanClosures === undefined ? true : !!attrs.autoCleanClosures;
    this.onLateError = attrs.onLateError;

    this.beforeFns = [];
    this.afterFns = [];
    this.beforeAllFns = [];
    this.afterAllFns = [];
    this.timer = attrs.timer || new j$.Timer();

    /**
     * The suite's children.
     * @name Suite#children
     * @type {Array.<(Spec|Suite)>}
     * @since 2.0.0
     */
    this.children = [];

    this.reset();
  }

  Suite.prototype.setSuiteProperty = function(key, value) {
    this.result.properties = this.result.properties || {};
    this.result.properties[key] = value;
  };

  Suite.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Suite.prototype.expectAsync = function(actual) {
    return this.asyncExpectationFactory(actual, this);
  };

  /**
   * The full description including all ancestors of this suite.
   * @name Suite#getFullName
   * @function
   * @returns {string}
   * @since 2.0.0
   */
  Suite.prototype.getFullName = function() {
    var fullName = [];
    for (
      var parentSuite = this;
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
    for (var i = 0; i < queueableFns.length; i++) {
      queueableFns[i].fn = null;
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
     * @property {Int} id - The unique id of this suite.
     * @property {String} description - The description text passed to the {@link describe} that made this suite.
     * @property {String} fullName - The full description including all ancestors of this suite.
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
      failedExpectations: [],
      deprecationWarnings: [],
      duration: null,
      properties: null
    };
    this.markedPending = this.markedExcluding;
    this.children.forEach(function(child) {
      child.reset();
    });
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

  Suite.prototype.onException = function() {
    if (arguments[0] instanceof j$.errors.ExpectationFailed) {
      return;
    }

    var data = {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: arguments[0]
    };
    var failedExpectation = this.expectationResultFactory(data);

    if (!this.parentSuite) {
      failedExpectation.globalErrorType = 'afterAll';
    }

    this.result.failedExpectations.push(failedExpectation);
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
      var data = arguments[1];
      this.result.failedExpectations.push(this.expectationResultFactory(data));
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
      this.expectationResultFactory(deprecation)
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
   */
  function SuiteMetadata(suite) {
    this.suite_ = suite;
    /**
     * The unique ID of this suite.
     * @name Suite#id
     * @readonly
     * @type {string}
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
     */
    this.description = suite.description;
  }

  /**
   * The full description including all ancestors of this suite.
   * @name Suite#getFullName
   * @function
   * @returns {string}
   */
  SuiteMetadata.prototype.getFullName = function() {
    return this.suite_.getFullName();
  };

  /**
   * The suite's children.
   * @name Suite#children
   * @type {Array.<(Spec|Suite)>}
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
