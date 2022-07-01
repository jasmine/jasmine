describe('GlobalErrors', function() {
  it('calls the added handler on error', function() {
    const fakeGlobal = { onerror: null },
      handler = jasmine.createSpy('errorHandler'),
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    errors.pushListener(handler);

    fakeGlobal.onerror('foo');

    expect(handler).toHaveBeenCalledWith('foo');
  });

  it('enables external interception of error by overriding global.onerror', function() {
    const fakeGlobal = { onerror: null },
      handler = jasmine.createSpy('errorHandler'),
      hijackHandler = jasmine.createSpy('hijackErrorHandler'),
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    errors.pushListener(handler);

    fakeGlobal.onerror = hijackHandler;

    fakeGlobal.onerror('foo');

    expect(hijackHandler).toHaveBeenCalledWith('foo');
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the global error handler with all parameters', function() {
    const fakeGlobal = { onerror: null },
      handler = jasmine.createSpy('errorHandler'),
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal),
      fooError = new Error('foo');

    errors.install();
    errors.pushListener(handler);

    fakeGlobal.onerror(fooError.message, 'foo.js', 1, 1, fooError);

    expect(handler).toHaveBeenCalledWith(
      fooError.message,
      'foo.js',
      1,
      1,
      fooError
    );
  });

  it('only calls the most recent handler', function() {
    const fakeGlobal = { onerror: null },
      handler1 = jasmine.createSpy('errorHandler1'),
      handler2 = jasmine.createSpy('errorHandler2'),
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    errors.pushListener(handler1);
    errors.pushListener(handler2);

    fakeGlobal.onerror('foo');

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith('foo');
  });

  it('calls previous handlers when one is removed', function() {
    const fakeGlobal = { onerror: null },
      handler1 = jasmine.createSpy('errorHandler1'),
      handler2 = jasmine.createSpy('errorHandler2'),
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    errors.pushListener(handler1);
    errors.pushListener(handler2);

    errors.popListener(handler2);

    fakeGlobal.onerror('foo');

    expect(handler1).toHaveBeenCalledWith('foo');
    expect(handler2).not.toHaveBeenCalled();
  });

  it('throws when no listener is passed to #popListener', function() {
    const errors = new jasmineUnderTest.GlobalErrors({});
    expect(function() {
      errors.popListener();
    }).toThrowError('popListener expects a listener');
  });

  it('uninstalls itself, putting back a previous callback', function() {
    const originalCallback = jasmine.createSpy('error'),
      fakeGlobal = { onerror: originalCallback },
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    expect(fakeGlobal.onerror).toBe(originalCallback);

    errors.install();

    expect(fakeGlobal.onerror).not.toBe(originalCallback);

    errors.uninstall();

    expect(fakeGlobal.onerror).toBe(originalCallback);
  });

  it('rethrows the original error when there is no handler', function() {
    const fakeGlobal = {},
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal),
      originalError = new Error('nope');

    errors.install();

    try {
      fakeGlobal.onerror(originalError);
    } catch (e) {
      expect(e).toBe(originalError);
    }

    errors.uninstall();
  });

  it('reports uncaught exceptions in node.js', function() {
    const fakeGlobal = {
        process: {
          on: jasmine.createSpy('process.on'),
          removeListener: jasmine.createSpy('process.removeListener'),
          listeners: jasmine
            .createSpy('process.listeners')
            .and.returnValue(['foo']),
          removeAllListeners: jasmine.createSpy('process.removeAllListeners')
        }
      },
      handler = jasmine.createSpy('errorHandler'),
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    expect(fakeGlobal.process.on).toHaveBeenCalledWith(
      'uncaughtException',
      jasmine.any(Function)
    );
    expect(fakeGlobal.process.listeners).toHaveBeenCalledWith(
      'uncaughtException'
    );
    expect(fakeGlobal.process.removeAllListeners).toHaveBeenCalledWith(
      'uncaughtException'
    );

    errors.pushListener(handler);

    const addedListener = fakeGlobal.process.on.calls.argsFor(0)[1];
    addedListener(new Error('bar'));

    expect(handler).toHaveBeenCalledWith(new Error('bar'));
    expect(handler.calls.argsFor(0)[0].jasmineMessage).toBe(
      'Uncaught exception: Error: bar'
    );

    errors.uninstall();

    expect(fakeGlobal.process.removeListener).toHaveBeenCalledWith(
      'uncaughtException',
      addedListener
    );
    expect(fakeGlobal.process.on).toHaveBeenCalledWith(
      'uncaughtException',
      'foo'
    );
  });

  describe('Reporting unhandled promise rejections in node.js', function() {
    it('reports rejections with `Error` reasons', function() {
      const fakeGlobal = {
          process: {
            on: jasmine.createSpy('process.on'),
            removeListener: jasmine.createSpy('process.removeListener'),
            listeners: jasmine
              .createSpy('process.listeners')
              .and.returnValue(['foo']),
            removeAllListeners: jasmine.createSpy('process.removeAllListeners')
          }
        },
        handler = jasmine.createSpy('errorHandler'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      expect(fakeGlobal.process.on).toHaveBeenCalledWith(
        'unhandledRejection',
        jasmine.any(Function)
      );
      expect(fakeGlobal.process.listeners).toHaveBeenCalledWith(
        'unhandledRejection'
      );
      expect(fakeGlobal.process.removeAllListeners).toHaveBeenCalledWith(
        'unhandledRejection'
      );

      errors.pushListener(handler);

      const addedListener = fakeGlobal.process.on.calls.argsFor(1)[1];
      addedListener(new Error('bar'));

      expect(handler).toHaveBeenCalledWith(new Error('bar'));
      expect(handler.calls.argsFor(0)[0].jasmineMessage).toBe(
        'Unhandled promise rejection: Error: bar'
      );

      errors.uninstall();

      expect(fakeGlobal.process.removeListener).toHaveBeenCalledWith(
        'unhandledRejection',
        addedListener
      );
      expect(fakeGlobal.process.on).toHaveBeenCalledWith(
        'unhandledRejection',
        'foo'
      );
    });

    it('reports rejections with non-`Error` reasons', function() {
      const fakeGlobal = {
          process: {
            on: jasmine.createSpy('process.on'),
            removeListener: function() {},
            listeners: function() {
              return [];
            },
            removeAllListeners: function() {}
          }
        },
        handler = jasmine.createSpy('errorHandler'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      errors.pushListener(handler);

      expect(fakeGlobal.process.on.calls.argsFor(1)[0]).toEqual(
        'unhandledRejection'
      );
      const addedListener = fakeGlobal.process.on.calls.argsFor(1)[1];
      addedListener(17);

      expect(handler).toHaveBeenCalledWith(
        new Error(
          'Unhandled promise rejection: 17\n' +
            '(Tip: to get a useful stack trace, use ' +
            'Promise.reject(new Error(...)) instead of Promise.reject(...).)'
        )
      );
    });

    it('reports rejections with no reason provided', function() {
      const fakeGlobal = {
          process: {
            on: jasmine.createSpy('process.on'),
            removeListener: function() {},
            listeners: function() {
              return [];
            },
            removeAllListeners: function() {}
          }
        },
        handler = jasmine.createSpy('errorHandler'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      errors.pushListener(handler);

      expect(fakeGlobal.process.on.calls.argsFor(1)[0]).toEqual(
        'unhandledRejection'
      );
      const addedListener = fakeGlobal.process.on.calls.argsFor(1)[1];
      addedListener(undefined);

      expect(handler).toHaveBeenCalledWith(
        new Error(
          'Unhandled promise rejection with no error or message\n' +
            '(Tip: to get a useful stack trace, use ' +
            'Promise.reject(new Error(...)) instead of Promise.reject().)'
        )
      );
    });
  });

  describe('Reporting unhandled promise rejections in the browser', function() {
    it('subscribes and unsubscribes from the unhandledrejection event', function() {
      const fakeGlobal = jasmine.createSpyObj('globalErrors', [
          'addEventListener',
          'removeEventListener',
          'onerror'
        ]),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      expect(fakeGlobal.addEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        jasmine.any(Function)
      );

      const addedListener = fakeGlobal.addEventListener.calls.argsFor(0)[1];
      errors.uninstall();

      expect(fakeGlobal.removeEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        addedListener
      );
    });

    it('reports rejections whose reason is a string', function() {
      const fakeGlobal = jasmine.createSpyObj('globalErrors', [
          'addEventListener',
          'removeEventListener',
          'onerror'
        ]),
        handler = jasmine.createSpy('errorHandler'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      errors.pushListener(handler);

      const addedListener = fakeGlobal.addEventListener.calls.argsFor(0)[1];
      addedListener({ reason: 'nope' });

      expect(handler).toHaveBeenCalledWith('Unhandled promise rejection: nope');
    });

    it('reports rejections whose reason is an Error', function() {
      const fakeGlobal = jasmine.createSpyObj('globalErrors', [
          'addEventListener',
          'removeEventListener',
          'onerror'
        ]),
        handler = jasmine.createSpy('errorHandler'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      errors.pushListener(handler);

      const addedListener = fakeGlobal.addEventListener.calls.argsFor(0)[1];
      const reason = new Error('bar');

      addedListener({ reason: reason });

      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({
          jasmineMessage: 'Unhandled promise rejection: Error: bar',
          message: reason.message,
          stack: reason.stack
        })
      );
    });

    describe('Enabling external interception of reported rejections by overriding global.onerror', function() {
      it('overriding global.onerror intercepts rejections whose reason is a string', function() {
        const fakeGlobal = jasmine.createSpyObj('globalErrors', [
            'addEventListener'
          ]),
          handler = jasmine.createSpy('errorHandler'),
          hijackHandler = jasmine.createSpy('hijackErrorHandler'),
          errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

        errors.install();
        errors.pushListener(handler);

        fakeGlobal.onerror = hijackHandler;

        const addedListener = fakeGlobal.addEventListener.calls.argsFor(0)[1];
        addedListener({ reason: 'nope' });

        expect(hijackHandler).toHaveBeenCalledWith(
          'Unhandled promise rejection: nope'
        );
        expect(handler).not.toHaveBeenCalled();
      });

      it('overriding global.onerror intercepts rejections whose reason is an Error', function() {
        const fakeGlobal = jasmine.createSpyObj('globalErrors', [
            'addEventListener'
          ]),
          handler = jasmine.createSpy('errorHandler'),
          hijackHandler = jasmine.createSpy('hijackErrorHandler'),
          errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

        errors.install();
        errors.pushListener(handler);

        fakeGlobal.onerror = hijackHandler;

        const addedListener = fakeGlobal.addEventListener.calls.argsFor(0)[1];
        const reason = new Error('bar');

        addedListener({ reason: reason });

        expect(hijackHandler).toHaveBeenCalledWith(
          jasmine.objectContaining({
            jasmineMessage: 'Unhandled promise rejection: Error: bar',
            message: reason.message,
            stack: reason.stack
          })
        );
        expect(handler).not.toHaveBeenCalled();
      });
    });
  });

  describe('#setOverrideListener', function() {
    it('overrides the existing handlers in browsers until removed', function() {
      const fakeGlobal = { onerror: null };
      const handler0 = jasmine.createSpy('handler0');
      const handler1 = jasmine.createSpy('handler1');
      const overrideHandler = jasmine.createSpy('overrideHandler');
      const errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      errors.pushListener(handler0);
      errors.setOverrideListener(overrideHandler, () => {});
      errors.pushListener(handler1);
      fakeGlobal.onerror('foo');
      fakeGlobal.onerror(null, null, null, null, new Error('bar'));

      expect(overrideHandler).toHaveBeenCalledWith('foo');
      expect(overrideHandler).toHaveBeenCalledWith(new Error('bar'));
      expect(handler0).not.toHaveBeenCalled();
      expect(handler1).not.toHaveBeenCalled();

      errors.removeOverrideListener();

      fakeGlobal.onerror('baz');
      expect(overrideHandler).not.toHaveBeenCalledWith('baz');
      expect(handler1).toHaveBeenCalledWith('baz');
    });

    it('overrides the existing handlers in Node until removed', function() {
      const globalEventListeners = {};
      const fakeGlobal = {
        process: {
          on: (name, listener) => (globalEventListeners[name] = listener),
          removeListener: () => {},
          listeners: name => globalEventListeners[name],
          removeAllListeners: name => (globalEventListeners[name] = [])
        }
      };
      const handler0 = jasmine.createSpy('handler0');
      const handler1 = jasmine.createSpy('handler1');
      const overrideHandler = jasmine.createSpy('overrideHandler');
      const errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      errors.pushListener(handler0);
      errors.setOverrideListener(overrideHandler);
      errors.pushListener(handler1);

      globalEventListeners['uncaughtException'](new Error('foo'));

      expect(overrideHandler).toHaveBeenCalledWith(new Error('foo'));
      expect(handler0).not.toHaveBeenCalled();
      expect(handler1).not.toHaveBeenCalled();

      errors.removeOverrideListener();

      globalEventListeners['uncaughtException'](new Error('bar'));
      expect(overrideHandler).not.toHaveBeenCalledWith(new Error('bar'));
      expect(handler1).toHaveBeenCalledWith(new Error('bar'));
    });

    it('handles unhandled promise rejections in browsers', function() {
      const globalEventListeners = {};
      const fakeGlobal = {
        addEventListener(name, listener) {
          globalEventListeners[name] = listener;
        },
        removeEventListener() {}
      };
      const handler = jasmine.createSpy('handler');
      const overrideHandler = jasmine.createSpy('overrideHandler');
      const errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      errors.pushListener(handler);
      errors.setOverrideListener(overrideHandler, () => {});

      const reason = new Error('bar');

      globalEventListeners['unhandledrejection']({ reason: reason });

      expect(overrideHandler).toHaveBeenCalledWith(
        jasmine.objectContaining({
          jasmineMessage: 'Unhandled promise rejection: Error: bar',
          message: reason.message,
          stack: reason.stack
        })
      );
      expect(handler).not.toHaveBeenCalled();
    });

    it('handles unhandled promise rejections in Node', function() {
      const globalEventListeners = {};
      const fakeGlobal = {
        process: {
          on(name, listener) {
            globalEventListeners[name] = listener;
          },
          removeListener() {},
          listeners(name) {
            return globalEventListeners[name];
          },
          removeAllListeners(name) {
            globalEventListeners[name] = null;
          }
        }
      };
      const handler0 = jasmine.createSpy('handler0');
      const handler1 = jasmine.createSpy('handler1');
      const overrideHandler = jasmine.createSpy('overrideHandler');
      const errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.install();
      errors.pushListener(handler0);
      errors.setOverrideListener(overrideHandler, () => {});
      errors.pushListener(handler1);

      globalEventListeners['unhandledRejection'](new Error('nope'));

      expect(overrideHandler).toHaveBeenCalledWith(new Error('nope'));
      expect(handler0).not.toHaveBeenCalled();
      expect(handler1).not.toHaveBeenCalled();
    });

    it('throws if there is already an override handler', function() {
      const fakeGlobal = { onerror: null };
      const errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.setOverrideListener(() => {}, () => {});
      expect(function() {
        errors.setOverrideListener(() => {}, () => {});
      }).toThrowError("Can't set more than one override listener at a time");
    });
  });

  describe('#removeOverrideListener', function() {
    it("calls the handler's onRemove callback", function() {
      const fakeGlobal = { onerror: null };
      const onRemove = jasmine.createSpy('onRemove');
      const errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      errors.setOverrideListener(() => {}, onRemove);
      errors.removeOverrideListener();

      expect(onRemove).toHaveBeenCalledWith();
    });

    it('does not throw if there is no handler', function() {
      const fakeGlobal = { onerror: null };
      const errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

      expect(() => errors.removeOverrideListener()).not.toThrow();
    });
  });
});
