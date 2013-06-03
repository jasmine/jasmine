describe("MatchersSpec - HTML Dependent", function () {
  var env, spec;

  beforeEach(function() {
    env = new j$.Env();
    env.updateInterval = 0;

    var suite = env.describe("suite", function() {
      spec = env.it("spec", function() {
      });
    });
    spyOn(spec, 'addExpectationResult');

    addMatchers({
      toPass: function() {
        return lastResult().passed;
      },
      toFail: function() {
        return !lastResult().passed;
      }
    });
  });

  function match(value) {
    return spec.expect(value);
  }

  function lastResult() {
    return spec.addExpectationResult.mostRecentCall.args[1];
  }

  xit("toEqual with DOM nodes", function() {
    var nodeA = document.createElement('div');
    var nodeB = document.createElement('div');
    expect((match(nodeA).toEqual(nodeA))).toPass();
    expect((match(nodeA).toEqual(nodeB))).toFail();
  });
});
