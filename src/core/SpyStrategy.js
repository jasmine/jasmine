getJasmineRequireObj().SpyStrategy = function(j$) {

  /**
   * @interface SpyStrategy
   */
  function SpyStrategy(options) {
    options = options || {};

    /**
     * Get the identifying information for the spy.
     * @name SpyStrategy#identity
     * @member
     * @type {String}
     */
    this.identity = options.name || 'unknown';
    this.originalFn = options.fn || function() {};
    this.getSpy = options.getSpy || function() {};
    this.deprecated = options.deprecated || j$.getEnv().deprecated;

    this._defaultPlan = function() {};
    this._planned = [this._defaultPlan];

    Object.defineProperty(this, 'plan', {
      get: function() {
        return this._planned[0];
      },
      set: function(plan) {
        if (this.deprecated) {
          this.deprecated('Setting plan directly on a spy is deprecated, use `callFake` instead');
        }
        this._planned = [plan];
      }
    });

    var k, cs = options.customStrategies || {};
    for (k in cs) {
      if (j$.util.has(cs, k) && !this[k]) {
        this[k] = createCustomPlan(cs[k]);
      }
    }

    this.plannedProxy = createPlannedProxy(this);
  }

  function createCustomPlan(factory) {
    return function() {
      var plan = factory.apply(null, arguments);

      if (!j$.isFunction_(plan)) {
        throw new Error('Spy strategy must return a function');
      }

      this._applyPlan(plan);
      return this.getSpy();
    };
  }

  function createPlannedProxy(obj) {
    var k, proxy = {};

    for (k in obj) {
      if (typeof obj[k] === 'function') {
        proxy[k] = obj[k];
      }
    }

    Object.defineProperty(proxy, 'plan', {
      get: function() {
        return obj.plan;
      },
      set: function(plan) {
        obj.plan = plan;
      }
    });

    proxy.getSpy = obj.getSpy.bind(obj);
    proxy.isConfigured = obj.isConfigured.bind(obj);
    proxy._applyPlan = function(plan) {
      obj._planned.push(plan);
    };

    return proxy;
  }

  /**
   * Assign the provided plan to be the current spy strategy.
   */
  SpyStrategy.prototype._applyPlan = function(plan) {
    this._planned = [plan];
  };

  /**
   * Execute the current spy strategy.
   * @name SpyStrategy#exec
   * @function
   */
  SpyStrategy.prototype.exec = function(context, args) {
    try {
      return this.plan.apply(context, args);
    } finally {
      if (this._planned.length > 1) {
        this._planned.shift();
      }
    }
  };

  /**
   * Tell the spy to call through to the real implementation when invoked.
   * @name SpyStrategy#callThrough
   * @function
   */
  SpyStrategy.prototype.callThrough = function() {
    this._applyPlan(this.originalFn);
    return this.getSpy();
  };

  /**
   * Tell the spy to return the value when invoked.
   * @name SpyStrategy#returnValue
   * @function
   * @param {*} value The value to return.
   */
  SpyStrategy.prototype.returnValue = function(value) {
    this._applyPlan(function() {
      return value;
    });
    return this.getSpy();
  };

  /**
   * Tell the spy to return one of the specified values (sequentially) each time the spy is invoked.
   * @name SpyStrategy#returnValues
   * @function
   * @param {...*} values - Values to be returned on subsequent calls to the spy.
   */
  SpyStrategy.prototype.returnValues = function() {
    var values = Array.prototype.slice.call(arguments);
    this._applyPlan(function() {
      return values.shift();
    });
    return this.getSpy();
  };

  /**
   * Tell the spy to throw an error when invoked.
   * @name SpyStrategy#throwError
   * @function
   * @param {Error|String} something Thing to throw
   */
  SpyStrategy.prototype.throwError = function(something) {
    var error = (something instanceof Error) ? something : new Error(something);
    this._applyPlan(function() {
      throw error;
    });
    return this.getSpy();
  };

  /**
   * Tell the spy to call a fake implementation when invoked.
   * @name SpyStrategy#callFake
   * @function
   * @param {Function} fn The function to invoke with the passed parameters.
   */
  SpyStrategy.prototype.callFake = function(fn) {
    if(!(j$.isFunction_(fn) || j$.isAsyncFunction_(fn))) {
      throw new Error('Argument passed to callFake should be a function, got ' + fn);
    }
    this._applyPlan(fn);
    return this.getSpy();
  };

  /**
   * Tell the spy to do nothing when invoked. This is the default.
   * @name SpyStrategy#stub
   * @function
   */
  SpyStrategy.prototype.stub = function() {
    this._applyPlan(function() {});
    return this.getSpy();
  };

  /**
   * Return a boolean indicating whether the spy has been configured.
   * @name SpyStrategy#isConfigured
   * @function
   */
  SpyStrategy.prototype.isConfigured = function() {
    return this._planned.length > 1 || this._planned[0] !== this._defaultPlan;
  };

  return SpyStrategy;
};
