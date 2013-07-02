xdescribe('Exceptions:', function() {
  var env;

  beforeEach(function() {
    env = new j$.Env();
    env.updateInterval = 0;
  });

  describe('with break on exception', function() {
    it('should not catch the exception', function() {
      env.catchExceptions(false);
      var suite = env.describe('suite for break on exceptions', function() {
        env.it('should break when an exception is thrown', function() {
          throw new Error('I should hit a breakpoint!');
        });
      });
      var runner = env.currentRunner();
      var dont_change = 'I will never change!';

      try {
        suite.execute();
        dont_change = 'oops I changed';
      }
      catch (e) {}

      expect(dont_change).toEqual('I will never change!');
    });
  });

  describe("with catch on exception", function() {
    it('should handle exceptions thrown, but continue', function() {
      var ranSecondTest = false,
      suite = env.describe('Suite for handles exceptions', function () {
        env.it('should be a test that fails because it throws an exception', function() {
          throw new Error();
        });
        env.it('should be a passing test that runs after exceptions are thrown from a async test', function() {
          ranSecondTest = true;
        });
      });

      suite.execute();
      expect(ranSecondTest).toBe(true);
    });

    it("should handle exceptions thrown directly in top-level describe blocks and continue", function () {
      var ranSecondDescribe = false, suite, suite2, runner = env.currentRunner();
      suite = env.describe("a suite that throws an exception", function () {
        env.it("is a test that should pass", function () {
         this.expect(true).toEqual(true);
        });

        throw new Error("top level error");
      });
      suite2 = env.describe("a suite that doesn't throw an exception", function () {
        ranSecondDescribe = true;
      });

      runner.execute();
      expect(ranSecondDescribe).toBe(true);
    });
  });

});
