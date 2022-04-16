describe('MatchersSpec - HTML Dependent', function() {
  let env, spec;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();

    env.describe('suite', function() {
      spec = env.it('spec', function() {});
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

  afterEach(function() {
    env.cleanup_();
  });

  function match(value) {
    return spec.expect(value);
  }

  function lastResult() {
    return spec.addExpectationResult.mostRecentCall.args[1];
  }

  xit('toEqual with DOM nodes', function() {
    const nodeA = document.createElement('div');
    const nodeB = document.createElement('div');
    expect(match(nodeA).toEqual(nodeA)).toPass();
    expect(match(nodeA).toEqual(nodeB)).toFail();
  });
});
