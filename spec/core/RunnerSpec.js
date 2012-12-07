describe('RunnerTest', function() {
  var fakeTimer;
  var env;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
  });

  describe('beforeEach', function() {
    it('should run before each spec for all suites', function() {
      var foo;
      env.beforeEach(function() {
        foo = 0;
      });

      env.describe('suite 1', function() {
        env.it('test 1-1', function() {
          foo++;
          expect(foo).toEqual(1);
        });
        env.it('test 1-2', function() {
          foo++;
          expect(foo).toEqual(1);
        });
      });

      env.describe('suite 2', function() {
        env.it('test 2-1', function() {
          foo++;
          expect(foo).toEqual(1);
        });
      });

      env.currentRunner().execute();
    });

    it('should provide all specs', function() {

      env.describe('suite 1', function() {
        env.it('test 1-1', function() {
        });
        env.it('test 1-2', function() {
        });
      });

      env.describe('suite 2', function() {
        env.it('test 2-1', function() {
        });
      });

      expect(env.currentRunner().specs().length).toEqual(3);
    });
  });

  describe('afterEach', function() {
    it('should run after each spec for all suites', function() {
      var foo = 3;
      env.afterEach(function() {
        foo = foo - 1;
      });

      env.describe('suite 1', function() {
        env.it('test 1-1', function() {
          expect(foo).toEqual(3);
        });
        env.it('test 1-2', function() {
          expect(foo).toEqual(2);
        });
      });

      env.describe('suite 2', function() {
        env.it('test 2-1', function() {
          expect(foo).toEqual(1);
        });
      });

      env.currentRunner().execute();
    });

    it('should run after a failing spec', function () {
      var afterEach = originalJasmine.createSpy();
      env.afterEach(afterEach);

      env.describe('suite',function() {
        env.it('fails', function() {
          this.expect(true).toBe(false);
        });
      }).execute();

      expect(afterEach).toHaveBeenCalled();
    });
  });

  it('should ignore suites that have been x\'d', function() {
    var disabledDescribe = jasmine.createSpy('xdescribe');
    env.xdescribe('one suite description', disabledDescribe);
    env.currentRunner().execute();
    expect(disabledDescribe).not.toHaveBeenCalled();
  });

  describe('reporting', function() {
    var fakeReporter;
    beforeEach(function() {
      fakeReporter = originalJasmine.createSpyObj("fakeReporter", ["log", "reportRunnerStarting", "reportRunnerResults"]);
      env.addReporter(fakeReporter);
    });

    it('should report runner results when the runner has completed running', function() {
      var specSpy = originalJasmine.createSpy('spec').andCallFake(function() {
        expect(fakeReporter.reportRunnerResults).not.toHaveBeenCalled();
      });
      env.describe('description', function() {
        env.it('should be a test', specSpy);
      });
      env.currentRunner().execute();
      expect(specSpy).toHaveBeenCalled();
      expect(fakeReporter.reportRunnerResults).toHaveBeenCalledWith(env.currentRunner());
    });
  });

  it("should report when the tests start running", function() {
    var fakeReporter = originalJasmine.createSpyObj("fakeReporter", ["log", "reportRunnerStarting"]);
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
      suite3 = env.describe("suite 3", function() {
      });
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
