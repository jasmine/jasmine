jasmine.Matchers = (function(){ 
	var _this = this /* @private scoped reference to "this".  (Avoids confusion/mistakes when scope of "this" changes due to events, apply, call, etc. */
		, _undefined_  = jasmine.___undefined___ /* @private scoped reference to "undefined" */
	;

	/**
	 * @constructor
	 * @param {jasmine.Env} env
	 * @param actual
	 * @param {jasmine.Spec} spec
	 */
	function _Matchers (env, actual, spec, opt_isNot) {
	  this.env = env;
	  this.actual = actual;
	  this.spec = spec;
	  this.isNot = opt_isNot || false;
	  this.reportWasCalled_ = false;
	};
	
	// todo: @deprecated as of Jasmine 0.11, remove soon [xw]
	_Matchers.pp = function(str) {
	  throw new Error("jasmine.Matchers.pp() is no longer supported, please use jasmine.pp() instead!");
	};
	
	// todo: @deprecated Deprecated as of Jasmine 0.10. Rewrite your custom matchers to return true or false. [xw]
	_Matchers.prototype.report = function(result, failing_message, details) {
	  throw new Error("As of jasmine 0.11, custom matchers must be implemented differently -- please see jasmine docs");
	};
	
	_Matchers.wrapInto_ = function(prototype, matchersClass) {
	  for (var methodName in prototype) {
	    if (methodName == 'report') continue;
	    var orig = prototype[methodName];
	    matchersClass.prototype[methodName] = _Matchers.matcherFn_(methodName, orig);
	  }
	};
	
	_Matchers.matcherFn_ = function(matcherName, matcherFunction) {
	  return function() {
	    var matcherArgs = jasmine.util.argsToArray(arguments);
	    var result = matcherFunction.apply(this, arguments);
	
	    if (this.isNot) {
	      result = !result;
	    }
	
	    if (this.reportWasCalled_) return result;
	
	    var message;
	    if (!result) {
	      if (this.message) {
	        message = this.message.apply(this, arguments);
	        if (jasmine.isArray_(message)) {
	          message = message[this.isNot ? 1 : 0];
	        }
	      } else {
	        var englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });
	        message = "Expected " + jasmine.pp(this.actual) + (this.isNot ? " not " : " ") + englishyPredicate;
	        if (matcherArgs.length > 0) {
	          for (var i = 0; i < matcherArgs.length; i++) {
	            if (i > 0) message += ",";
	            message += " " + jasmine.pp(matcherArgs[i]);
	          }
	        }
	        message += ".";
	      }
	    }
	    var expectationResult = new jasmine.ExpectationResult({
	      matcherName: matcherName,
	      passed: result,
	      expected: matcherArgs.length > 1 ? matcherArgs : matcherArgs[0],
	      actual: this.actual,
	      message: message
	    });
	    this.spec.addMatcherResult(expectationResult);
	    return _undefined_;
	  };
	};
	
	
	
	
	/**
	 * toBe: compares the actual to the expected using ===
	 * @param expected
	 */
	_Matchers.prototype.toBe = function(expected) {
	  return this.actual === expected;
	};
	
	/**
	 * toNotBe: compares the actual to the expected using !==
	 * @param expected
	 * @deprecated as of 1.0. Use not.toBe() instead.
	 */
	_Matchers.prototype.toNotBe = function(expected) {
	  return this.actual !== expected;
	};
	
	/**
	 * toEqual: compares the actual to the expected using common sense equality. Handles Objects, Arrays, etc.
	 *
	 * @param expected
	 */
	_Matchers.prototype.toEqual = function(expected) {
	  return this.env.equals_(this.actual, expected);
	};
	
	/**
	 * toNotEqual: compares the actual to the expected using the ! of jasmine.Matchers.toEqual
	 * @param expected
	 * @deprecated as of 1.0. Use not.toNotEqual() instead.
	 */
	_Matchers.prototype.toNotEqual = function(expected) {
	  return !this.env.equals_(this.actual, expected);
	};
	
	/**
	 * Matcher that compares the actual to the expected using a regular expression.  Constructs a RegExp, so takes
	 * a pattern or a String.
	 *
	 * @param expected
	 */
	_Matchers.prototype.toMatch = function(expected) {
	  return new RegExp(expected).test(this.actual);
	};
	
	/**
	 * Matcher that compares the actual to the expected using the boolean inverse of jasmine.Matchers.toMatch
	 * @param expected
	 * @deprecated as of 1.0. Use not.toMatch() instead.
	 */
	_Matchers.prototype.toNotMatch = function(expected) {
	  return !(new RegExp(expected).test(this.actual));
	};
	
	/**
	 * Matcher that compares the actual to _undefined_.
	 */
	_Matchers.prototype.toBeDefined = function() {
	  return (this.actual !== _undefined_);
	};
	
	/**
	 * Matcher that compares the actual to _undefined_.
	 */
	_Matchers.prototype.toBeUndefined = function() {
	  return (this.actual === _undefined_);
	};
	
	/**
	 * Matcher that compares the actual to null.
	 */
	_Matchers.prototype.toBeNull = function() {
	  return (this.actual === null);
	};
	
	/**
	 * Matcher that boolean not-nots the actual.
	 */
	_Matchers.prototype.toBeTruthy = function() {
	  return !!this.actual;
	};
	
	
	/**
	 * Matcher that boolean nots the actual.
	 */
	_Matchers.prototype.toBeFalsy = function() {
	  return !this.actual;
	};
	
	
	/**
	 * Matcher that checks to see if the actual, a Jasmine spy, was called.
	 */
	_Matchers.prototype.toHaveBeenCalled = function() {
	  if (arguments.length > 0) {
	    throw new Error('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
	  }
	
	  if (!jasmine.isSpy(this.actual)) {
	    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
	  }
	
	  this.message = function() {
	    return [
	      "Expected spy " + this.actual.identity + " to have been called.",
	      "Expected spy " + this.actual.identity + " not to have been called."
	    ];
	  };
	
	  return this.actual.wasCalled;
	};
	
	/** @deprecated Use expect(xxx).toHaveBeenCalled() instead */
	_Matchers.prototype.wasCalled = _Matchers.prototype.toHaveBeenCalled;
	
	/**
	 * Matcher that checks to see if the actual, a Jasmine spy, was not called.
	 *
	 * @deprecated Use expect(xxx).not.toHaveBeenCalled() instead
	 */
	_Matchers.prototype.wasNotCalled = function() {
	  if (arguments.length > 0) {
	    throw new Error('wasNotCalled does not take arguments');
	  }
	
	  if (!jasmine.isSpy(this.actual)) {
	    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
	  }
	
	  this.message = function() {
	    return [
	      "Expected spy " + this.actual.identity + " to not have been called.",
	      "Expected spy " + this.actual.identity + " to have been called."
	    ];
	  };
	
	  return !this.actual.wasCalled;
	};
	
	/**
	 * Matcher that checks to see if the actual, a Jasmine spy, was called with a set of parameters.
	 *
	 * @example
	 *
	 */
	_Matchers.prototype.toHaveBeenCalledWith = function() {
	  var expectedArgs = jasmine.util.argsToArray(arguments);
	  if (!jasmine.isSpy(this.actual)) {
	    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
	  }
	  this.message = function() {
	    if (this.actual.callCount == 0) {
	      // todo: what should the failure message for .not.toHaveBeenCalledWith() be? is this right? test better. [xw]
	      return [
	        "Expected spy to have been called with " + jasmine.pp(expectedArgs) + " but it was never called.",
	        "Expected spy not to have been called with " + jasmine.pp(expectedArgs) + " but it was."
	      ];
	    } else {
	      return [
	        "Expected spy to have been called with " + jasmine.pp(expectedArgs) + " but was called with " + jasmine.pp(this.actual.argsForCall),
	        "Expected spy not to have been called with " + jasmine.pp(expectedArgs) + " but was called with " + jasmine.pp(this.actual.argsForCall)
	      ];
	    }
	  };
	
	  return this.env.contains_(this.actual.argsForCall, expectedArgs);
	};
	
	/** @deprecated Use expect(xxx).toHaveBeenCalledWith() instead */
	_Matchers.prototype.wasCalledWith = _Matchers.prototype.toHaveBeenCalledWith;
	
	/** @deprecated Use expect(xxx).not.toHaveBeenCalledWith() instead */
	_Matchers.prototype.wasNotCalledWith = function() {
	  var expectedArgs = jasmine.util.argsToArray(arguments);
	  if (!jasmine.isSpy(this.actual)) {
	    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
	  }
	
	  this.message = function() {
	    return [
	      "Expected spy not to have been called with " + jasmine.pp(expectedArgs) + " but it was",
	      "Expected spy to have been called with " + jasmine.pp(expectedArgs) + " but it was"
	    ]
	  };
	
	  return !this.env.contains_(this.actual.argsForCall, expectedArgs);
	};
	
	/**
	 * Matcher that checks that the expected item is an element in the actual Array.
	 *
	 * @param {Object} expected
	 */
	_Matchers.prototype.toContain = function(expected) {
	  return this.env.contains_(this.actual, expected);
	};
	
	/**
	 * Matcher that checks that the expected item is NOT an element in the actual Array.
	 *
	 * @param {Object} expected
	 * @deprecated as of 1.0. Use not.toNotContain() instead.
	 */
	_Matchers.prototype.toNotContain = function(expected) {
	  return !this.env.contains_(this.actual, expected);
	};
	
	_Matchers.prototype.toBeLessThan = function(expected) {
	  return this.actual < expected;
	};
	
	_Matchers.prototype.toBeGreaterThan = function(expected) {
	  return this.actual > expected;
	};
	
	/**
	 * Matcher that checks that the expected exception was thrown by the actual.
	 *
	 * @param {String} expected
	 */
	_Matchers.prototype.toThrow = function(expected) {
	  var result = false;
	  var exception;
	  if (typeof this.actual != 'function') {
	    throw new Error('Actual is not a function');
	  }
	  try {
	    this.actual();
	  } catch (e) {
	    exception = e;
	  }
	  if (exception) {
	    result = (expected === _undefined_ || this.env.equals_(exception.message || exception, expected.message || expected));
	  }
	
	  var not = this.isNot ? "not " : "";
	
	  this.message = function() {
	    if (exception && (expected === _undefined_ || !this.env.equals_(exception.message || exception, expected.message || expected))) {
	      return ["Expected function " + not + "to throw", expected ? expected.message || expected : " an exception", ", but it threw", exception.message || exception].join(' ');
	    } else {
	      return "Expected function to throw an exception.";
	    }
	  };
	
	  return result;
	};
	
	_Matchers.Any = function(expectedClass) {
	  this.expectedClass = expectedClass;
	};
	
	_Matchers.Any.prototype.matches = function(other) {
	  if (this.expectedClass == String) {
	    return typeof other == 'string' || other instanceof String;
	  }
	
	  if (this.expectedClass == Number) {
	    return typeof other == 'number' || other instanceof Number;
	  }
	
	  if (this.expectedClass == Function) {
	    return typeof other == 'function' || other instanceof Function;
	  }
	
	  if (this.expectedClass == Object) {
	    return typeof other == 'object';
	  }
	
	  return other instanceof this.expectedClass;
	};
	
	_Matchers.Any.prototype.toString = function() {
	  return '<jasmine.any(' + this.expectedClass + ')>';
	};

	return _Matchers;
})();