getJasmineRequireObj().Spec = function(j$) {
  /**
   * @interface Spec
   * @see Configuration#specFilter
   */
  function Spec(attrs) {
    this.expectationFactory = attrs.expectationFactory;
    this.asyncExpectationFactory = attrs.asyncExpectationFactory;
    this.resultCallback = attrs.resultCallback || function() {};
    /**
     * The unique ID of this spec.
     * @name Spec#id
     * @readonly
     * @type {string}
     */
    this.id = attrs.id;
    /**
     * The description passed to the {@link it} that created this spec.
     * @name Spec#description
     * @readonly
     * @type {string}
     */
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
    this.getSpecName =
      attrs.getSpecName ||
      function() {
        return '';
      };
    this.expectationResultFactory =
      attrs.expectationResultFactory || function() {};
    this.deprecated = attrs.deprecated || function() {};
    this.queueRunnerFactory = attrs.queueRunnerFactory || function() {};
    this.catchingExceptions =
      attrs.catchingExceptions ||
      function() {
        return true;
      };
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;
    this.timer = attrs.timer || new j$.Timer();

    if (!this.queueableFn.fn) {
      this.pend();
    }

    /**
     * @typedef SpecResult
     * @property {Int} id - The unique id of this spec.
     * @property {String} description - The description passed to the {@link it} that created this spec.
     * @property {String} fullName - The full description including all ancestors of this spec.
     * @property {Expectation[]} failedExpectations - The list of expectations that failed during execution of this spec.
     * @property {Expectation[]} passedExpectations - The list of expectations that passed during execution of this spec.
     * @property {Expectation[]} deprecationWarnings - The list of deprecation warnings that occurred during execution this spec.
     * @property {String} pendingReason - If the spec is {@link pending}, this will be the reason.
     * @property {String} status - Once the spec has completed, this string represents the pass/fail status of this spec.
     * @property {number} duration - The time in ms used by the spec execution, including any before/afterEach.
     * @property {Object} properties - User-supplied properties, if any, that were set using {@link Env#setSpecProperty}
     */
    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      failedExpectations: [],
      passedExpectations: [],
      deprecationWarnings: [],
      pendingReason: '',
      duration: null,
      properties: null
    };
  }

  Spec.prototype.addExpectationResult = function(passed, data, isError) {
    var expectationResult = this.expectationResultFactory(data);
    if (passed) {
      this.result.passedExpectations.push(expectationResult);
    } else {
      this.result.failedExpectations.push(expectationResult);

      if (this.throwOnExpectationFailure && !isError) {
        throw new j$.errors.ExpectationFailed();
      }
    }
  };

  Spec.prototype.setSpecProperty = function(key, value) {
    this.result.properties = this.result.properties || {};
    this.result.properties[key] = value;
  };

  Spec.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Spec.prototype.expectAsync = function(actual) {
    return this.asyncExpectationFactory(actual, this);
  };

  Spec.prototype.execute = function(onComplete, excluded, failSpecWithNoExp) {
    var self = this;

    var onStart = {
      fn: function(done) {
        self.timer.start();
        self.onStart(self, done);
      }
    };

    var complete = {
      fn: function(done) {
        self.queueableFn.fn = null;
        self.result.status = self.status(excluded, failSpecWithNoExp);
        self.result.duration = self.timer.elapsed();
        self.resultCallback(self.result, done);
      }
    };

    var fns = this.beforeAndAfterFns();
    var regularFns = fns.befores.concat(this.queueableFn);

    var runnerConfig = {
      isLeaf: true,
      queueableFns: regularFns,
      cleanupFns: fns.afters,
      onException: function() {
        self.onException.apply(self, arguments);
      },
      onMultipleDone: function() {
        // Issue a deprecation. Include the context ourselves and pass
        // ignoreRunnable: true, since getting here always means that we've already
        // moved on and the current runnable isn't the one that caused the problem.
        self.deprecated(
          "An asynchronous function called its 'done' " +
            'callback more than once. This is a bug in the spec, beforeAll, ' +
            'beforeEach, afterAll, or afterEach function in question. This will ' +
            'be treated as an error in a future version.\n' +
            '(in spec: ' +
            self.getFullName() +
            ')',
          { ignoreRunnable: true }
        );
      },
      onComplete: function() {
        if (self.result.status === 'failed') {
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
      runnerConfig.cleanupFns = [];
    }

    runnerConfig.queueableFns.unshift(onStart);
    runnerConfig.cleanupFns.push(complete);

    this.queueRunnerFactory(runnerConfig);
  };

  Spec.prototype.onException = function onException(e) {
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

  Spec.prototype.pend = function(message) {
    this.markedPending = true;
    if (message) {
      this.result.pendingReason = message;
    }
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

  /**
   * The full description including all ancestors of this spec.
   * @name Spec#getFullName
   * @function
   * @returns {string}
   */
  Spec.prototype.getFullName = function() {
    return this.getSpecName(this);
  };

  Spec.prototype.addDeprecationWarning = function(deprecation) {
    if (typeof deprecation === 'string') {
      deprecation = { message: deprecation };
    }
    this.result.deprecationWarnings.push(
      this.expectationResultFactory(deprecation)
    );
  };

  var extractCustomPendingMessage = function(e) {
    var fullMessage = e.toString(),
      boilerplateStart = fullMessage.indexOf(Spec.pendingSpecExceptionMessage),
      boilerplateEnd =
        boilerplateStart + Spec.pendingSpecExceptionMessage.length;

    return fullMessage.substr(boilerplateEnd);
  };

  Spec.pendingSpecExceptionMessage = '=> marked Pending';

  Spec.isPendingSpecException = function(e) {
    return !!(
      e &&
      e.toString &&
      e.toString().indexOf(Spec.pendingSpecExceptionMessage) !== -1
    );
  };

  return Spec;
};

if (typeof window == void 0 && typeof exports == 'object') {
  /* globals exports */
  exports.Spec = jasmineRequire.Spec;
}
