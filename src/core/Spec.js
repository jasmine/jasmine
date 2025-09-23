getJasmineRequireObj().Spec = function(j$) {
  class Spec {
    #autoCleanClosures;
    #throwOnExpectationFailure;
    #timer;
    #metadata;
    #executionState;

    constructor(attrs) {
      this.expectationFactory = attrs.expectationFactory;
      this.asyncExpectationFactory = attrs.asyncExpectationFactory;
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
      this.getPath = function() {
        return attrs.getPath ? attrs.getPath(this) : [];
      };

      this.#autoCleanClosures =
        attrs.autoCleanClosures === undefined
          ? true
          : !!attrs.autoCleanClosures;
      this.onLateError = attrs.onLateError || function() {};
      this.#throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;
      this.#timer = attrs.timer || new j$.Timer();

      this.reset();

      if (!this.queueableFn.fn) {
        this.exclude();
      }
    }

    addExpectationResult(passed, data, isError) {
      const expectationResult = j$.private.buildExpectationResult(data);

      if (passed) {
        this.#executionState.passedExpectations.push(expectationResult);
      } else {
        if (this.reportedDone) {
          this.onLateError(expectationResult);
        } else {
          this.#executionState.failedExpectations.push(expectationResult);
        }

        if (this.#throwOnExpectationFailure && !isError) {
          throw new j$.private.errors.ExpectationFailed();
        }
      }
    }

    getSpecProperty(key) {
      this.#executionState.properties = this.#executionState.properties || {};
      return this.#executionState.properties[key];
    }

    setSpecProperty(key, value) {
      // Key and value will eventually be cloned during reporting. The error
      // thrown at that point if they aren't cloneable isn't very helpful.
      // Throw a better one now.
      j$.private.util.assertReporterCloneable(key, 'Key');
      j$.private.util.assertReporterCloneable(value, 'Value');
      this.#executionState.properties = this.#executionState.properties || {};
      this.#executionState.properties[key] = value;
    }

    executionStarted() {
      this.#timer.start();
    }

    executionFinished(excluded, failSpecWithNoExp) {
      this.#executionState.dynamicallyExcluded = excluded;
      this.#executionState.requireExpectations = failSpecWithNoExp;

      if (this.#autoCleanClosures) {
        this.queueableFn.fn = null;
      }

      this.#executionState.duration = this.#timer.elapsed();

      if (this.status() !== 'failed') {
        this.#executionState.debugLogs = null;
      }
    }

    hadBeforeAllFailure() {
      this.addExpectationResult(
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
    }

    reset() {
      this.#executionState = {
        failedExpectations: [],
        passedExpectations: [],
        deprecationWarnings: [],
        pendingReason: this.excludeMessage || '',
        duration: null,
        properties: null,
        debugLogs: null,
        // TODO: better naming. Don't make 'excluded' mean two things.
        dynamicallyExcluded: false,
        requireExpectations: false,
        markedPending: this.markedExcluding
      };
      this.reportedDone = false;
    }

    startedEvent() {
      /**
       * @typedef SpecStartedEvent
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
       * @since 2.0.0
       */
      return this.#commonEventFields();
    }

    doneEvent() {
      /**
       * @typedef SpecDoneEvent
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
      const event = {
        ...this.#commonEventFields(),
        status: this.status()
      };
      const toCopy = [
        'failedExpectations',
        'passedExpectations',
        'deprecationWarnings',
        'pendingReason',
        'duration',
        'properties',
        'debugLogs'
      ];

      for (const k of toCopy) {
        event[k] = this.#executionState[k];
      }

      return event;
    }

    #commonEventFields() {
      return {
        id: this.id,
        description: this.description,
        fullName: this.getFullName(),
        parentSuiteId: this.parentSuiteId,
        filename: this.filename
      };
    }

    handleException(e) {
      if (Spec.isPendingSpecException(e)) {
        this.pend(extractCustomPendingMessage(e));
        return;
      }

      if (e instanceof j$.private.errors.ExpectationFailed) {
        return;
      }

      this.addExpectationResult(
        false,
        {
          matcherName: '',
          passed: false,
          error: e
        },
        true
      );
    }

    pend(message) {
      this.#executionState.markedPending = true;
      if (message) {
        this.#executionState.pendingReason = message;
      }
    }

    get markedPending() {
      return this.#executionState.markedPending;
    }

    // Like pend(), but pending state will survive reset().
    // Useful for fit, xit, where pending state remains.
    exclude(message) {
      this.markedExcluding = true;
      if (this.message) {
        this.excludeMessage = message;
      }
      this.pend(message);
    }

    status() {
      if (this.#executionState.dynamicallyExcluded) {
        return 'excluded';
      }

      if (this.markedPending) {
        return 'pending';
      }

      if (
        this.#executionState.failedExpectations.length > 0 ||
        (this.#executionState.requireExpectations &&
          this.#executionState.failedExpectations.length +
            this.#executionState.passedExpectations.length ===
            0)
      ) {
        return 'failed';
      }

      return 'passed';
    }

    getFullName() {
      return this.getPath().join(' ');
    }

    addDeprecationWarning(deprecation) {
      if (typeof deprecation === 'string') {
        deprecation = { message: deprecation };
      }
      this.#executionState.deprecationWarnings.push(
        j$.private.buildExpectationResult(deprecation)
      );
    }

    debugLog(msg) {
      if (!this.#executionState.debugLogs) {
        this.#executionState.debugLogs = [];
      }

      /**
       * @typedef DebugLogEntry
       * @property {String} message - The message that was passed to {@link jasmine.debugLog}.
       * @property {number} timestamp - The time when the entry was added, in
       * milliseconds from the spec's start time
       */
      this.#executionState.debugLogs.push({
        message: msg,
        timestamp: this.#timer.elapsed()
      });
    }

    /**
     * @interface Spec
     * @see Configuration#specFilter
     * @since 2.0.0
     */
    get metadata() {
      // NOTE: Although most of jasmine-core only exposes these metadata objects,
      // actual Spec instances are still passed to Configuration#specFilter. Until
      // that is fixed, it's important to make sure that all metadata properties
      // also exist in compatible form on the underlying Spec.
      if (!this.#metadata) {
        this.#metadata = {
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

      return this.#metadata;
    }
  }

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

  return Spec;
};
