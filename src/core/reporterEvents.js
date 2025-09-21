getJasmineRequireObj().reporterEvents = function() {
  /**
   * Used to tell Jasmine what optional or uncommonly implemented features
   * the reporter supports. If not specified, the defaults described in
   * {@link ReporterCapabilities} will apply.
   * @name Reporter#reporterCapabilities
   * @type ReporterCapabilities | undefined
   * @since 5.0
   */
  /**
   * Used to tell Jasmine what optional or uncommonly implemented features
   * the reporter supports.
   * @interface ReporterCapabilities
   * @see Reporter#reporterCapabilities
   * @since 5.0
   */
  /**
   * Indicates whether the reporter supports parallel execution. Jasmine will
   * not allow parallel execution unless all reporters that are in use set this
   * capability to true.
   * @name ReporterCapabilities#parallel
   * @type boolean | undefined
   * @default false
   * @see running_specs_in_parallel
   * @since 5.0
   */

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
     * @param {SpecStartedEvent} result Information about the individual {@link it} being run
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
     * @param {SpecDoneEvent} result
     * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
     * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
     * @see async
     */
    'specDone'
  ];
  Object.freeze(events);
  return events;
};
