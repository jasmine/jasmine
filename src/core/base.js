var jasmine = {};

// TODO: do we need this now that we have boot.js?
if (typeof window == "undefined" && typeof exports == "object") {
  exports.jasmine = jasmine;
}

jasmine.unimplementedMethod_ = function() {
  throw new Error("unimplemented method");
};

jasmine.DEFAULT_UPDATE_INTERVAL = 250;
jasmine.MAX_PRETTY_PRINT_DEPTH = 40;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

jasmine.getGlobal = function() {
  function getGlobal() {
    return this;
  }

  return getGlobal();
};

jasmine.getEnv = function(options) {
  var env = jasmine.currentEnv_ = jasmine.currentEnv_ || new jasmine.Env(options);
  //jasmine. singletons in here (setTimeout blah blah).
  return env;
};

jasmine.given = function(name, block) {
  if (typeof block !== 'function') {
    throw "block required";
  }
  var env = (this instanceof jasmine.Env ? this : jasmine.getEnv());
  if (! env.currentSuite) {
    throw "invalid runtime invokation for given()";
  }

  env.currentSuite.LazyGetters.prototype.__defineGetter__(name, function() {
    var lazy = env.lazy;
    if (!lazy.values.hasOwnProperty(name)) {
      lazy.values[name] = block();
    }
    return lazy.values[name];
  });
  if (!jasmine.given.__lookupGetter__(name)) {
    jasmine.given.__defineGetter__(name, function() {
      var lazy = env.lazy;
      if (!lazy.values.hasOwnProperty(name)) {
        lazy.values[name] = lazy.context[name];
      }
      return lazy.values[name];
    });
  }
};

jasmine.isArray_ = function(value) {
  return jasmine.isA_("Array", value);
};

jasmine.isString_ = function(value) {
  return jasmine.isA_("String", value);
};

jasmine.isNumber_ = function(value) {
  return jasmine.isA_("Number", value);
};

jasmine.isA_ = function(typeName, value) {
  return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
};

jasmine.pp = function(value) {
  var stringPrettyPrinter = new jasmine.StringPrettyPrinter();
  stringPrettyPrinter.format(value);
  return stringPrettyPrinter.string;
};

jasmine.isDomNode = function(obj) {
  return obj.nodeType > 0;
};

jasmine.any = function(clazz) {
  return new jasmine.Matchers.Any(clazz);
};

jasmine.objectContaining = function (sample) {
    return new jasmine.Matchers.ObjectContaining(sample);
};

jasmine.Spy = function(name) {
  this.identity = name || 'unknown';
  this.isSpy = true;
  this.plan = function() {
  };
  this.mostRecentCall = {};

  this.argsForCall = [];
  this.calls = [];
};

jasmine.Spy.prototype.andCallThrough = function() {
  this.plan = this.originalValue;
  return this;
};

jasmine.Spy.prototype.andReturn = function(value) {
  this.plan = function() {
    return value;
  };
  return this;
};

jasmine.Spy.prototype.andThrow = function(exceptionMsg) {
  this.plan = function() {
    throw exceptionMsg;
  };
  return this;
};

jasmine.Spy.prototype.andCallFake = function(fakeFunc) {
  this.plan = fakeFunc;
  return this;
};

jasmine.Spy.prototype.reset = function() {
  this.wasCalled = false;
  this.callCount = 0;
  this.argsForCall = [];
  this.calls = [];
  this.mostRecentCall = {};
};

jasmine.createSpy = function(name) {

  var spyObj = function() {
    spyObj.wasCalled = true;
    spyObj.callCount++;
    var args = jasmine.util.argsToArray(arguments);
    spyObj.mostRecentCall.object = this;
    spyObj.mostRecentCall.args = args;
    spyObj.argsForCall.push(args);
    spyObj.calls.push({object: this, args: args});
    return spyObj.plan.apply(this, arguments);
  };

  var spy = new jasmine.Spy(name);

  for (var prop in spy) {
    spyObj[prop] = spy[prop];
  }

  spyObj.reset();

  return spyObj;
};

jasmine.isSpy = function(putativeSpy) {
  return putativeSpy && putativeSpy.isSpy;
};

jasmine.createSpyObj = function(baseName, methodNames) {
  if (!jasmine.isArray_(methodNames) || methodNames.length === 0) {
    throw new Error('createSpyObj requires a non-empty array of method names to create spies for');
  }
  var obj = {};
  for (var i = 0; i < methodNames.length; i++) {
    obj[methodNames[i]] = jasmine.createSpy(baseName + '.' + methodNames[i]);
  }
  return obj;
};
