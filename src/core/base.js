getJasmineRequireObj().base = function(j$) {
  j$.unimplementedMethod_ = function() {
    throw new Error("unimplemented method");
  };

  j$.DEFAULT_UPDATE_INTERVAL = 250;
  j$.MAX_PRETTY_PRINT_DEPTH = 40;
  j$.DEFAULT_TIMEOUT_INTERVAL = 5000;

  j$.getGlobal = function() {
    function getGlobal() {
      return this;
    }

    return getGlobal();
  };

  j$.getEnv = function(options) {
    var env = j$.currentEnv_ = j$.currentEnv_ || new j$.Env(options);
    //jasmine. singletons in here (setTimeout blah blah).
    return env;
  };

  j$.isArray_ = function(value) {
    return j$.isA_("Array", value);
  };

  j$.isString_ = function(value) {
    return j$.isA_("String", value);
  };

  j$.isNumber_ = function(value) {
    return j$.isA_("Number", value);
  };

  j$.isA_ = function(typeName, value) {
    return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
  };

  j$.pp = function(value) {
    var stringPrettyPrinter = new j$.StringPrettyPrinter();
    stringPrettyPrinter.format(value);
    return stringPrettyPrinter.string;
  };

  j$.isDomNode = function(obj) {
    return obj.nodeType > 0;
  };

  j$.any = function(clazz) {
    return new j$.Matchers.Any(clazz);
  };

  j$.objectContaining = function(sample) {
    return new j$.Matchers.ObjectContaining(sample);
  };

  j$.Spy = function(name) {
    this.identity = name || 'unknown';
    this.isSpy = true;
    this.plan = function() {
    };
    this.mostRecentCall = {};

    this.argsForCall = [];
    this.calls = [];
  };

  j$.Spy.prototype.andCallThrough = function() {
    this.plan = this.originalValue;
    return this;
  };

  j$.Spy.prototype.andReturn = function(value) {
    this.plan = function() {
      return value;
    };
    return this;
  };

  j$.Spy.prototype.andThrow = function(exceptionMsg) {
    this.plan = function() {
      throw exceptionMsg;
    };
    return this;
  };

  j$.Spy.prototype.andCallFake = function(fakeFunc) {
    this.plan = fakeFunc;
    return this;
  };

  j$.Spy.prototype.reset = function() {
    this.wasCalled = false;
    this.callCount = 0;
    this.argsForCall = [];
    this.calls = [];
    this.mostRecentCall = {};
  };

  j$.createSpy = function(name) {

    var spyObj = function() {
      spyObj.wasCalled = true;
      spyObj.callCount++;
      var args = j$.util.argsToArray(arguments);
      spyObj.mostRecentCall.object = this;
      spyObj.mostRecentCall.args = args;
      spyObj.argsForCall.push(args);
      spyObj.calls.push({object: this, args: args});
      return spyObj.plan.apply(this, arguments);
    };

    var spy = new j$.Spy(name);

    for (var prop in spy) {
      spyObj[prop] = spy[prop];
    }

    spyObj.reset();

    return spyObj;
  };

  j$.isSpy = function(putativeSpy) {
    return putativeSpy && putativeSpy.isSpy;
  };

  j$.createSpyObj = function(baseName, methodNames) {
    if (!j$.isArray_(methodNames) || methodNames.length === 0) {
      throw new Error('createSpyObj requires a non-empty array of method names to create spies for');
    }
    var obj = {};
    for (var i = 0; i < methodNames.length; i++) {
      obj[methodNames[i]] = j$.createSpy(baseName + '.' + methodNames[i]);
    }
    return obj;
  };
};
