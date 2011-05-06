describe('WaitsForBlock', function () {
  var env, suite, timeout, spec, message, onComplete, fakeTimer;
  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
    suite = new jasmine.Suite(env, 'suite 1');
    timeout = 1000;
    spec = new jasmine.Spec(env, suite);
    message = "some error message";
    onComplete = jasmine.createSpy("onComplete");
  });

  describe("jasmine.VERBOSE", function() {
    var jasmineVerboseOriginal;
    beforeEach(function() {
      jasmineVerboseOriginal = jasmine.VERBOSE;
      spyOn(env.reporter, 'log');

    });
    it('do not show information if jasmine.VERBOSE is set to false', function () {
        jasmine.VERBOSE = false;
        var latchFunction = function() {
          return true;
        };
        var block = new jasmine.WaitsForBlock(env, timeout, latchFunction, message, spec);
        expect(env.reporter.log).not.toHaveBeenCalled();
        block.execute(onComplete);
        expect(env.reporter.log).not.toHaveBeenCalled();
        jasmine.VERBOSE = jasmineVerboseOriginal;
      });
    it('show information if jasmine.VERBOSE is set to true', function () {
        jasmine.VERBOSE = true;
        var latchFunction = function() {
          return true;
        };
        var block = new jasmine.WaitsForBlock(env, timeout, latchFunction, message, spec);
        expect(env.reporter.log).not.toHaveBeenCalled();
        block.execute(onComplete);
        expect(env.reporter.log).toHaveBeenCalled();
        jasmine.VERBOSE = jasmineVerboseOriginal;
      });
  });

  it('onComplete should be called if the latchFunction returns true', function () {
    var latchFunction = function() {
      return true;
    };
    var block = new jasmine.WaitsForBlock(env, timeout, latchFunction, message, spec);
    expect(onComplete).not.toHaveBeenCalled();
    block.execute(onComplete);
    expect(onComplete).toHaveBeenCalled();
  });

  it('latchFunction should run in same scope as spec', function () {
    var result;
    var latchFunction = function() {
      result = this.scopedValue;
    };
    spec.scopedValue = 'foo';
    var block = new jasmine.WaitsForBlock(env, timeout, latchFunction, message, spec);
    block.execute(onComplete);
    expect(result).toEqual('foo');
  });

  it('should fail spec and call onComplete if there is an error in the latchFunction', function() {
    var latchFunction = jasmine.createSpy('latchFunction').andThrow('some error');
    spyOn(spec, 'fail');
    var block = new jasmine.WaitsForBlock(env, timeout, latchFunction, message, spec);
    block.execute(onComplete);
    expect(spec.fail).toHaveBeenCalledWith('some error');
    expect(onComplete).toHaveBeenCalled();
  });

  describe("if latchFunction returns false", function() {
    var latchFunction, fakeTimer;
    beforeEach(function() {
      latchFunction = jasmine.createSpy('latchFunction').andReturn(false);
      fakeTimer = new jasmine.FakeTimer();
      env.setTimeout = fakeTimer.setTimeout;
      env.clearTimeout = fakeTimer.clearTimeout;
      env.setInterval = fakeTimer.setInterval;
      env.clearInterval = fakeTimer.clearInterval;
    });

    it('latchFunction should be retried after 10 ms', function () {
      var block = new jasmine.WaitsForBlock(env, timeout, latchFunction, message, spec);
      expect(latchFunction).not.toHaveBeenCalled();
      block.execute(onComplete);
      expect(latchFunction.callCount).toEqual(1);
      fakeTimer.tick(5);
      expect(latchFunction.callCount).toEqual(1);
      fakeTimer.tick(5);
      expect(latchFunction.callCount).toEqual(2);
    });

    it('onComplete should be called if latchFunction returns true before timeout', function () {
      var block = new jasmine.WaitsForBlock(env, timeout, latchFunction, message, spec);
      expect(onComplete).not.toHaveBeenCalled();
      block.execute(onComplete);
      expect(onComplete).not.toHaveBeenCalled();
      latchFunction.andReturn(true);
      fakeTimer.tick(100);
      expect(onComplete).toHaveBeenCalled();
    });

    it('spec should fail with the passed message if the timeout is reached (and not call onComplete)', function () {
      spyOn(spec, 'fail');
      var block = new jasmine.WaitsForBlock(env, timeout, latchFunction, message, spec);
      block.execute(onComplete);
      expect(spec.fail).not.toHaveBeenCalled();
      fakeTimer.tick(timeout);
      expect(spec.fail).toHaveBeenCalled();
      var failMessage = spec.fail.mostRecentCall.args[0].message;
      expect(failMessage).toMatch(message);
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
