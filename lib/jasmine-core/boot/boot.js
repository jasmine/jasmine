// Jasmine boot.js for browser runners - exposes external/global interface, builds the Jasmine environment and executes it.
(function() {
  var env = jasmine.getEnv();

  var jasmineInterface = {
    describe: function(description, specDefinitions) {
      return env.describe(description, specDefinitions);
    },

    given: env.jasmine.given,

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

    pending: function() {
      return env.pending();
    },

    addMatchers: function(matchers) {
      return env.addMatchers(matchers);
    },

    spyOn: function(obj, methodName) {
      return env.spyOn(obj, methodName);
    },

    clock: env.clock,
    setTimeout: env.clock.setTimeout,
    clearTimeout: env.clock.clearTimeout,
    setInterval: env.clock.setInterval,
    clearInterval: env.clock.clearInterval,

    jsApiReporter: new jasmine.JsApiReporter(jasmine)
  };

  if (typeof window == "undefined" && typeof exports == "object") {
    extend(exports, jasmineInterface);
  } else {
    extend(window, jasmineInterface);
  }

  var queryString = new jasmine.QueryString({
    getWindowLocation: function() { return window.location; }
  });

  // TODO: move all of catching to raise so we don't break our brains
  var catchingExceptions = queryString.getParam("catch");
  env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

  var htmlReporter = new jasmine.HtmlReporter({
    env: env,
    queryString: queryString,
    onRaiseExceptionsClick: function() { queryString.setParam("catch", !env.catchingExceptions()); },
    getContainer: function() { return document.body; },
    createElement: function() { return document.createElement.apply(document, arguments); },
    createTextNode: function() { return document.createTextNode.apply(document, arguments); }
  });

  env.addReporter(jasmineInterface.jsApiReporter);
  env.addReporter(htmlReporter);

  var specFilter = new jasmine.HtmlSpecFilter({
    filterString: function() { return queryString.getParam("spec"); }
  });

  env.specFilter = function(spec) {
    return specFilter.matches(spec.getFullName());
  };

  var currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    htmlReporter.initialize();
    env.execute();
  };

  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

}());
