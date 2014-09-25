getJasmineRequireObj().interface = function(jasmine, env) {
  var jasmineInterface = {
    describe: function(description, specDefinitions) {
      return env.describe(description, specDefinitions);
    },

    xdescribe: function(description, specDefinitions) {
      return env.xdescribe(description, specDefinitions);
    },

    fdescribe: function(description, specDefinitions) {
      return env.fdescribe(description, specDefinitions);
    },

    it: function(desc, func) {
      return env.it(desc, func);
    },

    xit: function(desc, func) {
      return env.xit(desc, func);
    },

    fit: function(desc, func) {
      return env.fit(desc, func);
    },

    beforeEach: function(beforeEachFunction) {
      return env.beforeEach(beforeEachFunction);
    },

    afterEach: function(afterEachFunction) {
      return env.afterEach(afterEachFunction);
    },

    beforeAll: function(beforeAllFunction) {
      return env.beforeAll(beforeAllFunction);
    },

    afterAll: function(afterAllFunction) {
      return env.afterAll(afterAllFunction);
    },

    expect: function(actual) {
      return env.expect(actual);
    },

    pending: function() {
      return env.pending();
    },

    fail: function() {
      return env.fail.apply(env, arguments);
    },

    spyOn: function(obj, methodName) {
      return env.spyOn(obj, methodName);
    },

    jsApiReporter: new jasmine.JsApiReporter({
      timer: new jasmine.Timer()
    }),

    jasmine: jasmine
  };

  jasmine.addCustomEqualityTester = function(tester) {
    env.addCustomEqualityTester(tester);
  };

  jasmine.addMatchers = function(matchers) {
    return env.addMatchers(matchers);
  };

  jasmine.clock = function() {
    return env.clock;
  };

  return jasmineInterface;
};
