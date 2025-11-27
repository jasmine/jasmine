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
      getContainer() {
        return container;
      },
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

    expect(container.querySelector('progress')).toBeTruthy();

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

      it('logs a warning to the console when the spec passed', function() {
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
      });

      it('logs an error to the console when the spec failed', function() {
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
      });
    });

    it('updates the progress bar', function() {
      const reporter = setup();
      reporter.initialize();
      const progress = container.querySelector('progress');

      reporter.specDone({
        id: 123,
        status: 'passed',
        failedExpectations: [],
        passedExpectations: []
      });
      expect(progress.getAttribute('value')).toEqual('1');

      reporter.specDone({
        id: 345,
        status: 'passed',
        failedExpectations: [],
        passedExpectations: []
      });
      expect(progress.getAttribute('value')).toEqual('2');
    });

    it('changes the progress bar status if the spec failed', function() {
      const reporter = setup();
      reporter.initialize();

      reporter.specDone({
        id: 345,
        status: 'failed',
        failedExpectations: [],
        passedExpectations: []
      });

      const progress = container.querySelector('progress');
      expect(progress).toHaveClass('failed');
    });
  });

  describe('when there are deprecation warnings', function() {
    it('displays the messages in their own alert bars', function() {
      const reporter = setup();
      reporter.initialize();

      reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

      expect(alertBars.length).toEqual(5);
      expect(alertBars[2].innerHTML).toMatch(
        /spec deprecation.*\(in spec: a spec with a deprecation\)/
      );
      expect(alertBars[2].getAttribute('class')).toEqual(
        'jasmine-bar jasmine-warning'
      );
      expect(alertBars[3].innerHTML).toMatch(
        /suite deprecation.*\(in suite: a suite with a deprecation\)/
      );
      expect(alertBars[4].innerHTML).toMatch(/global deprecation/);
      expect(alertBars[4].innerHTML).not.toMatch(/in /);
    });

    it('displays expandable stack traces', function() {
      const reporter = setup();
      reporter.initialize();

      reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

      reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

      reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

  describe('The tab bar', function() {
    function checkHidden(tabs, expected) {
      const actual = Array.from(tabs).map(t =>
        t.classList.contains('jasmine-hidden')
      );
      expect(actual)
        .withContext('tab hiddenness')
        .toEqual(expected);
    }

    describe('while Jasmine is running', function() {
      it('hides all tabs', function() {
        const reporter = setup();
        reporter.initialize();
        reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
        const tabs = container.querySelectorAll('.jasmine-tab');
        expect(tabs.length).toEqual(3);
        expect(tabs[0].textContent).toEqual('Spec List');
        expect(tabs[1].textContent).toEqual('Failures');
        expect(tabs[2].textContent).toEqual('Performance');
        checkHidden(tabs, [true, true, true]);

        // Results, even failures, should not show any tabs
        reporter.specDone({
          id: 1,
          description: 'a failing spec',
          fullName: 'a failing spec',
          status: 'failed',
          failedExpectations: [{}],
          passedExpectations: []
        });
        checkHidden(tabs, [true, true, true]);
      });
    });

    describe('when Jasmine is done', function() {
      function hasSpecOrSuiteFailureBehavior(reportEvents) {
        let reporter;

        beforeEach(function() {
          reporter = setup();
          reporter.initialize();
          reportEvents(reporter);
        });

        it('shows all three tabs', function() {
          const tabs = container.querySelectorAll('.jasmine-tab');
          checkHidden(tabs, [false, false, false]);
        });

        it('selects the Failures tab', function() {
          const reporterNode = container.querySelector(
            '.jasmine_html-reporter'
          );
          expect(reporterNode).toHaveClass('jasmine-failure-list');
        });

        it('switches between failure details and the spec summary', function() {
          const tabs = container.querySelectorAll('.jasmine-tab');
          let specListLink = () => tabs[0].querySelector('a');
          let failuresLink = () => tabs[1].querySelector('a');
          const reporterNode = container.querySelector(
            '.jasmine_html-reporter'
          );
          expect(specListLink().textContent).toEqual('Spec List');
          expect(failuresLink())
            .withContext('failures link')
            .toBeFalsy();

          specListLink().click();
          expect(reporterNode).toHaveClass('jasmine-spec-list');
          expect(reporterNode).not.toHaveClass('jasmine-failure-list');
          expect(specListLink())
            .withContext('spec list link')
            .toBeFalsy();
          expect(failuresLink().textContent).toEqual('Failures');

          failuresLink().click();
          expect(reporterNode.getAttribute('class')).toMatch(
            'jasmine-failure-list'
          );
          expect(failuresLink())
            .withContext('failures link')
            .toBeFalsy();
          expect(specListLink().textContent).toEqual('Spec List');
          expect(reporterNode).toHaveClass('jasmine-failure-list');
          expect(reporterNode).not.toHaveClass('jasmine-spec-list');
        });
      }

      function hasSpecAndSuiteSuccessBehavior(reportEvents) {
        let reporter;

        beforeEach(function() {
          reporter = setup();
          reporter.initialize();
          reportEvents(reporter);
        });

        it('shows the Spec List and Performance tabs', function() {
          const tabs = container.querySelectorAll('.jasmine-tab');
          checkHidden(tabs, [false, true, false]);
        });

        it('shows the spec list view', function() {
          const reporterNode = container.querySelector(
            '.jasmine_html-reporter'
          );
          expect(reporterNode).toHaveClass('jasmine-spec-list');
          expect(reporterNode).not.toHaveClass('jasmine-failure-list');
        });
      }

      describe('with spec failures', function() {
        hasSpecOrSuiteFailureBehavior(function(reporter) {
          reporter.jasmineStarted({
            totalSpecsDefined: 0,
            numExcludedSpecs: 0
          });
          reporter.specDone({
            id: 1,
            description: 'a failing spec',
            fullName: 'a failing spec',
            status: 'failed',
            failedExpectations: [{}],
            passedExpectations: []
          });
          reporter.specDone({
            id: 2,
            description: 'a passing spec',
            fullName: 'a passing spec',
            status: 'passed',
            failedExpectations: [],
            passedExpectations: []
          });
          reporter.jasmineDone({});
        });
      });

      describe('with suite failures', function() {
        hasSpecOrSuiteFailureBehavior(function(reporter) {
          reporter.jasmineStarted({
            totalSpecsDefined: 0,
            numExcludedSpecs: 0
          });
          reporter.specDone({
            id: 1,
            description: 'a failing spec',
            fullName: 'a failing spec',
            status: 'failed',
            failedExpectations: [{}],
            passedExpectations: []
          });
          reporter.specDone({
            id: 2,
            description: 'a passing spec',
            fullName: 'a passing spec',
            status: 'passed',
            failedExpectations: [],
            passedExpectations: []
          });
          reporter.jasmineDone({});
        });
      });

      describe('without any failures', function() {
        hasSpecAndSuiteSuccessBehavior(function(reporter) {
          reporter.jasmineStarted({
            totalSpecsDefined: 0,
            numExcludedSpecs: 0
          });
          reporter.specDone({
            id: 1,
            description: 'a passing spec',
            fullName: 'a passing spec',
            status: 'passed',
            failedExpectations: [],
            passedExpectations: []
          });
          reporter.suiteDone({ id: 1 });
          reporter.jasmineDone({});
        });
      });

      describe('with only top suite failures', function() {
        // Top suite failures are displayed in their own alert bars, so they
        // don't cause the failures tab to be shown.
        hasSpecAndSuiteSuccessBehavior(function(reporter) {
          reporter.jasmineStarted({
            totalSpecsDefined: 0,
            numExcludedSpecs: 0
          });
          reporter.jasmineDone({
            failedExpectations: [{}]
          });
        });
      });

      it('shows the slow spec view when the Performance tab is clicked', function() {
        const reporter = setup();
        reporter.initialize();
        reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
        reporter.specDone({
          duration: 1.2,
          failedExpectations: [],
          passedExpectations: []
        });
        reporter.jasmineDone({});
        const tabs = container.querySelectorAll('.jasmine-tab');
        let perfLink = tabs[2].querySelector('a');
        const reporterNode = container.querySelector('.jasmine_html-reporter');
        expect(perfLink.textContent).toEqual('Performance');
        perfLink.click();
        expect(reporterNode).toHaveClass('jasmine-performance');
        expect(reporterNode.innerHTML).toContain('<h2>Performance</h2>');
        expect(reporterNode.innerHTML).toContain('<td>1.2ms</td>');
      });
    });
  });

  describe('when Jasmine is done', function() {
    it('adds a warning to the link title of specs that have no expectations', function() {
      const reporter = setup();
      spyOn(console, 'error');

      reporter.initialize();
      reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

      reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });

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

      reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

        reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
        reporter.jasmineDone({
          failedExpectations: [
            {
              message: 'Global After All Failure',
              globalErrorType: 'afterAll'
            },
            { message: 'Your JS is borken', globalErrorType: 'load' }
          ]
        });

        const errorBars = container.querySelectorAll(
          '.jasmine-alert .jasmine-bar.jasmine-errored'
        );

        expect(errorBars.length).toEqual(2);
        expect(errorBars[0].innerHTML).toMatch(
          /AfterAll Global After All Failure/
        );
        expect(errorBars[1].innerHTML).toMatch(
          /Error during loading: Your JS is borken/
        );
        expect(errorBars[1].innerHTML).not.toMatch(/line/);
      });

      it('does not display the "AfterAll" prefix for other error types', function() {
        const reporter = setup();
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

        const errorBars = container.querySelectorAll(
          '.jasmine-alert .jasmine-bar.jasmine-errored'
        );

        expect(errorBars.length).toEqual(3);
        expect(errorBars[0].textContent).toContain('load error');
        expect(errorBars[1].textContent).toContain('lateExpectation error');
        expect(errorBars[2].textContent).toContain('lateError error');

        for (let bar of errorBars) {
          expect(bar.textContent).not.toContain('AfterAll');
        }
      });

      it('displays file and line information if available', function() {
        const reporter = setup();
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

        const alertBar = container.querySelector(
          '.jasmine-alert .jasmine-bar.jasmine-errored'
        );

        expect(alertBar).toBeTruthy();
        expect(alertBar.innerHTML).toMatch(
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

      it('includes the number of specs in the text of the jasmine-skipped link', function() {
        const reporter = setup();

        reporter.initialize();
        const minimalSpecDone = {
          failedExpectations: [],
          passedExpectations: []
        };

        reporter.jasmineStarted({ totalSpecsDefined: 3, numExcludedSpecs: 0 });
        reporter.specDone({ ...minimalSpecDone });
        reporter.specDone({ ...minimalSpecDone });
        reporter.specDone({ ...minimalSpecDone, status: 'excluded' });
        reporter.jasmineDone({});

        const skippedLink = container.querySelector('.jasmine-skipped a');
        expect(skippedLink.textContent).toEqual('Ran 2 of 3 specs - run all');
      });

      it('should include non-spec query params in the jasmine-skipped link when present', function() {
        const reporter = setup({
          addToExistingQueryString: function(key, value) {
            return '?foo=bar&' + key + '=' + value;
          }
        });

        reporter.initialize();
        reporter.jasmineStarted({ totalSpecsDefined: 1, numExcludedSpecs: 0 });
        reporter.jasmineDone({ order: { random: true } });

        const skippedLink = container.querySelector('.jasmine-skipped a');
        expect(skippedLink.getAttribute('href')).toEqual('/?path=');
      });
    });

    describe('and all specs pass', function() {
      beforeEach(function() {
        const reporter = setup();
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 2, numExcludedSpecs: 0 });
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
        const resultBar = container.querySelector(
          '.jasmine-alert .jasmine-bar.jasmine-overall-result'
        );

        expect(resultBar).toBeTruthy();
        expect(resultBar.innerHTML).toMatch(/2 specs, 0 failures/);
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
          reporter.jasmineStarted({
            totalSpecsDefined: 1,
            numExcludedSpecs: 0
          });
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
          reporter.jasmineStarted({
            totalSpecsDefined: 1,
            numExcludedSpecs: 0
          });
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

        reporter.jasmineStarted({ totalSpecsDefined: 1, numExcludedSpecs: 0 });
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

        reporter.jasmineStarted({ totalSpecsDefined: 1, numExcludedSpecs: 0 });
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
    });

    it('counts failures that are reported in the jasmineDone event', function() {
      const reporter = setup({
        addToExistingQueryString: function(key, value) {
          return '?' + key + '=' + value;
        }
      });
      reporter.initialize();

      reporter.jasmineStarted({ totalSpecsDefined: 1, numExcludedSpecs: 0 });

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

  describe('The overall status bar', function() {
    describe('Before the jasmineDone event fires', function() {
      describe('When nothing has failed', function() {
        it('shows "Running..." and the has class jasmine-in-progress', function() {
          const reporter = setup();
          reporter.initialize();
          const alertBar = container.querySelector('.jasmine-overall-result');

          expect(alertBar.textContent).toEqual('Running...');
          expect(alertBar).not.toHaveClass('jasmine-passed');
          expect(alertBar).not.toHaveClass('jasmine-failed');
          expect(alertBar).toHaveClass('jasmine-in-progress');

          for (const status of ['passed', 'excluded', 'pending']) {
            reporter.specDone({
              status,
              fullName: `Some ${status} spec`,
              passedExpectations: [],
              failedExpectations: []
            });
          }

          expect(alertBar.textContent).toEqual('Running...');
          expect(alertBar).not.toHaveClass('jasmine-passed');
          expect(alertBar).not.toHaveClass('jasmine-failed');
          expect(alertBar).toHaveClass('jasmine-in-progress');
        });
      });

      describe('When a spec has failed', function() {
        it('shows "Failing..." and the has class jasmine-failed', function() {
          const reporter = setup();
          reporter.initialize();
          const alertBar = container.querySelector('.jasmine-overall-result');

          reporter.specDone({
            status: 'failed',
            fullName: 'Some failed spec',
            passedExpectations: [],
            failedExpectations: []
          });

          expect(alertBar.textContent).toEqual('Failing...');
          expect(alertBar).toHaveClass('jasmine-failed');
          expect(alertBar).not.toHaveClass('jasmine-passed');
        });
      });

      describe('When a suite has failed', function() {
        it('shows "Failing..." and the has class jasmine-failed', function() {
          const reporter = setup();
          reporter.initialize();
          const alertBar = container.querySelector('.jasmine-overall-result');

          reporter.suiteDone({
            status: 'failed',
            fullName: 'Some failed suite',
            passedExpectations: [],
            failedExpectations: []
          });

          expect(alertBar.textContent).toEqual('Failing...');
          expect(alertBar).toHaveClass('jasmine-failed');
          expect(alertBar).not.toHaveClass('jasmine-passed');
        });
      });
    });

    describe("When the jasmineDone event's overallStatus is 'passed'", function() {
      it('has class jasmine-passed', function() {
        const reporter = setup();
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

        reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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

        reporter.jasmineStarted({ totalSpecsDefined: 0, numExcludedSpecs: 0 });
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
