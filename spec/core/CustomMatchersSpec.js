describe("Custom Matchers (Integration)", function() {
  var env;
  var fakeTimer;

  beforeEach(function() {
    env = new j$.Env();
  });

  it("allows adding more matchers local to a spec", function(done) {
    env.it('spec defining a custom matcher', function() {
      env.addMatchers({
        matcherForSpec: function() {
          return {
            compare: function(actual, expected) {
              return { pass: false, message: "matcherForSpec: actual: " + actual + "; expected: " + expected };
            }
          }
        }
      });

      env.expect("zzz").matcherForSpec("yyy");
    });

    env.it("spec without custom matcher defined", function() {
      expect(env.expect("zzz").matcherForSpec).toBeUndefined();
    });

    var specDoneSpy = jasmine.createSpy("specDoneSpy");
    var expectations = function() {
      var firstSpecResult = specDoneSpy.calls.first().args[0];
      expect(firstSpecResult.status).toEqual("failed");
      expect(firstSpecResult.failedExpectations[0].message).toEqual("matcherForSpec: actual: zzz; expected: yyy");
      done();
    };
    env.addReporter({ specDone:specDoneSpy, jasmineDone: expectations});

    env.execute();
  });

  it("passes the spec if the custom matcher passes", function(done) {
    env.addMatchers({
      toBeReal: function() {
        return { compare: function() { return { pass: true }; } };
      }
    });

    env.it("spec using custom matcher", function() {
      env.expect(true).toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    };

    env.addReporter({ specDone: specExpectations, jasmineDone: done });
    env.execute();
  });

  it("uses the negative compare function for a negative comparison, if provided", function(done) {
    env.addMatchers({
      toBeReal: function() {
        return {
          compare: function() { return { pass: true }; },
          negativeCompare: function() { return { pass: true }; }
        };
      }
    });

    env.it("spec with custom negative comparison matcher", function() {
      env.expect(true).not.toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    }

    env.addReporter({ specDone: specExpectations, jasmineDone: done });
    env.execute();
  });

  it("generates messages with the same rules as built in matchers absent a custom message", function(done) {
    env.addMatchers({
      toBeReal: function() {
        return {
          compare: function() {
            return { pass: false };
          }
        }
      }
    });

    env.it('spec with an expectation', function() {
      env.expect("a").toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.failedExpectations[0].message).toEqual("Expected 'a' to be real.");
    };

    env.addReporter({ specDone: specExpectations, jasmineDone: done });
    env.execute();
  });

  it("passes the expected and actual arguments to the comparison function", function(done) {
    var argumentSpy = jasmine.createSpy("argument spy").and.returnValue({ pass: true });
    env.addMatchers({
      toBeReal: function() {
        return { compare: argumentSpy };
      }
    });

    env.it('spec with an expectation', function () {
      env.expect(true).toBeReal();
      env.expect(true).toBeReal("arg");
      env.expect(true).toBeReal("arg1", "arg2");
    });

    var specExpectations = function() {
      expect(argumentSpy).toHaveBeenCalledWith(true);
      expect(argumentSpy).toHaveBeenCalledWith(true, "arg");
      expect(argumentSpy).toHaveBeenCalledWith(true, "arg1", "arg2");
    };

    env.addReporter({ specDone: specExpectations, jasmineDone: done });
    env.execute();
  });

  it("passes the jasmine utility and current equality matchers to the expectation factory", function(done) {
    var matcherFactory = function() { return { compare: function() { return {pass: true}; }}; },
        argumentSpy = jasmine.createSpy("argument spy").and.returnValue(matcherFactory),
        customEqualityFn = function() { return true; };

    env.addCustomEqualityTester(customEqualityFn);
    env.addMatchers({
      toBeReal: argumentSpy
    });

    env.it("spec with expectation", function() {
      env.expect(true).toBeReal();
    });

    var specExpectations = function() {
      expect(argumentSpy).toHaveBeenCalledWith(j$.matchersUtil, [customEqualityFn]);
    };

    env.addReporter({ specDone: specExpectations, jasmineDone: done });
    env.execute();
  });
});
