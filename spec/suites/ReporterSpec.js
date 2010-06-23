describe('jasmine.Reporter', function() {
  var env;


  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
  });

  it('should get called from the test runner', function() {
    env.describe('Suite for JSON Reporter with Callbacks', function () {
      env.it('should be a test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });
      env.it('should be a failing test', function() {
        this.runs(function () {
          this.expect(false).toEqual(true);
        });
      });
    });
    env.describe('Suite for JSON Reporter with Callbacks 2', function () {
      env.it('should be a test', function() {
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });

    });

    var foo = 0;
    var bar = 0;
    var baz = 0;

    env.addReporter({
      reportSpecResults: function() {
        foo++;
      },
      reportSuiteResults: function() {
        bar++;
      },
      reportRunnerResults: function() {
        baz++;
      }
    });

    var runner = env.currentRunner();
    runner.execute();

    expect(foo).toEqual(3); // 'foo was expected to be 3, was ' + foo);
    expect(bar).toEqual(2); // 'bar was expected to be 2, was ' + bar);
    expect(baz).toEqual(1); // 'baz was expected to be 1, was ' + baz);
  });

});