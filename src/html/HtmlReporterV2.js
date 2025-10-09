jasmineRequire.HtmlReporterV2 = function(j$) {
  'use strict';

  const { createDom, noExpectations } = j$.private.htmlReporterUtils;

  /**
   * @class HtmlReporterV2
   * @classdesc Displays results and allows re-running individual specs and suites.
   * @implements {Reporter}
   * @param options Options object. See lib/jasmine-core/boot1.js for details.
   * @since 6.0.0
   */
  class HtmlReporterV2 {
    #env;
    #container;
    #queryString;
    #urlBuilder;
    #filterSpecs;
    #stateBuilder;
    #config;
    #htmlReporterMain;

    // Sub-views
    #alerts;
    #progress;
    #banner;
    #failures;

    constructor(options) {
      this.#env = options.env;

      this.#container = options.container;
      this.#queryString =
        options.queryString ||
        new j$.QueryString({
          getWindowLocation() {
            return window.location;
          }
        });
      this.#urlBuilder = new UrlBuilder({
        queryString: this.#queryString,
        getSuiteById: id => this.#stateBuilder.suitesById[id]
      });
      this.#filterSpecs = options.urls.filteringSpecs();
    }

    /**
     * Initializes the reporter. Should be called before {@link Env#execute}.
     * @function
     * @name HtmlReporter#initialize
     */
    initialize() {
      this.#clearPrior();
      this.#config = this.#env ? this.#env.configuration() : {};

      this.#stateBuilder = new j$.private.ResultsStateBuilder();

      this.#alerts = new j$.private.AlertsView(this.#urlBuilder);
      this.#progress = new ProgressView();
      this.#banner = new j$.private.Banner(
        this.#queryString.navigateWithNewParam.bind(this.#queryString),
        true
      );
      this.#failures = new j$.private.FailuresView(this.#urlBuilder);
      this.#htmlReporterMain = createDom(
        'div',
        { className: 'jasmine_html-reporter' },
        this.#banner.rootEl,
        this.#progress.rootEl,
        this.#alerts.rootEl,
        this.#failures.rootEl
      );
      this.#container.appendChild(this.#htmlReporterMain);
    }

    jasmineStarted(options) {
      this.#stateBuilder.jasmineStarted(options);
      this.#progress.start(options.totalSpecsDefined);
    }

    suiteStarted(result) {
      this.#stateBuilder.suiteStarted(result);
    }

    suiteDone(result) {
      this.#stateBuilder.suiteDone(result);

      if (result.status === 'failed') {
        this.#failures.append(result, this.#stateBuilder.currentParent);
      }
    }

    specDone(result) {
      this.#stateBuilder.specDone(result);
      this.#progress.specDone(result, this.#config);

      if (noExpectations(result)) {
        const noSpecMsg = "Spec '" + result.fullName + "' has no expectations.";
        if (result.status === 'failed') {
          // eslint-disable-next-line no-console
          console.error(noSpecMsg);
        } else {
          // eslint-disable-next-line no-console
          console.warn(noSpecMsg);
        }
      }

      if (result.status === 'failed') {
        this.#failures.append(result, this.#stateBuilder.currentParent);
      }
    }

    jasmineDone(doneResult) {
      this.#stateBuilder.jasmineDone(doneResult);
      this.#progress.rootEl.style.visibility = 'hidden';
      this.#alerts.addDuration(doneResult.totalTime);
      this.#banner.showOptionsMenu(this.#config);

      if (
        this.#stateBuilder.specsExecuted < this.#stateBuilder.totalSpecsDefined
      ) {
        this.#alerts.addSkipped(
          this.#stateBuilder.specsExecuted,
          this.#stateBuilder.totalSpecsDefined
        );
      }

      this.#alerts.addSeedBar(doneResult, this.#stateBuilder, doneResult.order);

      if (doneResult.failedExpectations) {
        for (const f of doneResult.failedExpectations) {
          this.#alerts.addGlobalFailure(f);
        }
      }

      for (const dw of this.#stateBuilder.deprecationWarnings) {
        this.#alerts.addDeprecationWarning(dw);
      }

      const results = this.#find('.jasmine-results');
      const summary = new j$.private.SummaryTreeView(
        this.#urlBuilder,
        this.#filterSpecs
      );
      summary.addResults(this.#stateBuilder.topResults);
      results.appendChild(summary.rootEl);

      if (this.#failures.any()) {
        this.#alerts.addFailureToggle(
          () => this.#setMenuModeTo('jasmine-failure-list'),
          () => this.#setMenuModeTo('jasmine-spec-list')
        );

        this.#setMenuModeTo('jasmine-failure-list');
        this.#failures.show();
      }
    }

    #find(selector) {
      return this.#container.querySelector(
        '.jasmine_html-reporter ' + selector
      );
    }

    #clearPrior() {
      const oldReporter = this.#find('');

      if (oldReporter) {
        this.#container.removeChild(oldReporter);
      }
    }

    #setMenuModeTo(mode) {
      this.#htmlReporterMain.setAttribute(
        'class',
        'jasmine_html-reporter ' + mode
      );
    }
  }

  class ProgressView {
    constructor() {
      this.rootEl = createDom('progress', { value: 0 });
    }

    start(totalSpecsDefined) {
      this.rootEl.max = totalSpecsDefined;
    }

    specDone(result) {
      this.rootEl.value = this.rootEl.value + 1;

      if (result.status === 'failed') {
        // TODO: also a non-color indicator
        this.rootEl.classList.add('failed');
      }
    }
  }

  class UrlBuilder {
    #queryString;
    #getSuiteById;

    constructor(options) {
      this.#queryString = options.queryString;
      this.#getSuiteById = options.getSuiteById;
    }

    suiteHref(suite) {
      const path = this.#suitePath(suite);
      return this.#specPathHref(path);
    }

    specHref(specResult) {
      const suite = this.#getSuiteById(specResult.parentSuiteId);
      const path = this.#suitePath(suite);
      path.push(specResult.description);
      return this.#specPathHref(path);
    }

    runAllHref() {
      return this.#addToExistingQueryString('path', '');
    }

    seedHref(seed) {
      return this.#addToExistingQueryString('seed', seed);
    }

    #suitePath(suite) {
      const path = [];

      while (suite && suite.parent) {
        path.unshift(suite.result.description);
        suite = suite.parent;
      }

      return path;
    }

    #specPathHref(specPath) {
      return this.#addToExistingQueryString('path', JSON.stringify(specPath));
    }

    #addToExistingQueryString(k, v) {
      // include window.location.pathname to fix issue with karma-jasmine-html-reporter in angular: see https://github.com/jasmine/jasmine/issues/1906
      return (
        (window.location.pathname || '') +
        this.#queryString.fullStringWithNewParam(k, v)
      );
    }
  }

  return HtmlReporterV2;
};
