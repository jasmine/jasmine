describe('Default Spy Strategy (Integration)', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
    env.configure({ random: false });
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('allows defining a default spy strategy', async function() {
    env.describe('suite with default strategy', function() {
      env.beforeEach(function() {
        env.setDefaultSpyStrategy(function(and) {
          and.returnValue(42);
        });
      });

      env.it('spec in suite', function() {
        var spy = env.createSpy('something');
        expect(spy()).toBe(42);
      });
    });

    env.it('spec not in suite', function() {
      var spy = env.createSpy('something');
      expect(spy()).toBeUndefined();
    });

    const result = await env.execute();
    expect(result.overallStatus).toEqual('passed');
  });

  it('uses the default spy strategy defined when the spy is created', async function() {
    env.it('spec', function() {
      var a = env.createSpy('a');
      env.setDefaultSpyStrategy(function(and) {
        and.returnValue(42);
      });
      var b = env.createSpy('b');
      env.setDefaultSpyStrategy(function(and) {
        and.stub();
      });
      var c = env.createSpy('c');
      env.setDefaultSpyStrategy();
      var d = env.createSpy('d');

      expect(a()).toBeUndefined();
      expect(b()).toBe(42);
      expect(c()).toBeUndefined();
      expect(d()).toBeUndefined();

      // Check our assumptions about which spies are "configured" (this matters because
      // spies that use withArgs() behave differently if they are not configured).
      expect(a.and.isConfigured()).toBe(false);
      expect(b.and.isConfigured()).toBe(true);
      expect(c.and.isConfigured()).toBe(true);
      expect(d.and.isConfigured()).toBe(false);
    });

    const result = await env.execute();
    expect(result.overallStatus).toEqual('passed');
  });
});
