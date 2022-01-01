describe('HtmlReporter', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('builds the initial DOM elements, including the title banner', function() {
    var container = document.createElement('div'),
      getContainer = function() {
        return container;
      },
      reporter = new jasmineUnderTest.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() {
          return document.createElement.apply(document, arguments);
        },
        createTextNode: function() {
          return document.createTextNode.apply(document, arguments);
        }
      });
    reporter.initialize();

    // Main top-level elements
    expect(container.querySelector('div.jasmine_html-reporter')).toBeTruthy();
    expect(container.querySelector('div.jasmine-banner')).toBeTruthy();
    expect(container.querySelector('div.jasmine-alert')).toBeTruthy();
    expect(container.querySelector('div.jasmine-results')).toBeTruthy();

    expect(container.querySelector('ul.jasmine-symbol-summary')).toBeTruthy();

    // title banner
    var banner = container.querySelector('.jasmine-banner');

    var title = banner.querySelector('a.jasmine-title');
    expect(title.getAttribute('href')).toEqual('http://jasmine.github.io/');
    expect(title.getAttribute('target')).toEqual('_blank');

    var version = banner.querySelector('.jasmine-version');
    expect(version.textContent).toEqual(jasmineUnderTest.version);
  });

  it('builds a single reporter even if initialized multiple times', function() {
    var container = document.createElement('div'),
      getContainer = function() {
        return container;
      },
      reporter = new jasmineUnderTest.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() {
          return document.createElement.apply(document, arguments);
        },
        createTextNode: function() {
          return document.createTextNode.apply(document, arguments);
        }
      });
    reporter.initialize();
    reporter.initialize();
    reporter.initialize();

    expect(
      container.querySelectorAll('div.jasmine_html-reporter').length
    ).toEqual(1);
  });

  describe('when a spec is done', function() {
    describe('and no expectations ran', function() {
      var container, reporter;
      beforeEach(function() {
        container = document.createElement('div');
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: function() {
            return container;
          },
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });

        spyOn(console, 'warn');
        spyOn(console, 'error');

        reporter.initialize();
      });

      it('should log warning to the console and print a special symbol when empty spec status is passed', function() {
        reporter.specDone({
          status: 'passed',
          fullName: 'Some Name',
          passedExpectations: [],
          failedExpectations: []
        });
        /* eslint-disable-next-line no-console */
        expect(console.warn).toHaveBeenCalledWith(
          "Spec 'Some Name' has no expectations."
        );
        var specEl = container.querySelector('.jasmine-symbol-summary li');
        expect(specEl.getAttribute('class')).toEqual('jasmine-empty');
      });

      it('should log error to the console and print a failure symbol when empty spec status is failed', function() {
        reporter.specDone({
          status: 'failed',
          fullName: 'Some Name',
          passedExpectations: [],
          failedExpectations: []
        });
        /* eslint-disable-next-line no-console */
        expect(console.error).toHaveBeenCalledWith(
          "Spec 'Some Name' has no expectations."
        );
        var specEl = container.querySelector('.jasmine-symbol-summary li');
        expect(specEl.getAttribute('class')).toEqual('jasmine-failed');
      });
    });

    it('reports the status symbol of a excluded spec', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });
      reporter.initialize();
      reporter.specDone({
        id: 789,
        status: 'excluded',
        fullName: 'symbols should have titles',
        passedExpectations: [],
        failedExpectations: []
      });

      var specEl = container.querySelector('.jasmine-symbol-summary li');
      expect(specEl.getAttribute('class')).toEqual('jasmine-excluded');
      expect(specEl.getAttribute('id')).toEqual('spec_789');
      expect(specEl.getAttribute('title')).toEqual(
        'symbols should have titles'
      );
    });

    it('reports the status symbol of a pending spec', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });
      reporter.initialize();

      reporter.specDone({
        id: 789,
        status: 'pending',
        passedExpectations: [],
        failedExpectations: []
      });

      var specEl = container.querySelector('.jasmine-symbol-summary li');
      expect(specEl.getAttribute('class')).toEqual('jasmine-pending');
      expect(specEl.getAttribute('id')).toEqual('spec_789');
    });

    it('reports the status symbol of a passing spec', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });
      reporter.initialize();

      reporter.specDone({
        id: 123,
        status: 'passed',
        passedExpectations: [{ passed: true }],
        failedExpectations: []
      });

      var statuses = container.querySelector('.jasmine-symbol-summary');
      var specEl = statuses.querySelector('li');
      expect(specEl.getAttribute('class')).toEqual('jasmine-passed');
      expect(specEl.getAttribute('id')).toEqual('spec_123');
    });

    it('reports the status symbol of a failing spec', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });

      reporter.initialize();

      reporter.specDone({
        id: 345,
        status: 'failed',
        failedExpectations: [],
        passedExpectations: []
      });

      var specEl = container.querySelector('.jasmine-symbol-summary li');
      expect(specEl.getAttribute('class')).toEqual('jasmine-failed');
      expect(specEl.getAttribute('id')).toEqual('spec_345');
    });
  });

  describe('when there are deprecation warnings', function() {
    it('displays the messages in their own alert bars', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });

      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.specDone({
        status: 'passed',
        fullName: 'a spec with a deprecation',
        deprecationWarnings: [{ message: 'spec deprecation' }],
        failedExpectations: [],
        passedExpectations: []
      });
      reporter.suiteDone({
        status: 'passed',
        fullName: 'a suite with a deprecation',
        deprecationWarnings: [{ message: 'suite deprecation' }],
        failedExpectations: []
      });
      reporter.jasmineDone({
        deprecationWarnings: [{ message: 'global deprecation' }],
        failedExpectations: []
      });

      var alertBars = container.querySelectorAll('.jasmine-alert .jasmine-bar');

      expect(alertBars.length).toEqual(4);
      expect(alertBars[1].innerHTML).toMatch(
        /spec deprecation.*\(in spec: a spec with a deprecation\)/
      );
      expect(alertBars[1].getAttribute('class')).toEqual(
        'jasmine-bar jasmine-warning'
      );
      expect(alertBars[2].innerHTML).toMatch(
        /suite deprecation.*\(in suite: a suite with a deprecation\)/
      );
      expect(alertBars[3].innerHTML).toMatch(/global deprecation/);
      expect(alertBars[3].innerHTML).not.toMatch(/in /);
    });

    it('displays expandable stack traces', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        }),
        expander,
        expanderLink,
        expanderContents;

      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.jasmineDone({
        deprecationWarnings: [
          {
            message: 'a deprecation',
            stack: 'a stack trace'
          }
        ],
        failedExpectations: []
      });

      expander = container.querySelector(
        '.jasmine-alert .jasmine-bar .jasmine-expander'
      );
      expanderContents = expander.querySelector('.jasmine-expander-contents');
      expect(expanderContents.textContent).toMatch(/a stack trace/);

      expanderLink = expander.querySelector('a');
      expect(expander).not.toHaveClass('jasmine-expanded');
      expect(expanderLink.textContent).toMatch(/Show stack trace/);

      expanderLink.click();
      expect(expander).toHaveClass('jasmine-expanded');
      expect(expanderLink.textContent).toMatch(/Hide stack trace/);
      expanderLink.click();

      expect(expander).not.toHaveClass('jasmine-expanded');
      expect(expanderLink.textContent).toMatch(/Show stack trace/);
    });

    it('omits the expander when there is no stack trace', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        }),
        warningBar;

      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.jasmineDone({
        deprecationWarnings: [
          {
            message: 'a deprecation',
            stack: ''
          }
        ],
        failedExpectations: []
      });

      warningBar = container.querySelector('.jasmine-warning');
      expect(warningBar.querySelector('.jasmine-expander')).toBeFalsy();
    });

    it('nicely formats the verboseDeprecations note', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        }),
        alertBar;

      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.jasmineDone({
        deprecationWarnings: [
          {
            message:
              'a deprecation\nNote: This message will be shown only once. Set config.verboseDeprecations to true to see every occurrence.'
          }
        ],
        failedExpectations: []
      });

      alertBar = container.querySelector('.jasmine-warning');

      expect(alertBar.innerHTML).toMatch(
        /a deprecation<br>Note: This message will be shown only once/
      );
    });
  });

  describe('when Jasmine is done', function() {
    it('adds a warning to the link title of specs that have no expectations', function() {
      if (!window.console) {
        window.console = { error: function() {} };
      }
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });

      spyOn(console, 'error');

      reporter.initialize();
      reporter.jasmineStarted({});
      reporter.suiteStarted({ id: 1 });
      reporter.specStarted({
        id: 1,
        passedExpectations: [],
        failedExpectations: []
      });
      reporter.specDone({
        id: 1,
        status: 'passed',
        description: 'Spec Description',
        passedExpectations: [],
        failedExpectations: []
      });
      reporter.suiteDone({ id: 1 });
      reporter.jasmineDone({});

      var summary = container.querySelector('.jasmine-summary');
      var suite = summary.childNodes[0];
      var specs = suite.childNodes[1];
      var spec = specs.childNodes[0];
      var specLink = spec.childNodes[0];
      expect(specLink.innerHTML).toMatch(/SPEC HAS NO EXPECTATIONS/);
    });

    it('reports the run time', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });

      reporter.initialize();

      reporter.jasmineStarted({});

      reporter.jasmineDone({ totalTime: 100 });

      var duration = container.querySelector(
        '.jasmine-alert .jasmine-duration'
      );
      expect(duration.innerHTML).toMatch(/finished in 0.1s/);
    });

    it('reports the suite and spec names with status', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          },
          addToExistingQueryString: function(key, value) {
            return '?foo=bar&' + key + '=' + value;
          }
        });
      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.suiteStarted({
        id: 1,
        description: 'A Suite',
        fullName: 'A Suite'
      });

      var specResult = {
        id: 123,
        description: 'with a spec',
        fullName: 'A Suite with a spec',
        status: 'passed',
        failedExpectations: [],
        passedExpectations: [{ passed: true }]
      };
      reporter.specStarted(specResult);
      reporter.specDone(specResult);

      reporter.suiteStarted({
        id: 2,
        description: 'inner suite',
        fullName: 'A Suite inner suite'
      });

      var specResult = {
        id: 124,
        description: 'with another spec',
        fullName: 'A Suite inner suite with another spec',
        status: 'passed',
        failedExpectations: [],
        passedExpectations: [{ passed: true }]
      };
      reporter.specStarted(specResult);
      reporter.specDone(specResult);

      reporter.suiteDone({
        id: 2,
        status: 'things',
        description: 'inner suite',
        fullName: 'A Suite inner suite'
      });

      specResult = {
        id: 209,
        description: 'with a failing spec',
        fullName: 'A Suite inner with a failing spec',
        status: 'failed',
        failedExpectations: [{}],
        passedExpectations: []
      };
      reporter.specStarted(specResult);
      reporter.specDone(specResult);

      reporter.suiteDone({
        id: 1,
        status: 'things',
        description: 'A Suite',
        fullName: 'A Suite'
      });

      reporter.jasmineDone({});
      var summary = container.querySelector('.jasmine-summary');

      expect(summary.childNodes.length).toEqual(1);

      var outerSuite = summary.childNodes[0];
      expect(outerSuite.childNodes.length).toEqual(4);

      var classes = [];
      for (var i = 0; i < outerSuite.childNodes.length; i++) {
        var node = outerSuite.childNodes[i];
        classes.push(node.getAttribute('class'));
      }
      expect(classes).toEqual([
        'jasmine-suite-detail jasmine-things',
        'jasmine-specs',
        'jasmine-suite',
        'jasmine-specs'
      ]);

      var suiteDetail = outerSuite.childNodes[0];
      var suiteLink = suiteDetail.childNodes[0];
      expect(suiteLink.innerHTML).toEqual('A Suite');
      expect(suiteLink.getAttribute('href')).toEqual('/?foo=bar&spec=A Suite');

      var specs = outerSuite.childNodes[1];
      var spec = specs.childNodes[0];
      expect(spec.getAttribute('class')).toEqual('jasmine-passed');
      expect(spec.getAttribute('id')).toEqual('spec-123');

      var specLink = spec.childNodes[0];
      expect(specLink.innerHTML).toEqual('with a spec');
      expect(specLink.getAttribute('href')).toEqual(
        '/?foo=bar&spec=A Suite with a spec'
      );
    });

    it('has an options menu', function() {
      var container = document.createElement('div'),
        getContainer = function() {
          return container;
        },
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });

      reporter.initialize();
      reporter.jasmineDone({});

      var trigger = container.querySelector(
          '.jasmine-run-options .jasmine-trigger'
        ),
        payload = container.querySelector(
          '.jasmine-run-options .jasmine-payload'
        );

      expect(payload).not.toHaveClass('jasmine-open');

      trigger.onclick();

      expect(payload).toHaveClass('jasmine-open');

      trigger.onclick();

      expect(payload).not.toHaveClass('jasmine-open');
    });

    describe('when there are global errors', function() {
      it('displays the exceptions in their own alert bars', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          failedExpectations: [
            {
              message: 'Global After All Failure',
              globalErrorType: 'afterAll'
            },
            { message: 'Your JS is borken', globalErrorType: 'load' }
          ]
        });

        var alertBars = container.querySelectorAll(
          '.jasmine-alert .jasmine-bar'
        );

        expect(alertBars.length).toEqual(3);
        expect(alertBars[1].getAttribute('class')).toEqual(
          'jasmine-bar jasmine-errored'
        );
        expect(alertBars[1].innerHTML).toMatch(
          /AfterAll Global After All Failure/
        );
        expect(alertBars[2].innerHTML).toMatch(
          /Error during loading: Your JS is borken/
        );
        expect(alertBars[2].innerHTML).not.toMatch(/line/);
      });

      it('does not display the "AfterAll" prefix for other error types', function() {
        const container = document.createElement('div');
        const getContainer = function() {
          return container;
        };
        const reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });

        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          failedExpectations: [
            { message: 'load error', globalErrorType: 'load' },
            {
              message: 'lateExpectation error',
              globalErrorType: 'lateExpectation'
            },
            { message: 'lateError error', globalErrorType: 'lateError' }
          ]
        });

        const alertBars = container.querySelectorAll(
          '.jasmine-alert .jasmine-bar'
        );

        expect(alertBars.length).toEqual(4);
        expect(alertBars[1].textContent).toContain('load error');
        expect(alertBars[2].textContent).toContain('lateExpectation error');
        expect(alertBars[3].textContent).toContain('lateError error');

        for (let bar of alertBars) {
          expect(bar.textContent).not.toContain('AfterAll');
        }
      });

      it('displays file and line information if available', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          failedExpectations: [
            {
              message: 'Your JS is borken',
              globalErrorType: 'load',
              filename: 'some/file.js',
              lineno: 42
            }
          ]
        });

        var alertBars = container.querySelectorAll(
          '.jasmine-alert .jasmine-bar'
        );

        expect(alertBars.length).toEqual(2);
        expect(alertBars[1].innerHTML).toMatch(
          /Error during loading: Your JS is borken in some\/file.js line 42/
        );
      });
    });

    describe('UI for stop on spec failure', function() {
      it('should be unchecked for full execution', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        reporter.jasmineDone({});

        var stopOnFailureUI = container.querySelector('.jasmine-fail-fast');
        expect(stopOnFailureUI.checked).toBe(false);
      });

      it('should be checked if stopping short', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ stopOnSpecFailure: true });

        reporter.initialize();
        reporter.jasmineDone({});

        var stopOnFailureUI = container.querySelector('.jasmine-fail-fast');
        expect(stopOnFailureUI.checked).toBe(true);
      });

      it('should navigate and turn the setting on', function() {
        var container = document.createElement('div'),
          navigationHandler = jasmine.createSpy('navigate'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            navigateWithNewParam: navigationHandler,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        reporter.jasmineDone({});

        var stopOnFailureUI = container.querySelector('.jasmine-fail-fast');
        stopOnFailureUI.click();

        expect(navigationHandler).toHaveBeenCalledWith(
          'stopOnSpecFailure',
          true
        );
      });

      it('should navigate and turn the setting off', function() {
        var container = document.createElement('div'),
          navigationHandler = jasmine.createSpy('navigate'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            navigateWithNewParam: navigationHandler,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ stopOnSpecFailure: true });

        reporter.initialize();
        reporter.jasmineDone({});

        var stopOnFailureUI = container.querySelector('.jasmine-fail-fast');
        stopOnFailureUI.click();

        expect(navigationHandler).toHaveBeenCalledWith(
          'stopOnSpecFailure',
          false
        );
      });
    });

    describe('UI for throwing errors on expectation failures', function() {
      it('should be unchecked if not throwing', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        reporter.jasmineDone({});

        var throwingExpectationsUI = container.querySelector('.jasmine-throw');
        expect(throwingExpectationsUI.checked).toBe(false);
      });

      it('should be checked if throwing', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ stopSpecOnExpectationFailure: true });

        reporter.initialize();
        reporter.jasmineDone({});

        var throwingExpectationsUI = container.querySelector('.jasmine-throw');
        expect(throwingExpectationsUI.checked).toBe(true);
      });

      it('should navigate and change the setting to on', function() {
        var container = document.createElement('div'),
          navigateHandler = jasmine.createSpy('navigate'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            navigateWithNewParam: navigateHandler,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        reporter.jasmineDone({});

        var throwingExpectationsUI = container.querySelector('.jasmine-throw');
        throwingExpectationsUI.click();

        expect(navigateHandler).toHaveBeenCalledWith(
          'stopSpecOnExpectationFailure',
          true
        );
      });

      it('should navigate and change the setting to off', function() {
        var container = document.createElement('div'),
          navigateHandler = jasmine.createSpy('navigate'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            navigateWithNewParam: navigateHandler,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ stopSpecOnExpectationFailure: true });

        reporter.initialize();
        reporter.jasmineDone({});

        var throwingExpectationsUI = container.querySelector('.jasmine-throw');
        throwingExpectationsUI.click();

        expect(navigateHandler).toHaveBeenCalledWith(
          'stopSpecOnExpectationFailure',
          false
        );
      });
    });
    describe('UI for hiding disabled specs', function() {
      it('should be unchecked if not hiding disabled specs', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ hideDisabled: false });
        reporter.initialize();
        reporter.jasmineDone({});

        var disabledUI = container.querySelector('.jasmine-disabled');
        expect(disabledUI.checked).toBe(false);
      });

      it('should be checked if hiding disabled', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ hideDisabled: true });
        reporter.initialize();
        reporter.jasmineDone({});

        var disabledUI = container.querySelector('.jasmine-disabled');
        expect(disabledUI.checked).toBe(true);
      });

      it('should not display specs that have been disabled', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ hideDisabled: true });
        reporter.initialize();
        reporter.specDone({
          id: 789,
          status: 'excluded',
          fullName: 'symbols should have titles',
          passedExpectations: [],
          failedExpectations: []
        });

        var specEl = container.querySelector('.jasmine-symbol-summary li');
        expect(specEl.getAttribute('class')).toEqual(
          'jasmine-excluded-no-display'
        );
      });
    });
    describe('UI for running tests in random order', function() {
      it('should be unchecked if not randomizing', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ random: false });
        reporter.initialize();
        reporter.jasmineDone({});

        var randomUI = container.querySelector('.jasmine-random');
        expect(randomUI.checked).toBe(false);
      });

      it('should be checked if randomizing', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ random: true });
        reporter.initialize();
        reporter.jasmineDone({});

        var randomUI = container.querySelector('.jasmine-random');
        expect(randomUI.checked).toBe(true);
      });

      it('should navigate and change the setting to on', function() {
        var container = document.createElement('div'),
          navigateHandler = jasmine.createSpy('navigate'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            navigateWithNewParam: navigateHandler,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ random: false });
        reporter.initialize();
        reporter.jasmineDone({});

        var randomUI = container.querySelector('.jasmine-random');
        randomUI.click();

        expect(navigateHandler).toHaveBeenCalledWith('random', true);
      });

      it('should navigate and change the setting to off', function() {
        var container = document.createElement('div'),
          navigateHandler = jasmine.createSpy('navigate'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            navigateWithNewParam: navigateHandler,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        env.configure({ random: true });
        reporter.initialize();
        reporter.jasmineDone({});

        var randomUI = container.querySelector('.jasmine-random');
        randomUI.click();

        expect(navigateHandler).toHaveBeenCalledWith('random', false);
      });

      it('should show the seed bar if randomizing', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        reporter.jasmineDone({
          order: {
            random: true,
            seed: '424242'
          }
        });

        var seedBar = container.querySelector('.jasmine-seed-bar');
        expect(seedBar.textContent).toBe(', randomized with seed 424242');
        var seedLink = container.querySelector('.jasmine-seed-bar a');
        expect(seedLink.getAttribute('href')).toBe('/?seed=424242');
      });

      it('should not show the current seed bar if not randomizing', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        reporter.jasmineDone({});

        var seedBar = container.querySelector('.jasmine-seed-bar');
        expect(seedBar).toBeNull();
      });

      it('should include non-spec query params in the jasmine-skipped link when present', function() {
        var container = document.createElement('div'),
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: function() {
              return container;
            },
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            },
            addToExistingQueryString: function(key, value) {
              return '?foo=bar&' + key + '=' + value;
            }
          });

        reporter.initialize();
        reporter.jasmineStarted({ totalSpecsDefined: 1 });
        reporter.jasmineDone({ order: { random: true } });

        var skippedLink = container.querySelector('.jasmine-skipped a');
        expect(skippedLink.getAttribute('href')).toEqual('/?foo=bar&spec=');
      });
    });

    describe('and all specs pass', function() {
      var container;
      beforeEach(function() {
        container = document.createElement('div');
        var getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 2 });
        reporter.specDone({
          id: 123,
          description: 'with a spec',
          fullName: 'A Suite with a spec',
          status: 'passed',
          passedExpectations: [{ passed: true }],
          failedExpectations: []
        });
        reporter.specDone({
          id: 124,
          description: 'with another spec',
          fullName: 'A Suite inner suite with another spec',
          status: 'passed',
          passedExpectations: [{ passed: true }],
          failedExpectations: []
        });
        reporter.jasmineDone({});
      });

      it('reports the specs counts', function() {
        var alertBars = container.querySelectorAll(
          '.jasmine-alert .jasmine-bar'
        );

        expect(alertBars.length).toEqual(1);
        expect(alertBars[0].innerHTML).toMatch(/2 specs, 0 failures/);
      });

      it('reports no failure details', function() {
        var specFailure = container.querySelector('.jasmine-failures');

        expect(specFailure.childNodes.length).toEqual(0);
      });

      it('reports no pending specs', function() {
        var alertBar = container.querySelector('.jasmine-alert .jasmine-bar');

        expect(alertBar.innerHTML).not.toMatch(/pending spec[s]/);
      });
    });

    describe('and there are excluded specs', function() {
      var container, reporter, reporterConfig, specStatus;
      beforeEach(function() {
        container = document.createElement('div');
        reporterConfig = {
          env: env,
          getContainer: function() {
            return container;
          },
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        };
        specStatus = {
          id: 123,
          description: 'with a excluded spec',
          fullName: 'A Suite with a excluded spec',
          status: 'excluded',
          passedExpectations: [],
          failedExpectations: []
        };
      });

      describe('when the specs are not filtered', function() {
        beforeEach(function() {
          reporterConfig.filterSpecs = false;
          reporter = new jasmineUnderTest.HtmlReporter(reporterConfig);
          reporter.initialize();
          reporter.jasmineStarted({ totalSpecsDefined: 1 });
          reporter.specStarted(specStatus);
          reporter.specDone(specStatus);
          reporter.jasmineDone({});
        });

        it('shows the excluded spec in the spec list', function() {
          var specList = container.querySelector('.jasmine-summary');

          expect(specList.innerHTML).toContain('with a excluded spec');
        });
      });

      describe('when the specs are filtered', function() {
        beforeEach(function() {
          reporterConfig.filterSpecs = true;
          reporter = new jasmineUnderTest.HtmlReporter(reporterConfig);
          reporter.initialize();
          reporter.jasmineStarted({ totalSpecsDefined: 1 });
          reporter.specStarted(specStatus);
          reporter.specDone(specStatus);
          reporter.jasmineDone({});
        });

        it("doesn't show the excluded spec in the spec list", function() {
          var specList = container.querySelector('.jasmine-summary');

          expect(specList.innerHTML).toEqual('');
        });
      });
    });

    describe('and there are pending specs', function() {
      var container, reporter;
      beforeEach(function() {
        container = document.createElement('div');
        var getContainer = function() {
          return container;
        };
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          }
        });
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 1 });
        var specStatus = {
          id: 123,
          description: 'with a spec',
          fullName: 'A Suite with a spec',
          status: 'pending',
          passedExpectations: [],
          failedExpectations: [],
          pendingReason: 'my custom pending reason'
        };
        reporter.specStarted(specStatus);
        reporter.specDone(specStatus);
        reporter.jasmineDone({});
      });

      it('reports the pending specs count', function() {
        var alertBar = container.querySelector('.jasmine-alert .jasmine-bar');

        expect(alertBar.innerHTML).toMatch(
          /1 spec, 0 failures, 1 pending spec/
        );
      });

      it('reports no failure details', function() {
        var specFailure = container.querySelector('.jasmine-failures');

        expect(specFailure.childNodes.length).toEqual(0);
      });

      it('displays the custom pending reason', function() {
        var pendingDetails = container.querySelector(
          '.jasmine-summary .jasmine-pending'
        );

        expect(pendingDetails.innerHTML).toContain('my custom pending reason');
      });
    });

    describe('and some tests fail', function() {
      var container, reporter;

      beforeEach(function() {
        container = document.createElement('div');
        var getContainer = function() {
          return container;
        };
        reporter = new jasmineUnderTest.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          },
          addToExistingQueryString: function(key, value) {
            return '?foo=bar&' + key + '=' + value;
          }
        });
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 1 });
        reporter.suiteStarted({
          id: 1,
          description: 'A suite'
        });
        reporter.suiteStarted({
          id: 2,
          description: 'inner suite'
        });

        var passingSpecResult = {
          id: 123,
          status: 'passed',
          passedExpectations: [{ passed: true }],
          failedExpectations: []
        };
        reporter.specStarted(passingSpecResult);
        reporter.specDone(passingSpecResult);

        var failingSpecResult = {
          id: 124,
          status: 'failed',
          description: 'a failing spec',
          fullName: 'a suite inner suite a failing spec',
          passedExpectations: [],
          failedExpectations: [
            {
              message: 'a failure message',
              stack: 'a stack trace'
            }
          ]
        };
        var failingSpecResultWithDebugLogs = {
          id: 567,
          status: 'failed',
          description: 'a failing spec',
          fullName: 'a suite inner suite a failing spec',
          passedExpectations: [],
          failedExpectations: [
            {
              message: 'a failure message',
              stack: 'a stack trace'
            }
          ],
          debugLogs: [
            { timestamp: 123, message: 'msg 1' },
            { timestamp: 456, message: 'msg 1' }
          ]
        };

        var passingSuiteResult = {
          id: 1,
          description: 'A suite'
        };
        var failingSuiteResult = {
          id: 2,
          description: 'a suite',
          fullName: 'a suite',
          status: 'failed',
          failedExpectations: [{ message: 'My After All Exception' }]
        };
        reporter.specStarted(failingSpecResult);
        reporter.specDone(failingSpecResult);
        reporter.suiteDone(passingSuiteResult);
        reporter.suiteDone(failingSuiteResult);
        reporter.suiteDone(passingSuiteResult);
        reporter.specStarted(failingSpecResultWithDebugLogs);
        reporter.specDone(failingSpecResultWithDebugLogs);
        reporter.jasmineDone({});
      });

      it('reports the specs counts', function() {
        var alertBar = container.querySelector('.jasmine-alert .jasmine-bar');
        expect(alertBar.innerHTML).toMatch(/3 specs, 3 failures/);
      });

      it('reports failure messages and stack traces', function() {
        var specFailures = container.querySelector('.jasmine-failures');

        expect(specFailures.childNodes.length).toEqual(3);

        var specFailure = specFailures.childNodes[0];
        expect(specFailure.getAttribute('class')).toMatch(/jasmine-failed/);
        expect(specFailure.getAttribute('class')).toMatch(
          /jasmine-spec-detail/
        );

        var specDiv = specFailure.childNodes[0];
        expect(specDiv.getAttribute('class')).toEqual('jasmine-description');

        var message = specFailure.childNodes[1].childNodes[0];
        expect(message.getAttribute('class')).toEqual('jasmine-result-message');
        expect(message.innerHTML).toEqual('a failure message');

        var stackTrace = specFailure.childNodes[1].childNodes[1];
        expect(stackTrace.getAttribute('class')).toEqual('jasmine-stack-trace');
        expect(stackTrace.innerHTML).toEqual('a stack trace');

        var suiteFailure = specFailures.childNodes[0];
        expect(suiteFailure.getAttribute('class')).toMatch(/jasmine-failed/);
        expect(suiteFailure.getAttribute('class')).toMatch(
          /jasmine-spec-detail/
        );

        var suiteDiv = suiteFailure.childNodes[0];
        expect(suiteDiv.getAttribute('class')).toEqual('jasmine-description');

        var suiteMessage = suiteFailure.childNodes[1].childNodes[0];
        expect(suiteMessage.getAttribute('class')).toEqual(
          'jasmine-result-message'
        );
        expect(suiteMessage.innerHTML).toEqual('a failure message');

        var suiteStackTrace = suiteFailure.childNodes[1].childNodes[1];
        expect(suiteStackTrace.getAttribute('class')).toEqual(
          'jasmine-stack-trace'
        );
        expect(suiteStackTrace.innerHTML).toEqual('a stack trace');
      });

      it('reports traces when present', function() {
        var specFailure = container.querySelectorAll(
            '.jasmine-spec-detail.jasmine-failed'
          )[2],
          debugLogs = specFailure.querySelector('.jasmine-debug-log table'),
          rows;

        expect(debugLogs).toBeTruthy();
        rows = debugLogs.querySelectorAll('tbody tr');
        expect(rows.length).toEqual(2);
      });

      it('provides links to focus on a failure and each containing suite', function() {
        var description = container.querySelector(
          '.jasmine-failures .jasmine-description'
        );
        var links = description.querySelectorAll('a');

        expect(description.textContent).toEqual(
          'A suite > inner suite > a failing spec'
        );

        expect(links.length).toEqual(3);
        expect(links[0].textContent).toEqual('A suite');

        expect(links[0].getAttribute('href')).toMatch(/\?foo=bar&spec=A suite/);

        expect(links[1].textContent).toEqual('inner suite');
        expect(links[1].getAttribute('href')).toMatch(
          /\?foo=bar&spec=A suite inner suite/
        );

        expect(links[2].textContent).toEqual('a failing spec');
        expect(links[2].getAttribute('href')).toMatch(
          /\?foo=bar&spec=a suite inner suite a failing spec/
        );
      });

      it('allows switching between failure details and the spec summary', function() {
        var menuBar = container.querySelectorAll('.jasmine-bar')[1];

        expect(menuBar.getAttribute('class')).not.toMatch(/hidden/);

        var link = menuBar.querySelector('a');
        expect(link.innerHTML).toEqual('Failures');
        expect(link.getAttribute('href')).toEqual('#');
      });

      it("sets the reporter to 'Failures List' mode", function() {
        var reporterNode = container.querySelector('.jasmine_html-reporter');
        expect(reporterNode.getAttribute('class')).toMatch(
          'jasmine-failure-list'
        );
      });
    });

    it('counts failures that are reported in the jasmineDone event', function() {
      const container = document.createElement('div');
      function getContainer() {
        return container;
      }
      const reporter = new jasmineUnderTest.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() {
          return document.createElement.apply(document, arguments);
        },
        createTextNode: function() {
          return document.createTextNode.apply(document, arguments);
        },
        addToExistingQueryString: function(key, value) {
          return '?' + key + '=' + value;
        }
      });
      reporter.initialize();

      reporter.jasmineStarted({ totalSpecsDefined: 1 });

      const failingSpecResult = {
        id: 124,
        status: 'failed',
        description: 'a failing spec',
        fullName: 'a suite inner suite a failing spec',
        passedExpectations: [],
        failedExpectations: [
          {
            message: 'a failure message',
            stack: 'a stack trace'
          }
        ]
      };

      reporter.specStarted(failingSpecResult);
      reporter.specDone(failingSpecResult);
      reporter.jasmineDone({
        failedExpectations: [
          {
            message: 'a failure message',
            stack: 'a stack trace'
          },
          {
            message: 'a failure message',
            stack: 'a stack trace'
          }
        ]
      });

      const alertBar = container.querySelector('.jasmine-alert .jasmine-bar');
      expect(alertBar.innerHTML).toMatch(/1 spec, 3 failures/);
    });
  });

  describe('The overall result bar', function() {
    describe("When the jasmineDone event's overallStatus is 'passed'", function() {
      it('has class jasmine-passed', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          overallStatus: 'passed',
          failedExpectations: []
        });

        var alertBar = container.querySelector('.jasmine-overall-result');
        expect(alertBar).toHaveClass('jasmine-passed');
      });
    });

    describe("When the jasmineDone event's overallStatus is 'failed'", function() {
      it('has class jasmine-failed', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          overallStatus: 'failed',
          failedExpectations: []
        });

        var alertBar = container.querySelector('.jasmine-overall-result');
        expect(alertBar).toHaveClass('jasmine-failed');
      });
    });

    describe("When the jasmineDone event's overallStatus is 'incomplete'", function() {
      it('has class jasmine-incomplete', function() {
        var container = document.createElement('div'),
          getContainer = function() {
            return container;
          },
          reporter = new jasmineUnderTest.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          overallStatus: 'incomplete',
          incompleteReason: 'because nope',
          failedExpectations: []
        });

        var alertBar = container.querySelector('.jasmine-overall-result');
        expect(alertBar).toHaveClass('jasmine-incomplete');
        expect(alertBar.textContent).toContain('Incomplete: because nope');
      });
    });
  });
});
