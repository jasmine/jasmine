describe('Custom Matchers (Integration)', function() {
  let env;

  beforeEach(function() {
    env = new privateUnderTest.Env();
    env.configure({ random: false });
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('allows adding more matchers local to a spec', async function() {
    env.it('spec defining a custom matcher', function() {
      env.addMatchers({
        matcherForSpec: function() {
          return {
            compare: function(actual, expected) {
              return {
                pass: false,
                message:
                  'matcherForSpec: actual: ' +
                  actual +
                  '; expected: ' +
                  expected
              };
            }
          };
        }
      });

      env.expect('zzz').matcherForSpec('yyy');
    });

    env.it('spec without custom matcher defined', function() {
      expect(env.expect('zzz').matcherForSpec).toBeUndefined();
    });

    const specDoneSpy = jasmine.createSpy('specDoneSpy');
    env.addReporter({ specDone: specDoneSpy });

    await env.execute();

    const firstSpecResult = specDoneSpy.calls.first().args[0];
    expect(firstSpecResult.status).toEqual('failed');
    expect(firstSpecResult.failedExpectations[0].message).toEqual(
      'matcherForSpec: actual: zzz; expected: yyy'
    );
  });

  it('provides diffs to a custom matcher that transforms its inputs', async function() {
    env.it('compares objects without empty properties', function() {
      function stripEmptyProperties(value) {
        const result = {};
        for (const key of Object.keys(value)) {
          if (value[key] !== '') {
            result[key] = value[key];
          }
        }
        return result;
      }

      env.addMatchers({
        toEqualExcludingEmpty: function(matchersUtil) {
          return {
            compare: function(actual, expected) {
              const result = matchersUtil.equalsWithDiff(
                stripEmptyProperties(actual),
                stripEmptyProperties(expected)
              );
              return { pass: result.pass, message: result.diff };
            }
          };
        }
      });

      env.expect({ x: 1, empty: '' }).toEqualExcludingEmpty({ x: 1 });
      env.expect({ x: 1, empty: '' }).toEqualExcludingEmpty({ x: 2 });
    });

    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    await env.execute();

    const result = reporter.specDone.calls.argsFor(0)[0];
    expect(result.passedExpectations.length).toBe(1);
    expect(result.failedExpectations.length).toBe(1);
    expect(result.failedExpectations[0].message).toBe(
      'Expected $.x = 1 to equal 2.'
    );
  });

  it('passes custom equality testers and object formatters to equalsWithDiff', async function() {
    env.it('uses the spec customizations in a custom matcher', function() {
      env.addCustomEqualityTester(function(a, b) {
        if (typeof a === 'string' && typeof b === 'string') {
          return a.toLowerCase() === b.toLowerCase();
        }
      });
      env.addCustomObjectFormatter(function(value) {
        if (typeof value === 'number') {
          return 'number(' + value + ')';
        }
      });
      env.addMatchers({
        toEqualWithDiff: function(matchersUtil) {
          return {
            compare: function(actual, expected) {
              const result = matchersUtil.equalsWithDiff(actual, expected);
              return { pass: result.pass, message: result.diff };
            }
          };
        }
      });
      env.expect({ x: 'ABC' }).toEqualWithDiff({ x: 'abc' });
      env.expect({ x: 1 }).toEqualWithDiff({ x: 2 });
    });

    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    await env.execute();

    const result = reporter.specDone.calls.argsFor(0)[0];
    expect(result.passedExpectations.length).toBe(1);
    expect(result.failedExpectations.length).toBe(1);
    expect(result.failedExpectations[0].message).toBe(
      'Expected $.x = number(1) to equal number(2).'
    );
  });

  it('passes the spec if the custom matcher passes', async function() {
    env.it('spec using custom matcher', function() {
      env.addMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return { pass: true };
            }
          };
        }
      });

      env.expect(true).toBeReal();
    });

    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledTimes(1);
    const result = reporter.specDone.calls.argsFor(0)[0];
    expect(result.status).toEqual('passed');
  });

  it('passes the spec if the custom equality matcher passes for types nested inside asymmetric equality testers', async function() {
    env.it('spec using custom equality matcher', function() {
      const customEqualityFn = function(a, b) {
        // All "foo*" strings match each other.
        if (
          typeof a == 'string' &&
          typeof b == 'string' &&
          a.slice(0, 3) == 'foo' &&
          b.slice(0, 3) == 'foo'
        ) {
          return true;
        }
      };

      env.addCustomEqualityTester(customEqualityFn);
      env
        .expect({ foo: 'fooValue' })
        .toEqual(jasmineUnderTest.objectContaining({ foo: 'fooBar' }));
      env
        .expect(['fooValue', 'things'])
        .toEqual(jasmineUnderTest.arrayContaining(['fooBar']));
      env
        .expect(['fooValue'])
        .toEqual(jasmineUnderTest.arrayWithExactContents(['fooBar']));
    });

    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledTimes(1);
    const result = reporter.specDone.calls.argsFor(0)[0];
    expect(result.status).toEqual('passed');
  });

  it('displays an appropriate failure message if a custom equality matcher fails', async function() {
    env.it('spec using custom equality matcher', function() {
      const customEqualityFn = function(a, b) {
        // "foo" is not equal to anything
        if (a === 'foo' || b === 'foo') {
          return false;
        }
      };

      env.addCustomEqualityTester(customEqualityFn);
      env.expect({ foo: 'foo' }).toEqual({ foo: 'foo' });
    });

    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledTimes(1);
    const result = reporter.specDone.calls.argsFor(0)[0];
    expect(result.status).toEqual('failed');
    expect(result.failedExpectations[0].message).toEqual(
      "Expected $.foo = 'foo' to equal 'foo'."
    );
  });

  it('uses the negative compare function for a negative comparison, if provided', async function() {
    env.it('spec with custom negative comparison matcher', function() {
      env.addMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return { pass: true };
            },
            negativeCompare: function() {
              return { pass: true };
            }
          };
        }
      });

      env.expect(true).not.toBeReal();
    });

    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledTimes(1);
    const result = reporter.specDone.calls.argsFor(0)[0];
    expect(result.status).toEqual('passed');
  });

  it('generates messages with the same rules as built in matchers absent a custom message', async function() {
    env.it('spec with an expectation', function() {
      env.addMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return { pass: false };
            }
          };
        }
      });

      env.expect('a').toBeReal();
    });

    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledTimes(1);
    const result = reporter.specDone.calls.argsFor(0)[0];
    expect(result.failedExpectations[0].message).toEqual(
      "Expected 'a' to be real."
    );
  });

  it('passes the expected and actual arguments to the comparison function', async function() {
    const argumentSpy = jasmine
      .createSpy('argument spy')
      .and.returnValue({ pass: true });

    env.it('spec with an expectation', function() {
      env.addMatchers({
        toBeReal: function() {
          return { compare: argumentSpy };
        }
      });

      env.expect(true).toBeReal();
      env.expect(true).toBeReal('arg');
      env.expect(true).toBeReal('arg1', 'arg2');
    });

    await env.execute();
    expect(argumentSpy).toHaveBeenCalledWith(true);
    expect(argumentSpy).toHaveBeenCalledWith(true, 'arg');
    expect(argumentSpy).toHaveBeenCalledWith(true, 'arg1', 'arg2');
  });

  it('passes the jasmine utility to the matcher factory', async function() {
    const matcherFactory = function() {
      return {
        compare: function() {
          return { pass: true };
        }
      };
    };
    const matcherFactorySpy = jasmine
      .createSpy('matcherFactorySpy')
      .and.callFake(matcherFactory);

    env.it('spec with expectation', function() {
      env.addMatchers({
        toBeReal: matcherFactorySpy
      });

      env.expect(true).toBeReal();
    });

    await env.execute();
    expect(matcherFactorySpy).toHaveBeenCalledWith(
      jasmine.any(privateUnderTest.MatchersUtil)
    );
  });

  it('provides custom equality testers to the matcher factory via matchersUtil', async function() {
    const matcherFactory = function(matchersUtil) {
      return {
        compare: function(actual, expected) {
          return { pass: matchersUtil.equals(actual[0], expected) };
        }
      };
    };
    const customEqualityFn = jasmine
      .createSpy('customEqualityFn')
      .and.callFake(function(a, b) {
        return a.toString() === b;
      });

    env.it('spec with expectation', function() {
      env.addCustomEqualityTester(customEqualityFn);
      env.addMatchers({
        toBeArrayWithFirstElement: matcherFactory
      });

      env.expect([1, 2]).toBeArrayWithFirstElement('1');
    });

    const reporter = jasmine.createSpyObj('reporter', ['specDone']);
    env.addReporter(reporter);
    await env.execute();

    expect(reporter.specDone).toHaveBeenCalledTimes(1);
    const result = reporter.specDone.calls.argsFor(0)[0];
    expect(customEqualityFn).toHaveBeenCalledWith(1, '1');
    expect(result.failedExpectations).toEqual([]);
  });
});
