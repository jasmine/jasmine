getJasmineRequireObj().Suite = function(j$) {
  class Suite {
    #reportedParentSuiteId;
    #throwOnExpectationFailure;
    #autoCleanClosures;
    #timer;

    constructor(attrs) {
      this.id = attrs.id;
      this.parentSuite = attrs.parentSuite;
      this.description = attrs.description;
      this.filename = attrs.filename;
      this.expectationFactory = attrs.expectationFactory;
      this.asyncExpectationFactory = attrs.asyncExpectationFactory;
      this.onLateError = attrs.onLateError || function() {};
      this.#reportedParentSuiteId = attrs.reportedParentSuiteId;
      this.#throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;
      this.#autoCleanClosures =
        attrs.autoCleanClosures === undefined
          ? true
          : !!attrs.autoCleanClosures;
      this.#timer = attrs.timer || new j$.Timer();

      this.beforeFns = [];
      this.afterFns = [];
      this.beforeAllFns = [];
      this.afterAllFns = [];
      this.children = [];

      this.reset();
    }

    setSuiteProperty(key, value) {
      this.result.properties = this.result.properties || {};
      this.result.properties[key] = value;
    }

    getFullName() {
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
    }

    // Mark the suite with "pending" status
    pend() {
      this.markedPending = true;
    }

    // Like pend(), but pending state will survive reset().
    // Useful for fdescribe, xdescribe, where pending state should remain.
    exclude() {
      this.pend();
      this.markedExcluding = true;
    }

    beforeEach(fn) {
      this.beforeFns.unshift({ ...fn, suite: this });
    }

    beforeAll(fn) {
      this.beforeAllFns.push({ ...fn, type: 'beforeAll', suite: this });
    }

    afterEach(fn) {
      this.afterFns.unshift({ ...fn, suite: this, type: 'afterEach' });
    }

    afterAll(fn) {
      this.afterAllFns.unshift({ ...fn, type: 'afterAll' });
    }

    startTimer() {
      this.#timer.start();
    }

    endTimer() {
      this.result.duration = this.#timer.elapsed();
    }

    cleanupBeforeAfter() {
      if (this.#autoCleanClosures) {
        removeFns(this.beforeAllFns);
        removeFns(this.afterAllFns);
        removeFns(this.beforeFns);
        removeFns(this.afterFns);
      }
    }

    reset() {
      /**
       * @typedef SuiteResult
       * @property {String} id - The unique id of this suite.
       * @property {String} description - The description text passed to the {@link describe} that made this suite.
       * @property {String} fullName - The full description including all ancestors of this suite.
       * @property {String|null} parentSuiteId - The ID of the suite containing this suite, or null if this is not in another describe().
       * @property {String} filename - Deprecated. The name of the file the suite was defined in.
       * Note: The value may be incorrect if zone.js is installed or
       * `describe`/`fdescribe`/`xdescribe` have been replaced with versions that
       * don't maintain the same call stack height as the originals. This property
       * may be removed in a future version unless there is enough user interest
       * in keeping it. See {@link https://github.com/jasmine/jasmine/issues/2065}.
       * @property {ExpectationResult[]} failedExpectations - The list of expectations that failed in an {@link afterAll} for this suite.
       * @property {ExpectationResult[]} deprecationWarnings - The list of deprecation warnings that occurred on this suite.
       * @property {String} status - Once the suite has completed, this string represents the pass/fail status of this suite.
       * @property {number} duration - The time in ms for Suite execution, including any before/afterAll, before/afterEach.
       * @property {Object} properties - User-supplied properties, if any, that were set using {@link Env#setSuiteProperty}
       * @since 2.0.0
       */
      this.result = {
        id: this.id,
        description: this.description,
        fullName: this.getFullName(),
        parentSuiteId: this.#reportedParentSuiteId,
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
    }

    removeChildren() {
      this.children = [];
    }

    addChild(child) {
      this.children.push(child);
    }

    #status() {
      if (this.markedPending) {
        return 'pending';
      }

      if (this.result.failedExpectations.length > 0) {
        return 'failed';
      } else {
        return 'passed';
      }
    }

    getResult() {
      this.result.status = this.#status();
      return this.result;
    }

    canBeReentered() {
      return this.beforeAllFns.length === 0 && this.afterAllFns.length === 0;
    }

    sharedUserContext() {
      if (!this.sharedContext) {
        this.sharedContext = this.parentSuite
          ? this.parentSuite.clonedSharedUserContext()
          : new j$.UserContext();
      }

      return this.sharedContext;
    }

    clonedSharedUserContext() {
      return j$.UserContext.fromExisting(this.sharedUserContext());
    }

    handleException() {
      if (arguments[0] instanceof j$.errors.ExpectationFailed) {
        return;
      }

      const data = {
        matcherName: '',
        passed: false,
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
    }

    onMultipleDone() {
      let msg;

      // Issue an error. Include the context ourselves and pass
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
    }

    addExpectationResult() {
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

        if (this.#throwOnExpectationFailure) {
          throw new j$.errors.ExpectationFailed();
        }
      }
    }

    addDeprecationWarning(deprecation) {
      if (typeof deprecation === 'string') {
        deprecation = { message: deprecation };
      }
      this.result.deprecationWarnings.push(
        j$.buildExpectationResult(deprecation)
      );
    }

    hasChildWithDescription(description) {
      for (const child of this.children) {
        if (child.description === description) {
          return true;
        }
      }

      return false;
    }

    get metadata() {
      if (!this.metadata_) {
        this.metadata_ = new SuiteMetadata(this);
      }

      return this.metadata_;
    }
  }

  function removeFns(queueableFns) {
    for (const qf of queueableFns) {
      qf.fn = null;
    }
  }

  /**
   * @interface Suite
   * @see Env#topSuite
   * @since 2.0.0
   */
  class SuiteMetadata {
    #suite;

    constructor(suite) {
      this.#suite = suite;
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
    getFullName() {
      return this.#suite.getFullName();
    }

    /**
     * The suite's children.
     * @name Suite#children
     * @type {Array.<(Spec|Suite)>}
     * @since 2.0.0
     */
    get children() {
      return this.#suite.children.map(child => child.metadata);
    }
  }

  function isFailure(args) {
    return !args[0];
  }

  return Suite;
};
