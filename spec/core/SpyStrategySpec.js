describe('SpyStrategy', function() {
  it('defaults its name to unknown', function() {
    var spyStrategy = new jasmineUnderTest.SpyStrategy();

    expect(spyStrategy.identity).toEqual('unknown');
  });

  it('takes a name', function() {
    var spyStrategy = new jasmineUnderTest.SpyStrategy({ name: 'foo' });

    expect(spyStrategy.identity).toEqual('foo');
  });

  it('stubs an original function, if provided', function() {
    var originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn });

    spyStrategy.exec();

    expect(originalFn).not.toHaveBeenCalled();
  });

  it("allows an original function to be called, passed through the params and returns it's value", function() {
    var originalFn = jasmine.createSpy('original').and.returnValue(42),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn }),
      returnValue;

    spyStrategy.callThrough();
    returnValue = spyStrategy.exec(null, ['foo']);

    expect(originalFn).toHaveBeenCalled();
    expect(originalFn.calls.mostRecent().args).toEqual(['foo']);
    expect(returnValue).toEqual(42);
  });

  it('can return a specified value when executed', function() {
    var originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn }),
      returnValue;

    spyStrategy.returnValue(17);
    returnValue = spyStrategy.exec();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(17);
  });

  it('can return specified values in order specified when executed', function() {
    var originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn });

    spyStrategy.returnValues('value1', 'value2', 'value3');

    expect(spyStrategy.exec()).toEqual('value1');
    expect(spyStrategy.exec()).toEqual('value2');
    expect(spyStrategy.exec()).toBe('value3');
    expect(spyStrategy.exec()).toBeUndefined();
    expect(originalFn).not.toHaveBeenCalled();
  });

  it('allows an exception to be thrown when executed', function() {
    var originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn });

    spyStrategy.throwError(new TypeError('bar'));

    expect(function() {
      spyStrategy.exec();
    }).toThrowError(TypeError, 'bar');
    expect(originalFn).not.toHaveBeenCalled();
  });

  it('allows a string to be thrown, wrapping it into an exception when executed', function() {
    var originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn });

    spyStrategy.throwError('bar');

    expect(function() {
      spyStrategy.exec();
    }).toThrowError(Error, 'bar');
    expect(originalFn).not.toHaveBeenCalled();
  });

  it('allows a non-Error to be thrown when executed', function() {
    var originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn });

    spyStrategy.throwError({ code: 'ESRCH' });

    expect(function() {
      spyStrategy.exec();
    }).toThrow(jasmine.objectContaining({ code: 'ESRCH' }));
    expect(originalFn).not.toHaveBeenCalled();
  });

  it('allows a fake function to be called instead', function() {
    var originalFn = jasmine.createSpy('original'),
      fakeFn = jasmine.createSpy('fake').and.returnValue(67),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn }),
      returnValue;

    spyStrategy.callFake(fakeFn);
    returnValue = spyStrategy.exec();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(67);
  });

  it('allows a fake async function to be called instead', function(done) {
    var originalFn = jasmine.createSpy('original'),
      fakeFn = jasmine
        .createSpy('fake')
        .and.callFake(eval('async () => { return 67; }')),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn });

    spyStrategy.callFake(fakeFn);
    spyStrategy
      .exec()
      .then(function(returnValue) {
        expect(originalFn).not.toHaveBeenCalled();
        expect(fakeFn).toHaveBeenCalled();
        expect(returnValue).toEqual(67);
        done();
      })
      .catch(function(err) {
        done.fail(err);
      });
  });

  describe('#resolveTo', function() {
    it('allows a resolved promise to be returned', function(done) {
      var originalFn = jasmine.createSpy('original'),
        spyStrategy = new jasmineUnderTest.SpyStrategy({
          fn: originalFn
        });

      spyStrategy.resolveTo(37);
      spyStrategy
        .exec()
        .then(function(returnValue) {
          expect(returnValue).toEqual(37);
          done();
        })
        .catch(done.fail);
    });

    it('allows an empty resolved promise to be returned', function(done) {
      var originalFn = jasmine.createSpy('original'),
        spyStrategy = new jasmineUnderTest.SpyStrategy({
          fn: originalFn
        });

      spyStrategy.resolveTo();
      spyStrategy
        .exec()
        .then(function(returnValue) {
          expect(returnValue).toBe();
          done();
        })
        .catch(done.fail);
    });
  });

  describe('#rejectWith', function() {
    it('allows a rejected promise to be returned', function(done) {
      var originalFn = jasmine.createSpy('original'),
        spyStrategy = new jasmineUnderTest.SpyStrategy({
          fn: originalFn
        });

      spyStrategy.rejectWith(new Error('oops'));
      spyStrategy
        .exec()
        .then(done.fail)
        .catch(function(error) {
          expect(error).toEqual(new Error('oops'));
          done();
        })
        .catch(done.fail);
    });

    it('allows an empty rejected promise to be returned', function(done) {
      var originalFn = jasmine.createSpy('original'),
        spyStrategy = new jasmineUnderTest.SpyStrategy({
          fn: originalFn
        });

      spyStrategy.rejectWith();
      spyStrategy
        .exec()
        .then(done.fail)
        .catch(function(error) {
          expect(error).toBe();
          done();
        })
        .catch(done.fail);
    });

    it('allows a non-Error to be rejected', function(done) {
      var originalFn = jasmine.createSpy('original'),
        spyStrategy = new jasmineUnderTest.SpyStrategy({
          fn: originalFn
        });

      spyStrategy.rejectWith('oops');
      spyStrategy
        .exec()
        .then(done.fail)
        .catch(function(error) {
          expect(error).toEqual('oops');
          done();
        })
        .catch(done.fail);
    });
  });

  it('allows a custom strategy to be used', function() {
    var plan = jasmine
        .createSpy('custom strategy')
        .and.returnValue('custom strategy result'),
      customStrategy = jasmine
        .createSpy('custom strategy')
        .and.returnValue(plan),
      originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({
        fn: originalFn,
        customStrategies: {
          doSomething: customStrategy
        }
      });

    spyStrategy.doSomething(1, 2, 3);
    expect(customStrategy).toHaveBeenCalledWith(1, 2, 3);
    expect(spyStrategy.exec(null, ['some', 'args'])).toEqual(
      'custom strategy result'
    );
    expect(plan).toHaveBeenCalledWith('some', 'args');
  });

  it("throws an error if a custom strategy doesn't return a function", function() {
    var originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({
        fn: originalFn,
        customStrategies: {
          doSomething: function() {
            return 'not a function';
          }
        }
      });

    expect(function() {
      spyStrategy.doSomething(1, 2, 3);
    }).toThrowError('Spy strategy must return a function');
  });

  it('does not allow custom strategies to overwrite existing methods', function() {
    var spyStrategy = new jasmineUnderTest.SpyStrategy({
      fn: function() {},
      customStrategies: {
        exec: function() {}
      }
    });

    expect(spyStrategy.exec).toBe(jasmineUnderTest.SpyStrategy.prototype.exec);
  });

  it('throws an error when a non-function is passed to callFake strategy', function() {
    var originalFn = jasmine.createSpy('original'),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn });

    spyOn(jasmineUnderTest, 'isFunction_').and.returnValue(false);
    spyOn(jasmineUnderTest, 'isAsyncFunction_').and.returnValue(false);

    expect(function() {
      spyStrategy.callFake(function() {});
    }).toThrowError(/^Argument passed to callFake should be a function, got/);

    expect(function() {
      spyStrategy.callFake(function() {});
    }).toThrowError(/^Argument passed to callFake should be a function, got/);
  });

  it('allows generator functions to be passed to callFake strategy', function() {
    var generator = function*() {
        yield 'ok';
      },
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: function() {} });

    spyStrategy.callFake(generator);

    expect(spyStrategy.exec().next().value).toEqual('ok');
  });

  it('allows a return to plan stubbing after another strategy', function() {
    var originalFn = jasmine.createSpy('original'),
      fakeFn = jasmine.createSpy('fake').and.returnValue(67),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ fn: originalFn }),
      returnValue;

    spyStrategy.callFake(fakeFn);
    returnValue = spyStrategy.exec();

    expect(originalFn).not.toHaveBeenCalled();
    expect(returnValue).toEqual(67);

    spyStrategy.stub();
    returnValue = spyStrategy.exec();

    expect(returnValue).toEqual(void 0);
  });

  it('returns the spy after changing the strategy', function() {
    var spy = {},
      spyFn = jasmine.createSpy('spyFn').and.returnValue(spy),
      spyStrategy = new jasmineUnderTest.SpyStrategy({ getSpy: spyFn });

    expect(spyStrategy.callThrough()).toBe(spy);
    expect(spyStrategy.returnValue()).toBe(spy);
    expect(spyStrategy.throwError()).toBe(spy);
    expect(spyStrategy.callFake(function() {})).toBe(spy);
    expect(spyStrategy.stub()).toBe(spy);
  });
});
