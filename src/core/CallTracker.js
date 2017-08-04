getJasmineRequireObj().CallTracker = function(j$) {

  /**
   * @namespace Spy#calls
   */
  function CallTracker() {
    var calls = [];
    var opts = {};

    function argCloner(context) {
      var clonedArgs = [];
      var argsAsArray = j$.util.argsToArray(context.args);
      for(var i = 0; i < argsAsArray.length; i++) {
        var str = Object.prototype.toString.apply(argsAsArray[i]),
          primitives = /^\[object (Boolean|String|RegExp|Number)/;

        if (argsAsArray[i] == null || str.match(primitives)) {
          clonedArgs.push(argsAsArray[i]);
        } else {
          clonedArgs.push(j$.util.clone(argsAsArray[i]));
        }
      }
      context.args = clonedArgs;
    }

    this.track = function(context) {
      if(opts.cloneArgs) {
        argCloner(context);
      }
      calls.push(context);
    };

    /**
     * Check whether this spy has been invoked.
     * @name Spy#calls#any
     * @function
     * @return {Boolean}
     */
    this.any = function() {
      return !!calls.length;
    };

    /**
     * Get the number of invocations of this spy.
     * @name Spy#calls#count
     * @function
     * @return {Integer}
     */
    this.count = function() {
      return calls.length;
    };

    /**
     * Get the arguments that were passed to a specific invocation of this spy.
     * @name Spy#calls#argsFor
     * @function
     * @param {Integer} index The 0-based invocation index.
     * @return {Array}
     */
    this.argsFor = function(index) {
      var call = calls[index];
      return call ? call.args : [];
    };

    /**
     * Get the raw calls array for this spy.
     * @name Spy#calls#all
     * @function
     * @return {Spy.callData[]}
     */
    this.all = function() {
      return calls;
    };

    /**
     * Get all of the arguments for each invocation of this spy in the order they were received.
     * @name Spy#calls#allArgs
     * @function
     * @return {Array}
     */
    this.allArgs = function() {
      var callArgs = [];
      for(var i = 0; i < calls.length; i++){
        callArgs.push(calls[i].args);
      }

      return callArgs;
    };

    /**
     * Get the first invocation of this spy.
     * @name Spy#calls#first
     * @function
     * @return {ObjecSpy.callData}
     */
    this.first = function() {
      return calls[0];
    };

    /**
     * Get the most recent invocation of this spy.
     * @name Spy#calls#mostRecent
     * @function
     * @return {ObjecSpy.callData}
     */
    this.mostRecent = function() {
      return calls[calls.length - 1];
    };

    /**
     * Reset this spy as if it has never been called.
     * @name Spy#calls#reset
     * @function
     */
    this.reset = function() {
      calls = [];
    };

    /**
     * Set this spy to do a shallow clone of arguments passed to each invocation.
     * @name Spy#calls#saveArgumentsByValue
     * @function
     */
    this.saveArgumentsByValue = function() {
      opts.cloneArgs = true;
    };

  }

  return CallTracker;
};
