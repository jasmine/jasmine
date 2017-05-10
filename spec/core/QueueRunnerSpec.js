describe("QueueRunner", function() {

  it("runs all the functions it's passed", function() {
    var calls = [],
      queueableFn1 = { fn: jasmine.createSpy('fn1') },
      queueableFn2 = { fn: jasmine.createSpy('fn2') },
      queueRunner = new jasmineUnderTest.QueueRunner({
        queueableFns: [queueableFn1, queueableFn2]
      });
    queueableFn1.fn.and.callFake(function() {
      calls.push('fn1');
    });
    queueableFn2.fn.and.callFake(function() {
      calls.push('fn2');
    });

    queueRunner.execute();

    expect(calls).toEqual(['fn1', 'fn2']);
  });

  it("calls each function with a consistent 'this'-- an empty object", function() {
    var queueableFn1 = { fn: jasmine.createSpy('fn1') },
        queueableFn2 = { fn: jasmine.createSpy('fn2') },
        queueableFn3 = { fn: function(done) { asyncContext = this; done(); } },
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn1, queueableFn2, queueableFn3]
        }),
        asyncContext;

    queueRunner.execute();

    var context = queueableFn1.fn.calls.first().object;
    expect(context).toEqual({});
    expect(queueableFn2.fn.calls.first().object).toBe(context);
    expect(asyncContext).toBe(context);
  });

  describe("with an asynchronous function", function() {
    beforeEach(function() {
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it("supports asynchronous functions, only advancing to next function after a done() callback", function() {
      //TODO: it would be nice if spy arity could match the fake, so we could do something like:
      //createSpy('asyncfn').and.callFake(function(done) {});

      var onComplete = jasmine.createSpy('onComplete'),
        beforeCallback = jasmine.createSpy('beforeCallback'),
        fnCallback = jasmine.createSpy('fnCallback'),
        afterCallback = jasmine.createSpy('afterCallback'),
        queueableFn1 = { fn: function(done) {
          beforeCallback();
          setTimeout(done, 100);
        } },
        queueableFn2 = { fn: function(done) {
          fnCallback();
          setTimeout(done, 100);
        } },
        queueableFn3 = { fn: function(done) {
          afterCallback();
          setTimeout(done, 100);
        } },
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn1, queueableFn2, queueableFn3],
          onComplete: onComplete
        });

      queueRunner.execute();

      expect(beforeCallback).toHaveBeenCalled();
      expect(fnCallback).not.toHaveBeenCalled();
      expect(afterCallback).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();

      jasmine.clock().tick(100);

      expect(fnCallback).toHaveBeenCalled();
      expect(afterCallback).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();

      jasmine.clock().tick(100);

      expect(afterCallback).toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();

      jasmine.clock().tick(100);

      expect(onComplete).toHaveBeenCalled();
    });

    it("explicitly fails an async function with a provided fail function and moves to the next function", function() {
      var queueableFn1 = { fn: function(done) {
          setTimeout(function() { done.fail('foo'); }, 100);
        } },
        queueableFn2 = { fn: jasmine.createSpy('fn2') },
        failFn = jasmine.createSpy('fail'),
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn1, queueableFn2],
          fail: failFn
        });

      queueRunner.execute();

      expect(failFn).not.toHaveBeenCalled();
      expect(queueableFn2.fn).not.toHaveBeenCalled();

      jasmine.clock().tick(100);

      expect(failFn).toHaveBeenCalledWith('foo');
      expect(queueableFn2.fn).toHaveBeenCalled();
    });

    it("sets a timeout if requested for asynchronous functions so they don't go on forever", function() {
      var timeout = 3,
        beforeFn = { fn: function(done) { }, type: 'before', timeout: function() { return timeout; } },
        queueableFn = { fn: jasmine.createSpy('fn'), type: 'queueable' },
        onComplete = jasmine.createSpy('onComplete'),
        onException = jasmine.createSpy('onException'),
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [beforeFn, queueableFn],
          onComplete: onComplete,
          onException: onException
        });

      queueRunner.execute();
      expect(queueableFn.fn).not.toHaveBeenCalled();

      jasmine.clock().tick(timeout);

      expect(onException).toHaveBeenCalledWith(jasmine.any(Error));
      expect(queueableFn.fn).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it("by default does not set a timeout for asynchronous functions", function() {
      var beforeFn = { fn: function(done) { } },
        queueableFn = { fn: jasmine.createSpy('fn') },
        onComplete = jasmine.createSpy('onComplete'),
        onException = jasmine.createSpy('onException'),
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [beforeFn, queueableFn],
          onComplete: onComplete,
          onException: onException,
        });

      queueRunner.execute();
      expect(queueableFn.fn).not.toHaveBeenCalled();

      jasmine.clock().tick(jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL);

      expect(onException).not.toHaveBeenCalled();
      expect(queueableFn.fn).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("clears the timeout when an async function throws an exception, to prevent additional exception reporting", function() {
       var queueableFn = { fn: function(done) { throw new Error("error!"); } },
        onComplete = jasmine.createSpy('onComplete'),
        onException = jasmine.createSpy('onException'),
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn],
          onComplete: onComplete,
          onException: onException
        });

      queueRunner.execute();

      expect(onComplete).toHaveBeenCalled();
      expect(onException).toHaveBeenCalled();

      jasmine.clock().tick(jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL);
      expect(onException.calls.count()).toEqual(1);
    });

    it("clears the timeout when the done callback is called", function() {
      var queueableFn = { fn: function(done) { done(); } },
        onComplete = jasmine.createSpy('onComplete'),
        onException = jasmine.createSpy('onException'),
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn],
          onComplete: onComplete,
          onException: onException
        });

      queueRunner.execute();

      expect(onComplete).toHaveBeenCalled();

      jasmine.clock().tick(jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL);
      expect(onException).not.toHaveBeenCalled();
    });

    it("only moves to the next spec the first time you call done", function() {
      var queueableFn = { fn: function(done) {done(); done();} },
        nextQueueableFn = { fn: jasmine.createSpy('nextFn') };
      queueRunner = new jasmineUnderTest.QueueRunner({
        queueableFns: [queueableFn, nextQueueableFn]
      });

      queueRunner.execute();
      expect(nextQueueableFn.fn.calls.count()).toEqual(1);
    });

    it("does not move to the next spec if done is called after an exception has ended the spec", function() {
       var queueableFn = { fn: function(done) {
         setTimeout(done, 1);
         throw new Error('error!');
       } },
        nextQueueableFn = { fn: jasmine.createSpy('nextFn') };
      queueRunner = new jasmineUnderTest.QueueRunner({
        queueableFns: [queueableFn, nextQueueableFn]
      });

      queueRunner.execute();
      jasmine.clock().tick(1);
      expect(nextQueueableFn.fn.calls.count()).toEqual(1);
    });

    it("should return a null when you call done", function () {
      // Some promises want handlers to return anything but undefined to help catch "forgotten returns".
      var doneReturn,
        queueableFn = { fn: function(done) {
          doneReturn = done();
        } },
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn]
        });

      queueRunner.execute();
      expect(doneReturn).toBe(null);
    });

    it("continues running functions when an exception is thrown in async code without timing out", function() {
      var queueableFn = { fn: function(done) { throwAsync(); }, timeout: function() { return 1; } },
        nextQueueableFn = { fn: jasmine.createSpy("nextFunction") },
        onException = jasmine.createSpy('onException'),
        globalErrors = { pushListener: jasmine.createSpy('pushListener'), popListener: jasmine.createSpy('popListener') },
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn, nextQueueableFn],
          onException: onException,
          globalErrors: globalErrors
        }),
        throwAsync = function() {
          globalErrors.pushListener.calls.mostRecent().args[0](new Error('foo'));
          jasmine.clock().tick(2);
        };

      nextQueueableFn.fn.and.callFake(function() {
        // should remove the same function that was added
        expect(globalErrors.popListener).toHaveBeenCalledWith(globalErrors.pushListener.calls.argsFor(1)[0]);
      });

      queueRunner.execute();

      function errorWithMessage(message) {
        return {
          asymmetricMatch: function(other) {
            return new RegExp(message).test(other.message);
          },
          toString: function() {
            return '<Error with message like "' + message + '">';
          }
        };
      }
      expect(onException).not.toHaveBeenCalledWith(errorWithMessage(/DEFAULT_TIMEOUT_INTERVAL/));
      expect(onException).toHaveBeenCalledWith(errorWithMessage(/^foo$/));
      expect(nextQueueableFn.fn).toHaveBeenCalled();
    });
  });

  describe("with a function that returns a promise", function() {
    function StubPromise() {}

    StubPromise.prototype.then = function(resolve, reject) {
      this.resolveHandler = resolve;
      this.rejectHandler = reject;
    };

    beforeEach(function() {
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it("runs the function asynchronously, advancing once the promise is settled", function() {
      var onComplete = jasmine.createSpy('onComplete'),
        fnCallback =  jasmine.createSpy('fnCallback'),
        p1 = new StubPromise(),
        p2 = new StubPromise(),
        queueableFn1 = { fn: function() {
          setTimeout(function() {
            p1.resolveHandler();
          }, 100);
          return p1;
        } };
        queueableFn2 = { fn: function() {
          fnCallback();
          setTimeout(function() {
            p2.resolveHandler();
          }, 100);
          return p2;
        } },
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn1, queueableFn2],
          onComplete: onComplete
        });

      queueRunner.execute();
      expect(fnCallback).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();

      jasmine.clock().tick(100);

      expect(fnCallback).toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();

      jasmine.clock().tick(100);

      expect(onComplete).toHaveBeenCalled();
    });

    it("fails the function when the promise is rejected", function() {
      var promise = new StubPromise(),
        queueableFn1 = { fn: function() {
          setTimeout(function() { promise.rejectHandler('foo'); }, 100);
          return promise;
        } },
        queueableFn2 = { fn: jasmine.createSpy('fn2') },
        failFn = jasmine.createSpy('fail'),
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [queueableFn1, queueableFn2],
          fail: failFn
        });

      queueRunner.execute();

      expect(failFn).not.toHaveBeenCalled();
      expect(queueableFn2.fn).not.toHaveBeenCalled();

      jasmine.clock().tick(100);

      expect(failFn).toHaveBeenCalledWith('foo');
      expect(queueableFn2.fn).toHaveBeenCalled();
    });
  });

  it("calls exception handlers when an exception is thrown in a fn", function() {
    var queueableFn = { type: 'queueable',
      fn: function() {
        throw new Error('fake error');
      } },
      onExceptionCallback = jasmine.createSpy('on exception callback'),
      queueRunner = new jasmineUnderTest.QueueRunner({
        queueableFns: [queueableFn],
        onException: onExceptionCallback
      });

    queueRunner.execute();

    expect(onExceptionCallback).toHaveBeenCalledWith(jasmine.any(Error));
  });

  it("rethrows an exception if told to", function() {
    var queueableFn = { fn: function() {
        throw new Error('fake error');
      } },
      queueRunner = new jasmineUnderTest.QueueRunner({
        queueableFns: [queueableFn],
        catchException: function(e) { return false; }
      });

    expect(function() {
      queueRunner.execute();
    }).toThrowError('fake error');
  });

  it("continues running the functions even after an exception is thrown in an async spec", function() {
    var queueableFn = { fn: function(done) { throw new Error("error"); } },
      nextQueueableFn = { fn: jasmine.createSpy("nextFunction") },
      queueRunner = new jasmineUnderTest.QueueRunner({
        queueableFns: [queueableFn, nextQueueableFn]
      });

    queueRunner.execute();
    expect(nextQueueableFn.fn).toHaveBeenCalled();
  });

  it("handles exceptions thrown while waiting for the stack to clear", function() {
    var queueableFn = { fn: function(done) { done() } },
      global = {},
      errorListeners = [],
      globalErrors = {
        pushListener: function(f) { errorListeners.push(f); },
        popListener: function() { errorListeners.pop(); }
      },
      clearStack = jasmine.createSpy('clearStack'),
      onException = jasmine.createSpy('onException'),
      queueRunner = new jasmineUnderTest.QueueRunner({
        queueableFns: [queueableFn],
        globalErrors: globalErrors,
        clearStack: clearStack,
        onException: onException
      }),
      error = new Error('nope');

    queueRunner.execute();
    expect(clearStack).toHaveBeenCalled();
    expect(errorListeners.length).toEqual(1);
    errorListeners[0](error);
    clearStack.calls.argsFor(0)[0]();
    expect(onException).toHaveBeenCalledWith(error);
  });

  it("calls a provided complete callback when done", function() {
    var queueableFn = { fn: jasmine.createSpy('fn') },
      completeCallback = jasmine.createSpy('completeCallback'),
      queueRunner = new jasmineUnderTest.QueueRunner({
        queueableFns: [queueableFn],
        onComplete: completeCallback
      });

    queueRunner.execute();

    expect(completeCallback).toHaveBeenCalled();
  });

  it("calls a provided stack clearing function when done", function() {
    var asyncFn = { fn: function(done) { done() } },
        afterFn = { fn: jasmine.createSpy('afterFn') },
        completeCallback = jasmine.createSpy('completeCallback'),
        clearStack = jasmine.createSpy('clearStack'),
        queueRunner = new jasmineUnderTest.QueueRunner({
          queueableFns: [asyncFn, afterFn],
          clearStack: clearStack,
          onComplete: completeCallback
        });

    clearStack.and.callFake(function(fn) { fn(); });

    queueRunner.execute();
    expect(afterFn.fn).toHaveBeenCalled();
    expect(clearStack).toHaveBeenCalled();
    clearStack.calls.argsFor(0)[0]();
    expect(completeCallback).toHaveBeenCalled();
  });
});
