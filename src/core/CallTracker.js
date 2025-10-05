getJasmineRequireObj().CallTracker = function(j$) {
  'use strict';

  /**
   * @namespace Spy#calls
   * @since 2.0.0
   */
  function CallTracker() {
    let calls = [];
    const opts = {};

    this.track = function(context) {
      if (opts.cloneArgs) {
        context.args = opts.argsCloner(context.args);
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
     * Set this spy to do a clone of arguments passed to each invocation.
     * @name Spy#calls#saveArgumentsByValue
     * @since 2.5.0
     * @param {Function} [argsCloner] A function to use to clone the arguments. Defaults to a shallow cloning function.
     * @function
     */
    this.saveArgumentsByValue = function(
      argsCloner = j$.private.util.cloneArgs
    ) {
      opts.cloneArgs = true;
      opts.argsCloner = argsCloner;
    };

    this.unverifiedCount = function() {
      return calls.reduce((count, call) => count + (call.verified ? 0 : 1), 0);
    };
  }

  return CallTracker;
};
