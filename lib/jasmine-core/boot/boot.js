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
      return env.expect(actual);
    },

    addMatchers: function(matchers) {
      return env.addMatchers(matchers);
    },

    spyOn: function(obj, methodName) {
      return env.spyOn(obj, methodName);
    },

    clock: function() {
      return env.clock;
    },

    jsApiReporter: new jasmine.JsApiReporter(jasmine)
  };

  if (typeof window == "undefined" && typeof exports == "object") {
    jasmine.util.extend(exports, jasmineInterface);
  } else {
    jasmine.util.extend(window, jasmineInterface);
  }

  var htmlReporter = new jasmine.HtmlReporter(null, jasmine);

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
