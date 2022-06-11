describe('Exceptions:', function() {
  let env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('should handle exceptions thrown, but continue', async function() {
    const secondTest = jasmine.createSpy('second test');
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

    await env.execute();

    expect(secondTest).toHaveBeenCalled();
  });

  it('should handle exceptions thrown directly in top-level describe blocks and continue', async function() {
    const secondDescribe = jasmine
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

    await env.execute();

    expect(secondDescribe).toHaveBeenCalled();
  });
});
