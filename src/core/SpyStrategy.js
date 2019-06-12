getJasmineRequireObj().SpyStrategy = function(j$) {
  /**
   * @interface SpyStrategy
   */
  function SpyStrategy(options) {
    options = options || {};

    var self = this;

    /**
     * Get the identifying information for the spy.
     * @name SpyStrategy#identity
     * @since 3.0.0
     * @member
     * @type {String}
     */
    this.identity = options.name || 'unknown';
    this.originalFn = options.fn || function() {};
    this.getSpy = options.getSpy || function() {};
    this.plan = this._defaultPlan = function() {};

    var k,
      cs = options.customStrategies || {};
    for (k in cs) {
      if (j$.util.has(cs, k) && !this[k]) {
        this[k] = createCustomPlan(cs[k]);
      }
    }

    var getPromise =
      typeof options.getPromise === 'function'
        ? options.getPromise
        : function() {};

    var requirePromise = function(name) {
      var Promise = getPromise();

      if (!Promise) {
        throw new Error(
          name +
            ' requires global Promise, or `Promise` configured with `jasmine.getEnv().configure()`'
        );
      }

      return Promise;
    };

    /**
     * Tell the spy to return a promise resolving to the specified value when invoked.
     * @name SpyStrategy#resolveTo
     * @since 3.5.0
     * @function
     * @param {*} value The value to return.
     */
    this.resolveTo = function(value) {
      var Promise = requirePromise('resolveTo');
      self.plan = function() {
        return Promise.resolve(value);
      };
      return self.getSpy();
    };

    /**
     * Tell the spy to return a promise rejecting with the specified value when invoked.
     * @name SpyStrategy#rejectWith
     * @since 3.5.0
     * @function
     * @param {*} value The value to return.
     */
    this.rejectWith = function(value) {
      var Promise = requirePromise('rejectWith');

      self.plan = function() {
        return Promise.reject(value);
      };
      return self.getSpy();
    };
  }

  function createCustomPlan(factory) {
    return function() {
      var plan = factory.apply(null, arguments);

      if (!j$.isFunction_(plan)) {
        throw new Error('Spy strategy must return a function');
      }

      this.plan = plan;
      return this.getSpy();
    };
  }

  /**
   * Execute the current spy strategy.
   * @name SpyStrategy#exec
   * @since 2.0.0
   * @function
   */
  SpyStrategy.prototype.exec = function(context, args) {
    return this.plan.apply(context, args);
  };

  /**
   * Tell the spy to call through to the real implementation when invoked.
   * @name SpyStrategy#callThrough
   * @since 2.0.0
   * @function
   */
  SpyStrategy.prototype.callThrough = function() {
    this.plan = this.originalFn;
    return this.getSpy();
  };

  /**
   * Tell the spy to return the value when invoked.
   * @name SpyStrategy#returnValue
   * @since 2.0.0
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
   * @name SpyStrategy#returnValues
   * @since 2.1.0
   * @function
   * @param {...*} values - Values to be returned on subsequent calls to the spy.
   */
  SpyStrategy.prototype.returnValues = function() {
    var values = Array.prototype.slice.call(arguments);
    this.plan = function() {
      return values.shift();
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to throw an error when invoked.
   * @name SpyStrategy#throwError
   * @since 2.0.0
   * @function
   * @param {Error|String} something Thing to throw
   */
  SpyStrategy.prototype.throwError = function(something) {
    var error = something instanceof Error ? something : new Error(something);
    this.plan = function() {
      throw error;
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to call a fake implementation when invoked.
   * @name SpyStrategy#callFake
   * @since 2.0.0
   * @function
   * @param {Function} fn The function to invoke with the passed parameters.
   */
  SpyStrategy.prototype.callFake = function(fn) {
    if (!(j$.isFunction_(fn) || j$.isAsyncFunction_(fn))) {
      throw new Error(
        'Argument passed to callFake should be a function, got ' + fn
      );
    }
    this.plan = fn;
    return this.getSpy();
  };

  /**
   * Tell the spy to do nothing when invoked. This is the default.
   * @name SpyStrategy#stub
   * @since 2.0.0
   * @function
   */
  SpyStrategy.prototype.stub = function(fn) {
    this.plan = function() {};
    return this.getSpy();
  };

  SpyStrategy.prototype.isConfigured = function() {
    return this.plan !== this._defaultPlan;
  };

  return SpyStrategy;
};
