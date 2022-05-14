describe('Matchers (Integration)', function() {
  let env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  function verifyPasses(expectations) {
    it('passes', async function() {
      env.it('a spec', function() {
        expectations(env);
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('passed');
      expect(result.passedExpectations.length)
        .withContext('Number of passed expectations')
        .toEqual(1);
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(0);
      expect(
        result.failedExpectations[0] && result.failedExpectations[0].message
      )
        .withContext('Failure message')
        .toBeUndefined();
    });
  }

  function verifyFails(expectations) {
    it('fails', async function() {
      env.it('a spec', function() {
        expectations(env);
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(1);
      expect(result.failedExpectations[0].message)
        .withContext('Failed with a thrown error rather than a matcher failure')
        .not.toMatch(/^Error: /);
      expect(result.failedExpectations[0].message)
        .withContext(
          'Failed with a thrown type error rather than a matcher failure'
        )
        .not.toMatch(/^TypeError: /);
      expect(result.failedExpectations[0].matcherName)
        .withContext('Matcher name')
        .not.toEqual('');
    });
  }

  function verifyFailsWithCustomObjectFormatters(config) {
    it('uses custom object formatters', async function() {
      env.it('a spec', function() {
        env.addCustomObjectFormatter(config.formatter);
        config.expectations(env);
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(1);
      expect(result.failedExpectations[0].message).toEqual(
        config.expectedMessage
      );
    });
  }

  function verifyPassesAsync(expectations) {
    it('passes', async function() {
      env.it('a spec', function() {
        return expectations(env);
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('passed');
      expect(result.passedExpectations.length)
        .withContext('Number of passed expectations')
        .toEqual(1);
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(0);
      expect(
        result.failedExpectations[0] && result.failedExpectations[0].message
      )
        .withContext('Failure message')
        .toBeUndefined();
    });
  }

  function verifyFailsAsync(expectations) {
    it('fails', async function() {
      env.it('a spec', function() {
        return expectations(env);
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(1);
      expect(result.failedExpectations[0].message)
        .withContext('Failed with a thrown error rather than a matcher failure')
        .not.toMatch(/^Error: /);
      expect(result.failedExpectations[0].matcherName)
        .withContext('Matcher name')
        .not.toEqual('');
    });
  }

  function verifyFailsWithCustomObjectFormattersAsync(config) {
    it('uses custom object formatters', async function() {
      const env = new jasmineUnderTest.Env();
      env.it('a spec', function() {
        env.addCustomObjectFormatter(config.formatter);
        return config.expectations(env);
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(1);
      expect(result.failedExpectations[0].message).toEqual(
        config.expectedMessage
      );
    });
  }

  describe('nothing', function() {
    verifyPasses(function(env) {
      env.expect().nothing();
    });
  });

  describe('toBe', function() {
    verifyPasses(function(env) {
      env.expect(1).toBe(1);
    });

    verifyFails(function(env) {
      env.expect(2).toBe(1);
    });
  });

  describe('toBeCloseTo', function() {
    verifyPasses(function(env) {
      env.expect(1.001).toBeCloseTo(1, 2);
    });

    verifyFails(function(env) {
      env.expect(1.1).toBeCloseTo(1, 2);
    });
  });

  describe('toBeDefined', function() {
    verifyPasses(function(env) {
      env.expect({}).toBeDefined();
    });

    verifyFails(function(env) {
      env.expect(undefined).toBeDefined();
    });
  });

  describe('toBeFalse', function() {
    verifyPasses(function(env) {
      env.expect(false).toBeFalse();
    });

    verifyFails(function(env) {
      env.expect(true).toBeFalse();
    });
  });

  describe('toBeFalsy', function() {
    verifyPasses(function(env) {
      env.expect(false).toBeFalsy();
    });

    verifyFails(function(env) {
      env.expect(true).toBeFalsy();
    });
  });

  describe('toBeGreaterThan', function() {
    verifyPasses(function(env) {
      env.expect(2).toBeGreaterThan(1);
    });

    verifyFails(function(env) {
      env.expect(1).toBeGreaterThan(2);
    });
  });

  describe('toBeGreaterThanOrEqual', function() {
    verifyPasses(function(env) {
      env.expect(2).toBeGreaterThanOrEqual(1);
    });

    verifyFails(function(env) {
      env.expect(1).toBeGreaterThanOrEqual(2);
    });
  });

  describe('toBeInstanceOf', function() {
    function Ctor() {}

    verifyPasses(function(env) {
      env.expect(new Ctor()).toBeInstanceOf(Ctor);
    });

    verifyFails(function(env) {
      env.expect({}).toBeInstanceOf(Ctor);
    });
  });

  describe('toBeLessThan', function() {
    verifyPasses(function(env) {
      env.expect(1).toBeLessThan(2);
    });

    verifyFails(function(env) {
      env.expect(2).toBeLessThan(1);
    });
  });

  describe('toBeLessThanOrEqual', function() {
    verifyPasses(function(env) {
      env.expect(1).toBeLessThanOrEqual(2);
    });

    verifyFails(function(env) {
      env.expect(2).toBeLessThanOrEqual(1);
    });
  });

  describe('toBeNaN', function() {
    verifyPasses(function(env) {
      env.expect(NaN).toBeNaN();
    });

    verifyFails(function(env) {
      env.expect(2).toBeNaN();
    });

    verifyFailsWithCustomObjectFormatters({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        env.expect(1).toBeNaN();
      },
      expectedMessage: 'Expected |1| to be NaN.'
    });
  });

  describe('toBeNegativeInfinity', function() {
    verifyPasses(function(env) {
      env.expect(Number.NEGATIVE_INFINITY).toBeNegativeInfinity();
    });

    verifyFails(function(env) {
      env.expect(2).toBeNegativeInfinity();
    });

    verifyFailsWithCustomObjectFormatters({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        env.expect(1).toBeNegativeInfinity();
      },
      expectedMessage: 'Expected |1| to be -Infinity.'
    });
  });

  describe('toBeNull', function() {
    verifyPasses(function(env) {
      env.expect(null).toBeNull();
    });

    verifyFails(function(env) {
      env.expect(2).toBeNull();
    });
  });

  describe('toBePositiveInfinity', function() {
    verifyPasses(function(env) {
      env.expect(Number.POSITIVE_INFINITY).toBePositiveInfinity();
    });

    verifyFails(function(env) {
      env.expect(2).toBePositiveInfinity();
    });

    verifyFailsWithCustomObjectFormatters({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        env.expect(1).toBePositiveInfinity();
      },
      expectedMessage: 'Expected |1| to be Infinity.'
    });
  });

  describe('toBeResolved', function() {
    verifyPassesAsync(function(env) {
      return env.expectAsync(Promise.resolve()).toBeResolved();
    });

    verifyFailsAsync(function(env) {
      return env.expectAsync(Promise.reject()).toBeResolved();
    });
  });

  describe('toBeResolvedTo', function() {
    verifyPassesAsync(function(env) {
      env.addCustomEqualityTester(function(a, b) {
        return a.toString() === b.toString();
      });
      return env.expectAsync(Promise.resolve('5')).toBeResolvedTo(5);
    });

    verifyFailsAsync(function(env) {
      return env.expectAsync(Promise.resolve('foo')).toBeResolvedTo('bar');
    });

    verifyFailsWithCustomObjectFormattersAsync({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        return env.expectAsync(Promise.resolve('x')).toBeResolvedTo('y');
      },
      expectedMessage:
        'Expected a promise to be resolved to |y| ' +
        'but it was resolved to |x|.'
    });
  });

  describe('toBeRejected', function() {
    verifyPassesAsync(function(env) {
      return env.expectAsync(Promise.reject('nope')).toBeRejected();
    });

    verifyFailsAsync(function(env) {
      return env.expectAsync(Promise.resolve()).toBeRejected();
    });
  });

  describe('toBeRejectedWith', function() {
    verifyPassesAsync(function(env) {
      env.addCustomEqualityTester(function(a, b) {
        return a.toString() === b.toString();
      });
      return env.expectAsync(Promise.reject('5')).toBeRejectedWith(5);
    });

    verifyFailsAsync(function(env) {
      return env.expectAsync(Promise.resolve()).toBeRejectedWith('nope');
    });

    verifyFailsWithCustomObjectFormattersAsync({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        return env.expectAsync(Promise.reject('x')).toBeRejectedWith('y');
      },
      expectedMessage:
        'Expected a promise to be rejected with |y| ' +
        'but it was rejected with |x|.'
    });
  });

  describe('toBeRejectedWithError', function() {
    verifyPassesAsync(function(env) {
      return env
        .expectAsync(Promise.reject(new Error()))
        .toBeRejectedWithError(Error);
    });

    verifyFailsAsync(function(env) {
      return env.expectAsync(Promise.resolve()).toBeRejectedWithError(Error);
    });

    verifyFailsWithCustomObjectFormattersAsync({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        return env
          .expectAsync(Promise.reject('foo'))
          .toBeRejectedWithError('foo');
      },
      expectedMessage:
        'Expected a promise to be rejected with Error: |foo| ' +
        'but it was rejected with |foo|.'
    });
  });

  describe('toBeTrue', function() {
    verifyPasses(function(env) {
      env.expect(true).toBeTrue();
    });

    verifyFails(function(env) {
      env.expect(false).toBeTrue();
    });
  });

  describe('toBeTruthy', function() {
    verifyPasses(function(env) {
      env.expect(true).toBeTruthy();
    });

    verifyFails(function(env) {
      env.expect(false).toBeTruthy();
    });
  });

  describe('toBeUndefined', function() {
    verifyPasses(function(env) {
      env.expect(undefined).toBeUndefined();
    });

    verifyFails(function(env) {
      env.expect(1).toBeUndefined();
    });
  });

  describe('toContain', function() {
    verifyPasses(function(env) {
      env.addCustomEqualityTester(function(a, b) {
        return a.toString() === b.toString();
      });
      env.expect(['1', '2', '3']).toContain(2);
    });

    verifyFails(function(env) {
      env.expect('bar').toContain('oo');
    });
  });

  describe('toEqual', function() {
    verifyPasses(function(env) {
      env.addCustomEqualityTester(function(a, b) {
        return a.toString() === b.toString();
      });
      env.expect(5).toEqual('5');
    });

    verifyFails(function(env) {
      env.expect('a').toEqual('b');
    });

    verifyFailsWithCustomObjectFormatters({
      formatter: function(val) {
        if (val === 5) {
          return 'five';
        } else if (val === 4) {
          return 'four';
        }
      },
      expectations: function(env) {
        env.expect([{ foo: 4 }]).toEqual([{ foo: 5 }]);
      },
      expectedMessage: 'Expected $[0].foo = four to equal five.'
    });
  });

  describe('toHaveSize', function() {
    verifyPasses(function(env) {
      env.expect(['a', 'b']).toHaveSize(2);
    });

    verifyFails(function(env) {
      env.expect(['a', 'b']).toHaveSize(1);
    });
  });

  describe('toHaveBeenCalled', function() {
    verifyPasses(function(env) {
      const spy = env.createSpy('spy');
      spy();
      env.expect(spy).toHaveBeenCalled();
    });

    verifyFails(function(env) {
      const spy = env.createSpy('spy');
      env.expect(spy).toHaveBeenCalled();
    });
  });

  describe('toHaveBeenCalledBefore', function() {
    verifyPasses(function(env) {
      const a = env.createSpy('a'),
        b = env.createSpy('b');
      a();
      b();
      env.expect(a).toHaveBeenCalledBefore(b);
    });

    verifyFails(function(env) {
      const a = env.createSpy('a'),
        b = env.createSpy('b');
      b();
      a();
      env.expect(a).toHaveBeenCalledBefore(b);
    });
  });

  describe('toHaveBeenCalledTimes', function() {
    verifyPasses(function(env) {
      const spy = env.createSpy('spy');
      spy();
      env.expect(spy).toHaveBeenCalledTimes(1);
    });

    verifyFails(function(env) {
      const spy = env.createSpy('spy');
      env.expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('toHaveBeenCalledWith', function() {
    verifyPasses(function(env) {
      const spy = env.createSpy();
      spy('5');
      env.addCustomEqualityTester(function(a, b) {
        return a.toString() === b.toString();
      });
      env.expect(spy).toHaveBeenCalledWith(5);
    });

    verifyFails(function(env) {
      const spy = env.createSpy();
      env.expect(spy).toHaveBeenCalledWith('foo');
    });

    verifyFailsWithCustomObjectFormatters({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        const spy = env.createSpy('foo');
        env.expect(spy).toHaveBeenCalledWith('x');
      },
      expectedMessage:
        'Expected spy foo to have been called with:\n' +
        '  |x|\n' +
        'but it was never called.'
    });
  });

  describe('toHaveBeenCalledOnceWith', function() {
    verifyPasses(function(env) {
      const spy = env.createSpy();
      spy('5', 3);
      env.addCustomEqualityTester(function(a, b) {
        return a.toString() === b.toString();
      });
      env.expect(spy).toHaveBeenCalledOnceWith(5, 3);
    });

    verifyFails(function(env) {
      const spy = env.createSpy();
      env.expect(spy).toHaveBeenCalledOnceWith(5, 3);
    });
  });

  describe('toHaveClass', function() {
    beforeEach(function() {
      this.domHelpers = jasmine.getEnv().domHelpers();
    });

    verifyPasses(function(env) {
      const domHelpers = jasmine.getEnv().domHelpers();
      const el = domHelpers.createElementWithClassName('foo');
      env.expect(el).toHaveClass('foo');
    });

    verifyFails(function(env) {
      const domHelpers = jasmine.getEnv().domHelpers();
      const el = domHelpers.createElementWithClassName('foo');
      env.expect(el).toHaveClass('bar');
    });
  });

  describe('toHaveSpyInteractions', function() {
    let spyObj;
    beforeEach(function() {
      spyObj = env.createSpyObj('NewClass', ['spyA', 'spyB']);
      spyObj.otherMethod = function() {};
    });

    verifyPasses(function(env) {
      spyObj.spyA();
      env.expect(spyObj).toHaveSpyInteractions();
    });

    verifyFails(function(env) {
      env.expect(spyObj).toHaveSpyInteractions();
    });

    verifyFails(function(env) {
      spyObj.otherMethod();
      env.expect(spyObj).toHaveSpyInteractions();
    });
  });

  describe('toMatch', function() {
    verifyPasses(function(env) {
      env.expect('foo').toMatch(/oo$/);
    });

    verifyFails(function(env) {
      env.expect('bar').toMatch(/oo$/);
    });
  });

  describe('toThrow', function() {
    verifyPasses(function(env) {
      env.addCustomEqualityTester(function(a, b) {
        return a.toString() === b.toString();
      });
      env
        .expect(function() {
          throw '5';
        })
        .toThrow(5);
    });

    verifyFails(function(env) {
      env.expect(function() {}).toThrow();
    });

    verifyFailsWithCustomObjectFormatters({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        env
          .expect(function() {
            throw 'x';
          })
          .not.toThrow();
      },
      expectedMessage: 'Expected function not to throw, but it threw |x|.'
    });
  });

  describe('toThrowError', function() {
    verifyPasses(function(env) {
      env
        .expect(function() {
          throw new Error();
        })
        .toThrowError();
    });

    verifyFails(function(env) {
      env.expect(function() {}).toThrowError();
    });

    verifyFailsWithCustomObjectFormatters({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        env
          .expect(function() {
            throw 'x';
          })
          .toThrowError();
      },
      expectedMessage: 'Expected function to throw an Error, but it threw |x|.'
    });
  });

  describe('toThrowMatching', function() {
    function throws() {
      throw new Error('nope');
    }

    verifyPasses(function(env) {
      env.expect(throws).toThrowMatching(function() {
        return true;
      });
    });

    verifyFails(function(env) {
      env.expect(throws).toThrowMatching(function() {
        return false;
      });
    });

    verifyFailsWithCustomObjectFormatters({
      formatter: function(val) {
        return '|' + val + '|';
      },
      expectations: function(env) {
        env
          .expect(function() {
            throw new Error('nope');
          })
          .toThrowMatching(function() {
            return false;
          });
      },
      expectedMessage:
        'Expected function to throw an exception matching ' +
        'a predicate, but it threw Error with message |nope|.'
    });
  });

  describe('When an async matcher is used with .already()', function() {
    it('propagates the matcher result when the promise is resolved', async function() {
      env.it('a spec', function() {
        return env.expectAsync(Promise.resolve()).already.toBeRejected();
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(1);
      expect(result.failedExpectations[0].message).toEqual(
        'Expected [object Promise] to be rejected.'
      );
      expect(result.failedExpectations[0].matcherName)
        .withContext('Matcher name')
        .not.toEqual('');
    });

    it('propagates the matcher result when the promise is rejected', async function() {
      env.it('a spec', function() {
        return env
          .expectAsync(Promise.reject(new Error('nope')))
          .already.toBeResolved();
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(1);
      expect(result.failedExpectations[0].message).toEqual(
        'Expected a promise to be resolved but it was ' +
          'rejected with Error: nope.'
      );
      expect(result.failedExpectations[0].matcherName)
        .withContext('Matcher name')
        .not.toEqual('');
    });

    it('fails when the promise is pending', async function() {
      const promise = new Promise(function() {});

      env.it('a spec', function() {
        return env.expectAsync(promise).already.toBeResolved();
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await env.execute();

      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const result = reporter.specDone.calls.argsFor(0)[0];
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations.length)
        .withContext('Number of failed expectations')
        .toEqual(1);
      expect(result.failedExpectations[0].message).toEqual(
        'Expected a promise to be settled ' +
          '(via expectAsync(...).already) but it was pending.'
      );
      expect(result.failedExpectations[0].matcherName)
        .withContext('Matcher name')
        .not.toEqual('');
    });
  });
});
