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

  it('delegates execution to a QueueRunner', function() {
    const fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      spec = new jasmineUnderTest.Spec({
        description: 'my test',
        id: 'some-id',
        queueableFn: { fn: function() {} },
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    expect(fakeQueueRunner).toHaveBeenCalled();
  });

  it('should call the start callback on execution', function() {
    const fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      spec = new jasmineUnderTest.Spec({
        id: 123,
        description: 'foo bar',
        queueableFn: { fn: function() {} },
        onStart: startCallback,
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    fakeQueueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(startCallback).toHaveBeenCalled();
    expect(startCallback.calls.first().object).toEqual(spec);
  });

  it('should call the start callback on execution but before any befores are called', function() {
    const fakeQueueRunner = jasmine.createSpy('fakeQueueRunner');
    let beforesWereCalled = false;
    const startCallback = jasmine
      .createSpy('start-callback')
      .and.callFake(function() {
        expect(beforesWereCalled).toBe(false);
      });
    const spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: function() {} },
      beforeFns: function() {
        return [
          function() {
            beforesWereCalled = true;
          }
        ];
      },
      onStart: startCallback,
      queueRunnerFactory: fakeQueueRunner
    });

    spec.execute();

    fakeQueueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(startCallback).toHaveBeenCalled();
  });

  it('provides all before fns and after fns to be run', function() {
    const fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      before = jasmine.createSpy('before'),
      after = jasmine.createSpy('after'),
      queueableFn = {
        fn: jasmine.createSpy('test body').and.callFake(function() {
          expect(before).toHaveBeenCalled();
          expect(after).not.toHaveBeenCalled();
        })
      },
      spec = new jasmineUnderTest.Spec({
        queueableFn: queueableFn,
        beforeAndAfterFns: function() {
          return { befores: [before], afters: [after] };
        },
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    const options = fakeQueueRunner.calls.mostRecent().args[0];
    expect(options.queueableFns).toEqual([
      { fn: jasmine.any(Function) },
      before,
      queueableFn,
      after,
      {
        fn: jasmine.any(Function),
        type: 'specCleanup'
      }
    ]);
  });

  it("tells the queue runner that it's a leaf node", function() {
    const fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        beforeAndAfterFns: function() {
          return { befores: [], afters: [] };
        },
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    expect(fakeQueueRunner).toHaveBeenCalledWith(
      jasmine.objectContaining({
        isLeaf: true
      })
    );
  });

  it('is marked pending if created without a function body', function() {
    const fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        onStart: startCallback,
        queueableFn: { fn: null },
        resultCallback: resultCallback,
        queueRunnerFactory: fakeQueueRunner
      });

    expect(spec.status()).toBe('pending');
  });

  it('can be excluded at execution time by a parent', function() {
    const fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      specBody = jasmine.createSpy('specBody'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        onStart: startCallback,
        queueableFn: { fn: specBody },
        resultCallback: resultCallback,
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute('cally-back', true);

    expect(fakeQueueRunner).toHaveBeenCalledWith(
      jasmine.objectContaining({
        onComplete: jasmine.any(Function),
        queueableFns: [
          { fn: jasmine.any(Function) },
          {
            fn: jasmine.any(Function),
            type: 'specCleanup'
          }
        ]
      })
    );
    expect(specBody).not.toHaveBeenCalled();

    const args = fakeQueueRunner.calls.mostRecent().args[0];
    args.queueableFns[0].fn();
    expect(startCallback).toHaveBeenCalled();
    args.queueableFns[args.queueableFns.length - 1].fn();
    expect(resultCallback).toHaveBeenCalled();

    expect(spec.result.status).toBe('excluded');
  });

  it('can be marked pending, but still calls callbacks when executed', function() {
    const fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        onStart: startCallback,
        resultCallback: resultCallback,
        description: 'with a spec',
        getSpecName: function() {
          return 'a suite with a spec';
        },
        queueRunnerFactory: fakeQueueRunner,
        queueableFn: { fn: null }
      });

    spec.pend();

    expect(spec.status()).toBe('pending');

    spec.execute();

    expect(fakeQueueRunner).toHaveBeenCalled();

    const args = fakeQueueRunner.calls.mostRecent().args[0];
    args.queueableFns[0].fn();
    expect(startCallback).toHaveBeenCalled();
    args.queueableFns[1].fn('things');
    expect(resultCallback).toHaveBeenCalledWith(
      {
        id: spec.id,
        status: 'pending',
        description: 'with a spec',
        fullName: 'a suite with a spec',
        failedExpectations: [],
        passedExpectations: [],
        deprecationWarnings: [],
        pendingReason: '',
        duration: jasmine.any(Number),
        properties: null,
        debugLogs: null
      },
      'things'
    );
  });

  it('should call the done callback on execution complete', function() {
    const done = jasmine.createSpy('done callback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        catchExceptions: function() {
          return false;
        },
        resultCallback: function() {},
        queueRunnerFactory: function(attrs) {
          attrs.onComplete();
        }
      });

    spec.execute(done);

    expect(done).toHaveBeenCalled();
  });

  it('should call the done callback with an error if the spec is failed', function() {
    const done = jasmine.createSpy('done callback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        catchExceptions: function() {
          return false;
        },
        resultCallback: function() {},
        queueRunnerFactory: function(attrs) {
          spec.result.status = 'failed';
          attrs.onComplete();
        }
      });

    spec.execute(done);

    expect(done).toHaveBeenCalledWith(
      jasmine.any(jasmineUnderTest.StopExecutionError)
    );
  });

  it('should report the duration of the test', function() {
    const timer = jasmine.createSpyObj('timer', {
      start: null,
      elapsed: 77000
    });
    let duration = undefined;
    const spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: jasmine.createSpy('spec body') },
      catchExceptions: function() {
        return false;
      },
      resultCallback: function(result) {
        duration = result.duration;
      },
      queueRunnerFactory: function(config) {
        config.queueableFns.forEach(function(qf) {
          qf.fn();
        });
        config.onComplete();
      },
      timer: timer
    });

    spec.execute(function() {});
    expect(duration).toBe(77000);
  });

  it('should report properties set during the test', function() {
    const done = jasmine.createSpy('done callback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: jasmine.createSpy('spec body') },
        catchExceptions: function() {
          return false;
        },
        resultCallback: function() {},
        queueRunnerFactory: function(attrs) {
          attrs.onComplete();
        }
      });
    spec.setSpecProperty('a', 4);
    spec.execute(done);
    expect(spec.result.properties).toEqual({ a: 4 });
  });

  it('#status returns passing by default', function() {
    const spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: jasmine.createSpy('spec body') }
    });
    expect(spec.status()).toBe('passed');
  });

  it('#status returns passed if all expectations in the spec have passed', function() {
    const spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: jasmine.createSpy('spec body') }
    });
    spec.addExpectationResult(true);
    expect(spec.status()).toBe('passed');
  });

  it('#status returns failed if any expectations in the spec have failed', function() {
    const spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: jasmine.createSpy('spec body') }
    });
    spec.addExpectationResult(true);
    spec.addExpectationResult(false);
    expect(spec.status()).toBe('failed');
  });

  it('keeps track of passed and failed expectations', function() {
    const fakeQueueRunner = jasmine.createSpy('queueRunner'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: jasmine.createSpy('spec body') },
        expectationResultFactory: function(data) {
          return data;
        },
        queueRunnerFactory: fakeQueueRunner,
        resultCallback: resultCallback
      });
    spec.addExpectationResult(true, 'expectation1');
    spec.addExpectationResult(false, 'expectation2');

    spec.execute();

    const fns = fakeQueueRunner.calls.mostRecent().args[0].queueableFns;
    fns[fns.length - 1].fn();

    expect(resultCallback.calls.first().args[0].passedExpectations).toEqual([
      'expectation1'
    ]);
    expect(resultCallback.calls.first().args[0].failedExpectations).toEqual([
      'expectation2'
    ]);
  });

  it("throws an ExpectationFailed error upon receiving a failed expectation when 'throwOnExpectationFailure' is set", function() {
    const fakeQueueRunner = jasmine.createSpy('queueRunner'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        expectationResultFactory: function(data) {
          return data;
        },
        queueRunnerFactory: fakeQueueRunner,
        resultCallback: resultCallback,
        throwOnExpectationFailure: true
      });

    spec.addExpectationResult(true, 'passed');
    expect(function() {
      spec.addExpectationResult(false, 'failed');
    }).toThrowError(jasmineUnderTest.errors.ExpectationFailed);

    spec.execute();

    const fns = fakeQueueRunner.calls.mostRecent().args[0].queueableFns;
    fns[fns.length - 1].fn();
    expect(resultCallback.calls.first().args[0].passedExpectations).toEqual([
      'passed'
    ]);
    expect(resultCallback.calls.first().args[0].failedExpectations).toEqual([
      'failed'
    ]);
  });

  it('forwards late expectation failures to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const expectationResultFactory = jasmine
      .createSpy('expectationResultFactory')
      .and.returnValue('built expectation result');
    const spec = new jasmineUnderTest.Spec({
      expectationResultFactory,
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

    expect(expectationResultFactory).toHaveBeenCalledWith(data);
    expect(onLateError).toHaveBeenCalledWith('built expectation result');
    expect(spec.result.failedExpectations).toEqual([]);
  });

  it('does not forward non-late expectation failures to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const spec = new jasmineUnderTest.Spec({
      expectationResultFactory: r => r,
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
    const expectationResultFactory = jasmine
      .createSpy('expectationResultFactory')
      .and.returnValue('built expectation result');
    const spec = new jasmineUnderTest.Spec({
      expectationResultFactory,
      onLateError,
      queueableFn: { fn: function() {} }
    });
    const error = new Error('oops');

    spec.reportedDone = true;
    spec.handleException(error);

    expect(expectationResultFactory).toHaveBeenCalledWith({
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error
    });
    expect(onLateError).toHaveBeenCalledWith('built expectation result');
    expect(spec.result.failedExpectations).toEqual([]);
  });

  it('does not forward non-late handleException calls to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const spec = new jasmineUnderTest.Spec({
      expectationResultFactory: r => r,
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
      expectationResultFactory: r => r,
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
        expectationResultFactory: function(data) {
          return data;
        },
        queueRunnerFactory: function(attrs) {
          attrs.onComplete();
        },
        resultCallback: resultCallback,
        throwOnExpectationFailure: true
      });

    spec.handleException('failing exception');
  });

  it('can return its full name', function() {
    const specNameSpy = jasmine
      .createSpy('specNameSpy')
      .and.returnValue('expected val');

    const spec = new jasmineUnderTest.Spec({
      getSpecName: specNameSpy,
      queueableFn: { fn: null }
    });

    expect(spec.getFullName()).toBe('expected val');
    expect(specNameSpy.calls.mostRecent().args[0].id).toEqual(spec.id);
  });

  describe('when a spec is marked pending during execution', function() {
    it('should mark the spec as pending', function() {
      const fakeQueueRunner = function(opts) {
          opts.onException(
            new Error(jasmineUnderTest.Spec.pendingSpecExceptionMessage)
          );
        },
        spec = new jasmineUnderTest.Spec({
          description: 'my test',
          id: 'some-id',
          queueableFn: { fn: function() {} },
          queueRunnerFactory: fakeQueueRunner
        });

      spec.execute();

      expect(spec.status()).toEqual('pending');
      expect(spec.result.pendingReason).toEqual('');
    });

    it('should set the pendingReason', function() {
      const fakeQueueRunner = function(opts) {
          opts.onException(
            new Error(
              jasmineUnderTest.Spec.pendingSpecExceptionMessage +
                'custom message'
            )
          );
        },
        spec = new jasmineUnderTest.Spec({
          description: 'my test',
          id: 'some-id',
          queueableFn: { fn: function() {} },
          queueRunnerFactory: fakeQueueRunner
        });

      spec.execute();

      expect(spec.status()).toEqual('pending');
      expect(spec.result.pendingReason).toEqual('custom message');
    });
  });

  it('should log a failure when handling an exception', function() {
    const fakeQueueRunner = jasmine.createSpy('queueRunner'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        expectationResultFactory: function(data) {
          return data;
        },
        queueRunnerFactory: fakeQueueRunner,
        resultCallback: resultCallback
      });

    spec.handleException('foo');
    spec.execute();

    const args = fakeQueueRunner.calls.mostRecent().args[0];
    args.queueableFns[args.queueableFns.length - 1].fn();
    expect(resultCallback.calls.first().args[0].failedExpectations).toEqual([
      {
        error: 'foo',
        matcherName: '',
        passed: false,
        expected: '',
        actual: ''
      }
    ]);
  });

  it('should not log an additional failure when handling an ExpectationFailed error', function() {
    const fakeQueueRunner = jasmine.createSpy('queueRunner'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        expectationResultFactory: function(data) {
          return data;
        },
        queueRunnerFactory: fakeQueueRunner,
        resultCallback: resultCallback
      });

    spec.handleException(new jasmineUnderTest.errors.ExpectationFailed());
    spec.execute();

    const args = fakeQueueRunner.calls.mostRecent().args[0];
    args.queueableFns[args.queueableFns.length - 1].fn();
    expect(resultCallback.calls.first().args[0].failedExpectations).toEqual([]);
  });

  it('treats multiple done calls as late errors', function() {
    const queueRunnerFactory = jasmine.createSpy('queueRunnerFactory'),
      onLateError = jasmine.createSpy('onLateError'),
      spec = new jasmineUnderTest.Spec({
        onLateError: onLateError,
        queueableFn: { fn: function() {} },
        queueRunnerFactory: queueRunnerFactory,
        getSpecName: function() {
          return 'a spec';
        }
      });

    spec.execute();

    expect(queueRunnerFactory).toHaveBeenCalled();
    queueRunnerFactory.calls.argsFor(0)[0].onMultipleDone();

    expect(onLateError).toHaveBeenCalledTimes(1);
    expect(onLateError.calls.argsFor(0)[0]).toBeInstanceOf(Error);
    expect(onLateError.calls.argsFor(0)[0].message).toEqual(
      'An asynchronous spec, beforeEach, or afterEach function called its ' +
        "'done' callback more than once.\n(in spec: a spec)"
    );
  });

  describe('#trace', function() {
    it('adds the messages to the result', function() {
      const timer = jasmine.createSpyObj('timer', ['start', 'elapsed']),
        spec = new jasmineUnderTest.Spec({
          queueableFn: {
            fn: function() {}
          },
          queueRunnerFactory: function() {},
          timer: timer
        }),
        t1 = 123,
        t2 = 456;

      spec.execute();
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
      it('omits the messages from the reported result', function() {
        const resultCallback = jasmine.createSpy('resultCallback'),
          spec = new jasmineUnderTest.Spec({
            queueableFn: {
              fn: function() {}
            },
            resultCallback: resultCallback,
            queueRunnerFactory: function(config) {
              spec.debugLog('msg');
              for (const fn of config.queueableFns) {
                fn.fn();
              }
              config.onComplete(false);
            }
          });

        spec.execute(function() {});
        expect(resultCallback).toHaveBeenCalledWith(
          jasmine.objectContaining({ debugLogs: null }),
          undefined
        );
      });

      it('removes the messages to save memory', function() {
        const resultCallback = jasmine.createSpy('resultCallback'),
          spec = new jasmineUnderTest.Spec({
            queueableFn: {
              fn: function() {}
            },
            resultCallback: resultCallback,
            queueRunnerFactory: function(config) {
              spec.debugLog('msg');
              for (const fn of config.queueableFns) {
                fn.fn();
              }
              config.onComplete(false);
            }
          });

        spec.execute(function() {});
        expect(resultCallback).toHaveBeenCalled();
        expect(spec.result.debugLogs).toBeNull();
      });
    });

    describe('When the spec fails', function() {
      it('includes the messages in the reported result', function() {
        const resultCallback = jasmine.createSpy('resultCallback'),
          timer = jasmine.createSpyObj('timer', ['start', 'elapsed']),
          spec = new jasmineUnderTest.Spec({
            queueableFn: {
              fn: function() {}
            },
            resultCallback: resultCallback,
            queueRunnerFactory: function(config) {
              spec.debugLog('msg');
              spec.handleException(new Error('nope'));
              for (const fn of config.queueableFns) {
                fn.fn();
              }
              config.onComplete(true);
            },
            timer: timer
          }),
          timestamp = 12345;

        timer.elapsed.and.returnValue(timestamp);

        spec.execute(function() {});
        expect(resultCallback).toHaveBeenCalledWith(
          jasmine.objectContaining({
            debugLogs: [{ message: 'msg', timestamp: timestamp }]
          }),
          undefined
        );
      });
    });
  });
});
