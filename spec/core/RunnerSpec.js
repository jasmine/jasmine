describe('RunnerTest', function() {
  var fakeTimer;
  var env;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;

    fakeTimer = new jasmine.FakeTimer();
    env.setTimeout = fakeTimer.setTimeout;
    env.clearTimeout = fakeTimer.clearTimeout;
    env.setInterval = fakeTimer.setInterval;
    env.clearInterval = fakeTimer.clearInterval;
  });

  describe('beforeEach', function() {
    it('should run before each spec for all suites', function () {
      var foo;
      env.beforeEach(function () {
        foo = 0;
      });

      env.describe('suite 1', function () {
        env.it('test 1-1', function() {
          foo++;
          this.expect(foo).toEqual(1);
        });
        env.it('test 1-2', function() {
          foo++;
          this.expect(foo).toEqual(1);
        });
      });

      env.describe('suite 2', function () {
        env.it('test 2-1', function() {
          foo++;
          this.expect(foo).toEqual(1);
        });
      });

      env.currentRunner().execute();

      var runnerResults = env.currentRunner().results();
      expect(runnerResults.totalCount).toEqual(3);
      expect(runnerResults.passedCount).toEqual(3);
    });


    it('should provide all specs', function () {
      var foo;
      env.beforeEach(function () {
        foo = 0;
      });

      env.describe('suite 1', function () {
        env.it('test 1-1', function() {
          foo++;
          this.expect(foo).toEqual(1);
        });
        env.it('test 1-2', function() {
          foo++;
          this.expect(foo).toEqual(1);
        });
      });

      env.describe('suite 2', function () {
        env.it('test 2-1', function() {
          foo++;
          this.expect(foo).toEqual(1);
        });
      });

      env.currentRunner().execute();


      expect(env.currentRunner().specs().length).toEqual(3);
    });
  });

  describe('afterEach', function() {
    it('should run after each spec for all suites', function () {
      var foo = 3;
      env.afterEach(function () {
        foo = foo - 1;
      });

      env.describe('suite 1', function () {
        env.it('test 1-1', function() {
          this.expect(foo).toEqual(3);
        });
        env.it('test 1-2', function() {
          this.expect(foo).toEqual(2);
        });
      });

      env.describe('suite 2', function () {
        env.it('test 2-1', function() {
          this.expect(foo).toEqual(1);
        });
      });

      env.currentRunner().execute();

      var runnerResults = env.currentRunner().results();
      expect(runnerResults.totalCount).toEqual(3);
      expect(runnerResults.passedCount).toEqual(3);
    });

    it('should run after a failing spec', function () {
      var afterEach = jasmine.createSpy();
      env.afterEach(afterEach);

      env.describe('suite', function () {
        env.it('fails', function () {
          this.explodes();
        });
      }).execute();

      expect(afterEach).toHaveBeenCalled();
    });
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

    env.currentRunner().execute();

    var runnerResults = env.currentRunner().results();
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

    env.currentRunner().execute();

    var runnerResults = env.currentRunner().results();
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

    env.currentRunner().execute();

    var results = env.currentRunner().results();
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

      env.currentRunner().execute();
      expect(fakeReporter.reportRunnerResults).not.toHaveBeenCalled();
      fakeTimer.tick(200);
      //This blows up the JSApiReporter.
      //expect(fakeReporter.reportRunnerResults).toHaveBeenCalledWith(env.currentRunner);
      expect(fakeReporter.reportRunnerResults).toHaveBeenCalled();
      expect(fakeReporter.reportRunnerResults.mostRecentCall.args[0].results()).toEqual(env.currentRunner().results());
    });
  });

  it("should report when the tests start running", function() {
    var fakeReporter = jasmine.createSpyObj("fakeReporter", ["log", "reportRunnerStarting"]);
    env.addReporter(fakeReporter);


    var runner = new jasmine.Runner(env);
    runner.arbitraryVariable = 'foo';
    spyOn(runner.queue, 'start');
    expect(fakeReporter.reportRunnerStarting).not.toHaveBeenCalled();
    runner.execute();
    expect(fakeReporter.reportRunnerStarting).toHaveBeenCalled();
    var reportedRunner = fakeReporter.reportRunnerStarting.mostRecentCall.args[0];
    expect(reportedRunner.arbitraryVariable).toEqual('foo');
    expect(runner.queue.start).toHaveBeenCalled();
  });

  describe("when suites are nested", function() {
    var suite1, suite2, suite3;

    function suiteNames(suites) {
      var suiteDescriptions = [];
      for (var i = 0; i < suites.length; i++) {
        suiteDescriptions.push(suites[i].getFullName());
      }
      return suiteDescriptions;
    }

    beforeEach(function() {
      suite1 = env.describe("suite 1", function() {
        suite2 = env.describe("suite 2", function() {
        });
      });
      suite3 = env.describe("suite 3", function() {});
    });

    it("#suites should return a flat array of all suites, including nested suites", function() {
      var suites = env.currentRunner().suites();
      expect(suiteNames(suites)).toEqual([suite1.getFullName(), suite2.getFullName(), suite3.getFullName()]);
    });

    it("#topLevelSuites should return a flat array of all top-level suites only", function() {
      var suites = env.currentRunner().topLevelSuites();
      expect(suiteNames(suites)).toEqual([suite1.getFullName(), suite3.getFullName()]);
    });
  });
});