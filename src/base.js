/*
 * Jasmine internal classes & objects
 */

/** @namespace */
var jasmine = {};

jasmine.unimplementedMethod_ = function() {
  throw new Error("unimplemented method");
};

jasmine.bindOriginal_ = function(base, name) {
  var original = base[name];
  return function() {
    return original.apply(base, arguments);
  };
};

jasmine.setTimeout = jasmine.bindOriginal_(window, 'setTimeout');
jasmine.clearTimeout = jasmine.bindOriginal_(window, 'clearTimeout');
jasmine.setInterval = jasmine.bindOriginal_(window, 'setInterval');
jasmine.clearInterval = jasmine.bindOriginal_(window, 'clearInterval');

jasmine.MessageResult = function(text) {
  this.type = 'MessageResult';
  this.text = text;
  this.trace = new Error(); // todo: test better
};

jasmine.ExpectationResult = function(passed, message, details) {
  this.type = 'ExpectationResult';
  this.passed = passed;
  this.message = message;
  this.details = details;
  this.trace = new Error(message); // todo: test better
};

jasmine.getEnv = function() {
  return jasmine.currentEnv_ = jasmine.currentEnv_ || new jasmine.Env();
};

jasmine.isArray_ = function(value) {
  return value &&
         typeof value === 'object' &&
         typeof value.length === 'number' &&
         typeof value.splice === 'function' &&
         !(value.propertyIsEnumerable('length'));
};

jasmine.pp = function(value) {
  var stringPrettyPrinter = new jasmine.StringPrettyPrinter();
  stringPrettyPrinter.format(value);
  return stringPrettyPrinter.string;
};

jasmine.isDomNode = function(obj) {
  return obj['nodeType'] > 0;
};

jasmine.any = function(clazz) {
  return new jasmine.Matchers.Any(clazz);
};

jasmine.createSpy = function(name) {
  var spyObj = function() {
    spyObj.wasCalled = true;
    spyObj.callCount++;
    var args = jasmine.util.argsToArray(arguments);
    spyObj.mostRecentCall = {
      object: this,
      args: args
    };
    spyObj.argsForCall.push(args);
    return spyObj.plan.apply(this, arguments);
  };

  spyObj.identity = name || 'unknown';
  spyObj.isSpy = true;

  spyObj.plan = function() {
  };

  spyObj.andCallThrough = function() {
    spyObj.plan = spyObj.originalValue;
    return spyObj;
  };
  spyObj.andReturn = function(value) {
    spyObj.plan = function() {
      return value;
    };
    return spyObj;
  };
  spyObj.andThrow = function(exceptionMsg) {
    spyObj.plan = function() {
      throw exceptionMsg;
    };
    return spyObj;
  };
  spyObj.andCallFake = function(fakeFunc) {
    spyObj.plan = fakeFunc;
    return spyObj;
  };
  spyObj.reset = function() {
    spyObj.wasCalled = false;
    spyObj.callCount = 0;
    spyObj.argsForCall = [];
    spyObj.mostRecentCall = {};
  };
  spyObj.reset();

  return spyObj;
};

jasmine.createSpyObj = function(baseName, methodNames) {
  var obj = {};
  for (var i = 0; i < methodNames.length; i++) {
    obj[methodNames[i]] = jasmine.createSpy(baseName + '.' + methodNames[i]);
  }
  return obj;
};

jasmine.log = function(message) {
  jasmine.getEnv().currentSpec.getResults().log(message);
};

var spyOn = function(obj, methodName) {
  return jasmine.getEnv().currentSpec.spyOn(obj, methodName);
};

var it = function(desc, func) {
  return jasmine.getEnv().it(desc, func);
};

var xit = function(desc, func) {
  return jasmine.getEnv().xit(desc, func);
};

var expect = function(actual) {
  return jasmine.getEnv().currentSpec.expect(actual);
};

var runs = function(func) {
  jasmine.getEnv().currentSpec.runs(func);
};

var waits = function(timeout) {
  jasmine.getEnv().currentSpec.waits(timeout);
};

var waitsFor = function(timeout, latchFunction, message) {
  jasmine.getEnv().currentSpec.waitsFor(timeout, latchFunction, message);
};

var beforeEach = function(beforeEachFunction) {
  jasmine.getEnv().beforeEach(beforeEachFunction);
};

var afterEach = function(afterEachFunction) {
  jasmine.getEnv().afterEach(afterEachFunction);
};

var describe = function(description, specDefinitions) {
  return jasmine.getEnv().describe(description, specDefinitions);
};

var xdescribe = function(description, specDefinitions) {
  return jasmine.getEnv().xdescribe(description, specDefinitions);
};

jasmine.XmlHttpRequest = XMLHttpRequest;

// Provide the XMLHttpRequest class for IE 5.x-6.x:
if (typeof XMLHttpRequest == "undefined") jasmine.XmlHttpRequest = function() {
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
};

jasmine.include = function(url, opt_global) {
  if (opt_global) {
    document.write('<script type="text/javascript" src="' + url + '"></' + 'script>');
  } else {
    var xhr;
    try {
      xhr = new jasmine.XmlHttpRequest();
      xhr.open("GET", url, false);
      xhr.send(null);
    } catch(e) {
      throw new Error("couldn't fetch " + url + ": " + e);
    }

    return eval(xhr.responseText);
  }
};