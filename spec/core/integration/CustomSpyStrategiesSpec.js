describe('Custom Spy Strategies (Integration)', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
    env.configure({ random: false });
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('allows adding more strategies local to a suite', async function() {
    var plan = jasmine.createSpy('custom strategy plan').and.returnValue(42);
    var strategy = jasmine.createSpy('custom strategy').and.returnValue(plan);

    env.describe('suite defining a custom spy strategy', function() {
      env.beforeAll(function() {
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

    const result = await env.execute();
    expect(result.overallStatus).toEqual('passed');
  });

  it('allows adding more strategies local to a spec', async function() {
    var plan = jasmine.createSpy('custom strategy plan').and.returnValue(42);
    var strategy = jasmine.createSpy('custom strategy').and.returnValue(plan);

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

    const result = await env.execute();
    expect(result.overallStatus).toEqual('passed');
  });

  it('allows using custom strategies on a per-argument basis', async function() {
    var plan = jasmine.createSpy('custom strategy plan').and.returnValue(42);
    var strategy = jasmine.createSpy('custom strategy').and.returnValue(plan);

    env.it('spec defining a custom spy strategy', function() {
      env.addSpyStrategy('frobnicate', strategy);
      var spy = env
        .createSpy('something')
        .and.returnValue('no args return')
        .withArgs(1, 2, 3)
        .and.frobnicate(17);

      expect(spy()).toEqual('no args return');
      expect(plan).not.toHaveBeenCalled();
      expect(spy(1, 2, 3)).toEqual(42);
      expect(plan).toHaveBeenCalledWith(1, 2, 3);
    });

    env.it('spec without custom strategy defined', function() {
      expect(env.createSpy('something').and.frobnicate).toBeUndefined();
    });

    const result = await env.execute();
    expect(result.overallStatus).toEqual('passed');
  });

  it('allows multiple custom strategies to be used', async function() {
    var plan1 = jasmine.createSpy('plan 1').and.returnValue(42),
      strategy1 = jasmine.createSpy('strat 1').and.returnValue(plan1),
      plan2 = jasmine.createSpy('plan 2').and.returnValue(24),
      strategy2 = jasmine.createSpy('strat 2').and.returnValue(plan2),
      specDone = jasmine.createSpy('specDone');

    env.beforeEach(function() {
      env.addSpyStrategy('frobnicate', strategy1);
      env.addSpyStrategy('jiggle', strategy2);
    });

    env.it('frobnicates', function() {
      plan1.calls.reset();
      plan2.calls.reset();
      var spy = env.createSpy('spy').and.frobnicate();
      expect(spy()).toEqual(42);
      expect(plan1).toHaveBeenCalled();
      expect(plan2).not.toHaveBeenCalled();
    });

    env.it('jiggles', function() {
      plan1.calls.reset();
      plan2.calls.reset();
      var spy = env.createSpy('spy').and.jiggle();
      expect(spy()).toEqual(24);
      expect(plan1).not.toHaveBeenCalled();
      expect(plan2).toHaveBeenCalled();
    });

    env.addReporter({ specDone: specDone });
    const result = await env.execute();
    expect(result.overallStatus).toEqual('passed');
    expect(specDone.calls.count()).toBe(2);
  });
});
