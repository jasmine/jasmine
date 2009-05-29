describe("jasmine.Reporters.JSON", function () {
  var env;
  var expectedSpecJSON;
  var expectedSuiteJSON;
  var expectedRunnerJSON;

  beforeEach(function() {
    env = new jasmine.Env();

    env.describe('Suite for JSON Reporter, NO DOM', function () {
      env.it('should be a test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
    });

    env.reporter = jasmine.Reporters.JSON();

    var runner = env.currentRunner;
    runner.execute();

    expectedSpecJSON = {
      "totalCount":1,"passedCount":1,"failedCount":0,"skipped":false,
      "items_":[{"type": 'ExpectationResult', "passed":true,"message":"Passed.", trace: jasmine.any(Object), details: jasmine.any(Object)}],
      "description":"should be a test"
    };

    expectedSuiteJSON = {
      "totalCount":1,"passedCount":1,"failedCount":0,"skipped":false, items_:[]
    };

    expectedRunnerJSON = {
      "totalCount":1,"passedCount":1,"failedCount":0,"skipped":false, items_:[]
    };
  });

  it("should report spec results as json", function() {
    var specJSON = env.reporter.specJSON;
    expect(JSON.parse(specJSON)).toEqual(expectedSpecJSON);
  });

  it("should report test results as json", function() {
    var suiteJSON = env.reporter.suiteJSON;
    expect(JSON.parse(suiteJSON)).toEqual(expectedSuiteJSON);
  });

  it("should report test results as json", function() {
    var runnerJSON = env.reporter.runnerJSON;
    expect(JSON.parse(runnerJSON)).toEqual(expectedRunnerJSON);
  });
});

