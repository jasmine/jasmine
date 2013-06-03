getJasmineRequireObj().Spy = function(j$) {

  function Spy(name) {
    this.identity = name || 'unknown';
    this.isSpy = true;
    this.plan = function() {
    };
    this.mostRecentCall = {};

    this.argsForCall = [];
    this.calls = [];
  }

  Spy.prototype.andCallThrough = function() {
    this.plan = this.originalValue;
    return this;
  };

  Spy.prototype.andReturn = function(value) {
    this.plan = function() {
      return value;
    };
    return this;
  };

  Spy.prototype.andThrow = function(exceptionMsg) {
    this.plan = function() {
      throw exceptionMsg;
    };
    return this;
  };

  Spy.prototype.andCallFake = function(fakeFunc) {
    this.plan = fakeFunc;
    return this;
  };

  Spy.prototype.reset = function() {
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

    var spy = new Spy(name);

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
      throw "createSpyObj requires a non-empty array of method names to create spies for";
    }
    var obj = {};
    for (var i = 0; i < methodNames.length; i++) {
      obj[methodNames[i]] = j$.createSpy(baseName + '.' + methodNames[i]);
    }
    return obj;
  };

  return Spy;
};
