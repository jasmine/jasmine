describe('Exceptions:', function() {
  var env;

  beforeEach(function() {
    env = new j$.Env();
  });

  describe('with break on exception', function() {
    it('should not catch the exception', function() {
      env.catchExceptions(false);
      env.describe('suite for break on exceptions', function() {
        env.it('should break when an exception is thrown', function() {
          throw new Error('I should hit a breakpoint!');
        });
      });
      var spy = jasmine.createSpy('spy');

      try {
        env.execute();
        spy();
      }
      catch (e) {}

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("with catch on exception", function() {
    it('should handle exceptions thrown, but continue', function(done) {
      var secondTest = jasmine.createSpy('second test');
      env.describe('Suite for handles exceptions', function () {
        env.it('should be a test that fails because it throws an exception', function() {
          throw new Error();
        });
        env.it('should be a passing test that runs after exceptions are thrown from a async test', secondTest);
      });

      expectations = function() {
        expect(secondTest).toHaveBeenCalled();
        done();
      };

      env.addReporter({ jasmineDone: expectations });
      env.execute();
    });

    it("should handle exceptions thrown directly in top-level describe blocks and continue", function(done) {
      var secondDescribe = jasmine.createSpy("second describe");
      env.describe("a suite that throws an exception", function () {
        env.it("is a test that should pass", function () {
         this.expect(true).toEqual(true);
        });

        throw new Error("top level error");
      });
      env.describe("a suite that doesn't throw an exception", secondDescribe);

      expectations = function() {
        expect(secondDescribe).toHaveBeenCalled();
        done();
      };

      env.addReporter({ jasmineDone: expectations });
      env.execute();
    });
  });
});

