describe('Exception formatting (integration)', function() {
  let env;

  beforeEach(function() {
    specHelpers.registerIntegrationMatchers();
    env = new privateUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  describe('AggregateError formatting', function() {
    it('formats AggregateError from Promise.any() with all errors', async function() {
      env.it(
        'should format AggregateError from Promise.any()',
        async function() {
          await Promise.any([
            Promise.reject(new Error('First promise failed')),
            Promise.reject(new TypeError('Second promise failed')),
            Promise.reject(new Error('Third promise failed'))
          ]);
        }
      );

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length).toEqual(1);

      const failure = result.failedExpectations[0];
      expect(failure.message).toContain('AggregateError');

      expect(failure.stack).toContain('Error 1:');
      expect(failure.stack).toContain('First promise failed');
      expect(failure.stack).toContain('Error 2:');
      expect(failure.stack).toContain('Second promise failed');
      expect(failure.stack).toContain('Error 3:');
      expect(failure.stack).toContain('Third promise failed');
    });

    it('formats manually created AggregateError with individual errors', async function() {
      env.it('should format manually created AggregateError', function() {
        const errors = [
          new Error('Database connection failed'),
          new TypeError('Invalid configuration'),
          new Error('Service unavailable')
        ];
        throw new AggregateError(errors, 'Multiple initialization errors');
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length).toEqual(1);

      const failure = result.failedExpectations[0];
      expect(failure.message).toContain('AggregateError');
      expect(failure.message).toContain('Multiple initialization errors');

      expect(failure.stack).toContain('Error 1:');
      expect(failure.stack).toContain('Database connection failed');
      expect(failure.stack).toContain('Error 2:');
      expect(failure.stack).toContain('Invalid configuration');
      expect(failure.stack).toContain('Error 3:');
      expect(failure.stack).toContain('Service unavailable');
    });

    it('formats nested AggregateError', async function() {
      env.it('should format nested AggregateError', function() {
        const innerErrors = [
          new Error('Inner error 1'),
          new Error('Inner error 2')
        ];
        const innerAggregate = new AggregateError(
          innerErrors,
          'Inner operation failed'
        );

        const outerErrors = [
          innerAggregate,
          new Error('Outer error'),
          new TypeError('Type error in outer operation')
        ];
        throw new AggregateError(outerErrors, 'Multiple operations failed');
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');

      const failure = result.failedExpectations[0];

      expect(failure.stack).toContain('Error 1:');
      expect(failure.stack).toContain('Inner operation failed');
      expect(failure.stack).toContain('Error 2:');
      expect(failure.stack).toContain('Outer error');
      expect(failure.stack).toContain('Error 3:');
      expect(failure.stack).toContain('Type error in outer operation');

      expect(failure.stack).toContain('Inner error 1');
      expect(failure.stack).toContain('Inner error 2');
    });
  });
});
