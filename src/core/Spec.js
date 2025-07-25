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

    this.getPath = function() {
      return attrs.getPath ? attrs.getPath(this) : [];
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
     * @property {String} filename - Deprecated. The name of the file the spec was defined in.
     * Note: The value may be incorrect if zone.js is installed or
     * `it`/`fit`/`xit` have been replaced with versions that don't maintain the
     *  same call stack height as the originals. This property may be removed in
     *  a future version unless there is enough user interest in keeping it.
     *  See {@link https://github.com/jasmine/jasmine/issues/2065}.
     * @property {ExpectationResult[]} failedExpectations - The list of expectations that failed during execution of this spec.
     * @property {ExpectationResult[]} passedExpectations - The list of expectations that passed during execution of this spec.
     * @property {ExpectationResult[]} deprecationWarnings - The list of deprecation warnings that occurred during execution this spec.
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
    return this.getPath().join(' ');
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
    // NOTE: Although most of jasmine-core only exposes these metadata objects,
    // actual Spec instances are still passed to Configuration#specFilter. Until
    // that is fixed, it's important to make sure that all metadata properties
    // also exist in compatible form on the underlying Spec.
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
          getFullName: this.getFullName.bind(this),

          /**
           * The full path of the spec, as an array of names.
           * @name Spec#getPath
           * @function
           * @returns {Array.<string>}
           * @since 5.7.0
           */
          getPath: this.getPath.bind(this)
        };
      }

      return this.metadata_;
    }
  });

  return Spec;
};
