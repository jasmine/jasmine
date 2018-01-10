describe('Custom Spy Strategies (Integration)', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
    env.randomizeTests(false);
  });

  it('allows adding more strategies local to a suite', function(done) {
    var strategyInstance = jasmine.createSpy('custom strategy instance')
      .and.returnValue(42);
    var strategyFactory = jasmine.createSpy('custom strategy factory')
      .and.returnValue(strategyInstance);

    env.describe('suite defining a custom spy strategy', function() {
      env.beforeEach(function() {
        env.addSpyStrategy('frobnicate', strategyFactory);
      });

      env.it('spec in the suite', function() {
        var spy = env.createSpy('something').and.frobnicate(17);
        expect(spy(1, 2, 3)).toEqual(42);
        expect(strategyFactory).toHaveBeenCalledWith(17);
        expect(strategyInstance).toHaveBeenCalledWith(1, 2, 3);
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
    var strategyInstance = jasmine.createSpy('custom strategy instance')
      .and.returnValue(42);
    var strategyFactory = jasmine.createSpy('custom strategy factory')
      .and.returnValue(strategyInstance);

    env.it('spec defining a custom spy strategy', function() {
      env.addSpyStrategy('frobnicate', strategyFactory);
      var spy = env.createSpy('something').and.frobnicate(17);
      expect(spy(1, 2, 3)).toEqual(42);
      expect(strategyFactory).toHaveBeenCalledWith(17);
      expect(strategyInstance).toHaveBeenCalledWith(1, 2, 3);
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
    var strategyInstance = jasmine.createSpy('custom strategy instance')
      .and.returnValue(42);
    var strategyFactory = jasmine.createSpy('custom strategy factory')
      .and.returnValue(strategyInstance);

    env.it('spec defining a custom spy strategy', function() {
      env.addSpyStrategy('frobnicate', strategyFactory);
      var spy = env.createSpy('something')
        .and.returnValue('no args return')
        .withArgs(1, 2, 3).and.frobnicate(17);

      expect(spy()).toEqual('no args return');
      expect(strategyInstance).not.toHaveBeenCalled();
      expect(spy(1, 2, 3)).toEqual(42);
      expect(strategyInstance).toHaveBeenCalledWith(1, 2, 3);
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
