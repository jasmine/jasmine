describe('Exceptions:', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('should handle exceptions thrown, but continue', function(done) {
    var secondTest = jasmine.createSpy('second test');
    env.describe('Suite for handles exceptions', function() {
      env.it(
        'should be a test that fails because it throws an exception',
        function() {
          throw new Error();
        }
      );
      env.it(
        'should be a passing test that runs after exceptions are thrown from a async test',
        secondTest
      );
    });

    var expectations = function() {
      expect(secondTest).toHaveBeenCalled();
      done();
    };

    env.execute(null, expectations);
  });

  it('should handle exceptions thrown directly in top-level describe blocks and continue', function(done) {
    var secondDescribe = jasmine
      .createSpy('second describe')
      .and.callFake(function() {
        env.it('has a test', function() {});
      });
    env.describe('a suite that throws an exception', function() {
      env.it('is a test that should pass', function() {
        this.expect(true).toEqual(true);
      });

      throw new Error('top level error');
    });
    env.describe("a suite that doesn't throw an exception", secondDescribe);

    var expectations = function() {
      expect(secondDescribe).toHaveBeenCalled();
      done();
    };

    env.execute(null, expectations);
  });
});
