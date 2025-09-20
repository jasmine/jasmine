describe('GlobalErrors', function() {
  it('calls the added handler on error', function() {
    const globals = browserGlobals();
    const handler = jasmine.createSpy('errorHandler');
    const errors = new jasmineUnderTest.GlobalErrors(
      globals.global,
      () => ({})
    );

    errors.install();
    errors.pushListener(handler);

    const error = new Error('nope');
    dispatchEvent(globals.listeners, 'error', { error });

    expect(handler).toHaveBeenCalledWith(
      jasmine.is(error),
      jasmine.objectContaining({ error: jasmine.is(error) })
    );
  });

  it('is not affected by overriding global.onerror', function() {
    const globals = browserGlobals();
    const handler = jasmine.createSpy('errorHandler');
    const errors = new jasmineUnderTest.GlobalErrors(
      globals.global,
      () => ({})
    );

    errors.install();
    errors.pushListener(handler);

    globals.global.onerror = () => {};

    const error = new Error('nope');
    dispatchEvent(globals.listeners, 'error', { error });

    expect(handler).toHaveBeenCalledWith(
      jasmine.is(error),
      jasmine.objectContaining({ error: jasmine.is(error) })
    );
  });

  it('only calls the most recent handler', function() {
    const globals = browserGlobals();
    const handler1 = jasmine.createSpy('errorHandler1');
    const handler2 = jasmine.createSpy('errorHandler2');
    const errors = new jasmineUnderTest.GlobalErrors(
      globals.global,
      () => ({})
    );

    errors.install();
    errors.pushListener(handler1);
    errors.pushListener(handler2);

    const error = new Error('nope');
    dispatchEvent(globals.listeners, 'error', { error });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith(
      jasmine.is(error),
      jasmine.objectContaining({ error: jasmine.is(error) })
    );
  });

  it('calls previous handlers when one is removed', function() {
    const globals = browserGlobals();
    const handler1 = jasmine.createSpy('errorHandler1');
    const handler2 = jasmine.createSpy('errorHandler2');
    const errors = new jasmineUnderTest.GlobalErrors(
      globals.global,
      () => ({})
    );

    errors.install();
    errors.pushListener(handler1);
    errors.pushListener(handler2);

    errors.popListener(handler2);

    const error = new Error('nope');
    dispatchEvent(globals.listeners, 'error', { error });

    expect(handler1).toHaveBeenCalledWith(
      jasmine.is(error),
      jasmine.objectContaining({ error: jasmine.is(error) })
    );
    expect(handler2).not.toHaveBeenCalled();
  });

  it('throws when no listener is passed to #popListener', function() {
    const errors = new jasmineUnderTest.GlobalErrors({});
    expect(function() {
      errors.popListener();
    }).toThrowError('popListener expects a listener');
  });

  it('uninstalls itself', function() {
    const globals = browserGlobals();
    const errors = new jasmineUnderTest.GlobalErrors(
      globals.global,
      () => ({})
    );
    function unrelatedListener() {}

    errors.install();
    globals.global.addEventListener('error', unrelatedListener);
    errors.uninstall();

    expect(globals.listeners.error).toEqual([unrelatedListener]);
  });

  it('rethrows the original error when there is no handler', function() {
    const globals = browserGlobals();
    const errors = new jasmineUnderTest.GlobalErrors(
      globals.global,
      () => ({})
    );
    const originalError = new Error('nope');

    errors.install();

    try {
      dispatchEvent(globals.listeners, 'error', { error: originalError });
    } catch (e) {
      expect(e).toBe(originalError);
    }

    errors.uninstall();
  });

  it('reports uncaught exceptions in node.js', function() {
    const globals = nodeGlobals();
    const errors = new jasmineUnderTest.GlobalErrors(
      globals.global,
      () => ({})
    );
    const handler = jasmine.createSpy('errorHandler');
    function originalHandler() {}
    globals.listeners.uncaughtException = [originalHandler];

    errors.install();
    expect(globals.listeners.uncaughtException).toEqual([
      jasmine.any(Function)
    ]);
    expect(globals.listeners.uncaughtException).not.toEqual([
      originalHandler()
    ]);

    errors.pushListener(handler);

    dispatchEvent(globals.listeners, 'uncaughtException', new Error('bar'));

    expect(handler).toHaveBeenCalledWith(new Error('bar'), undefined);
    expect(handler.calls.argsFor(0)[0].jasmineMessage).toBe(
      'Uncaught exception: Error: bar'
    );

    errors.uninstall();

    expect(globals.listeners.uncaughtException).toEqual([originalHandler]);
  });

  describe('Reporting unhandled promise rejections in node.js', function() {
    it('reports rejections with `Error` reasons', function() {
      const globals = nodeGlobals();
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );
      const handler = jasmine.createSpy('errorHandler');
      function originalHandler() {}
      globals.listeners.unhandledRejection = [originalHandler];

      errors.install();
      expect(globals.listeners.unhandledRejection).toEqual([
        jasmine.any(Function)
      ]);
      expect(globals.listeners.unhandledRejection).not.toEqual([
        originalHandler()
      ]);

      errors.pushListener(handler);

      dispatchEvent(globals.listeners, 'unhandledRejection', new Error('bar'));

      expect(handler).toHaveBeenCalledWith(new Error('bar'), undefined);
      expect(handler.calls.argsFor(0)[0].jasmineMessage).toBe(
        'Unhandled promise rejection: Error: bar'
      );

      errors.uninstall();

      expect(globals.listeners.unhandledRejection).toEqual([originalHandler]);
    });

    it('reports rejections with non-`Error` reasons', function() {
      const globals = nodeGlobals();
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );
      const handler = jasmine.createSpy('errorHandler');

      errors.install();
      errors.pushListener(handler);

      dispatchEvent(globals.listeners, 'unhandledRejection', 17);

      expect(handler).toHaveBeenCalledWith(
        new Error(
          'Unhandled promise rejection: 17\n' +
            '(Tip: to get a useful stack trace, use ' +
            'Promise.reject(new Error(...)) instead of Promise.reject(...).)'
        ),
        undefined
      );
    });

    it('reports rejections with no reason provided', function() {
      const globals = nodeGlobals();
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );
      const handler = jasmine.createSpy('errorHandler');

      errors.install();
      errors.pushListener(handler);

      dispatchEvent(globals.listeners, 'unhandledRejection', undefined);

      expect(handler).toHaveBeenCalledWith(
        new Error(
          'Unhandled promise rejection with no error or message\n' +
            '(Tip: to get a useful stack trace, use ' +
            'Promise.reject(new Error(...)) instead of Promise.reject().)'
        ),
        undefined
      );
    });

    describe('When detectLateRejectionHandling is true', function() {
      let globals, errors;

      beforeEach(function() {
        globals = nodeGlobals();
        errors = new jasmineUnderTest.GlobalErrors(globals.global, () => ({
          detectLateRejectionHandling: true
        }));
      });

      it('subscribes and unsubscribes from the rejectionHandled event', function() {
        function originalHandler() {}
        globals.global.process.on('rejectionHandled', originalHandler);
        errors.install();

        expect(globals.listeners.rejectionHandled).toEqual([
          jasmine.any(Function)
        ]);
        expect(globals.listeners.rejectionHandled).not.toEqual([
          originalHandler
        ]);

        errors.uninstall();
        expect(globals.listeners.rejectionHandled).toEqual([originalHandler]);
      });

      describe("When the unhandledRejection event doesn't have a promise", function() {
        it('immediately reports the rejection', function() {
          const handler = jasmine.createSpy('errorHandler');

          errors.install();
          errors.pushListener(handler);

          dispatchEvent(
            globals.listeners,
            'unhandledRejection',
            new Error('nope'),
            undefined
          );

          expect(handler).toHaveBeenCalledWith(new Error('nope'), undefined);
          expect(handler.calls.argsFor(0)[0].jasmineMessage).toBe(
            'Unhandled promise rejection: Error: nope'
          );
        });
      });

      describe('When the unhandledRejection event has a promise property', function() {
        it('does not immediately report the rejection', function() {
          const handler = jasmine.createSpy('errorHandler');

          errors.install();
          errors.pushListener(handler);

          const promise = Promise.reject('nope');
          promise.catch(() => {});
          dispatchEvent(
            globals.listeners,
            'unhandledRejection',
            'nope',
            promise
          );

          expect(handler).not.toHaveBeenCalled();
        });

        describe('When reportUnhandledRejections is called', function() {
          it('reports rejections that have not been handled', function() {
            const handler = jasmine.createSpy('errorHandler');
            errors.install();
            errors.pushListener(handler);

            const reason = new Error('nope');
            const promise = Promise.reject(reason);
            promise.catch(() => {});
            dispatchEvent(
              globals.listeners,
              'unhandledRejection',
              reason,
              promise
            );
            errors.reportUnhandledRejections();

            expect(handler).toHaveBeenCalledWith(new Error('nope'), undefined);
            expect(handler.calls.argsFor(0)[0].jasmineMessage).toBe(
              'Unhandled promise rejection: Error: nope'
            );
          });

          it('does not report rejections that have been handled', function() {
            const handler = jasmine.createSpy('errorHandler');
            errors.install();
            errors.pushListener(handler);

            const reason = new Error('nope');
            const promise = Promise.reject(reason);
            promise.catch(() => {});
            dispatchEvent(
              globals.listeners,
              'unhandledRejection',
              reason,
              promise
            );
            dispatchEvent(globals.listeners, 'rejectionHandled', promise);
            errors.reportUnhandledRejections();

            expect(handler).not.toHaveBeenCalled();
          });

          it('does not report the same rejection on subsequent calls', function() {
            const handler = jasmine.createSpy('errorHandler');

            errors.install();
            errors.pushListener(handler);

            const promise = Promise.reject('nope');
            promise.catch(() => {});
            dispatchEvent(
              globals.listeners,
              'unhandledRejection',
              'nope',
              promise
            );
            errors.reportUnhandledRejections();
            expect(handler).toHaveBeenCalled();
            handler.calls.reset();

            errors.reportUnhandledRejections();
            expect(handler).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('Reporting unhandled promise rejections in the browser', function() {
    it('subscribes and unsubscribes from the unhandledrejection event', function() {
      const globals = browserGlobals();
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );

      errors.install();
      expect(globals.listeners.unhandledrejection).toEqual([
        jasmine.any(Function)
      ]);

      errors.uninstall();
      expect(globals.listeners.unhandledrejection).toEqual([]);
    });

    it('reports rejections whose reason is a string', function() {
      const globals = browserGlobals();
      const handler = jasmine.createSpy('errorHandler');
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );

      errors.install();
      errors.pushListener(handler);

      const event = { reason: 'nope' };
      dispatchEvent(globals.listeners, 'unhandledrejection', event);

      expect(handler).toHaveBeenCalledWith(
        'Unhandled promise rejection: nope',
        event
      );
    });

    it('reports rejections whose reason is an Error', function() {
      const globals = browserGlobals();
      const handler = jasmine.createSpy('errorHandler');
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );

      errors.install();
      errors.pushListener(handler);

      const reason = new Error('bar');
      const event = { reason };
      dispatchEvent(globals.listeners, 'unhandledrejection', event);

      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({
          jasmineMessage: 'Unhandled promise rejection: Error: bar',
          message: reason.message,
          stack: reason.stack
        }),
        event
      );
    });

    describe('When detectLateRejectionHandling is true', function() {
      let globals, errors;

      beforeEach(function() {
        globals = browserGlobals();
        errors = new jasmineUnderTest.GlobalErrors(globals.global, () => ({
          detectLateRejectionHandling: true
        }));
      });

      it('subscribes and unsubscribes from the rejectionhandled event', function() {
        errors.install();
        expect(globals.listeners.rejectionhandled).toEqual([
          jasmine.any(Function)
        ]);

        errors.uninstall();
        expect(globals.listeners.rejectionhandled).toEqual([]);
      });

      describe("When the unhandledrejection event doesn't have a promise property", function() {
        it('immediately reports the rejection', function() {
          const handler = jasmine.createSpy('errorHandler');

          errors.install();
          errors.pushListener(handler);

          const event = { reason: 'nope' };
          dispatchEvent(globals.listeners, 'unhandledrejection', event);

          expect(handler).toHaveBeenCalledWith(
            'Unhandled promise rejection: nope',
            event
          );
        });
      });

      describe('When the unhandledrejection event has a promise property', function() {
        it('does not immediately report the rejection', function() {
          const handler = jasmine.createSpy('errorHandler');

          errors.install();
          errors.pushListener(handler);

          const promise = Promise.reject('nope');
          promise.catch(() => {});
          dispatchEvent(globals.listeners, 'unhandledrejection', {
            reason: 'nope',
            promise
          });

          expect(handler).not.toHaveBeenCalled();
        });

        describe('When reportUnhandledRejections is called', function() {
          it('reports rejections that have not been handled', function() {
            const handler = jasmine.createSpy('errorHandler');
            errors.install();
            errors.pushListener(handler);

            const promise = Promise.reject('nope');
            promise.catch(() => {});
            dispatchEvent(globals.listeners, 'unhandledrejection', {
              reason: 'nope',
              promise
            });
            errors.reportUnhandledRejections();

            expect(handler).toHaveBeenCalledWith(
              'Unhandled promise rejection: nope',
              { reason: 'nope', promise }
            );
          });

          it('does not report rejections that have been handled', function() {
            const handler = jasmine.createSpy('errorHandler');
            errors.install();
            errors.pushListener(handler);

            const promise = Promise.reject('nope');
            promise.catch(() => {});
            dispatchEvent(globals.listeners, 'unhandledrejection', {
              reason: 'nope',
              promise
            });
            dispatchEvent(globals.listeners, 'rejectionhandled', { promise });
            errors.reportUnhandledRejections();

            expect(handler).not.toHaveBeenCalled();
          });

          it('does not report the same rejection on subsequent calls', function() {
            const handler = jasmine.createSpy('errorHandler');

            errors.install();
            errors.pushListener(handler);

            const promise = Promise.reject('nope');
            promise.catch(() => {});
            dispatchEvent(globals.listeners, 'unhandledrejection', {
              reason: 'nope',
              promise
            });
            errors.reportUnhandledRejections();
            expect(handler).toHaveBeenCalled();
            handler.calls.reset();

            errors.reportUnhandledRejections();
            expect(handler).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('Reporting uncaught exceptions in node.js', function() {
    it('prepends a descriptive message when the error is not an `Error`', function() {
      const globals = nodeGlobals();
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );
      const handler = jasmine.createSpy('errorHandler');

      errors.install();
      errors.pushListener(handler);

      dispatchEvent(globals.listeners, 'uncaughtException', 17);

      expect(handler).toHaveBeenCalledWith(
        new Error('Uncaught exception: 17'),
        undefined
      );
    });

    it('substitutes a descriptive message when the error is falsy', function() {
      const globals = nodeGlobals();
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );
      const handler = jasmine.createSpy('errorHandler');

      errors.install();
      errors.pushListener(handler);

      dispatchEvent(globals.listeners, 'uncaughtException', undefined);

      expect(handler).toHaveBeenCalledWith(
        new Error('Uncaught exception with no error or message'),
        undefined
      );
    });
  });

  describe('#setOverrideListener', function() {
    it('overrides the existing handlers in browsers until removed', function() {
      const globals = browserGlobals();
      const handler0 = jasmine.createSpy('handler0');
      const handler1 = jasmine.createSpy('handler1');
      const overrideHandler = jasmine.createSpy('overrideHandler');
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );

      errors.install();
      errors.pushListener(handler0);
      errors.setOverrideListener(overrideHandler, () => {});
      errors.pushListener(handler1);
      dispatchEvent(globals.listeners, 'error', { error: 'foo' });

      expect(overrideHandler).toHaveBeenCalledWith('foo');
      expect(handler0).not.toHaveBeenCalled();
      expect(handler1).not.toHaveBeenCalled();

      errors.removeOverrideListener();

      const event = { error: 'baz' };
      dispatchEvent(globals.listeners, 'error', event);
      expect(overrideHandler).not.toHaveBeenCalledWith('baz');
      expect(handler1).toHaveBeenCalledWith('baz', event);
    });

    it('overrides the existing handlers in Node until removed', function() {
      const globals = nodeGlobals();
      const handler0 = jasmine.createSpy('handler0');
      const handler1 = jasmine.createSpy('handler1');
      const overrideHandler = jasmine.createSpy('overrideHandler');
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );

      errors.install();
      errors.pushListener(handler0);
      errors.setOverrideListener(overrideHandler);
      errors.pushListener(handler1);

      dispatchEvent(globals.listeners, 'uncaughtException', new Error('foo'));

      expect(overrideHandler).toHaveBeenCalledWith(new Error('foo'));
      expect(handler0).not.toHaveBeenCalled();
      expect(handler1).not.toHaveBeenCalled();

      overrideHandler.calls.reset();
      errors.removeOverrideListener();

      dispatchEvent(globals.listeners, 'uncaughtException', new Error('bar'));
      expect(overrideHandler).not.toHaveBeenCalled();
      expect(handler1).toHaveBeenCalledWith(new Error('bar'), undefined);
    });

    it('handles unhandled promise rejections in browsers', function() {
      const globals = browserGlobals();
      const handler = jasmine.createSpy('handler');
      const overrideHandler = jasmine.createSpy('overrideHandler');
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );

      errors.install();
      errors.pushListener(handler);
      errors.setOverrideListener(overrideHandler, () => {});

      const reason = new Error('bar');

      dispatchEvent(globals.listeners, 'unhandledrejection', { reason });

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
      const globals = nodeGlobals();
      const handler0 = jasmine.createSpy('handler0');
      const handler1 = jasmine.createSpy('handler1');
      const overrideHandler = jasmine.createSpy('overrideHandler');
      const errors = new jasmineUnderTest.GlobalErrors(
        globals.global,
        () => ({})
      );

      errors.install();
      errors.pushListener(handler0);
      errors.setOverrideListener(overrideHandler, () => {});
      errors.pushListener(handler1);

      dispatchEvent(globals.listeners, 'unhandledRejection', new Error('nope'));

      expect(overrideHandler).toHaveBeenCalledWith(new Error('nope'));
      expect(handler0).not.toHaveBeenCalled();
      expect(handler1).not.toHaveBeenCalled();
    });

    it('throws if there is already an override handler', function() {
      const errors = new jasmineUnderTest.GlobalErrors(browserGlobals().global);

      errors.setOverrideListener(() => {}, () => {});
      expect(function() {
        errors.setOverrideListener(() => {}, () => {});
      }).toThrowError("Can't set more than one override listener at a time");
    });
  });

  describe('#removeOverrideListener', function() {
    it("calls the handler's onRemove callback", function() {
      const onRemove = jasmine.createSpy('onRemove');
      const errors = new jasmineUnderTest.GlobalErrors(browserGlobals().global);

      errors.setOverrideListener(() => {}, onRemove);
      errors.removeOverrideListener();

      expect(onRemove).toHaveBeenCalledWith();
    });

    it('does not throw if there is no handler', function() {
      const errors = new jasmineUnderTest.GlobalErrors(browserGlobals().global);

      expect(() => errors.removeOverrideListener()).not.toThrow();
    });
  });

  function browserGlobals() {
    const listeners = {
      error: [],
      unhandledrejection: [],
      rejectionhandled: []
    };
    return {
      listeners,
      global: {
        addEventListener(eventName, listener) {
          listeners[eventName].push(listener);
        },
        removeEventListener(eventName, listener) {
          listeners[eventName] = listeners[eventName].filter(
            l => l !== listener
          );
        }
      }
    };
  }

  function nodeGlobals() {
    const listeners = {
      uncaughtException: [],
      unhandledRejection: [],
      rejectionHandled: []
    };
    return {
      listeners,
      global: {
        process: {
          on(eventName, listener) {
            listeners[eventName].push(listener);
          },
          removeListener(eventName, listener) {
            listeners[eventName] = listeners[eventName].filter(
              l => l !== listener
            );
          },
          removeAllListeners(eventName) {
            listeners[eventName] = [];
          },
          listeners(eventName) {
            return listeners[eventName];
          }
        }
      }
    };
  }

  function dispatchEvent(listeners, eventName, ...args) {
    expect(listeners[eventName].length)
      .withContext(`number of ${eventName} listeners`)
      .toBeGreaterThan(0);

    for (const l of listeners[eventName]) {
      l.apply(null, args);
    }
  }
});
