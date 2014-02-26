describe("QueueRunner", function() {

  it("runs all the functions it's passed", function() {
    var calls = [],
      fn1 = jasmine.createSpy('fn1'),
      fn2 = jasmine.createSpy('fn2'),
      queueRunner = new j$.QueueRunner({
        fns: [fn1, fn2]
      });
    fn1.and.callFake(function() {
      calls.push('fn1');
    });
    fn2.and.callFake(function() {
      calls.push('fn2');
    });

    queueRunner.execute();

    expect(calls).toEqual(['fn1', 'fn2']);
  });

  it("calls each function with a consistent 'this'-- an empty object", function() {
    var fn1 = jasmine.createSpy('fn1'),
        fn2 = jasmine.createSpy('fn2'),
        fn3 = function(done) { asyncContext = this; done(); },
        queueRunner = new j$.QueueRunner({
          fns: [fn1, fn2, fn3]
        }),
        asyncContext;

    queueRunner.execute();

    var context = fn1.calls.first().object;
    expect(context).toEqual({});
    expect(fn2.calls.first().object).toBe(context);
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
        fn1 = function(done) {
          beforeCallback();
          setTimeout(done, 100);
        },
        fn2 = function(done) {
          fnCallback();
          setTimeout(done, 100);
        },
        fn3 = function(done) {
          afterCallback();
          setTimeout(done, 100);
        },
        queueRunner = new j$.QueueRunner({
          fns: [fn1, fn2, fn3],
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

    it("sets a timeout if requested for asynchronous functions so they don't go on forever", function() {
      var beforeFn = function(done) { },
        fn = jasmine.createSpy('fn'),
        onComplete = jasmine.createSpy('onComplete'),
        onException = jasmine.createSpy('onException'),
        queueRunner = new j$.QueueRunner({
          fns: [beforeFn, fn],
          onComplete: onComplete,
          onException: onException,
          enforceTimeout: function() { return true; }
        });

      queueRunner.execute();
      expect(fn).not.toHaveBeenCalled();

      jasmine.clock().tick(j$.DEFAULT_TIMEOUT_INTERVAL);

      expect(onException).toHaveBeenCalledWith(jasmine.any(Error));
      expect(fn).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it("by default does not set a timeout for asynchronous functions", function() {
      var beforeFn = function(done) { },
        fn = jasmine.createSpy('fn'),
        onComplete = jasmine.createSpy('onComplete'),
        onException = jasmine.createSpy('onException'),
        queueRunner = new j$.QueueRunner({
          fns: [beforeFn, fn],
          onComplete: onComplete,
          onException: onException,
        });

      queueRunner.execute();
      expect(fn).not.toHaveBeenCalled();

      jasmine.clock().tick(j$.DEFAULT_TIMEOUT_INTERVAL);

      expect(onException).not.toHaveBeenCalled();
      expect(fn).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("clears the timeout when an async function throws an exception, to prevent additional onException calls", function() {
       var fn = function(done) { throw new Error("error!"); },
        onComplete = jasmine.createSpy('onComplete'),
        onException = jasmine.createSpy('onException'),
        queueRunner = new j$.QueueRunner({
          fns: [fn],
          onComplete: onComplete,
          onException: onException
        });

      queueRunner.execute();

      expect(onComplete).toHaveBeenCalled();
      expect(onException).toHaveBeenCalled();

      jasmine.clock().tick(j$.DEFAULT_TIMEOUT_INTERVAL);
      expect(onException.calls.count()).toEqual(1);
    });

    it("clears the timeout when the done callback is called", function() {
      var fn = function(done) { done(); },
        onComplete = jasmine.createSpy('onComplete'),
        onException = jasmine.createSpy('onException'),
        queueRunner = new j$.QueueRunner({
          fns: [fn],
          onComplete: onComplete,
          onException: onException
        });

      queueRunner.execute();

      expect(onComplete).toHaveBeenCalled();

      jasmine.clock().tick(j$.DEFAULT_TIMEOUT_INTERVAL);
      expect(onException).not.toHaveBeenCalled();
    });

    it("only moves to the next spec the first time you call done", function() {
      var fn = function(done) {done(); done();},
        nextFn = jasmine.createSpy('nextFn');
      queueRunner = new j$.QueueRunner({
        fns: [fn, nextFn]
      });

      queueRunner.execute();
      expect(nextFn.calls.count()).toEqual(1);
    });

    it("does not move to the next spec if done is called after an exception has ended the spec", function() {
       var fn = function(done) {
         setTimeout(done, 1);
         throw new Error('error!');
       },
        nextFn = jasmine.createSpy('nextFn');
      queueRunner = new j$.QueueRunner({
        fns: [fn, nextFn]
      });

      queueRunner.execute();
      jasmine.clock().tick(1);
      expect(nextFn.calls.count()).toEqual(1);
    });
  });

  it("calls an exception handler when an exception is thrown in a fn", function() {
    var fn = function() {
        throw new Error('fake error');
      },
      exceptionCallback = jasmine.createSpy('exception callback'),
      queueRunner = new j$.QueueRunner({
        fns: [fn],
        onException: exceptionCallback
      });

    queueRunner.execute();

    expect(exceptionCallback).toHaveBeenCalledWith(jasmine.any(Error));
  });

  it("rethrows an exception if told to", function() {
    var fn = function() {
        throw new Error('fake error');
      },
      queueRunner = new j$.QueueRunner({
        fns: [fn],
        catchException: function(e) { return false; }
      });

    expect(queueRunner.execute).toThrow();
  });

  it("continues running the functions even after an exception is thrown in an async spec", function() {
    var fn = function(done) { throw new Error("error"); },
      nextFn = jasmine.createSpy("nextFunction"),
      queueRunner = new j$.QueueRunner({
        fns: [fn, nextFn]
      });

    queueRunner.execute();
    expect(nextFn).toHaveBeenCalled();
  });

  it("calls a provided complete callback when done", function() {
    var fn = jasmine.createSpy('fn'),
      completeCallback = jasmine.createSpy('completeCallback'),
      queueRunner = new j$.QueueRunner({
        fns: [fn],
        onComplete: completeCallback
      });

    queueRunner.execute();

    expect(completeCallback).toHaveBeenCalled();
  });

  it("calls a provided stack clearing function when done", function() {
    var asyncFn = function(done) { done() },
        afterFn = jasmine.createSpy('afterFn'),
        completeCallback = jasmine.createSpy('completeCallback'),
        clearStack = jasmine.createSpy('clearStack'),
        queueRunner = new j$.QueueRunner({
          fns: [asyncFn, afterFn],
          clearStack: clearStack,
          onComplete: completeCallback
        });

    clearStack.and.callFake(function(fn) { fn(); });

    queueRunner.execute();
    expect(afterFn).toHaveBeenCalled();
    expect(clearStack).toHaveBeenCalledWith(completeCallback);
  });
});
