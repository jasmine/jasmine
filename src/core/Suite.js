getJasmineRequireObj().Suite = function(j$) {
  function Suite(attrs) {
    this.env = attrs.env;
    this.id = attrs.id;
    this.parentSuite = attrs.parentSuite;
    this.description = attrs.description;
    this.expectationFactory = attrs.expectationFactory;
    this.expectationResultFactory = attrs.expectationResultFactory;
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;

    this.beforeFns = [];
    this.afterFns = [];
    this.beforeAllFns = [];
    this.afterAllFns = [];

    this.children = [];

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      failedExpectations: []
    };
  }

  Suite.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Suite.prototype.getFullName = function() {
    var fullName = [];
    for (var parentSuite = this; parentSuite; parentSuite = parentSuite.parentSuite) {
      if (parentSuite.parentSuite) {
        fullName.unshift(parentSuite.description);
      }
    }
    return fullName.join(' ');
  };

  Suite.prototype.pend = function() {
    this.markedPending = true;
  };

  Suite.prototype.beforeEach = function(fn) {
    this.beforeFns.unshift(fn);
  };

  Suite.prototype.beforeAll = function(fn) {
    this.beforeAllFns.push(fn);
  };

  Suite.prototype.afterEach = function(fn) {
    this.afterFns.unshift(fn);
  };

  Suite.prototype.afterAll = function(fn) {
    this.afterAllFns.unshift(fn);
  };

  Suite.prototype.addChild = function(child) {
    this.children.push(child);
  };

  Suite.prototype.status = function() {
    if (this.markedPending) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'finished';
    }
  };

  Suite.prototype.isExecutable = function() {
    return !this.markedPending;
  };

  Suite.prototype.canBeReentered = function() {
    return this.beforeAllFns.length === 0 && this.afterAllFns.length === 0;
  };

  Suite.prototype.getResult = function() {
    this.result.status = this.status();
    return this.result;
  };

  Suite.prototype.sharedUserContext = function() {
    if (!this.sharedContext) {
      this.sharedContext = this.parentSuite ? clone(this.parentSuite.sharedUserContext()) : {};
    }

    return this.sharedContext;
  };

  Suite.prototype.clonedSharedUserContext = function() {
    return clone(this.sharedUserContext());
  };

  Suite.prototype.onException = function() {
    if (arguments[0] instanceof j$.errors.ExpectationFailed) {
      return;
    }

    if(isAfterAll(this.children)) {
      recordException(this, arguments[0]);
      return true;
    } else {
      var wasHandled = false;
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (child.onException.apply(child, arguments)) {
          wasHandled = true;
        }
      }

      if (!wasHandled && !this.parentSuite) {
        recordException(this, arguments[0]);
      }

      return wasHandled;
    }
  };

  Suite.prototype.addExpectationResult = function () {
    if(isAfterAll(this.children) && isFailure(arguments)){
      var data = arguments[1];
      this.result.failedExpectations.push(this.expectationResultFactory(data));
      if(this.throwOnExpectationFailure) {
        throw new j$.errors.ExpectationFailed();
      }
    } else {
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        try {
          child.addExpectationResult.apply(child, arguments);
        } catch(e) {
          // keep going
        }
      }
    }
  };

  function isAfterAll(children) {
    return children && children[0] && children[0].result.status;
  }

  function isFailure(args) {
    return !args[0];
  }

  function clone(obj) {
    var clonedObj = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        clonedObj[prop] = obj[prop];
      }
    }

    return clonedObj;
  }

  function recordException(suite, exception) {
    var data = {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: exception
    };
    suite.result.failedExpectations.push(suite.expectationResultFactory(data));
  }

  return Suite;
};

if (typeof window == void 0 && typeof exports == 'object') {
  exports.Suite = jasmineRequire.Suite;
}
