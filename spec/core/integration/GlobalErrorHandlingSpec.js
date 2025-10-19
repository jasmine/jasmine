describe('Global error handling (integration)', function() {
  const isBrowser = typeof window !== 'undefined';
  let env;

  beforeEach(function() {
    specHelpers.registerIntegrationMatchers();
    env = new privateUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('reports errors that occur during loading', async function() {
    const global = {
      ...browserEventMethods(),
      setTimeout: function(fn, delay) {
        return setTimeout(fn, delay);
      },
      clearTimeout: function(fn, delay) {
        clearTimeout(fn, delay);
      },
      queueMicrotask: function(fn) {
        queueMicrotask(fn);
      },
      onerror: function() {}
    };

    env.cleanup_();
    env = new privateUnderTest.Env({ global });
    const reporter = jasmine.createSpyObj('reporter', [
      'jasmineDone',
      'suiteDone',
      'specDone'
    ]);

    env.addReporter(reporter);
    dispatchErrorEvent(global, 'error', {
      message: 'Uncaught SyntaxError: Unexpected end of input',
      error: undefined,
      filename: 'borkenSpec.js',
      lineno: 42
    });
    const error = new Error('ENOCHEESE');
    dispatchErrorEvent(global, 'error', { error });

    await env.execute();

    const e = reporter.jasmineDone.calls.argsFor(0)[0];
    expect(e.failedExpectations).toEqual([
      {
        passed: false,
        globalErrorType: 'load',
        message: 'Uncaught SyntaxError: Unexpected end of input',
        filename: 'borkenSpec.js',
        lineno: 42,
        matcherName: undefined,
        stack: jasmine.any(String)
      },
      {
        passed: false,
        globalErrorType: 'load',
        message: 'ENOCHEESE',
        matcherName: undefined,
        stack: jasmine.any(String)
      }
    ]);
  });

  describe('If suppressLoadErrors: true was passed', function() {
    it('does not install a global error handler during loading', async function() {
      const originalOnerror = jasmine.createSpy('original onerror');
      const global = {
        ...browserEventMethods(),
        setTimeout: function(fn, delay) {
          return setTimeout(fn, delay);
        },
        clearTimeout: function(fn, delay) {
          clearTimeout(fn, delay);
        },
        queueMicrotask: function(fn) {
          queueMicrotask(fn);
        },
        onerror: originalOnerror
      };
      const globalErrors = new privateUnderTest.GlobalErrors(global);
      const onerror = jasmine.createSpy('onerror');
      globalErrors.pushListener(onerror);

      env.cleanup_();
      env = new privateUnderTest.Env({
        suppressLoadErrors: true,
        global,
        GlobalErrors: function() {
          return globalErrors;
        }
      });
      const reporter = jasmine.createSpyObj('reporter', [
        'jasmineDone',
        'suiteDone',
        'specDone'
      ]);

      env.addReporter(reporter);
      global.onerror('Uncaught Error: ENOCHEESE');

      await env.execute();

      const e = reporter.jasmineDone.calls.argsFor(0)[0];
      expect(e.failedExpectations).toEqual([]);
      expect(originalOnerror).toHaveBeenCalledWith('Uncaught Error: ENOCHEESE');
    });
  });

  describe('Handling unhandled exceptions', function() {
    it('routes unhandled exceptions to the running spec', async function() {
      const global = {
        ...browserEventMethods(),
        setTimeout: function(fn, delay) {
          return setTimeout(fn, delay);
        },
        clearTimeout: function(fn, delay) {
          clearTimeout(fn, delay);
        },
        queueMicrotask: function(fn) {
          queueMicrotask(fn);
        }
      };
      env.cleanup_();
      env = new privateUnderTest.Env({ global });
      const reporter = jasmine.createSpyObj('fakeReporter', [
        'specDone',
        'suiteDone'
      ]);

      env.addReporter(reporter);

      env.describe('A suite', function() {
        env.it('fails', function(specDone) {
          setTimeout(function() {
            dispatchErrorEvent(global, 'error', { error: 'fail' });
            specDone();
          });
        });
      });

      await env.execute();

      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'A suite fails',
        ['fail thrown']
      );
    });

    describe('When the most recently running spec has reported specDone', function() {
      it('routes unhandled exceptions to an ancestor suite', async function() {
        const global = {
          ...browserEventMethods(),
          setTimeout: function(fn, delay) {
            return setTimeout(fn, delay);
          },
          clearTimeout: function(fn) {
            clearTimeout(fn);
          },
          queueMicrotask: function(fn) {
            queueMicrotask(fn);
          }
        };

        const realClearStack = privateUnderTest.getClearStack(global);
        const clearStackCallbacks = {};
        let clearStackCallCount = 0;
        spyOn(privateUnderTest, 'getClearStack').and.returnValue(function(fn) {
          clearStackCallCount++;

          if (clearStackCallbacks[clearStackCallCount]) {
            clearStackCallbacks[clearStackCallCount]();
          }

          realClearStack(fn);
        });

        env.cleanup_();
        env = new privateUnderTest.Env({ global });

        let suiteErrors = [];
        env.addReporter({
          suiteDone: function(result) {
            const messages = result.failedExpectations.map(e => e.message);
            suiteErrors = suiteErrors.concat(messages);
          },
          specDone: function() {
            clearStackCallbacks[clearStackCallCount + 1] = function() {
              dispatchErrorEvent(global, 'error', {
                error: 'fail at the end of the reporter queue'
              });
            };
            clearStackCallbacks[clearStackCallCount + 2] = function() {
              dispatchErrorEvent(global, 'error', {
                error: 'fail at the end of the spec queue'
              });
            };
          }
        });

        env.describe('A suite', function() {
          env.it('is finishing when the failure occurs', function() {});
        });

        await env.execute();

        expect(suiteErrors).toEqual([
          'fail at the end of the reporter queue thrown',
          'fail at the end of the spec queue thrown'
        ]);
      });
    });

    it('routes unhandled exceptions to the running suite', async function() {
      const global = {
        ...browserEventMethods(),
        setTimeout: function(fn, delay) {
          return setTimeout(fn, delay);
        },
        clearTimeout: function(fn, delay) {
          clearTimeout(fn, delay);
        },
        queueMicrotask: function(fn) {
          queueMicrotask(fn);
        }
      };
      env.cleanup_();
      env = new privateUnderTest.Env({ global });
      const reporter = jasmine.createSpyObj('fakeReporter', [
        'specDone',
        'suiteDone'
      ]);

      env.addReporter(reporter);

      env.fdescribe('A suite', function() {
        env.it('fails', function(specDone) {
          setTimeout(function() {
            specDone();
            queueMicrotask(function() {
              queueMicrotask(function() {
                dispatchErrorEvent(global, 'error', { error: 'fail' });
              });
            });
          });
        });
      });

      env.describe('Ignored', function() {
        env.it('is not run', function() {});
      });

      await env.execute();

      expect(reporter.specDone).not.toHaveFailedExpectationsForRunnable(
        'A suite fails',
        ['fail thrown']
      );
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'A suite',
        ['fail thrown']
      );
    });

    describe('When the most recently suite has reported suiteDone', function() {
      it('routes unhandled exceptions to an ancestor suite', async function() {
        const global = {
          ...browserEventMethods(),
          setTimeout: function(fn, delay) {
            return setTimeout(fn, delay);
          },
          clearTimeout: function(fn, delay) {
            clearTimeout(fn, delay);
          },
          queueMicrotask: function(fn) {
            queueMicrotask(fn);
          }
        };

        const realClearStack = privateUnderTest.getClearStack(global);
        const clearStackCallbacks = {};
        let clearStackCallCount = 0;
        spyOn(privateUnderTest, 'getClearStack').and.returnValue(function(fn) {
          clearStackCallCount++;

          if (clearStackCallbacks[clearStackCallCount]) {
            clearStackCallbacks[clearStackCallCount]();
          }

          realClearStack(fn);
        });

        env.cleanup_();
        env = new privateUnderTest.Env({ global });

        let suiteErrors = [];
        env.addReporter({
          suiteDone: function(result) {
            const messages = result.failedExpectations.map(e => e.message);
            suiteErrors = suiteErrors.concat(messages);

            if (result.description === 'A nested suite') {
              clearStackCallbacks[clearStackCallCount + 1] = function() {
                dispatchErrorEvent(global, 'error', {
                  error: 'fail at the end of the reporter queue'
                });
              };
              clearStackCallbacks[clearStackCallCount + 2] = function() {
                dispatchErrorEvent(global, 'error', {
                  error: 'fail at the end of the suite queue'
                });
              };
            }
          }
        });

        env.describe('A suite', function() {
          env.describe('A nested suite', function() {
            env.it('a spec', function() {});
          });
        });

        await env.execute();

        expect(suiteErrors).toEqual([
          'fail at the end of the reporter queue thrown',
          'fail at the end of the suite queue thrown'
        ]);
      });
    });

    describe('When the env has started reporting jasmineDone', function() {
      it('logs the error to the console', async function() {
        const global = {
          ...browserEventMethods(),
          setTimeout: function(fn, delay) {
            return setTimeout(fn, delay);
          },
          clearTimeout: function(fn, delay) {
            clearTimeout(fn, delay);
          },
          queueMicrotask: function(fn) {
            queueMicrotask(fn);
          }
        };
        env.cleanup_();
        env = new privateUnderTest.Env({ global });

        spyOn(console, 'error');

        env.addReporter({
          jasmineDone: function() {
            dispatchErrorEvent(global, 'error', { error: 'a very late error' });
          }
        });

        env.it('a spec', function() {});

        await env.execute();

        /* eslint-disable-next-line no-console */
        expect(console.error).toHaveBeenCalledWith(
          'Jasmine received a result after the suite finished:'
        );
        /* eslint-disable-next-line no-console */
        expect(console.error).toHaveBeenCalledWith(
          jasmine.objectContaining({
            message: 'a very late error thrown',
            globalErrorType: 'afterAll'
          })
        );
      });
    });

    it('routes all errors that occur during stack clearing somewhere', async function() {
      const global = {
        ...browserEventMethods(),
        setTimeout: function(fn, delay) {
          return setTimeout(fn, delay);
        },
        clearTimeout: function(fn) {
          clearTimeout(fn);
        },
        queueMicrotask: function(fn) {
          queueMicrotask(fn);
        }
      };

      const realClearStack = privateUnderTest.getClearStack(global);
      let clearStackCallCount = 0;
      let jasmineDone = false;
      const expectedErrors = [];
      const expectedErrorsAfterJasmineDone = [];
      spyOn(privateUnderTest, 'getClearStack').and.returnValue(function(fn) {
        clearStackCallCount++;
        const msg = `Error in clearStack #${clearStackCallCount}`;

        if (jasmineDone) {
          expectedErrorsAfterJasmineDone.push(`${msg} thrown`);
        } else {
          expectedErrors.push(`${msg} thrown`);
        }

        dispatchErrorEvent(global, 'error', { error: msg });
        realClearStack(fn);
      });
      spyOn(console, 'error');

      env.cleanup_();
      env = new privateUnderTest.Env({ global });

      const receivedErrors = [];
      function logErrors(event) {
        for (const failure of event.failedExpectations) {
          receivedErrors.push(failure.message);
        }
      }
      env.addReporter({
        specDone: logErrors,
        suiteDone: logErrors,
        jasmineDone: function(event) {
          jasmineDone = true;
          logErrors(event);
        }
      });

      env.describe('A suite', function() {
        env.it('is finishing when the failure occurs', function() {});
      });

      await env.execute();

      expect(receivedErrors.length).toEqual(expectedErrors.length);

      for (const e of expectedErrors) {
        expect(receivedErrors).toContain(e);
      }

      for (const message of expectedErrorsAfterJasmineDone) {
        /* eslint-disable-next-line no-console */
        expect(console.error).toHaveBeenCalledWith(
          jasmine.objectContaining({ message })
        );
      }
    });
  });

  describe('Handling unhandled promise rejections', function() {
    it('routes unhandled promise rejections to the running spec', async function() {
      const global = {
        ...browserEventMethods(),
        setTimeout: function(fn, delay) {
          return setTimeout(fn, delay);
        },
        clearTimeout: function(fn, delay) {
          clearTimeout(fn, delay);
        },
        queueMicrotask: function(fn) {
          queueMicrotask(fn);
        }
      };
      env.cleanup_();
      env = new privateUnderTest.Env({ global });
      const reporter = jasmine.createSpyObj('fakeReporter', [
        'specDone',
        'suiteDone'
      ]);

      env.addReporter(reporter);

      env.describe('A suite', function() {
        env.it('fails', function(specDone) {
          setTimeout(function() {
            dispatchErrorEvent(global, 'unhandledrejection', {
              reason: 'fail'
            });
            specDone();
          });
        });
      });

      await env.execute();

      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'A suite fails',
        ['Unhandled promise rejection: fail thrown']
      );
    });

    describe('When the most recently running spec has reported specDone', function() {
      it('routes unhandled promise rejections to an ancestor suite', async function() {
        const global = {
          ...browserEventMethods(),
          setTimeout: function(fn, delay) {
            return setTimeout(fn, delay);
          },
          clearTimeout: function(fn) {
            clearTimeout(fn);
          },
          queueMicrotask: function(fn) {
            queueMicrotask(fn);
          }
        };

        const realClearStack = privateUnderTest.getClearStack(global);
        const clearStackCallbacks = {};
        let clearStackCallCount = 0;
        spyOn(privateUnderTest, 'getClearStack').and.returnValue(function(fn) {
          clearStackCallCount++;

          if (clearStackCallbacks[clearStackCallCount]) {
            clearStackCallbacks[clearStackCallCount]();
          }

          realClearStack(fn);
        });

        env.cleanup_();
        env = new privateUnderTest.Env({ global });

        let suiteErrors = [];
        env.addReporter({
          suiteDone: function(result) {
            const messages = result.failedExpectations.map(e => e.message);
            suiteErrors = suiteErrors.concat(messages);
          },
          specDone: function() {
            clearStackCallbacks[clearStackCallCount + 1] = function() {
              dispatchErrorEvent(global, 'unhandledrejection', {
                reason: 'fail at the end of the reporter queue'
              });
            };
            clearStackCallbacks[clearStackCallCount + 2] = function() {
              dispatchErrorEvent(global, 'unhandledrejection', {
                reason: 'fail at the end of the spec queue'
              });
            };
          }
        });

        env.describe('A suite', function() {
          env.it('is finishing when the failure occurs', function() {});
        });

        await env.execute();

        expect(suiteErrors).toEqual([
          'Unhandled promise rejection: fail at the end of the reporter queue thrown',
          'Unhandled promise rejection: fail at the end of the spec queue thrown'
        ]);
      });
    });

    it('routes unhandled promise rejections to the running suite', async function() {
      const global = {
        ...browserEventMethods(),
        setTimeout: function(fn, delay) {
          return setTimeout(fn, delay);
        },
        clearTimeout: function(fn, delay) {
          clearTimeout(fn, delay);
        },
        queueMicrotask: function(fn) {
          queueMicrotask(fn);
        }
      };
      env.cleanup_();
      env = new privateUnderTest.Env({ global });
      const reporter = jasmine.createSpyObj('fakeReporter', [
        'specDone',
        'suiteDone'
      ]);

      env.addReporter(reporter);

      env.fdescribe('A suite', function() {
        env.it('fails', function(specDone) {
          setTimeout(function() {
            specDone();
            queueMicrotask(function() {
              queueMicrotask(function() {
                dispatchErrorEvent(global, 'unhandledrejection', {
                  reason: 'fail'
                });
              });
            });
          });
        });
      });

      env.describe('Ignored', function() {
        env.it('is not run', function() {});
      });

      await env.execute();

      expect(reporter.specDone).not.toHaveFailedExpectationsForRunnable(
        'A suite fails',
        ['Unhandled promise rejection: fail thrown']
      );
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'A suite',
        ['Unhandled promise rejection: fail thrown']
      );
    });

    describe('When the most recently suite has reported suiteDone', function() {
      it('routes unhandled promise rejections to an ancestor suite', async function() {
        const global = {
          ...browserEventMethods(),
          setTimeout: function(fn, delay) {
            return setTimeout(fn, delay);
          },
          clearTimeout: function(fn, delay) {
            clearTimeout(fn, delay);
          },
          queueMicrotask: function(fn) {
            queueMicrotask(fn);
          }
        };

        const realClearStack = privateUnderTest.getClearStack(global);
        const clearStackCallbacks = {};
        let clearStackCallCount = 0;
        spyOn(privateUnderTest, 'getClearStack').and.returnValue(function(fn) {
          clearStackCallCount++;

          if (clearStackCallbacks[clearStackCallCount]) {
            clearStackCallbacks[clearStackCallCount]();
          }

          realClearStack(fn);
        });

        env.cleanup_();
        env = new privateUnderTest.Env({ global });

        let suiteErrors = [];
        env.addReporter({
          suiteDone: function(result) {
            const messages = result.failedExpectations.map(e => e.message);
            suiteErrors = suiteErrors.concat(messages);

            if (result.description === 'A nested suite') {
              clearStackCallbacks[clearStackCallCount + 1] = function() {
                dispatchErrorEvent(global, 'unhandledrejection', {
                  reason: 'fail at the end of the reporter queue'
                });
              };
              clearStackCallbacks[clearStackCallCount + 2] = function() {
                dispatchErrorEvent(global, 'unhandledrejection', {
                  reason: 'fail at the end of the suite queue'
                });
              };
            }
          }
        });

        env.describe('A suite', function() {
          env.describe('A nested suite', function() {
            env.it('a spec', function() {});
          });
        });

        await env.execute();

        expect(suiteErrors).toEqual([
          'Unhandled promise rejection: fail at the end of the reporter queue thrown',
          'Unhandled promise rejection: fail at the end of the suite queue thrown'
        ]);
      });
    });

    describe('When the env has started reporting jasmineDone', function() {
      it('logs the rejection to the console', async function() {
        const global = {
          ...browserEventMethods(),
          setTimeout: function(fn, delay) {
            return setTimeout(fn, delay);
          },
          clearTimeout: function(fn, delay) {
            clearTimeout(fn, delay);
          },
          queueMicrotask: function(fn) {
            queueMicrotask(fn);
          }
        };
        env.cleanup_();
        env = new privateUnderTest.Env({ global });

        spyOn(console, 'error');

        env.addReporter({
          jasmineDone: function() {
            dispatchErrorEvent(global, 'unhandledrejection', {
              reason: 'a very late error'
            });
          }
        });

        env.it('a spec', function() {});

        await env.execute();

        /* eslint-disable-next-line no-console */
        expect(console.error).toHaveBeenCalledWith(
          'Jasmine received a result after the suite finished:'
        );
        /* eslint-disable-next-line no-console */
        expect(console.error).toHaveBeenCalledWith(
          jasmine.objectContaining({
            message: 'Unhandled promise rejection: a very late error thrown',
            globalErrorType: 'afterAll'
          })
        );
      });
    });

    it('routes all unhandled promise rejections that occur during stack clearing somewhere', async function() {
      const global = {
        ...browserEventMethods(),
        setTimeout: function(fn, delay) {
          return setTimeout(fn, delay);
        },
        clearTimeout: function(fn) {
          clearTimeout(fn);
        },
        queueMicrotask: function(fn) {
          queueMicrotask(fn);
        }
      };

      const realClearStack = privateUnderTest.getClearStack(global);
      let clearStackCallCount = 0;
      let jasmineDone = false;
      const expectedErrors = [];
      const expectedErrorsAfterJasmineDone = [];
      spyOn(privateUnderTest, 'getClearStack').and.returnValue(function(fn) {
        clearStackCallCount++;
        const reason = `Error in clearStack #${clearStackCallCount}`;
        const expectedMsg = `Unhandled promise rejection: ${reason} thrown`;

        if (jasmineDone) {
          expectedErrorsAfterJasmineDone.push(expectedMsg);
        } else {
          expectedErrors.push(expectedMsg);
        }

        dispatchErrorEvent(global, 'unhandledrejection', { reason });
        realClearStack(fn);
      });
      spyOn(console, 'error');

      env.cleanup_();
      env = new privateUnderTest.Env({ global });

      const receivedErrors = [];
      function logErrors(event) {
        for (const failure of event.failedExpectations) {
          receivedErrors.push(failure.message);
        }
      }
      env.addReporter({
        specDone: logErrors,
        suiteDone: logErrors,
        jasmineDone: function(event) {
          jasmineDone = true;
          logErrors(event);
        }
      });

      env.describe('A suite', function() {
        env.it('is finishing when the failure occurs', function() {});
      });

      await env.execute();

      expect(receivedErrors.length).toEqual(expectedErrors.length);

      for (const e of expectedErrors) {
        expect(receivedErrors).toContain(e);
      }

      for (const message of expectedErrorsAfterJasmineDone) {
        /* eslint-disable-next-line no-console */
        expect(console.error).toHaveBeenCalledWith(
          jasmine.objectContaining({ message })
        );
      }
    });

    describe('When the detectLateRejectionHandling config option is set', function() {
      describe('When the unhandled rejection event has a promise', function() {
        function makeEvent(suffix) {
          const reason = `rejection ${suffix}`;
          const promise = Promise.reject(reason);
          promise.catch(() => {});
          return { reason, promise };
        }

        let global, reporter;

        beforeEach(function() {
          global = {
            ...browserEventMethods(),
            setTimeout: function(fn, delay) {
              return setTimeout(fn, delay);
            },
            clearTimeout: function(fn, delay) {
              clearTimeout(fn, delay);
            },
            queueMicrotask: function(fn) {
              queueMicrotask(fn);
            }
          };
          env.cleanup_();
          env = new privateUnderTest.Env({ global });
          env.configure({ detectLateRejectionHandling: true });

          reporter = jasmine.createSpyObj('fakeReporter', [
            'specDone',
            'suiteDone'
          ]);

          env.addReporter(reporter);
        });

        describe('During spec execution', function() {
          it('reports the rejection unless a corresponding rejection handled event occurs', async function() {
            env.describe('A suite', function() {
              env.it('fails', function(specDone) {
                setTimeout(function() {
                  const events = ['spec 1', 'spec 2'].map(makeEvent);

                  for (const e of events) {
                    dispatchErrorEvent(global, 'unhandledrejection', e);
                  }

                  dispatchErrorEvent(global, 'rejectionhandled', events[0]);
                  specDone();
                });
              });
            });

            await env.execute();

            expect(reporter.specDone).toHaveBeenCalledWith(
              jasmine.objectContaining({
                fullName: 'A suite fails',
                failedExpectations: [
                  // Only the second rejection should be reported, since the first
                  // one was eventually handled.
                  jasmine.objectContaining({
                    message:
                      'Unhandled promise rejection: rejection spec 2 thrown'
                  })
                ]
              })
            );
          });
        });

        describe('During beforeAll execution', function() {
          it('reports the rejection unless a corresponding rejection handled event occurs by the end of the beforeAll', async function() {
            env.describe('A suite', function() {
              let events;

              env.beforeAll(function(beforeAllDone) {
                setTimeout(function() {
                  events = ['suite 1', 'suite 2'].map(makeEvent);

                  for (const e of events) {
                    dispatchErrorEvent(global, 'unhandledrejection', e);
                  }

                  dispatchErrorEvent(global, 'rejectionhandled', events[0]);
                  beforeAllDone();
                });
              });

              env.it('is a spec', function(specDone) {
                setTimeout(function() {
                  // Should not prevent the second rejection from being reported
                  dispatchErrorEvent(global, 'rejectionhandled', events[1]);
                  specDone();
                });
              });
            });

            await env.execute();

            expect(reporter.suiteDone).toHaveBeenCalledWith(
              jasmine.objectContaining({
                fullName: 'A suite',
                failedExpectations: [
                  // Only the second rejection should be reported, since the first
                  // one was eventually handled.
                  jasmine.objectContaining({
                    message:
                      'Unhandled promise rejection: rejection suite 2 thrown'
                  })
                ]
              })
            );
          });
        });

        describe('During afterAll execution', function() {
          it('reports the rejection unless a corresponding rejection handled event occurs by the end of the afterAll', async function() {
            env.describe('A suite', function() {
              let events;

              env.afterAll(function(beforeAllDone) {
                setTimeout(function() {
                  events = ['suite 1', 'suite 2'].map(makeEvent);

                  for (const e of events) {
                    dispatchErrorEvent(global, 'unhandledrejection', e);
                  }

                  dispatchErrorEvent(global, 'rejectionhandled', events[0]);
                  beforeAllDone();
                });
              });

              env.it('is a spec', function() {});
            });

            await env.execute();

            expect(reporter.suiteDone).toHaveBeenCalledWith(
              jasmine.objectContaining({
                fullName: 'A suite',
                failedExpectations: [
                  // Only the second rejection should be reported, since the first
                  // one was eventually handled.
                  jasmine.objectContaining({
                    message:
                      'Unhandled promise rejection: rejection suite 2 thrown'
                  })
                ]
              })
            );
          });
        });
      });

      describe("When the unhandled rejection event doesn't have a promise", function() {
        it('reports the rejection', async function() {
          const global = {
            ...browserEventMethods(),
            setTimeout: function(fn, delay) {
              return setTimeout(fn, delay);
            },
            clearTimeout: function(fn, delay) {
              clearTimeout(fn, delay);
            },
            queueMicrotask: function(fn) {
              queueMicrotask(fn);
            }
          };
          env = new privateUnderTest.Env({ global });
          env.configure({ detectLateRejectionHandling: true });
          const reporter = jasmine.createSpyObj('fakeReporter', [
            'specDone',
            'suiteDone'
          ]);

          env.addReporter(reporter);

          env.describe('A suite', function() {
            env.it('fails', function(specDone) {
              setTimeout(function() {
                dispatchErrorEvent(global, 'unhandledrejection', {
                  reason: 'fail'
                });
                specDone();
              });
            });
          });

          await env.execute();

          expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
            'A suite fails',
            ['Unhandled promise rejection: fail thrown']
          );
        });
      });
    });
  });

  it('works when the suite is run multiple times', async function() {
    const global = {
      ...browserEventMethods(),
      setTimeout: function(fn, delay) {
        return setTimeout(fn, delay);
      },
      clearTimeout: function(fn, delay) {
        clearTimeout(fn, delay);
      },
      queueMicrotask: function(fn) {
        queueMicrotask(fn);
      }
    };
    env.cleanup_();
    env = new privateUnderTest.Env({ global });
    env.configure({ autoCleanClosures: false });
    const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);

    env.it('fails', function(specDone) {
      setTimeout(function() {
        dispatchErrorEvent(global, 'error', { error: 'fail' });
        specDone();
      });
    });

    await env.execute();
    reporter.specDone.calls.reset();
    await env.execute();

    expect(reporter.specDone).toHaveFailedExpectationsForRunnable('fails', [
      'fail thrown'
    ]);
  });

  describe('#spyOnGlobalErrorsAsync', function() {
    const leftInstalledMessage =
      'Global error spy was not uninstalled. ' +
      '(Did you forget to await the return value of spyOnGlobalErrorsAsync?)';

    function resultForRunable(reporterSpy, fullName) {
      const match = reporterSpy.calls.all().find(function(call) {
        return call.args[0].fullName === fullName;
      });

      if (!match) {
        throw new Error(`No result for runable "${fullName}"`);
      }

      return match.args[0];
    }

    it('allows global errors to be suppressed and spied on', async function() {
      env.it('a passing spec', async function() {
        await env.spyOnGlobalErrorsAsync(async spy => {
          setTimeout(() => {
            throw new Error('nope');
          });
          await new Promise(resolve => setTimeout(resolve));
          env.expect(spy).toHaveBeenCalledWith(new Error('nope'));
        });
      });

      env.it('a failing spec', async function() {
        await env.spyOnGlobalErrorsAsync(async spy => {
          setTimeout(() => {
            throw new Error('yep');
          });
          await new Promise(resolve => setTimeout(resolve));
          env.expect(spy).toHaveBeenCalledWith(new Error('nope'));
        });
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await jasmine.spyOnGlobalErrorsAsync(async function(globalErrorSpy) {
        await env.execute();

        if (isBrowser) {
          // Verify that there were no unexpected errors
          expect(globalErrorSpy).toHaveBeenCalledTimes(2);
          expect(globalErrorSpy).toHaveBeenCalledWith(new Error('nope'));
          expect(globalErrorSpy).toHaveBeenCalledWith(new Error('yep'));
        }
      });

      const passingResult = resultForRunable(
        reporter.specDone,
        'a passing spec'
      );
      expect(passingResult.status).toEqual('passed');
      expect(passingResult.failedExpectations).toEqual([]);

      const failingResult = resultForRunable(
        reporter.specDone,
        'a failing spec'
      );
      expect(failingResult.status).toEqual('failed');
      expect(failingResult.failedExpectations[0].message).toMatch(
        /Expected \$\[0] = Error: yep to equal Error: nope\./
      );
    });

    it('cleans up if the global error spy is left installed in a beforeAll', async function() {
      env.configure({ random: false });

      env.describe('Suite 1', function() {
        env.beforeAll(async function() {
          env.spyOnGlobalErrorsAsync(function() {
            // Never resolves
            return new Promise(() => {});
          });
        });

        env.it('a spec', function() {});
      });

      env.describe('Suite 2', function() {
        env.it('a spec', async function() {
          setTimeout(function() {
            throw new Error('should fail the spec');
          });
          await new Promise(resolve => setTimeout(resolve));
        });
      });

      const reporter = jasmine.createSpyObj('reporter', [
        'specDone',
        'suiteDone'
      ]);
      env.addReporter(reporter);
      await jasmine.spyOnGlobalErrorsAsync(async function(globalErrorSpy) {
        await env.execute();

        if (isBrowser) {
          // Verify that there were no unexpected errors
          expect(globalErrorSpy).toHaveBeenCalledTimes(1);
          expect(globalErrorSpy).toHaveBeenCalledWith(
            new Error('should fail the spec')
          );
        }
      });

      const suiteResult = resultForRunable(reporter.suiteDone, 'Suite 1');
      expect(suiteResult.status).toEqual('failed');
      expect(suiteResult.failedExpectations.length).toEqual(1);
      expect(suiteResult.failedExpectations[0].message).toEqual(
        leftInstalledMessage
      );

      const specResult = resultForRunable(reporter.specDone, 'Suite 2 a spec');
      expect(specResult.status).toEqual('failed');
      expect(specResult.failedExpectations.length).toEqual(1);
      expect(specResult.failedExpectations[0].message).toMatch(
        /Error: should fail the spec/
      );
    });

    it('cleans up if the global error spy is left installed in an afterAll', async function() {
      env.configure({ random: false });

      env.describe('Suite 1', function() {
        env.afterAll(async function() {
          env.spyOnGlobalErrorsAsync(function() {
            // Never resolves
            return new Promise(() => {});
          });
        });

        env.it('a spec', function() {});
      });

      env.describe('Suite 2', function() {
        env.it('a spec', async function() {
          setTimeout(function() {
            throw new Error('should fail the spec');
          });
          await new Promise(resolve => setTimeout(resolve));
        });
      });

      const reporter = jasmine.createSpyObj('reporter', [
        'specDone',
        'suiteDone'
      ]);
      env.addReporter(reporter);
      await jasmine.spyOnGlobalErrorsAsync(async function(globalErrorSpy) {
        await env.execute();

        if (isBrowser) {
          // Verify that there were no unexpected errors
          expect(globalErrorSpy).toHaveBeenCalledTimes(1);
          expect(globalErrorSpy).toHaveBeenCalledWith(
            new Error('should fail the spec')
          );
        }
      });

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'Suite 1',
        [leftInstalledMessage]
      );

      const suiteResult = resultForRunable(reporter.suiteDone, 'Suite 1');
      expect(suiteResult.status).toEqual('failed');
      expect(suiteResult.failedExpectations.length).toEqual(1);
      expect(suiteResult.failedExpectations[0].message).toEqual(
        leftInstalledMessage
      );

      const specResult = resultForRunable(reporter.specDone, 'Suite 2 a spec');
      expect(specResult.status).toEqual('failed');
      expect(specResult.failedExpectations.length).toEqual(1);
      expect(specResult.failedExpectations[0].message).toMatch(
        /Error: should fail the spec/
      );
    });

    it('cleans up if the global error spy is left installed in a beforeEach', async function() {
      env.configure({ random: false });

      env.describe('Suite 1', function() {
        env.beforeEach(async function() {
          env.spyOnGlobalErrorsAsync(function() {
            // Never resolves
            return new Promise(() => {});
          });
        });

        env.it('a spec', function() {});
      });

      env.describe('Suite 2', function() {
        env.it('a spec', async function() {
          setTimeout(function() {
            throw new Error('should fail the spec');
          });
          await new Promise(resolve => setTimeout(resolve));
        });
      });

      const reporter = jasmine.createSpyObj('reporter', [
        'specDone',
        'suiteDone'
      ]);
      env.addReporter(reporter);

      await jasmine.spyOnGlobalErrorsAsync(async function(globalErrorSpy) {
        await env.execute();

        if (isBrowser) {
          // Verify that there were no unexpected errors
          expect(globalErrorSpy).toHaveBeenCalledTimes(1);
          expect(globalErrorSpy).toHaveBeenCalledWith(
            new Error('should fail the spec')
          );
        }
      });

      const spec1Result = resultForRunable(reporter.specDone, 'Suite 1 a spec');
      expect(spec1Result.status).toEqual('failed');
      expect(spec1Result.failedExpectations.length).toEqual(1);
      expect(spec1Result.failedExpectations[0].message).toEqual(
        leftInstalledMessage
      );

      const spec2Result = resultForRunable(reporter.specDone, 'Suite 2 a spec');
      expect(spec2Result.status).toEqual('failed');
      expect(spec2Result.failedExpectations.length).toEqual(1);
      expect(spec2Result.failedExpectations[0].message).toMatch(
        /Error: should fail the spec/
      );
    });

    it('cleans up if the global error spy is left installed in an it', async function() {
      env.configure({ random: false });

      env.it('spec 1', async function() {
        env.spyOnGlobalErrorsAsync(function() {
          // Never resolves
          return new Promise(() => {});
        });
      });

      env.it('spec 2', async function() {
        setTimeout(function() {
          throw new Error('should fail the spec');
        });
        await new Promise(resolve => setTimeout(resolve));
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);
      await jasmine.spyOnGlobalErrorsAsync(async function(globalErrorSpy) {
        await env.execute();

        if (isBrowser) {
          // Verify that there were no unexpected errors
          expect(globalErrorSpy).toHaveBeenCalledTimes(1);
          expect(globalErrorSpy).toHaveBeenCalledWith(
            new Error('should fail the spec')
          );
        }
      });

      const spec1Result = resultForRunable(reporter.specDone, 'spec 1');
      expect(spec1Result.status).toEqual('failed');
      expect(spec1Result.failedExpectations.length).toEqual(1);
      expect(spec1Result.failedExpectations[0].message).toEqual(
        leftInstalledMessage
      );

      const spec2Result = resultForRunable(reporter.specDone, 'spec 2');
      expect(spec2Result.status).toEqual('failed');
      expect(spec2Result.failedExpectations.length).toEqual(1);
      expect(spec2Result.failedExpectations[0].message).toMatch(
        /Error: should fail the spec/
      );
    });

    it('cleans up if the global error spy is left installed in an afterEach', async function() {
      env.configure({ random: false });

      env.describe('Suite 1', function() {
        env.afterEach(async function() {
          env.spyOnGlobalErrorsAsync(function() {
            // Never resolves
            return new Promise(() => {});
          });
        });

        env.it('a spec', function() {});
      });

      env.describe('Suite 2', function() {
        env.it('a spec', async function() {
          setTimeout(function() {
            throw new Error('should fail the spec');
          });
          await new Promise(resolve => setTimeout(resolve));
        });
      });

      const reporter = jasmine.createSpyObj('reporter', [
        'specDone',
        'suiteDone'
      ]);
      env.addReporter(reporter);
      await jasmine.spyOnGlobalErrorsAsync(async function(globalErrorSpy) {
        await env.execute();

        if (isBrowser) {
          // Verify that there were no unexpected errors
          expect(globalErrorSpy).toHaveBeenCalledTimes(1);
          expect(globalErrorSpy).toHaveBeenCalledWith(
            new Error('should fail the spec')
          );
        }
      });

      const spec1Result = resultForRunable(reporter.specDone, 'Suite 1 a spec');
      expect(spec1Result.status).toEqual('failed');
      expect(spec1Result.failedExpectations.length).toEqual(1);
      expect(spec1Result.failedExpectations[0].message).toEqual(
        leftInstalledMessage
      );

      const spec2Result = resultForRunable(reporter.specDone, 'Suite 2 a spec');
      expect(spec2Result.status).toEqual('failed');
      expect(spec2Result.failedExpectations.length).toEqual(1);
      expect(spec2Result.failedExpectations[0].message).toMatch(
        /Error: should fail the spec/
      );
    });
  });

  function browserEventMethods() {
    return {
      listeners_: { error: [], unhandledrejection: [], rejectionhandled: [] },
      addEventListener(eventName, listener) {
        this.listeners_[eventName].push(listener);
      },
      removeEventListener(eventName, listener) {
        this.listeners_[eventName] = this.listeners_[eventName].filter(
          l => l !== listener
        );
      }
    };
  }

  function dispatchErrorEvent(global, eventName, event) {
    expect(global.listeners_[eventName].length)
      .withContext(`number of ${eventName} listeners`)
      .toBeGreaterThan(0);

    for (const l of global.listeners_[eventName]) {
      l(event);
    }
  }
});
