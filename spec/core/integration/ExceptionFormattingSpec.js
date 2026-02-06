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
    it('formats AggregateError with individual errors', async function() {
      env.it('should format AggregateError with individual errors', function() {
        const errors = [
          new Error('Database connection failed'),
          new Error('Invalid configuration'),
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

      expect(failure.stack).toContain(
        'Error 1: Error: Database connection failed'
      );
      expect(failure.stack).toContain('Error 2: Error: Invalid configuration');
      expect(failure.stack).toContain('Error 3: Error: Service unavailable');
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
          new Error('Type error in outer operation')
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

      // Firefox & Safari don't preserve nested Error names
      expect(failure.stack).toMatch(
        /Error 1: (AggregateError|Error): Inner operation failed/
      );
      expect(failure.stack).toContain('Error 2: Error: Outer error');
      expect(failure.stack).toContain(
        'Error 3: Error: Type error in outer operation'
      );

      expect(failure.stack).toContain('Error 1: Error: Inner error 1');
      expect(failure.stack).toContain('Error 2: Error: Inner error 2');
    });
  });
});
