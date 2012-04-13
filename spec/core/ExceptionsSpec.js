describe('Exceptions:', function() {
  var env;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
  });

  it('jasmine.formatException formats Firefox exception messages as expected', function() {
    var sampleFirefoxException = {
      fileName: 'foo.js',
      line: '1978',
      message: 'you got your foo in my bar',
      name: 'A Classic Mistake'
    };

    var expected = 'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)';

    expect(jasmine.util.formatException(sampleFirefoxException)).toEqual(expected);
  });

  it('jasmine.formatException formats Webkit exception messages as expected', function() {
    var sampleWebkitException = {
      sourceURL: 'foo.js',
      lineNumber: '1978',
      message: 'you got your foo in my bar',
      name: 'A Classic Mistake'
    };

    var expected = 'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)';

    expect(jasmine.util.formatException(sampleWebkitException)).toEqual(expected);
  });

  describe('with break on exception', function() {
    it('should not catch the exception', function() {
      var suite = env.describe('suite for break on exceptions', function() {
        env.it('should break when an exception is thrown', function() {
          throw new Error('I should hit a breakpoint!');
        });
      });
      var runner = env.currentRunner();
      var dont_change = 'I will never change!';

      var oldCatch = jasmine.CATCH_EXCEPTIONS;
      jasmine.CATCH_EXCEPTIONS = false;
      try {
        suite.execute();
        dont_change = 'oops I changed';
      }
      catch (e) {}
      finally {
        jasmine.CATCH_EXCEPTIONS = oldCatch;
      }

      expect(dont_change).toEqual('I will never change!');
    });
  });

  describe("with catch on exception", function() {
    it('should handle exceptions thrown, but continue', function() {
      var fakeTimer = new jasmine.FakeTimer();
      env.setTimeout = fakeTimer.setTimeout;
      env.clearTimeout = fakeTimer.clearTimeout;
      env.setInterval = fakeTimer.setInterval;
      env.clearInterval = fakeTimer.clearInterval;

      //we run two exception tests to make sure we continue after throwing an exception
      var suite = env.describe('Suite for handles exceptions', function () {
        env.it('should be a test that fails because it throws an exception', function() {
          throw new Error('fake error 1');
        });

        env.it('should be another test that fails because it throws an exception', function() {
          this.runs(function () {
            throw new Error('fake error 2');
          });
          this.runs(function () {
            this.expect(true).toEqual(true);
          });
        });

        env.it('should be a passing test that runs after exceptions are thrown', function() {
          this.expect(true).toEqual(true);
        });

        env.it('should be another test that fails because it throws an exception after a wait', function() {
          this.runs(function () {
            var foo = 'foo';
          });
          this.waits(250);
          this.runs(function () {
            throw new Error('fake error 3');
          });
        });

        env.it('should be a passing test that runs after exceptions are thrown from a async test', function() {
          this.expect(true).toEqual(true);
        });
      });

      var runner = env.currentRunner();
      suite.execute();
      fakeTimer.tick(2500);

      var suiteResults = suite.results();
      var specResults = suiteResults.getItems();

      expect(suiteResults.passed()).toEqual(false);
      //
      expect(specResults.length).toEqual(5);
      expect(specResults[0].passed()).toMatch(false);
      var blockResults = specResults[0].getItems();
      expect(blockResults[0].passed()).toEqual(false);
      expect(blockResults[0].message).toMatch(/fake error 1/);

      expect(specResults[1].passed()).toEqual(false);
      blockResults = specResults[1].getItems();
      expect(blockResults[0].passed()).toEqual(false);
      expect(blockResults[0].message).toMatch(/fake error 2/);
      expect(blockResults[1].passed()).toEqual(true);

      expect(specResults[2].passed()).toEqual(true);

      expect(specResults[3].passed()).toEqual(false);
      blockResults = specResults[3].getItems();
      expect(blockResults[0].message).toMatch(/fake error 3/);

      expect(specResults[4].passed()).toEqual(true);
    });

    it("should handle exceptions thrown directly in top-level describe blocks and continue", function () {
      var suite = env.describe("a top level describe block that throws an exception", function () {
        env.it("is a test that should pass", function () {
         this.expect(true).toEqual(true);
        });

        throw new Error("top level error");
      });

      suite.execute();
      var suiteResults = suite.results();
      var specResults = suiteResults.getItems();

      expect(suiteResults.passed()).toEqual(false);
      expect(specResults.length).toEqual(2);

      expect(specResults[1].description).toMatch(/encountered a declaration exception/);
    });

    it("should handle exceptions thrown directly in nested describe blocks and continue", function () {
      var suite = env.describe("a top level describe", function () {
        env.describe("a mid-level describe that throws an exception", function () {
          env.it("is a test that should pass", function () {
            this.expect(true).toEqual(true);
          });

          throw new Error("a mid-level error");
        });
      });

      suite.execute();
      var suiteResults = suite.results();
      var specResults = suiteResults.getItems();

      expect(suiteResults.passed()).toEqual(false);
      expect(specResults.length).toEqual(1);

      var nestedSpecResults = specResults[0].getItems();

      expect(nestedSpecResults.length).toEqual(2);
      expect(nestedSpecResults[1].description).toMatch(/encountered a declaration exception/);
    });
  });
});
