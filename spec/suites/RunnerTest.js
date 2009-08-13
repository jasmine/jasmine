describe('RunnerTest', function() {
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

  it('should run child suites and specs and generate results when execute is called', function() {
    env.describe('one suite description', function () {
      env.it('should be a test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
    });

    env.describe('another suite description', function () {
      env.it('should be another test', function() {
        this.runs(function () {
          this.expect(true).toEqual(false);
        });
      });
    });

    env.currentRunner.execute();
    fakeTimer.tick(0);

    var runnerResults = env.currentRunner.getResults();
    expect(runnerResults.totalCount).toEqual(2);
    expect(runnerResults.passedCount).toEqual(1);
    expect(runnerResults.failedCount).toEqual(1);
  });


  it('should ignore suites that have been x\'d', function() {
    env.xdescribe('one suite description', function () {
      env.it('should be a test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
    });

    env.describe('another suite description', function () {
      env.it('should be another test', function() {
        this.runs(function () {
          this.expect(true).toEqual(false);
        });
      });
    });

    env.currentRunner.execute();
    fakeTimer.tick(0);
    
    var runnerResults = env.currentRunner.getResults();
    expect(runnerResults.totalCount).toEqual(1);
    expect(runnerResults.passedCount).toEqual(0);
    expect(runnerResults.failedCount).toEqual(1);
  });

  it('should roll up results from all specs', function() {
    env.describe('one suite description', function () {
      env.it('should be a test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
    });

    env.describe('another suite description', function () {
      env.it('should be another test', function() {
        this.runs(function () {
          this.expect(true).toEqual(false);
        });
      });
    });

    env.currentRunner.execute();
    fakeTimer.tick(0);
    
    var results = env.currentRunner.getResults();
    expect(results.totalCount).toEqual(2);
    expect(results.passedCount).toEqual(1);
    expect(results.failedCount).toEqual(1);
  });

  describe('reporting', function () {
    var fakeReporter;
    beforeEach(function () {
      fakeReporter = jasmine.createSpyObj("fakeReporter", ["log", "reportRunnerStarting", "reportRunnerResults"]);
      env.addReporter(fakeReporter);
    });

    it('should report runner results when the runner has completed running', function() {
      env.describe('one suite description', function () {
        env.it('should be a test', function() {
          this.runs(function () {
            this.expect(true).toEqual(true);
          });
        });
      });

      env.describe('another suite description', function () {
        env.it('should be another test', function() {
          this.waits(200);
          this.runs(function () {
            this.expect(true).toEqual(false);
          });
        });
      });

      env.currentRunner.execute();
      expect(fakeReporter.reportRunnerResults).wasNotCalled();
      fakeTimer.tick(200);
      expect(fakeReporter.reportRunnerResults).wasCalledWith(env.currentRunner);
    });

    it("should report when the tests start running", function() {
      expect(fakeReporter.reportRunnerStarting).wasNotCalled();
      env.currentRunner.execute();
      expect(fakeReporter.reportRunnerStarting).wasCalledWith(env.currentRunner);
    });

  });
});