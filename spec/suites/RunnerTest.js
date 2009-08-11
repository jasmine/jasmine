describe('RunnerTest', function() {
  var env;
  beforeEach(function () {
    env = new jasmine.Env();
  });

  it('should be able to add a suite', function() {
    env.describe('one suite description', function () {
      env.it('should be a test');
    });
    expect(env.currentRunner.suites.length).toEqual(1); // "Runner expected one suite, got " + env.currentRunner.suites.length);
  });

  it('should be able to push multiple suites', function() {
    env.describe('one suite description', function () {
      env.it('should be a test');
    });
    env.describe('another suite description', function () {
      env.it('should be a test');
    });
    expect(env.currentRunner.suites.length).toEqual(2); //"Runner expected two suites, but got " + env.currentRunner.suites.length);
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

    expect(env.currentRunner.suites.length).toEqual(2); // "Runner expected two suites, got " + env.currentRunner.suites.length);
    expect(env.currentRunner.suites[0].specs[0].results.getItems()[0].passed).toEqual(true); //"Runner should have run specs in first suite");
    expect(env.currentRunner.suites[1].specs[0].results.getItems()[0].passed).toEqual(false); //"Runner should have run specs in second suite");
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

    expect(env.currentRunner.suites.length).toEqual(1); // "Runner expected 1 suite, got " + env.currentRunner.suites.length);
    expect(env.currentRunner.suites[0].specs[0].results.getItems()[0].passed).toEqual(false); // "Runner should have run specs in first suite");
    expect(env.currentRunner.suites[1]).toEqual(undefined); // "Second suite should be undefined, but was " + reporter.toJSON(env.currentRunner.suites[1]));
  });

  it('should roll up results from all specs', function() {
    var env = new jasmine.Env();
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

    var results = env.currentRunner.getResults();
    expect(results.totalCount).toEqual(2);
    expect(results.passedCount).toEqual(1);
    expect(results.failedCount).toEqual(1);
  });

  it('should set the finished flag when #finished is called', function(){
    env.currentRunner.finish();

    expect(env.currentRunner.finished).toEqual(true);
  });

  it('should call the finish callback when the runner is finished', function() {
    var foo = 0;

    env.currentRunner.finishCallback = function() {
      foo++;
    };

    env.currentRunner.finish();

    expect(env.currentRunner.finished).toEqual(true);
    expect(foo).toEqual(1);
  });

  it("should report when the tests start running", function() {
    var fakeReporter = jasmine.createSpyObj("fakeReporter", ["log", "reportRunnerStarting"]);
    env.addReporter(fakeReporter);

    var runner = new jasmine.Runner(env);
    runner.execute();
    expect(fakeReporter.reportRunnerStarting).wasCalledWith(env.currentRunner);
  });

  it("should return a flat array of all suites, including nested suites", function() {
    var suite1, suite2;
    suite1 = env.describe("spec 1", function() {
      suite2 = env.describe("nested spec", function() {});
    });

    console.log("runner:", env.currentRunner);
    document.runner = env.currentRunner;

    var suites = env.currentRunner.getAllSuites();
    expect(suites).toEqual([suite1, suite2]);
  });

});