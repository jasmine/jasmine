(function() {
  var env = jasmine.getEnv();

  var jasmineInterface = {
    describe: function(description, specDefinitions) {
      return env.describe(description, specDefinitions);
    },

    xdescribe: function(description, specDefinitions) {
      return env.xdescribe(description, specDefinitions);
    },

    it: function(desc, func) {
      return env.it(desc, func);
    },

    xit: function(desc, func) {
      return env.xit(desc, func);
    },

    beforeEach: function(beforeEachFunction) {
      return env.beforeEach(beforeEachFunction);
    },

    afterEach: function(afterEachFunction) {
      return env.afterEach(afterEachFunction);
    },

    expect: function(actual) {
      return env.currentSpec.expect(actual);
    },

    runs: function(func) {
      return env.currentSpec.runs(func);
    },

    waits: function(timeout) {
      return env.currentSpec.waits(timeout);
    },

    waitsFor: function(latchFunction, optional_timeoutMessage, optional_timeout) {
      return env.currentSpec.waitsFor.apply(jasmine.getEnv().currentSpec, arguments);
    },

    spyOn: function(obj, methodName) {
      return env.currentSpec.spyOn(obj, methodName);
    },
    jsApiReporter: new jasmine.JsApiReporter()
  };

  if (typeof window == "undefined" && typeof exports == "object") {
    jasmine.util.extend(exports, jasmineInterface);
  } else {
    jasmine.util.extend(window, jasmineInterface);
  }

  var htmlReporter = new jasmine.HtmlReporter();

  env.addReporter(jasmineInterface.jsApiReporter);
  env.addReporter(htmlReporter);

  env.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    env.execute();
  };

}());
