/**
 * Environment for Jasmine
 *
 * @constructor
 */
jasmine.Env = function() {
  this.currentSpec = null;
  this.currentSuite = null;
  this.currentRunner_ = new jasmine.Runner(this);

  this.reporter = new jasmine.MultiReporter();

  this.updateInterval = jasmine.UPDATE_INTERVAL
  this.lastUpdate = 0;
  this.specFilter = function() {
    return true;
  };

  this.nextSpecId_ = 0;
  this.nextSuiteId_ = 0;
  this.equalityTesters_ = [];
};


jasmine.Env.prototype.setTimeout = jasmine.setTimeout;
jasmine.Env.prototype.clearTimeout = jasmine.clearTimeout;
jasmine.Env.prototype.setInterval = jasmine.setInterval;
jasmine.Env.prototype.clearInterval = jasmine.clearInterval;

/**
 * @returns an object containing jasmine version build info, if set.
 */
jasmine.Env.prototype.version = function () {
  if (jasmine.version_) {
    return jasmine.version_;
  } else {
    throw new Error('Version not set');
  }
};

/**
 * @returns a sequential integer starting at 0
 */
jasmine.Env.prototype.nextSpecId = function () {
  return this.nextSpecId_++;
};

/**
 * @returns a sequential integer starting at 0
 */
jasmine.Env.prototype.nextSuiteId = function () {
  return this.nextSuiteId_++;
};

/**
 * Register a reporter to receive status updates from Jasmine.
 * @param {jasmine.Reporter} reporter An object which will receive status updates.
 */
jasmine.Env.prototype.addReporter = function(reporter) {
  this.reporter.addReporter(reporter);
};

jasmine.Env.prototype.execute = function() {
  this.currentRunner_.execute();
};

jasmine.Env.prototype.describe = function(description, specDefinitions) {
  var suite = new jasmine.Suite(this, description, specDefinitions, this.currentSuite);

  var parentSuite = this.currentSuite;
  if (parentSuite) {
    parentSuite.add(suite);
  } else {
    this.currentRunner_.add(suite);
  }

  this.currentSuite = suite;

  specDefinitions.call(suite);

  this.currentSuite = parentSuite;

  return suite;
};

jasmine.Env.prototype.beforeEach = function(beforeEachFunction) {
  if (this.currentSuite) {
    this.currentSuite.beforeEach(beforeEachFunction);
  } else {
    this.currentRunner_.beforeEach(beforeEachFunction);
  }
};

jasmine.Env.prototype.currentRunner = function () {
  return this.currentRunner_;
};

jasmine.Env.prototype.afterEach = function(afterEachFunction) {
  if (this.currentSuite) {
    this.currentSuite.afterEach(afterEachFunction);
  } else {
    this.currentRunner_.afterEach(afterEachFunction);
  }

};

jasmine.Env.prototype.xdescribe = function(desc, specDefinitions) {
  return {
    execute: function() {
    }
  };
};

jasmine.Env.prototype.it = function(description, func) {
  var spec = new jasmine.Spec(this, this.currentSuite, description);
  this.currentSuite.add(spec);
  this.currentSpec = spec;

  if (func) {
    spec.runs(func);
  }

  return spec;
};

jasmine.Env.prototype.xit = function(desc, func) {
  return {
    id: this.nextSpecId(),
    runs: function() {
    }
  };
};

jasmine.Env.prototype.compareObjects_ = function(a, b, mismatchKeys, mismatchValues) {
  if (a.__Jasmine_been_here_before__ === b && b.__Jasmine_been_here_before__ === a) {
    return true;
  }

  a.__Jasmine_been_here_before__ = b;
  b.__Jasmine_been_here_before__ = a;

  var hasKey = function(obj, keyName) {
    return obj != null && obj[keyName] !== undefined;
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

jasmine.Env.prototype.equals_ = function(a, b, mismatchKeys, mismatchValues) {
  mismatchKeys = mismatchKeys || [];
  mismatchValues = mismatchValues || [];

  if (a === b) return true;

  if (a === undefined || a === null || b === undefined || b === null) {
    return (a == undefined && b == undefined);
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

  if (typeof a === "object" && typeof b === "object") {
    return this.compareObjects_(a, b, mismatchKeys, mismatchValues);
  }

  for (var i = 0; i < this.equalityTesters_.length; i++) {
    var equalityTester = this.equalityTesters_[i];
    var result = equalityTester(a, b, this, mismatchKeys, mismatchValues);
    if (result !== undefined) return result;
  }

  //Straight check
  return (a === b);
};

jasmine.Env.prototype.contains_ = function(haystack, needle) {
  if (jasmine.isArray_(haystack)) {
    for (var i = 0; i < haystack.length; i++) {
      if (this.equals_(haystack[i], needle)) return true;
    }
    return false;
  }
  return haystack.indexOf(needle) >= 0;
};

jasmine.Env.prototype.addEqualityTester = function(equalityTester) {
  this.equalityTesters_.push(equalityTester);
};
