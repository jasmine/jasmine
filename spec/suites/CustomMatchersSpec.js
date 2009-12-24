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
        this.addMatchers({ matcherForSuite: function(expected) {
          return "matcherForSuite: actual: " + this.actual + "; expected: " + expected;
        } });
      });

      spec1 = env.it('spec with an expectation').runs(function () {
        this.addMatchers({ matcherForSpec: function(expected) {
          return "matcherForSpec: actual: " + this.actual + "; expected: " + expected;
        } });
        spec1Matcher = this.expect("xxx");
      });

      spec2 = env.it('spec with failing expectation').runs(function () {
        spec2Matcher = this.expect("yyy");
      });
    });

    suite.execute();

    expect(spec1Matcher.matcherForSuite("expected")).toEqual("matcherForSuite: actual: xxx; expected: expected");
    expect(spec1Matcher.matcherForSpec("expected")).toEqual("matcherForSpec: actual: xxx; expected: expected");

    expect(spec2Matcher.matcherForSuite("expected")).toEqual("matcherForSuite: actual: yyy; expected: expected");
    expect(spec2Matcher.matcherForSpec).toBe(jasmine.undefined);
  });
  
});