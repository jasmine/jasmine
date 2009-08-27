describe('Suite', function() {
  var fakeTimer;
  var env;

  beforeEach(function() {
    env = new jasmine.Env();

    fakeTimer = new jasmine.FakeTimer();
    env.setTimeout = fakeTimer.setTimeout;
    env.clearTimeout = fakeTimer.clearTimeout;
    env.setInterval = fakeTimer.setInterval;
    env.clearInterval = fakeTimer.clearInterval;
  });

  it('should keep a count of the number of specs that are run' , function() {
    env.describe('one suite description', function () {
      env.it('should be a test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
      env.it('should be another test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
      env.it('should be a third test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
    });

    var suite = env.currentRunner.suites[0];
    expect(suite.specCount()).toEqual(3);
  });

  it('specCount should be correct even with runs/waits blocks' , function() {
    env.describe('one suite description', function () {
      env.it('should be a test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
      env.it('should be another test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
        this.waits(10);
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
      env.it('should be a third test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
    });

    var suite = env.currentRunner.suites[0];
    expect(suite.specCount()).toEqual(3);
  });

});