describe('Matchers (Integration)', function() {
  function verifyPasses(expectations) {
    it('passes', function(done) {
      var env = new jasmineUnderTest.Env();
      env.it('a spec', function() {
        expectations(env);
      });

      var specExpectations = function(result) {
        expect(result.status).toEqual('passed');
        expect(result.passedExpectations.length)
          .withContext('Number of passed expectations')
          .toEqual(1);
        expect(result.failedExpectations.length)
          .withContext('Number of failed expectations')
          .toEqual(0);
        expect(result.failedExpectations[0] && result.failedExpectations[0].message)
          .withContext('Failure message')
          .toBeUndefined();
      };

      env.addReporter({ specDone: specExpectations, jasmineDone: done });
      env.execute();
    });
  }

  function verifyFails(expectations) {
    it('fails', function(done) {
      var env = new jasmineUnderTest.Env();
      env.it('a spec', function() {
        expectations(env);
      });

      var specExpectations = function(result) {
        expect(result.status).toEqual('failed');
        expect(result.failedExpectations.length)
          .withContext('Number of failed expectations')
          .toEqual(1);
        expect(result.failedExpectations[0].message)
          .withContext('Failed with a thrown error rather than a matcher failure')
          .not.toMatch(/^Error: /);
        expect(result.failedExpectations[0].matcherName).withContext('Matcher name')
          .not.toEqual('');
      };

      env.addReporter({ specDone: specExpectations, jasmineDone: done });
      env.execute();
    });
  }

  function verifyPassesAsync(expectations) {
    it('passes', function(done) {
      jasmine.getEnv().requirePromises();
      var env = new jasmineUnderTest.Env();

      env.it('a spec', function() {
        return expectations(env);
      });

      var specExpectations = function(result) {
        expect(result.status).toEqual('passed');
        expect(result.passedExpectations.length)
          .withContext('Number of passed expectations')
          .toEqual(1);
        expect(result.failedExpectations.length)
          .withContext('Number of failed expectations')
          .toEqual(0);
        expect(result.failedExpectations[0] && result.failedExpectations[0].message)
          .withContext('Failure message')
          .toBeUndefined();
      };

      env.addReporter({ specDone: specExpectations, jasmineDone: done });
      env.execute();
    });
  }

  function verifyFailsAsync(expectations) {
    it('fails', function(done) {
      var env = new jasmineUnderTest.Env();
      jasmine.getEnv().requirePromises();

      env.it('a spec', function() {
        return expectations(env);
      });

      var specExpectations = function(result) {
        expect(result.status).toEqual('failed');
        expect(result.failedExpectations.length)
          .withContext('Number of failed expectations')
          .toEqual(1);
        expect(result.failedExpectations[0].message)
          .withContext('Failed with a thrown error rather than a matcher failure')
          .not.toMatch(/^Error: /);
        expect(result.failedExpectations[0].matcherName).withContext('Matcher name')
          .not.toEqual('');
      };

      env.addReporter({ specDone: specExpectations, jasmineDone: done });
      env.execute();
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
  });

  describe('toBeNegativeInfinity', function() {
    verifyPasses(function(env) {
      env.expect(Number.NEGATIVE_INFINITY).toBeNegativeInfinity();
    });

    verifyFails(function(env) {
      env.expect(2).toBeNegativeInfinity();
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
      return env.expectAsync(Promise.resolve('foo')).toBeResolvedTo('foo');
    });

    verifyFailsAsync(function(env) {
      return env.expectAsync(Promise.resolve('foo')).toBeResolvedTo('bar');
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
      return env.expectAsync(Promise.reject('nope')).toBeRejectedWith('nope');
    });

    verifyFailsAsync(function(env) {
      return env.expectAsync(Promise.resolve()).toBeRejectedWith('nope');
    });
  });

  describe('toBeRejectedWithError', function() {
    verifyPassesAsync(function(env) {
      return env.expectAsync(Promise.reject(new Error())).toBeRejectedWithError(Error);
    });

    verifyFailsAsync(function(env) {
      return env.expectAsync(Promise.resolve()).toBeRejectedWithError(Error);
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
      env.expect('foobar').toContain('oo');
    });

    verifyFails(function(env) {
      env.expect('bar').toContain('oo');
    });
  });

  describe('toEqual', function() {
    verifyPasses(function(env) {
      env.expect('a').toEqual('a');
    });

    verifyFails(function(env) {
      env.expect('a').toEqual('b');
    });
  });

  describe('toHaveBeenCalled', function() {
    verifyPasses(function(env) {
      var spy = env.createSpy('spy');
      spy();
      env.expect(spy).toHaveBeenCalled();
    });

    verifyFails(function(env) {
      var spy = env.createSpy('spy');
      env.expect(spy).toHaveBeenCalled();
    });
  });

  describe('toHaveBeenCalledBefore', function() {
    verifyPasses(function(env) {
      var a = env.createSpy('a'), b = env.createSpy('b');
      a();
      b();
      env.expect(a).toHaveBeenCalledBefore(b);
    });

    verifyFails(function(env) {
      var a = env.createSpy('a'), b = env.createSpy('b');
      b();
      a();
      env.expect(a).toHaveBeenCalledBefore(b);
    });
  });

  describe('toHaveBeenCalledTimes', function() {
    verifyPasses(function(env) {
      var spy = env.createSpy('spy');
      spy();
      env.expect(spy).toHaveBeenCalledTimes(1);
    });

    verifyFails(function(env) {
      var spy = env.createSpy('spy');
      env.expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('toHaveBeenCalledWith', function() {
    verifyPasses(function(env) {
      var spy = env.createSpy();
      spy('foo');
      env.expect(spy).toHaveBeenCalledWith('foo');
    });

    verifyFails(function(env) {
      var spy = env.createSpy();
      env.expect(spy).toHaveBeenCalledWith('foo');
    });
  });

  describe('toHaveClass', function() {
    beforeEach(function() {
      this.domHelpers = jasmine.getEnv().domHelpers();
    });

    verifyPasses(function(env) {
      var domHelpers = jasmine.getEnv().domHelpers();
      var el = domHelpers.createElementWithClassName('foo');
      env.expect(el).toHaveClass('foo');
    });

    verifyFails(function(env) {
      var domHelpers = jasmine.getEnv().domHelpers();
      var el = domHelpers.createElementWithClassName('foo');
      env.expect(el).toHaveClass('bar');
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
      env.expect(function() { throw new Error(); }).toThrow();
    });

    verifyFails(function(env) {
      env.expect(function() {}).toThrow();
    });
  });

  describe('toThrowError', function() {
    verifyPasses(function(env) {
      env.expect(function() { throw new Error(); }).toThrowError();
    });

    verifyFails(function(env) {
      env.expect(function() { }).toThrowError();
    });
  });

  describe('toThrowMatching', function() {
    function throws() {
      throw new Error('nope');
    }

    verifyPasses(function(env) {
      env.expect(throws).toThrowMatching(function() { return true; });
    });

    verifyFails(function(env) {
      env.expect(throws).toThrowMatching(function() { return false; });
    });
  });
});
