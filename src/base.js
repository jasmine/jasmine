/**
 * Top level namespace for Jasmine, a lightweight JavaScript BDD/spec/testing framework.
 *
 * @namespace
 */
var jasmine = (function(){
	var _this = this;

	/**
	 * Allows for bound functions to be compared.  Internal use only.
	 *
	 * @ignore
	 * @private
	 * @param base {Object} bound 'this' for the function
	 * @param name {Function} function to find
	 */
	function _bindOriginal_ (base, name) {
	  var original = base[name];
	  if (original.apply) {
	    return function() {
	      return original.apply(base, arguments);
	    };
	  } else {
	    // IE support
	    return _this.getGlobal()[name];
	  }
	};
	
	/**
	 * Default interval in milliseconds for event loop yields (e.g. to allow network activity or to refresh the screen with the HTML-based runner). Small values here may result in slow test running. Zero means no updates until all tests have completed.
	 *
	 */
	_this.DEFAULT_UPDATE_INTERVAL = 250;
	
	/**
	 * Default timeout interval in milliseconds for waitsFor() blocks.
	 */
	_this.DEFAULT_TIMEOUT_INTERVAL = 5000;
	
	_this.getGlobal = function() {
	  function getGlobal() {
	    return this;
	  }
	
	  return getGlobal();
	};
	
	
	_this.setTimeout = _bindOriginal_(_this.getGlobal(), 'setTimeout');
	_this.clearTimeout = _bindOriginal_(_this.getGlobal(), 'clearTimeout');
	_this.setInterval = _bindOriginal_(_this.getGlobal(), 'setInterval');
	_this.clearInterval = _bindOriginal_(_this.getGlobal(), 'clearInterval');
	
	_this.MessageResult = function(values) {
	  this.type = 'log';
	  this.values = values;
	  this.trace = new Error(); // todo: test better
	};
	
	_this.MessageResult.prototype.toString = function() {
	  var text = "";
	  for(var i = 0; i < this.values.length; i++) {
	    if (i > 0) text += " ";
	    if (_this.isString_(this.values[i])) {
	      text += this.values[i];
	    } else {
	      text += _this.pp(this.values[i]);
	    }
	  }
	  return text;
	};
	
	_this.ExpectationResult = function(params) {
	  this.type = 'expect';
	  this.matcherName = params.matcherName;
	  this.passed_ = params.passed;
	  this.expected = params.expected;
	  this.actual = params.actual;
	
	  this.message = this.passed_ ? 'Passed.' : params.message;
	  this.trace = this.passed_ ? '' : new Error(this.message);
	};
	
	_this.ExpectationResult.prototype.toString = function () {
	  return this.message;
	};
	
	_this.ExpectationResult.prototype.passed = function () {
	  return this.passed_;
	};
	
	/**
	 * Getter for the Jasmine environment. Ensures one gets created
	 */
	_this.getEnv = function() {
	  return _this.currentEnv_ = _this.currentEnv_ || new _this.Env();
	};
	
	/**
	 * @ignore
	 * @private
	 * @param value
	 * @returns {Boolean}
	 */
	_this.isArray_ = function(value) {
	  return _this.isA_("Array", value);  
	};
	
	/**
	 * @ignore
	 * @private
	 * @param value
	 * @returns {Boolean}
	 */
	_this.isString_ = function(value) {
	  return _this.isA_("String", value);
	};
	
	/**
	 * @ignore
	 * @private
	 * @param value
	 * @returns {Boolean}
	 */
	_this.isNumber_ = function(value) {
	  return _this.isA_("Number", value);
	};
	
	/**
	 * @ignore
	 * @private
	 * @param {String} typeName
	 * @param value
	 * @returns {Boolean}
	 */
	_this.isA_ = function(typeName, value) {
	  return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
	};
	
	/**
	 * Pretty printer for expecations.  Takes any object and turns it into a human-readable string.
	 *
	 * @param value {Object} an object to be outputted
	 * @returns {String}
	 */
	_this.pp = function(value) {
	  var stringPrettyPrinter = new _this.StringPrettyPrinter();
	  stringPrettyPrinter.format(value);
	  return stringPrettyPrinter.string;
	};
	
	/**
	 * Returns true if the object is a DOM Node.
	 *
	 * @param {Object} obj object to check
	 * @returns {Boolean}
	 */
	_this.isDomNode = function(obj) {
	  return obj['nodeType'] > 0;
	};
	
	/**
	 * Returns a matchable 'generic' object of the class type.  For use in expecations of type when values don't matter.
	 *
	 * @example
	 * // don't care about which function is passed in, as long as it's a function
	 * expect(mySpy).toHaveBeenCalledWith(jasmine.any(Function));
	 *
	 * @param {Class} clazz
	 * @returns matchable object of the type clazz
	 */
	_this.any = function(clazz) {
	  return new _this.Matchers.Any(clazz);
	};
	
	/**
	 * Jasmine Spies are test doubles that can act as stubs, spies, fakes or when used in an expecation, mocks.
	 *
	 * Spies should be created in test setup, before expectations.  They can then be checked, using the standard Jasmine
	 * expectation syntax. Spies can be checked if they were called or not and what the calling params were.
	 *
	 * A Spy has the following fields: wasCalled, callCount, mostRecentCall, and argsForCall (see docs).
	 *
	 * Spies are torn down at the end of every spec.
	 *
	 * Note: Do <b>not</b> call new jasmine.Spy() directly - a spy must be created using spyOn, jasmine.createSpy or jasmine.createSpyObj.
	 *
	 * @example
	 * // a stub
	 * var myStub = jasmine.createSpy('myStub');  // can be used anywhere
	 *
	 * // spy example
	 * var foo = {
	 *   not: function(bool) { return !bool; }
	 * }
	 *
	 * // actual foo.not will not be called, execution stops
	 * spyOn(foo, 'not');
	
	 // foo.not spied upon, execution will continue to implementation
	 * spyOn(foo, 'not').andCallThrough();
	 *
	 * // fake example
	 * var foo = {
	 *   not: function(bool) { return !bool; }
	 * }
	 *
	 * // foo.not(val) will return val
	 * spyOn(foo, 'not').andCallFake(function(value) {return value;});
	 *
	 * // mock example
	 * foo.not(7 == 7);
	 * expect(foo.not).toHaveBeenCalled();
	 * expect(foo.not).toHaveBeenCalledWith(true);
	 *
	 * @constructor
	 * @see spyOn, jasmine.createSpy, jasmine.createSpyObj
	 * @param {String} name
	 */
	_this.Spy = function(name) {
	  /**
	   * The name of the spy, if provided.
	   */
	  this.identity = name || 'unknown';
	  /**
	   *  Is this Object a spy?
	   */
	  this.isSpy = true;
	  /**
	   * The actual function this spy stubs.
	   */
	  this.plan = function() {
	  };
	  /**
	   * Tracking of the most recent call to the spy.
	   * @example
	   * var mySpy = jasmine.createSpy('foo');
	   * mySpy(1, 2);
	   * mySpy.mostRecentCall.args = [1, 2];
	   */
	  this.mostRecentCall = {};
	
	  /**
	   * Holds arguments for each call to the spy, indexed by call count
	   * @example
	   * var mySpy = jasmine.createSpy('foo');
	   * mySpy(1, 2);
	   * mySpy(7, 8);
	   * mySpy.mostRecentCall.args = [7, 8];
	   * mySpy.argsForCall[0] = [1, 2];
	   * mySpy.argsForCall[1] = [7, 8];
	   */
	  this.argsForCall = [];
	  this.calls = [];
	};
	
	/**
	 * Tells a spy to call through to the actual implemenatation.
	 *
	 * @example
	 * var foo = {
	 *   bar: function() { // do some stuff }
	 * }
	 *
	 * // defining a spy on an existing property: foo.bar
	 * spyOn(foo, 'bar').andCallThrough();
	 */
	_this.Spy.prototype.andCallThrough = function() {
	  this.plan = this.originalValue;
	  return this;
	};
	
	/**
	 * For setting the return value of a spy.
	 *
	 * @example
	 * // defining a spy from scratch: foo() returns 'baz'
	 * var foo = jasmine.createSpy('spy on foo').andReturn('baz');
	 *
	 * // defining a spy on an existing property: foo.bar() returns 'baz'
	 * spyOn(foo, 'bar').andReturn('baz');
	 *
	 * @param {Object} value
	 */
	_this.Spy.prototype.andReturn = function(value) {
	  this.plan = function() {
	    return value;
	  };
	  return this;
	};
	
	/**
	 * For throwing an exception when a spy is called.
	 *
	 * @example
	 * // defining a spy from scratch: foo() throws an exception w/ message 'ouch'
	 * var foo = jasmine.createSpy('spy on foo').andThrow('baz');
	 *
	 * // defining a spy on an existing property: foo.bar() throws an exception w/ message 'ouch'
	 * spyOn(foo, 'bar').andThrow('baz');
	 *
	 * @param {String} exceptionMsg
	 */
	_this.Spy.prototype.andThrow = function(exceptionMsg) {
	  this.plan = function() {
	    throw exceptionMsg;
	  };
	  return this;
	};
	
	/**
	 * Calls an alternate implementation when a spy is called.
	 *
	 * @example
	 * var baz = function() {
	 *   // do some stuff, return something
	 * }
	 * // defining a spy from scratch: foo() calls the function baz
	 * var foo = jasmine.createSpy('spy on foo').andCall(baz);
	 *
	 * // defining a spy on an existing property: foo.bar() calls an anonymnous function
	 * spyOn(foo, 'bar').andCall(function() { return 'baz';} );
	 *
	 * @param {Function} fakeFunc
	 */
	_this.Spy.prototype.andCallFake = function(fakeFunc) {
	  this.plan = fakeFunc;
	  return this;
	};
	
	/**
	 * Resets all of a spy's the tracking variables so that it can be used again.
	 *
	 * @example
	 * spyOn(foo, 'bar');
	 *
	 * foo.bar();
	 *
	 * expect(foo.bar.callCount).toEqual(1);
	 *
	 * foo.bar.reset();
	 *
	 * expect(foo.bar.callCount).toEqual(0);
	 */
	_this.Spy.prototype.reset = function() {
	  this.wasCalled = false;
	  this.callCount = 0;
	  this.argsForCall = [];
	  this.calls = [];
	  this.mostRecentCall = {};
	};
	
	_this.createSpy = function(name) {
	
	  var spyObj = function() {
	    spyObj.wasCalled = true;
	    spyObj.callCount++;
	    var args = _this.util.argsToArray(arguments);
	    spyObj.mostRecentCall.object = this;
	    spyObj.mostRecentCall.args = args;
	    spyObj.argsForCall.push(args);
	    spyObj.calls.push({object: this, args: args});
	    return spyObj.plan.apply(this, arguments);
	  };
	
	  var spy = new _this.Spy(name);
	
	  for (var prop in spy) {
	    spyObj[prop] = spy[prop];
	  }
	
	  spyObj.reset();
	
	  return spyObj;
	};
	
	/**
	 * Determines whether an object is a spy.
	 *
	 * @param {jasmine.Spy|Object} putativeSpy
	 * @returns {Boolean}
	 */
	_this.isSpy = function(putativeSpy) {
	  return putativeSpy && putativeSpy.isSpy;
	};
	
	/**
	 * Creates a more complicated spy: an Object that has every property a function that is a spy.  Used for stubbing something
	 * large in one call.
	 *
	 * @param {String} baseName name of spy class
	 * @param {Array} methodNames array of names of methods to make spies
	 */
	_this.createSpyObj = function(baseName, methodNames) {
	  if (!_this.isArray_(methodNames) || methodNames.length == 0) {
	    throw new Error('createSpyObj requires a non-empty array of method names to create spies for');
	  }
	  var obj = {};
	  for (var i = 0; i < methodNames.length; i++) {
	    obj[methodNames[i]] = _this.createSpy(baseName + '.' + methodNames[i]);
	  }
	  return obj;
	};
	
	/**
	 * All parameters are pretty-printed and concatenated together, then written to the current spec's output.
	 *
	 * Be careful not to leave calls to <code>jasmine.log</code> in production code.
	 */
	_this.log = function() {
	  var spec = _this.getEnv().currentSpec;
	  spec.log.apply(spec, arguments);
	};
	
	/**
	 * Function that installs a spy on an existing object's method name.  Used within a Spec to create a spy.
	 *
	 * @example
	 * // spy example
	 * var foo = {
	 *   not: function(bool) { return !bool; }
	 * }
	 * spyOn(foo, 'not'); // actual foo.not will not be called, execution stops
	 *
	 * @see jasmine.createSpy
	 * @param obj
	 * @param methodName
	 * @returns a Jasmine spy that can be chained with all spy methods
	 */
	_this.spyOn = function(obj, methodName) {
	  return _this.getEnv().currentSpec.spyOn(obj, methodName);
	};
	
	/**
	 * Creates a Jasmine spec that will be added to the current suite.
	 *
	 * // TODO: pending tests
	 *
	 * @example
	 * it('should be true', function() {
	 *   expect(true).toEqual(true);
	 * });
	 *
	 * @param {String} desc description of this specification
	 * @param {Function} func defines the preconditions and expectations of the spec
	 */
	_this.it = function(desc, func) {
	  return _this.getEnv().it(desc, func);
	};
	
	/**
	 * Creates a <em>disabled</em> Jasmine spec.
	 *
	 * A convenience method that allows existing specs to be disabled temporarily during development.
	 *
	 * @param {String} desc description of this specification
	 * @param {Function} func defines the preconditions and expectations of the spec
	 */
	_this.xit = function(desc, func) {
	  return _this.getEnv().xit(desc, func);
	};
	
	/**
	 * Starts a chain for a Jasmine expectation.
	 *
	 * It is passed an Object that is the actual value and should chain to one of the many
	 * _this.Matchers functions.
	 *
	 * @param {Object} actual Actual value to test against and expected value
	 */
	_this.expect = function(actual) {
	  return _this.getEnv().currentSpec.expect(actual);
	};
	
	/**
	 * Defines part of a jasmine spec.  Used in cominbination with waits or waitsFor in asynchrnous specs.
	 *
	 * @param {Function} func Function that defines part of a jasmine spec.
	 */
	_this.runs = function(func) {
	  _this.getEnv().currentSpec.runs(func);
	};
	
	/**
	 * Waits a fixed time period before moving to the next block.
	 *
	 * @deprecated Use waitsFor() instead
	 * @param {Number} timeout milliseconds to wait
	 */
	_this.waits = function(timeout) {
	  _this.getEnv().currentSpec.waits(timeout);
	};
	
	/**
	 * Waits for the latchFunction to return true before proceeding to the next block.
	 *
	 * @param {Function} latchFunction
	 * @param {String} optional_timeoutMessage
	 * @param {Number} optional_timeout
	 */
	_this.waitsFor = function(latchFunction, optional_timeoutMessage, optional_timeout) {
	  _this.getEnv().currentSpec.waitsFor.apply(_this.getEnv().currentSpec, arguments);
	};
	
	/**
	 * A function that is called before each spec in a suite.
	 *
	 * Used for spec setup, including validating assumptions.
	 *
	 * @param {Function} beforeEachFunction
	 */
	_this.beforeEach = function(beforeEachFunction) {
	  _this.getEnv().beforeEach(beforeEachFunction);
	};
	
	/**
	 * A function that is called after each spec in a suite.
	 *
	 * Used for restoring any state that is hijacked during spec execution.
	 *
	 * @param {Function} afterEachFunction
	 */
	_this.afterEach = function(afterEachFunction) {
	  _this.getEnv().afterEach(afterEachFunction);
	};
	
	/**
	 * Defines a suite of specifications.
	 *
	 * Stores the description and all defined specs in the Jasmine environment as one suite of specs. Variables declared
	 * are accessible by calls to beforeEach, it, and afterEach. Describe blocks can be nested, allowing for specialization
	 * of setup in some tests.
	 *
	 * @example
	 * // TODO: a simple suite
	 *
	 * // TODO: a simple suite with a nested describe block
	 *
	 * @param {String} description A string, usually the class under test.
	 * @param {Function} specDefinitions function that defines several specs.
	 */
	_this.describe = function(description, specDefinitions) {
	  return _this.getEnv().describe(description, specDefinitions);
	};
	
	/**
	 * Disables a suite of specifications.  Used to disable some suites in a file, or files, temporarily during development.
	 *
	 * @param {String} description A string, usually the class under test.
	 * @param {Function} specDefinitions function that defines several specs.
	 */
	_this.xdescribe = function(description, specDefinitions) {
	  return _this.getEnv().xdescribe(description, specDefinitions);
	};
	
	
	// Provide the XMLHttpRequest class for IE 5.x-6.x:
	_this.XmlHttpRequest = (typeof XMLHttpRequest == "undefined") ? function() {
	  try {
	    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
	  } catch(e) {
	  }
	  try {
	    return new ActiveXObject("Msxml2.XMLHTTP.3.0");
	  } catch(e) {
	  }
	  try {
	    return new ActiveXObject("Msxml2.XMLHTTP");
	  } catch(e) {
	  }
	  try {
	    return new ActiveXObject("Microsoft.XMLHTTP");
	  } catch(e) {
	  }
	  throw new Error("This browser does not support XMLHttpRequest.");
	} : XMLHttpRequest;
	
	return _this;
})();