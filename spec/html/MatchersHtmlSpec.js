describe("MatchersSpec - HTML Dependent", function () {
  var env, spec;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;

    var suite = env.describe("suite", function() {
      spec = env.it("spec", function() {
      });
    });
    spyOn(spec, 'addMatcherResult');

    this.addMatchers({
      toPass: function() {
        return lastResult().passed();
      },
      toFail: function() {
        return !lastResult().passed();
      }
    });
  });

  function match(value) {
    return spec.expect(value);
  }

  function lastResult() {
    return spec.addMatcherResult.mostRecentCall.args[0];
  }

  it("toEqual with DOM nodes", function() {
    var nodeA = document.createElement('div');
    var nodeB = document.createElement('div');
    expect((match(nodeA).toEqual(nodeA))).toPass();
    expect((match(nodeA).toEqual(nodeB))).toFail();
  });
});