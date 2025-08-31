describe('Spec', function() {
  it('#isPendingSpecException returns true for a pending spec exception', function() {
    const e = new Error(jasmineUnderTest.Spec.pendingSpecExceptionMessage);

    expect(jasmineUnderTest.Spec.isPendingSpecException(e)).toBe(true);
  });

  it('#isPendingSpecException returns true for a pending spec exception (even when FF bug is present)', function() {
    const fakeError = {
      toString: function() {
        return 'Error: ' + jasmineUnderTest.Spec.pendingSpecExceptionMessage;
      }
    };

    expect(jasmineUnderTest.Spec.isPendingSpecException(fakeError)).toBe(true);
  });

  it('#isPendingSpecException returns true for a pending spec exception with a custom message', function() {
    expect(
      jasmineUnderTest.Spec.isPendingSpecException(
        jasmineUnderTest.Spec.pendingSpecExceptionMessage + 'foo'
      )
    ).toBe(true);
  });

  it('#isPendingSpecException returns false for not a pending spec exception', function() {
    const e = new Error('foo');

    expect(jasmineUnderTest.Spec.isPendingSpecException(e)).toBe(false);
  });

  it("#isPendingSpecException returns false for thrown values that don't have toString", function() {
    expect(jasmineUnderTest.Spec.isPendingSpecException(void 0)).toBe(false);
  });

  describe('#executionFinished', function() {
    it('removes the fn if autoCleanClosures is true', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} },
        autoCleanClosures: true
      });

      spec.executionFinished();
      expect(spec.queueableFn.fn).toBeFalsy();
    });

    it('removes the fn after execution if autoCleanClosures is undefined', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} },
        autoCleanClosures: undefined
      });

      spec.executionFinished();
      expect(spec.queueableFn.fn).toBeFalsy();
    });

    it('does not remove the fn after execution if autoCleanClosures is false', function() {
      function originalFn() {}
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: originalFn },
        autoCleanClosures: false
      });

      spec.executionFinished();
      expect(spec.queueableFn.fn).toBe(originalFn);
    });
  });

  describe('#getSpecProperty', function() {
    it('get the property value', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} }
      });

      spec.setSpecProperty('a', 4);
      expect(spec.getSpecProperty('a')).toBe(4);
    });
  });

  describe('#setSpecProperty', function() {
    it('adds the property to the result', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} }
      });

      spec.setSpecProperty('a', 4);

      expect(spec.result.properties).toEqual({ a: 4 });
    });

    it('replace the property result when it was previously set', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} }
      });

      spec.setSpecProperty('a', 'original-value');
      spec.setSpecProperty('b', 'original-value');
      spec.setSpecProperty('a', 'new-value');

      expect(spec.result.properties).toEqual({
        a: 'new-value',
        b: 'original-value'
      });
    });
  });

  describe('status', function() {
    it('is "passed" by default', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} }
      });
      expect(spec.getResult().status).toBe('passed');
    });

    it('is "passed" if all expectations passed', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} }
      });

      spec.addExpectationResult(true, {});

      expect(spec.getResult().status).toBe('passed');
    });

    it('is "failed" if any expectation failed', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} }
      });

      spec.addExpectationResult(true, {});
      spec.addExpectationResult(false, {});

      expect(spec.getResult().status).toBe('failed');
    });

    it('is "pending" if created without a function body', function() {
      const startCallback = jasmine.createSpy('startCallback'),
        resultCallback = jasmine.createSpy('resultCallback'),
        spec = new jasmineUnderTest.Spec({
          onStart: startCallback,
          queueableFn: { fn: null },
          resultCallback: resultCallback
        });

      expect(spec.getResult().status).toBe('pending');
    });
  });

  describe('#addExpectationResult', function() {
    it('keeps track of passed and failed expectations', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} }
      });

      spec.addExpectationResult(true, { message: 'expectation1' });
      spec.addExpectationResult(false, { message: 'expectation2' });

      expect(spec.result.passedExpectations).toEqual([
        jasmine.objectContaining({ message: 'expectation1' })
      ]);
      expect(spec.result.failedExpectations).toEqual([
        jasmine.objectContaining({ message: 'expectation2' })
      ]);
    });

    describe("when 'throwOnExpectationFailure' is set", function() {
      it('throws an ExpectationFailed error', function() {
        const spec = new jasmineUnderTest.Spec({
          queueableFn: { fn: () => {} },
          throwOnExpectationFailure: true
        });

        spec.addExpectationResult(true, { message: 'passed' });
        expect(function() {
          spec.addExpectationResult(false, { message: 'failed' });
        }).toThrowError(jasmineUnderTest.errors.ExpectationFailed);

        expect(spec.result.failedExpectations).toEqual([
          jasmine.objectContaining({ message: 'failed' })
        ]);
      });
    });

    describe("when 'throwOnExpectationFailure' is not set", function() {
      it('does not throw', function() {
        const spec = new jasmineUnderTest.Spec({
          queueableFn: { fn: () => {} }
        });

        spec.addExpectationResult(false, { message: 'failed' });

        expect(spec.result.failedExpectations).toEqual([
          jasmine.objectContaining({ message: 'failed' })
        ]);
      });
    });
  });

  it('forwards late expectation failures to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const spec = new jasmineUnderTest.Spec({
      onLateError,
      queueableFn: { fn: function() {} }
    });
    const data = {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: new Error('nope')
    };

    spec.reportedDone = true;
    spec.addExpectationResult(false, data, true);

    expect(onLateError).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: jasmine.stringMatching(/^Error: nope/)
      })
    );
    expect(spec.result.failedExpectations).toEqual([]);
  });

  it('does not forward non-late expectation failures to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const spec = new jasmineUnderTest.Spec({
      onLateError,
      queueableFn: { fn: function() {} }
    });
    const data = {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: new Error('nope')
    };

    spec.addExpectationResult(false, data, true);

    expect(onLateError).not.toHaveBeenCalled();
  });

  it('forwards late handleException calls to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const spec = new jasmineUnderTest.Spec({
      onLateError,
      queueableFn: { fn: function() {} }
    });

    spec.reportedDone = true;
    spec.handleException(new Error('oops'));

    expect(onLateError).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: jasmine.stringMatching(/^Error: oops/)
      })
    );
    expect(spec.result.failedExpectations).toEqual([]);
  });

  it('does not forward non-late handleException calls to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const spec = new jasmineUnderTest.Spec({
      onLateError,
      queueableFn: { fn: function() {} }
    });
    const error = new Error('oops');

    spec.handleException(error);

    expect(onLateError).not.toHaveBeenCalled();
    expect(spec.result.failedExpectations.length).toEqual(1);
  });

  it('clears the reportedDone flag when reset', function() {
    const spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: function() {} }
    });
    spec.reportedDone = true;

    spec.reset();

    expect(spec.reportedDone).toBeFalse();
  });

  it('does not throw an ExpectationFailed error when handling an error', function() {
    const resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        resultCallback: resultCallback,
        throwOnExpectationFailure: true
      });

    spec.handleException('failing exception');
  });

  it('can return its full name', function() {
    const getPath = jasmine
      .createSpy('getPath')
      .and.returnValue(['expected', 'val']);

    const spec = new jasmineUnderTest.Spec({
      getPath,
      queueableFn: { fn: null }
    });

    expect(spec.getFullName()).toBe('expected val');
    expect(getPath.calls.mostRecent().args[0]).toBe(spec);
  });

  it('can return its full path', function() {
    const getPath = jasmine
      .createSpy('getPath')
      .and.returnValue(['expected val']);

    const spec = new jasmineUnderTest.Spec({
      getPath,
      queueableFn: { fn: null }
    });

    expect(spec.getPath()).toEqual(['expected val']);
    expect(getPath.calls.mostRecent().args[0]).toBe(spec);

    expect(spec.metadata.getPath()).toEqual(['expected val']);
  });

  describe('#handleException', function() {
    it('records a failure', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: {}
      });

      spec.handleException('foo');

      expect(spec.result.failedExpectations).toEqual([
        {
          message: 'foo thrown',
          matcherName: '',
          passed: false,
          expected: '',
          actual: '',
          stack: null
        }
      ]);
    });

    it('does not record an additional failure when the error is ExpectationFailed', function() {
      const spec = new jasmineUnderTest.Spec({
        queueableFn: {}
      });

      spec.handleException(new jasmineUnderTest.errors.ExpectationFailed());

      expect(spec.result.failedExpectations).toEqual([]);
    });
  });

  describe('#debugLog', function() {
    it('adds the messages to the result', function() {
      const timer = jasmine.createSpyObj('timer', ['start', 'elapsed']);
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: () => {} },
        timer: timer
      });
      const t1 = 123;
      const t2 = 456;

      expect(spec.result.debugLogs).toBeNull();
      timer.elapsed.and.returnValue(t1);
      spec.debugLog('msg 1');
      expect(spec.result.debugLogs).toEqual([
        { message: 'msg 1', timestamp: t1 }
      ]);
      timer.elapsed.and.returnValue(t2);
      spec.debugLog('msg 2');
      expect(spec.result.debugLogs).toEqual([
        { message: 'msg 1', timestamp: t1 },
        { message: 'msg 2', timestamp: t2 }
      ]);
    });

    describe('When the spec passes', function() {
      it('removes the logs from the result', function() {
        const spec = new jasmineUnderTest.Spec({
          queueableFn: { fn: () => {} }
        });

        spec.debugLog('msg');
        spec.executionFinished();

        expect(spec.result.debugLogs).toBeNull();
      });
    });

    describe('When the spec fails', function() {
      it('includes the messages in the result', function() {
        const timer = jasmine.createSpyObj('timer', ['start', 'elapsed']);
        const spec = new jasmineUnderTest.Spec({
          queueableFn: { fn: () => {} },
          timer: timer
        });
        const timestamp = 12345;

        timer.elapsed.and.returnValue(timestamp);

        spec.debugLog('msg');
        spec.handleException(new Error('nope'));
        spec.executionFinished();

        expect(spec.result.debugLogs).toEqual([
          { message: 'msg', timestamp: timestamp }
        ]);
      });
    });
  });
});
