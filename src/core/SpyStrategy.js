getJasmineRequireObj().SpyStrategy = function() {

  /**
   * @namespace Spy#and
   */
  function SpyStrategy(options) {
    options = options || {};

    var identity = options.name || 'unknown',
        originalFn = options.fn || function() {},
        getSpy = options.getSpy || function() {},
        plan = function() {};

    /**
     * Return the identifying information for the spy.
     * @name Spy#and#identity
     * @function
     * @returns {String}
     */
    this.identity = function() {
      return identity;
    };

    /**
     * Execute the current spy strategy.
     * @name Spy#and#exec
     * @function
     */
    this.exec = function() {
      return Function.prototype.apply.call(plan, this, arguments);
    };

    /**
     * Tell the spy to call through to the real implementation when invoked.
     * @name Spy#and#callThrough
     * @function
     */
    this.callThrough = function() {
      plan = originalFn;
      return getSpy();
    };

    /**
     * Tell the spy to return the value when invoked.
     * @name Spy#and#returnValue
     * @function
     * @param {*} value The value to return.
     */
    this.returnValue = function(value) {
      plan = function() {
        return value;
      };
      return getSpy();
    };

    /**
     * Tell the spy to return one of the specified values (sequentially) each time the spy is invoked.
     * @name Spy#and#returnValues
     * @function
     * @param {...*} values - Values to be returned on subsequent calls to the spy.
     */
    this.returnValues = function() {
      var values = Array.prototype.slice.call(arguments);
      plan = function () {
        return values.shift();
      };
      return getSpy();
    };

    /**
     * Tell the spy to throw an error when invoked.
     * @name Spy#and#throwError
     * @function
     * @param {Error|String} something Thing to throw
     */
    this.throwError = function(something) {
      var error = (something instanceof Error) ? something : new Error(something);
      plan = function() {
        throw error;
      };
      return getSpy();
    };

    /**
     * Tell the spy to call a fake implementation when invoked.
     * @name Spy#and#callFake
     * @function
     * @param {Function} fn The function to invoke with the passed parameters.
     */
    this.callFake = function(fn) {
      if(typeof fn !== 'function') {
        throw new Error('Argument passed to callFake should be a function, got ' + fn);
      }
      plan = fn;
      return getSpy();
    };

    /**
     * Tell the spy to do nothing when invoked. This is the default.
     * @name Spy#and#stub
     * @function
     */
    this.stub = function(fn) {
      plan = function() {};
      return getSpy();
    };
  }

  return SpyStrategy;
};
