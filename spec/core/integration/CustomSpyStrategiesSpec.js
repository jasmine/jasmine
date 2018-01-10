describe('Custom Spy Strategies (Integration)', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
    env.randomizeTests(false);
  });

  it('allows adding more strategies local to a suite', function(done) {
    var plan = jasmine.createSpy('custom strategy plan')
      .and.returnValue(42);
    var strategy = jasmine.createSpy('custom strategy')
      .and.returnValue(plan);

    env.describe('suite defining a custom spy strategy', function() {
      env.beforeEach(function() {
        env.addSpyStrategy('frobnicate', strategy);
      });

      env.it('spec in the suite', function() {
        var spy = env.createSpy('something').and.frobnicate(17);
        expect(spy(1, 2, 3)).toEqual(42);
        expect(strategy).toHaveBeenCalledWith(17);
        expect(plan).toHaveBeenCalledWith(1, 2, 3);
      });
    });

    env.it('spec without custom strategy defined', function() {
      expect(env.createSpy('something').and.frobnicate).toBeUndefined();
    });

    function jasmineDone(result) {
      expect(result.overallStatus).toEqual('passed');
      done();
    }

    env.addReporter({ jasmineDone: jasmineDone });
    env.execute();
  });

  it('allows adding more strategies local to a spec', function(done) {
    var plan = jasmine.createSpy('custom strategy plan')
      .and.returnValue(42);
    var strategy = jasmine.createSpy('custom strategy')
      .and.returnValue(plan);

    env.it('spec defining a custom spy strategy', function() {
      env.addSpyStrategy('frobnicate', strategy);
      var spy = env.createSpy('something').and.frobnicate(17);
      expect(spy(1, 2, 3)).toEqual(42);
      expect(strategy).toHaveBeenCalledWith(17);
      expect(plan).toHaveBeenCalledWith(1, 2, 3);
    });

    env.it('spec without custom strategy defined', function() {
      expect(env.createSpy('something').and.frobnicate).toBeUndefined();
    });

    function jasmineDone(result) {
      expect(result.overallStatus).toEqual('passed');
      done();
    }

    env.addReporter({ jasmineDone: jasmineDone });
    env.execute();
  });

  it('allows using custom strategies on a per-argument basis', function(done) {
    var plan = jasmine.createSpy('custom strategy plan')
      .and.returnValue(42);
    var strategy = jasmine.createSpy('custom strategy')
      .and.returnValue(plan);

    env.it('spec defining a custom spy strategy', function() {
      env.addSpyStrategy('frobnicate', strategy);
      var spy = env.createSpy('something')
        .and.returnValue('no args return')
        .withArgs(1, 2, 3).and.frobnicate(17);

      expect(spy()).toEqual('no args return');
      expect(plan).not.toHaveBeenCalled();
      expect(spy(1, 2, 3)).toEqual(42);
      expect(plan).toHaveBeenCalledWith(1, 2, 3);
    });

    env.it('spec without custom strategy defined', function() {
      expect(env.createSpy('something').and.frobnicate).toBeUndefined();
    });

    function jasmineDone(result) {
      expect(result.overallStatus).toEqual('passed');
      done();
    }

    env.addReporter({ jasmineDone: jasmineDone });
    env.execute();
  });
});
