describe('HtmlReporterV2', function() {
  let env, container, location;

  beforeEach(function() {
    container = document.createElement('div');
    env = new privateUnderTest.Env();
    location = { search: '' };
  });

  afterEach(function() {
    env.cleanup_();
  });

  function setup(options = {}) {
    return new jasmineUnderTest.HtmlReporterV2({
      env,
      container,
      urls: new jasmineUnderTest.HtmlReporterV2Urls(),
      queryString: new jasmineUnderTest.QueryString({
        getWindowLocation() {
          return location;
        }
      }),
      ...options
    });
  }

  it('builds the initial DOM elements, including the title banner', function() {
    const reporter = setup();
    reporter.initialize();

    // Main top-level elements
    expect(container.querySelector('div.jasmine_html-reporter')).toBeTruthy();
    expect(container.querySelector('div.jasmine-banner')).toBeTruthy();
    expect(container.querySelector('div.jasmine-alert')).toBeTruthy();
    expect(container.querySelector('div.jasmine-results')).toBeTruthy();

    expect(container.querySelector('ul.jasmine-symbol-summary')).toBeTruthy();

    // title banner
    const banner = container.querySelector('.jasmine-banner');

    const title = banner.querySelector('a.jasmine-title');
    expect(title.getAttribute('href')).toEqual('http://jasmine.github.io/');
    expect(title.getAttribute('target')).toEqual('_blank');

    const version = banner.querySelector('.jasmine-version');
    expect(version.textContent).toEqual(jasmineUnderTest.version);
  });

  it('builds a single reporter even if initialized multiple times', function() {
    const reporter = setup();
    reporter.initialize();
    reporter.initialize();
    reporter.initialize();

    expect(
      container.querySelectorAll('div.jasmine_html-reporter').length
    ).toEqual(1);
  });

  describe('when a spec is done', function() {
    describe('and no expectations ran', function() {
      let reporter;

      beforeEach(function() {
        reporter = setup();

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
        const specEl = container.querySelector('.jasmine-symbol-summary li');
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
        const specEl = container.querySelector('.jasmine-symbol-summary li');
        expect(specEl.getAttribute('class')).toEqual('jasmine-failed');
      });
    });

    it('reports the status symbol of a excluded spec', function() {
      const reporter = setup();
      reporter.initialize();
      reporter.specDone({
        id: 789,
        status: 'excluded',
        fullName: 'symbols should have titles',
        passedExpectations: [],
        failedExpectations: []
      });

      const specEl = container.querySelector('.jasmine-symbol-summary li');
      expect(specEl.getAttribute('class')).toEqual('jasmine-excluded');
      expect(specEl.getAttribute('id')).toEqual('spec_789');
      expect(specEl.getAttribute('title')).toEqual(
        'symbols should have titles'
      );
    });

    it('reports the status symbol of a pending spec', function() {
      const reporter = setup();
      reporter.initialize();

      reporter.specDone({
        id: 789,
        status: 'pending',
        passedExpectations: [],
        failedExpectations: []
      });

      const specEl = container.querySelector('.jasmine-symbol-summary li');
      expect(specEl.getAttribute('class')).toEqual('jasmine-pending');
      expect(specEl.getAttribute('id')).toEqual('spec_789');
    });

    it('reports the status symbol of a passing spec', function() {
      const reporter = setup();
      reporter.initialize();

      reporter.specDone({
        id: 123,
        status: 'passed',
        passedExpectations: [{ passed: true }],
        failedExpectations: []
      });

      const statuses = container.querySelector('.jasmine-symbol-summary');
      const specEl = statuses.querySelector('li');
      expect(specEl.getAttribute('class')).toEqual('jasmine-passed');
      expect(specEl.getAttribute('id')).toEqual('spec_123');
    });

    it('reports the status symbol of a failing spec', function() {
      const reporter = setup();
      reporter.initialize();

      reporter.specDone({
        id: 345,
        status: 'failed',
        failedExpectations: [],
        passedExpectations: []
      });

      const specEl = container.querySelector('.jasmine-symbol-summary li');
      expect(specEl.getAttribute('class')).toEqual('jasmine-failed');
      expect(specEl.getAttribute('id')).toEqual('spec_345');
    });
  });

  describe('when there are deprecation warnings', function() {
    it('displays the messages in their own alert bars', function() {
      const reporter = setup();
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

      const alertBars = container.querySelectorAll(
        '.jasmine-alert .jasmine-bar'
      );

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
      const reporter = setup();
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

      const expander = container.querySelector(
        '.jasmine-alert .jasmine-bar .jasmine-expander'
      );
      const expanderContents = expander.querySelector(
        '.jasmine-expander-contents'
      );
      expect(expanderContents.textContent).toMatch(/a stack trace/);

      const expanderLink = expander.querySelector('a');
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
      const reporter = setup();
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

      const warningBar = container.querySelector('.jasmine-warning');
      expect(warningBar.querySelector('.jasmine-expander')).toBeFalsy();
    });

    it('nicely formats the verboseDeprecations note', function() {
      const reporter = setup();
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

      const alertBar = container.querySelector('.jasmine-warning');

      expect(alertBar.innerHTML).toMatch(
        /a deprecation<br>Note: This message will be shown only once/
      );
    });
  });

  describe('when Jasmine is done', function() {
    it('adds a warning to the link title of specs that have no expectations', function() {
      const reporter = setup();
      spyOn(console, 'error');

      reporter.initialize();
      reporter.jasmineStarted({});
      reporter.suiteStarted({ id: 1 });
      reporter.specDone({
        id: 1,
        status: 'passed',
        description: 'Spec Description',
        passedExpectations: [],
        failedExpectations: []
      });
      reporter.suiteDone({ id: 1 });
      reporter.jasmineDone({});

      const summary = container.querySelector('.jasmine-summary');
      const suite = summary.childNodes[0];
      const specs = suite.childNodes[1];
      const spec = specs.childNodes[0];
      const specLink = spec.childNodes[0];
      expect(specLink.innerHTML).toMatch(/SPEC HAS NO EXPECTATIONS/);
    });

    it('reports the run time', function() {
      const reporter = setup();
      reporter.initialize();

      reporter.jasmineStarted({});

      reporter.jasmineDone({ totalTime: 100 });

      const duration = container.querySelector(
        '.jasmine-alert .jasmine-duration'
      );
      expect(duration.innerHTML).toMatch(/finished in 0.1s/);
    });

    it('reports the suite names with status, and spec names with status and duration', function() {
      const reporter = setup({
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

      let specResult = {
        id: 123,
        parentSuiteId: 1,
        description: 'with a spec',
        fullName: 'A Suite with a spec',
        status: 'passed',
        failedExpectations: [],
        passedExpectations: [{ passed: true }],
        duration: 1230
      };
      reporter.specDone(specResult);

      reporter.suiteStarted({
        id: 2,
        description: 'inner suite',
        fullName: 'A Suite inner suite'
      });

      specResult = {
        id: 124,
        description: 'with another spec',
        fullName: 'A Suite inner suite with another spec',
        status: 'passed',
        failedExpectations: [],
        passedExpectations: [{ passed: true }],
        duration: 1240
      };
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
        passedExpectations: [],
        duration: 2090
      };
      reporter.specDone(specResult);

      reporter.suiteDone({
        id: 1,
        status: 'things',
        description: 'A Suite',
        fullName: 'A Suite'
      });

      reporter.jasmineDone({});
      const summary = container.querySelector('.jasmine-summary');

      expect(summary.childNodes.length).toEqual(1);

      const outerSuite = summary.childNodes[0];
      expect(outerSuite.childNodes.length).toEqual(4);

      const classes = [];
      for (let i = 0; i < outerSuite.childNodes.length; i++) {
        const node = outerSuite.childNodes[i];
        classes.push(node.getAttribute('class'));
      }
      expect(classes).toEqual([
        'jasmine-suite-detail jasmine-things',
        'jasmine-specs',
        'jasmine-suite',
        'jasmine-specs'
      ]);

      const suiteDetail = outerSuite.childNodes[0];
      const suiteLink = suiteDetail.childNodes[0];
      expect(suiteLink.innerHTML).toEqual('A Suite');
      expect(suiteLink.getAttribute('href')).toEqual(
        `/?path=${encodeURIComponent('["A Suite"]')}`
      );

      const specs = outerSuite.childNodes[1];
      const spec = specs.childNodes[0];
      expect(spec.getAttribute('class')).toEqual('jasmine-passed');
      expect(spec.getAttribute('id')).toEqual('spec-123');

      const specLink = spec.childNodes[0];
      expect(specLink.innerHTML).toEqual('with a spec');
      expect(specLink.getAttribute('href')).toEqual(
        `/?path=${encodeURIComponent('["A Suite","with a spec"]')}`
      );

      const specDuration = spec.childNodes[1];
      expect(specDuration.innerHTML).toEqual('(1230ms)');
    });

    it('has an options menu', function() {
      const reporter = setup();
      reporter.initialize();
      reporter.jasmineDone({});

      const trigger = container.querySelector(
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
        const reporter = setup();
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

        const alertBars = container.querySelectorAll(
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
        const reporter = setup();
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
        const reporter = setup();
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

        const alertBars = container.querySelectorAll(
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
        const reporter = setup();
        reporter.initialize();
        reporter.jasmineDone({});

        const stopOnFailureUI = container.querySelector('.jasmine-fail-fast');
        expect(stopOnFailureUI.checked).toBe(false);
      });

      it('should be checked if stopping short', function() {
        const reporter = setup();
        env.configure({ stopOnSpecFailure: true });

        reporter.initialize();
        reporter.jasmineDone({});

        const stopOnFailureUI = container.querySelector('.jasmine-fail-fast');
        expect(stopOnFailureUI.checked).toBe(true);
      });

      it('should navigate and turn the setting on', function() {
        const reporter = setup();

        reporter.initialize();
        reporter.jasmineDone({});

        const stopOnFailureUI = container.querySelector('.jasmine-fail-fast');
        stopOnFailureUI.click();

        expect(location.search).toEqual('?stopOnSpecFailure=true');
      });

      it('should navigate and turn the setting off', function() {
        const reporter = setup();
        env.configure({ stopOnSpecFailure: true });

        reporter.initialize();
        reporter.jasmineDone({});

        const stopOnFailureUI = container.querySelector('.jasmine-fail-fast');
        stopOnFailureUI.click();

        expect(location.search).toEqual('?stopOnSpecFailure=false');
      });
    });

    describe('UI for throwing errors on expectation failures', function() {
      it('should be unchecked if not throwing', function() {
        const reporter = setup();
        reporter.initialize();
        reporter.jasmineDone({});

        const throwingExpectationsUI = container.querySelector(
          '.jasmine-throw'
        );
        expect(throwingExpectationsUI.checked).toBe(false);
      });

      it('should be checked if throwing', function() {
        const reporter = setup();
        env.configure({ stopSpecOnExpectationFailure: true });

        reporter.initialize();
        reporter.jasmineDone({});

        const throwingExpectationsUI = container.querySelector(
          '.jasmine-throw'
        );
        expect(throwingExpectationsUI.checked).toBe(true);
      });

      it('should navigate and change the setting to on', function() {
        const reporter = setup();
        reporter.initialize();
        reporter.jasmineDone({});

        const throwingExpectationsUI = container.querySelector(
          '.jasmine-throw'
        );
        throwingExpectationsUI.click();

        expect(location.search).toEqual('?stopSpecOnExpectationFailure=true');
      });

      it('should navigate and change the setting to off', function() {
        const reporter = setup();

        env.configure({ stopSpecOnExpectationFailure: true });

        reporter.initialize();
        reporter.jasmineDone({});

        const throwingExpectationsUI = container.querySelector(
          '.jasmine-throw'
        );
        throwingExpectationsUI.click();

        expect(location.search).toEqual('?stopSpecOnExpectationFailure=false');
      });
    });

    describe('UI for hiding disabled specs', function() {
      it('should be unchecked if not hiding disabled specs', function() {
        const reporter = setup();
        env.configure({ hideDisabled: false });
        reporter.initialize();
        reporter.jasmineDone({});

        const disabledUI = container.querySelector('.jasmine-disabled');
        expect(disabledUI.checked).toBe(false);
      });

      it('should be checked if hiding disabled', function() {
        const reporter = setup();
        env.configure({ hideDisabled: true });
        reporter.initialize();
        reporter.jasmineDone({});

        const disabledUI = container.querySelector('.jasmine-disabled');
        expect(disabledUI.checked).toBe(true);
      });

      it('should not display specs that have been disabled', function() {
        const reporter = setup();
        env.configure({ hideDisabled: true });
        reporter.initialize();
        reporter.specDone({
          id: 789,
          status: 'excluded',
          fullName: 'symbols should have titles',
          passedExpectations: [],
          failedExpectations: []
        });

        const specEl = container.querySelector('.jasmine-symbol-summary li');
        expect(specEl.getAttribute('class')).toEqual(
          'jasmine-excluded-no-display'
        );
      });
    });

    describe('UI for running tests in random order', function() {
      it('should be unchecked if not randomizing', function() {
        const reporter = setup();
        env.configure({ random: false });
        reporter.initialize();
        reporter.jasmineDone({});

        const randomUI = container.querySelector('.jasmine-random');
        expect(randomUI.checked).toBe(false);
      });

      it('should be checked if randomizing', function() {
        const reporter = setup();
        env.configure({ random: true });
        reporter.initialize();
        reporter.jasmineDone({});

        const randomUI = container.querySelector('.jasmine-random');
        expect(randomUI.checked).toBe(true);
      });

      it('should navigate and change the setting to on', function() {
        const reporter = setup();

        env.configure({ random: false });
        reporter.initialize();
        reporter.jasmineDone({});

        const randomUI = container.querySelector('.jasmine-random');
        randomUI.click();

        expect(location.search).toEqual('?random=true');
      });

      it('should navigate and change the setting to off', function() {
        const reporter = setup();

        env.configure({ random: true });
        reporter.initialize();
        reporter.jasmineDone({});

        const randomUI = container.querySelector('.jasmine-random');
        randomUI.click();

        expect(location.search).toEqual('?random=false');
      });

      it('should show the seed bar if randomizing', function() {
        const reporter = setup();
        reporter.initialize();
        reporter.jasmineDone({
          order: {
            random: true,
            seed: '424242'
          }
        });

        const seedBar = container.querySelector('.jasmine-seed-bar');
        expect(seedBar.textContent).toBe(', randomized with seed 424242');
        const seedLink = container.querySelector('.jasmine-seed-bar a');
        expect(seedLink.getAttribute('href')).toBe('/?seed=424242');
      });

      it('should not show the current seed bar if not randomizing', function() {
        const reporter = setup();
        reporter.initialize();
        reporter.jasmineDone({});

        const seedBar = container.querySelector('.jasmine-seed-bar');
        expect(seedBar).toBeNull();
      });

      it('should include non-spec query params in the jasmine-skipped link when present', function() {
        const reporter = setup({
          addToExistingQueryString: function(key, value) {
            return '?foo=bar&' + key + '=' + value;
          }
        });

        reporter.initialize();
        reporter.jasmineStarted({ totalSpecsDefined: 1 });
        reporter.jasmineDone({ order: { random: true } });

        const skippedLink = container.querySelector('.jasmine-skipped a');
        expect(skippedLink.getAttribute('href')).toEqual('/?path=');
      });
    });

    describe('and all specs pass', function() {
      beforeEach(function() {
        const reporter = setup();
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
        const alertBars = container.querySelectorAll(
          '.jasmine-alert .jasmine-bar'
        );

        expect(alertBars.length).toEqual(1);
        expect(alertBars[0].innerHTML).toMatch(/2 specs, 0 failures/);
      });

      it('reports no failure details', function() {
        const specFailure = container.querySelector('.jasmine-failures');

        expect(specFailure.childNodes.length).toEqual(0);
      });

      it('reports no pending specs', function() {
        const alertBar = container.querySelector('.jasmine-alert .jasmine-bar');

        expect(alertBar.innerHTML).not.toMatch(/pending spec[s]/);
      });
    });

    describe('and there are excluded specs', function() {
      let reporter, specStatus;

      beforeEach(function() {
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
          reporter = setup({
            urls: {
              filteringSpecs() {
                return false;
              }
            }
          });
          reporter.initialize();
          reporter.jasmineStarted({ totalSpecsDefined: 1 });
          reporter.specDone(specStatus);
          reporter.jasmineDone({});
        });

        it('shows the excluded spec in the spec list', function() {
          const specList = container.querySelector('.jasmine-summary');

          expect(specList.innerHTML).toContain('with a excluded spec');
        });
      });

      describe('when the specs are filtered', function() {
        beforeEach(function() {
          reporter = setup({
            urls: {
              filteringSpecs() {
                return true;
              }
            }
          });
          reporter.initialize();
          reporter.jasmineStarted({ totalSpecsDefined: 1 });
          reporter.specDone(specStatus);
          reporter.jasmineDone({});
        });

        it("doesn't show the excluded spec in the spec list", function() {
          const specList = container.querySelector('.jasmine-summary');

          expect(specList.innerHTML).toEqual('');
        });
      });
    });

    describe('and there are pending specs', function() {
      let reporter;

      function pendingSpecStatus() {
        return {
          id: 123,
          description: 'with a spec',
          fullName: 'A Suite with a spec',
          status: 'pending',
          passedExpectations: [],
          failedExpectations: []
        };
      }

      function reportWithSpecStatus(specStatus) {
        reporter.specDone(specStatus);
        reporter.jasmineDone({});
      }

      beforeEach(function() {
        reporter = setup();
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 1 });
      });

      it('reports the pending specs count', function() {
        reportWithSpecStatus(pendingSpecStatus());
        const alertBar = container.querySelector('.jasmine-alert .jasmine-bar');

        expect(alertBar.innerHTML).toMatch(
          /1 spec, 0 failures, 1 pending spec/
        );
      });

      it('reports no failure details', function() {
        reportWithSpecStatus(pendingSpecStatus());
        const specFailure = container.querySelector('.jasmine-failures');

        expect(specFailure.childNodes.length).toEqual(0);
      });

      it('displays the custom pending reason', function() {
        reportWithSpecStatus({
          ...pendingSpecStatus(),
          pendingReason: 'my custom pending reason'
        });
        const pendingDetails = container.querySelector(
          '.jasmine-summary .jasmine-pending'
        );

        expect(pendingDetails.innerHTML).toContain(
          'PENDING WITH MESSAGE: my custom pending reason'
        );
      });

      it('indicates that the spec is pending even if there is no reason', function() {
        reportWithSpecStatus({
          ...pendingSpecStatus(),
          pendingReason: ''
        });
        const pendingDetails = container.querySelector(
          '.jasmine-summary .jasmine-pending'
        );

        expect(pendingDetails.innerHTML).toContain('PENDING');
      });
    });

    describe('and some tests fail', function() {
      let reporter;

      beforeEach(function() {
        reporter = setup();
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

        const passingSpecResult = {
          id: 123,
          status: 'passed',
          passedExpectations: [{ passed: true }],
          failedExpectations: []
        };
        reporter.specDone(passingSpecResult);

        const failingSpecResult = {
          id: 124,
          parentSuiteId: 2,
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
        const failingSpecResultWithDebugLogs = {
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

        const passingSuiteResult = {
          id: 1,
          description: 'A suite'
        };
        const failingSuiteResult = {
          id: 2,
          description: 'a suite',
          fullName: 'a suite',
          status: 'failed',
          failedExpectations: [{ message: 'My After All Exception' }]
        };
        reporter.specDone(failingSpecResult);
        reporter.suiteDone(passingSuiteResult);
        reporter.suiteDone(failingSuiteResult);
        reporter.suiteDone(passingSuiteResult);
        reporter.specDone(failingSpecResultWithDebugLogs);
        reporter.jasmineDone({});
      });

      it('reports the specs counts', function() {
        const alertBar = container.querySelector('.jasmine-alert .jasmine-bar');
        expect(alertBar.innerHTML).toMatch(/3 specs, 3 failures/);
      });

      it('reports failure messages and stack traces', function() {
        const specFailures = container.querySelector('.jasmine-failures');

        expect(specFailures.childNodes.length).toEqual(3);

        const specFailure = specFailures.childNodes[0];
        expect(specFailure.getAttribute('class')).toMatch(/jasmine-failed/);
        expect(specFailure.getAttribute('class')).toMatch(
          /jasmine-spec-detail/
        );

        const specDiv = specFailure.childNodes[0];
        expect(specDiv.getAttribute('class')).toEqual('jasmine-description');

        const message = specFailure.childNodes[1].childNodes[0];
        expect(message.getAttribute('class')).toEqual('jasmine-result-message');
        expect(message.innerHTML).toEqual('a failure message');

        const stackTrace = specFailure.childNodes[1].childNodes[1];
        expect(stackTrace.getAttribute('class')).toEqual('jasmine-stack-trace');
        expect(stackTrace.innerHTML).toEqual('a stack trace');

        const suiteFailure = specFailures.childNodes[0];
        expect(suiteFailure.getAttribute('class')).toMatch(/jasmine-failed/);
        expect(suiteFailure.getAttribute('class')).toMatch(
          /jasmine-spec-detail/
        );

        const suiteDiv = suiteFailure.childNodes[0];
        expect(suiteDiv.getAttribute('class')).toEqual('jasmine-description');

        const suiteMessage = suiteFailure.childNodes[1].childNodes[0];
        expect(suiteMessage.getAttribute('class')).toEqual(
          'jasmine-result-message'
        );
        expect(suiteMessage.innerHTML).toEqual('a failure message');

        const suiteStackTrace = suiteFailure.childNodes[1].childNodes[1];
        expect(suiteStackTrace.getAttribute('class')).toEqual(
          'jasmine-stack-trace'
        );
        expect(suiteStackTrace.innerHTML).toEqual('a stack trace');
      });

      it('reports traces when present', function() {
        const specFailure = container.querySelectorAll(
            '.jasmine-spec-detail.jasmine-failed'
          )[2],
          debugLogs = specFailure.querySelector('.jasmine-debug-log table');

        expect(debugLogs).toBeTruthy();
        const rows = debugLogs.querySelectorAll('tbody tr');
        expect(rows.length).toEqual(2);
      });

      it('provides links to focus on a failure and each containing suite', function() {
        const description = container.querySelector(
          '.jasmine-failures .jasmine-description'
        );
        const links = description.querySelectorAll('a');

        expect(description.textContent).toEqual(
          'A suite > inner suite > a failing spec'
        );

        expect(links.length).toEqual(3);
        expect(links[0].textContent).toEqual('A suite');

        expect(links[0].getAttribute('href')).toEqual(
          `/?path=${encodeURIComponent('["A suite"]')}`
        );

        expect(links[1].textContent).toEqual('inner suite');
        expect(links[1].getAttribute('href')).toEqual(
          `/?path=${encodeURIComponent('["A suite","inner suite"]')}`
        );

        expect(links[2].textContent).toEqual('a failing spec');
        expect(links[2].getAttribute('href')).toEqual(
          `/?path=${encodeURIComponent(
            '["A suite","inner suite","a failing spec"]'
          )}`
        );
      });

      it('allows switching between failure details and the spec summary', function() {
        const menuBar = container.querySelectorAll('.jasmine-bar')[1];

        expect(menuBar.getAttribute('class')).not.toMatch(/hidden/);

        const link = menuBar.querySelector('a');
        expect(link.innerHTML).toEqual('Failures');
        expect(link.getAttribute('href')).toEqual('#');
      });

      it("sets the reporter to 'Failures List' mode", function() {
        const reporterNode = container.querySelector('.jasmine_html-reporter');
        expect(reporterNode.getAttribute('class')).toMatch(
          'jasmine-failure-list'
        );
      });
    });

    it('counts failures that are reported in the jasmineDone event', function() {
      const reporter = setup({
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
        const reporter = setup();
        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          overallStatus: 'passed',
          failedExpectations: []
        });

        const alertBar = container.querySelector('.jasmine-overall-result');
        expect(alertBar).toHaveClass('jasmine-passed');
      });
    });

    describe("When the jasmineDone event's overallStatus is 'failed'", function() {
      it('has class jasmine-failed', function() {
        const reporter = setup();
        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          overallStatus: 'failed',
          failedExpectations: []
        });

        const alertBar = container.querySelector('.jasmine-overall-result');
        expect(alertBar).toHaveClass('jasmine-failed');
      });
    });

    describe("When the jasmineDone event's overallStatus is 'incomplete'", function() {
      it('has class jasmine-incomplete', function() {
        const reporter = setup();
        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.jasmineDone({
          overallStatus: 'incomplete',
          incompleteReason: 'because nope',
          failedExpectations: []
        });

        const alertBar = container.querySelector('.jasmine-overall-result');
        expect(alertBar).toHaveClass('jasmine-incomplete');
        expect(alertBar.textContent).toContain('Incomplete: because nope');
      });
    });
  });
});
