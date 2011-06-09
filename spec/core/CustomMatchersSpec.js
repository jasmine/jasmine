describe("Custom Matchers", function() {
  var env;
  var fakeTimer;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
  });

  it("should be easy to add more matchers local to a spec, suite, etc.", function() {
    var spec1, spec2, spec1Matcher, spec2Matcher;
    var suite = env.describe('some suite', function() {
      env.beforeEach(function() {
        this.addMatchers({
          matcherForSuite: function(expected) {
            this.message = "matcherForSuite: actual: " + this.actual + "; expected: " + expected;
            return true;
          }
        });
      });

      spec1 = env.it('spec with an expectation').runs(function () {
        this.addMatchers({
          matcherForSpec: function(expected) {
            this.message = "matcherForSpec: actual: " + this.actual + "; expected: " + expected;
            return true;
          }
        });
        spec1Matcher = this.expect("xxx");
      });

      spec2 = env.it('spec with failing expectation').runs(function () {
        spec2Matcher = this.expect("yyy");
      });
    });

    suite.execute();

    spec1Matcher.matcherForSuite("expected");
    expect(spec1Matcher.message).toEqual("matcherForSuite: actual: xxx; expected: expected");
    spec1Matcher.matcherForSpec("expected");
    expect(spec1Matcher.message).toEqual("matcherForSpec: actual: xxx; expected: expected");

    spec2Matcher.matcherForSuite("expected");
    expect(spec2Matcher.message).toEqual("matcherForSuite: actual: yyy; expected: expected");
    expect(spec2Matcher.matcherForSpec).toBe(jasmine.undefined);
  });

  it("should generate messages with the same rules as for regular matchers when this.report() is not called", function() {
    var spec;
    var suite = env.describe('some suite', function() {
      spec = env.it('spec with an expectation').runs(function () {
        this.addMatchers({
          toBeTrue: function() {
            return this.actual === true;
          }
        });
        this.expect(true).toBeTrue();
        this.expect(false).toBeTrue();
      });
    });

    suite.execute();
    var passResult = new jasmine.ExpectationResult({passed: true, matcherName: 'toBeTrue',
      actual: true, expected: jasmine.undefined, message: "Passed." });
    var failResult = new jasmine.ExpectationResult({passed: false, matcherName: 'toBeTrue',
      actual: false, expected: jasmine.undefined, message: "Expected false to be true." });
    failResult.trace = jasmine.any(Object);
    expect(spec.results().getItems()).toEqual([passResult, failResult]);
  });

  it("should pass args", function() {
    var matcherCallArgs = [];
    var spec;
    var suite = env.describe('some suite', function() {
      spec = env.it('spec with an expectation').runs(function () {
        this.addMatchers({
          toBeTrue: function() {
            matcherCallArgs.push(jasmine.util.argsToArray(arguments));
            return this.actual === true;
          }
        });
        this.expect(true).toBeTrue();
        this.expect(false).toBeTrue('arg');
        this.expect(true).toBeTrue('arg1', 'arg2');
      });
    });

    suite.execute();
    var results = spec.results().getItems();
    expect(results[0].expected).toEqual(jasmine.undefined);
    expect(results[1].expected).toEqual('arg');
    expect(results[2].expected).toEqual(['arg1', 'arg2']);

    expect(matcherCallArgs).toEqual([[], ['arg'], ['arg1', 'arg2']]);
  });
});