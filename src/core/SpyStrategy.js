getJasmineRequireObj().SpyStrategy = function(j$) {

  /**
   * @namespace Spy#and
   */
  function SpyStrategy(options) {
    options = options || {};

    /**
     * Get the identifying information for the spy.
     * @name Spy#and#identity
     * @member
     * @type {String}
     */
    this.identity = options.name || 'unknown',
    this.originalFn = options.fn || function() {},
    this.getSpy = options.getSpy || function() {},
    this.plan = function() {};
  }

  /**
   * Execute the current spy strategy.
   * @name Spy#and#exec
   * @function
   */
  SpyStrategy.prototype.exec = function(context, args) {
    return this.plan.apply(context, args);
  };

  /**
   * Tell the spy to call through to the real implementation when invoked.
   * @name Spy#and#callThrough
   * @function
   */
  SpyStrategy.prototype.callThrough = function() {
    this.plan = this.originalFn;
    return this.getSpy();
  };

  /**
   * Tell the spy to return the value when invoked.
   * @name Spy#and#returnValue
   * @function
   * @param {*} value The value to return.
   */
  SpyStrategy.prototype.returnValue = function(value) {
    this.plan = function() {
      return value;
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to return one of the specified values (sequentially) each time the spy is invoked.
   * @name Spy#and#returnValues
   * @function
   * @param {...*} values - Values to be returned on subsequent calls to the spy.
   */
  SpyStrategy.prototype.returnValues = function() {
    var values = Array.prototype.slice.call(arguments);
    this.plan = function () {
      return values.shift();
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to throw an error when invoked.
   * @name Spy#and#throwError
   * @function
   * @param {Error|String} something Thing to throw
   */
  SpyStrategy.prototype.throwError = function(something) {
    var error = (something instanceof Error) ? something : new Error(something);
    this.plan = function() {
      throw error;
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to call a fake implementation when invoked.
   * @name Spy#and#callFake
   * @function
   * @param {Function} fn The function to invoke with the passed parameters.
   */
  SpyStrategy.prototype.callFake = function(fn) {
    if(!(j$.isFunction_(fn) || j$.isAsyncFunction_(fn))) {
      throw new Error('Argument passed to callFake should be a function, got ' + fn);
    }
    this.plan = fn;
    return this.getSpy();
  };

  /**
   * Tell the spy to do nothing when invoked. This is the default.
   * @name Spy#and#stub
   * @function
   */
  SpyStrategy.prototype.stub = function(fn) {
    this.plan = function() {};
    return this.getSpy();
  };

  return SpyStrategy;
};
