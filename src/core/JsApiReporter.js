getJasmineRequireObj().JsApiReporter = function() {

  var noopTimer = {
    start: function(){},
    elapsed: function(){ return 0; }
  };

  /**
   * @name jsApiReporter
   * @classdesc {@link Reporter} added by default in `boot.js` to record results for retrieval in javascript code. An instance is made available as `jsApiReporter` on the global object.
   * @class
   * @hideconstructor
   */
  function JsApiReporter(options) {
    var timer = options.timer || noopTimer,
        status = 'loaded';

    this.started = false;
    this.finished = false;
    this.runDetails = {};

    this.jasmineStarted = function() {
      this.started = true;
      status = 'started';
      timer.start();
    };

    var executionTime;

    this.jasmineDone = function(runDetails) {
      this.finished = true;
      this.runDetails = runDetails;
      executionTime = timer.elapsed();
      status = 'done';
    };

    /**
     * Get the current status for the Jasmine environment.
     * @name jsApiReporter#status
     * @function
     * @return {String} - One of `loaded`, `started`, or `done`
     */
    this.status = function() {
      return status;
    };

    var suites = [],
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
     * @function
     * @param {Number} index - The position in the suites list to start from.
     * @param {Number} length - Maximum number of suite results to return.
     * @return {Object[]}
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
     * @function
     * @return {Object}
     */
    this.suites = function() {
      return suites_hash;
    };

    var specs = [];

    this.specDone = function(result) {
      specs.push(result);
    };

    /**
     * Get the results for a set of specs.
     *
     * Retrievable in slices for easier serialization.
     * @name jsApiReporter#specResults
     * @function
     * @param {Number} index - The position in the specs list to start from.
     * @param {Number} length - Maximum number of specs results to return.
     * @return {Object[]}
     */
    this.specResults = function(index, length) {
      return specs.slice(index, index + length);
    };

    /**
     * Get all spec results.
     * @name jsApiReporter#specs
     * @function
     * @return {Object[]}
     */
    this.specs = function() {
      return specs;
    };

    /**
     * Get the number of milliseconds it took for the full Jasmine suite to run.
     * @name jsApiReporter#executionTime
     * @function
     * @return {Number}
     */
    this.executionTime = function() {
      return executionTime;
    };

  }

  return JsApiReporter;
};
