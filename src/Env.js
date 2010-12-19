jasmine.Env = (function(){ 
	var _this = this /* @private scoped reference to "this".  (Avoids confusion/mistakes when scope of "this" changes due to events, apply, call, etc. */
		, _undefined_  = jasmine.___undefined___ /* @private scoped reference to "undefined" */
	;

	/**
	 * Environment for Jasmine
	 *
	 * @constructor
	 */
	function _Env() {
	  this.currentSpec = null;
	  this.currentSuite = null;
	  this.currentRunner_ = new jasmine.Runner(this);
	
	  this.reporter = new jasmine.MultiReporter();
	
	  this.updateInterval = jasmine.DEFAULT_UPDATE_INTERVAL;
	  this.defaultTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
	  this.lastUpdate = 0;
	  this.specFilter = function() {
	    return true;
	  };
	
	  this.nextSpecId_ = 0;
	  this.nextSuiteId_ = 0;
	  this.equalityTesters_ = [];
	
	  // wrap matchers
	  this.matchersClass = function() {
	    jasmine.Matchers.apply(this, arguments);
	  };
	  jasmine.util.inherit(this.matchersClass, jasmine.Matchers);
	
	  jasmine.Matchers.wrapInto_(jasmine.Matchers.prototype, this.matchersClass);
	};
	
	
	_Env.prototype.setTimeout = jasmine.setTimeout;
	_Env.prototype.clearTimeout = jasmine.clearTimeout;
	_Env.prototype.setInterval = jasmine.setInterval;
	_Env.prototype.clearInterval = jasmine.clearInterval;
	
	/**
	 * @returns an object containing jasmine version build info, if set.
	 */
	_Env.prototype.version = function () {
	  if (jasmine.version_) {
	    return jasmine.version_;
	  } else {
	    throw new Error('Version not set');
	  }
	};
	
	/**
	 * @returns string containing jasmine version build info, if set.
	 */
	_Env.prototype.versionString = function() {
	  if (jasmine.version_) {
	    var version = this.version();
	    return version.major + "." + version.minor + "." + version.build + " revision " + version.revision;
	  } else {
	    return "version unknown";
	  }
	};
	
	/**
	 * @returns a sequential integer starting at 0
	 */
	_Env.prototype.nextSpecId = function () {
	  return this.nextSpecId_++;
	};
	
	/**
	 * @returns a sequential integer starting at 0
	 */
	_Env.prototype.nextSuiteId = function () {
	  return this.nextSuiteId_++;
	};
	
	/**
	 * Register a reporter to receive status updates from Jasmine.
	 * @param {jasmine.Reporter} reporter An object which will receive status updates.
	 */
	_Env.prototype.addReporter = function(reporter) {
	  this.reporter.addReporter(reporter);
	};
	
	_Env.prototype.execute = function() {
	  this.currentRunner_.execute();
	};
	
	_Env.prototype.describe = function(description, specDefinitions) {
	  var suite = new jasmine.Suite(this, description, specDefinitions, this.currentSuite);
	
	  var parentSuite = this.currentSuite;
	  if (parentSuite) {
	    parentSuite.add(suite);
	  } else {
	    this.currentRunner_.add(suite);
	  }
	
	  this.currentSuite = suite;
	
	  var declarationError = null;
	  try {
	    specDefinitions.call(suite);
	  } catch(e) {
	    declarationError = e;
	  }
	
	  this.currentSuite = parentSuite;
	
	  if (declarationError) {
	    this.it("encountered a declaration exception", function() {
	      throw declarationError;
	    });
	  }
	
	  return suite;
	};
	
	_Env.prototype.beforeEach = function(beforeEachFunction) {
	  if (this.currentSuite) {
	    this.currentSuite.beforeEach(beforeEachFunction);
	  } else {
	    this.currentRunner_.beforeEach(beforeEachFunction);
	  }
	};
	
	_Env.prototype.currentRunner = function () {
	  return this.currentRunner_;
	};
	
	_Env.prototype.afterEach = function(afterEachFunction) {
	  if (this.currentSuite) {
	    this.currentSuite.afterEach(afterEachFunction);
	  } else {
	    this.currentRunner_.afterEach(afterEachFunction);
	  }
	
	};
	
	_Env.prototype.xdescribe = function(desc, specDefinitions) {
	  return {
	    execute: function() {
	    }
	  };
	};
	
	_Env.prototype.it = function(description, func) {
	  var spec = new jasmine.Spec(this, this.currentSuite, description);
	  this.currentSuite.add(spec);
	  this.currentSpec = spec;
	
	  if (func) {
	    spec.runs(func);
	  }
	
	  return spec;
	};
	
	_Env.prototype.xit = function(desc, func) {
	  return {
	    id: this.nextSpecId(),
	    runs: function() {
	    }
	  };
	};
	
	_Env.prototype.compareObjects_ = function(a, b, mismatchKeys, mismatchValues) {
	  if (a.__Jasmine_been_here_before__ === b && b.__Jasmine_been_here_before__ === a) {
	    return true;
	  }
	
	  a.__Jasmine_been_here_before__ = b;
	  b.__Jasmine_been_here_before__ = a;
	
	  var hasKey = function(obj, keyName) {
	    return obj != null && obj[keyName] !== _undefined_ ;
	  };
	
	  for (var property in b) {
	    if (!hasKey(a, property) && hasKey(b, property)) {
	      mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
	    }
	  }
	  for (property in a) {
	    if (!hasKey(b, property) && hasKey(a, property)) {
	      mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
	    }
	  }
	  for (property in b) {
	    if (property == '__Jasmine_been_here_before__') continue;
	    if (!this.equals_(a[property], b[property], mismatchKeys, mismatchValues)) {
	      mismatchValues.push("'" + property + "' was '" + (b[property] ? jasmine.util.htmlEscape(b[property].toString()) : b[property]) + "' in expected, but was '" + (a[property] ? jasmine.util.htmlEscape(a[property].toString()) : a[property]) + "' in actual.");
	    }
	  }
	
	  if (jasmine.isArray_(a) && jasmine.isArray_(b) && a.length != b.length) {
	    mismatchValues.push("arrays were not the same length");
	  }
	
	  delete a.__Jasmine_been_here_before__;
	  delete b.__Jasmine_been_here_before__;
	  return (mismatchKeys.length == 0 && mismatchValues.length == 0);
	};
	
	_Env.prototype.equals_ = function(a, b, mismatchKeys, mismatchValues) {
	  mismatchKeys = mismatchKeys || [];
	  mismatchValues = mismatchValues || [];
	
	  for (var i = 0; i < this.equalityTesters_.length; i++) {
	    var equalityTester = this.equalityTesters_[i];
	    var result = equalityTester(a, b, this, mismatchKeys, mismatchValues);
	    if (result !== _undefined_ ) return result;
	  }
	
	  if (a === b) return true;
	
	  if (a === _undefined_  || a === null || b === _undefined_  || b === null) {
	    return (a == _undefined_  && b == _undefined_ );
	  }
	
	  if (jasmine.isDomNode(a) && jasmine.isDomNode(b)) {
	    return a === b;
	  }
	
	  if (a instanceof Date && b instanceof Date) {
	    return a.getTime() == b.getTime();
	  }
	
	  if (a instanceof jasmine.Matchers.Any) {
	    return a.matches(b);
	  }
	
	  if (b instanceof jasmine.Matchers.Any) {
	    return b.matches(a);
	  }
	
	  if (jasmine.isString_(a) && jasmine.isString_(b)) {
	    return (a == b);
	  }
	
	  if (jasmine.isNumber_(a) && jasmine.isNumber_(b)) {
	    return (a == b);
	  }
	
	  if (typeof a === "object" && typeof b === "object") {
	    return this.compareObjects_(a, b, mismatchKeys, mismatchValues);
	  }
	
	  //Straight check
	  return (a === b);
	};
	
	_Env.prototype.contains_ = function(haystack, needle) {
	  if (jasmine.isArray_(haystack)) {
	    for (var i = 0; i < haystack.length; i++) {
	      if (this.equals_(haystack[i], needle)) return true;
	    }
	    return false;
	  }
	  return haystack.indexOf(needle) >= 0;
	};
	
	_Env.prototype.addEqualityTester = function(equalityTester) {
	  this.equalityTesters_.push(equalityTester);
	};
	
	return _Env;
	
})();