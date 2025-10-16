jasmineRequire.HtmlReporter = function(j$) {
  'use strict';

  const { createDom, noExpectations } = j$.private.htmlReporterUtils;

  /**
   * @class HtmlReporter
   * @classdesc Displays results and allows re-running individual specs and suites.
   * @implements {Reporter}
   * @param options Options object. See lib/jasmine-core/boot1.js for details.
   * @since 1.2.0
   * @deprecated Use {@link HtmlReporterV2} instead.
   */
  class HtmlReporter {
    #env;
    #getContainer;
    #navigateWithNewParam;
    #urlBuilder;
    #filterSpecs;
    #stateBuilder;
    #config;
    #htmlReporterMain;

    // Sub-views
    #alerts;
    #symbols;
    #banner;
    #failures;

    constructor(options) {
      this.#env = options.env;

      this.#getContainer = options.getContainer;
      this.#navigateWithNewParam =
        options.navigateWithNewParam || function() {};
      this.#urlBuilder = new UrlBuilder(
        options.addToExistingQueryString || defaultQueryString
      );
      this.#filterSpecs = options.filterSpecs;
    }

    /**
     * Initializes the reporter. Should be called before {@link Env#execute}.
     * @function
     * @name HtmlReporter#initialize
     */
    initialize() {
      this.#env.deprecated(
        'HtmlReporter and HtmlSpecFilter are deprecated. Use HtmlReporterV2 instead.'
      );
      this.#clearPrior();
      this.#config = this.#env ? this.#env.configuration() : {};

      this.#stateBuilder = new j$.private.ResultsStateBuilder();

      this.#alerts = new j$.private.AlertsView(this.#urlBuilder);
      this.#symbols = new j$.private.SymbolsView();
      this.#banner = new j$.private.Banner(this.#navigateWithNewParam);
      this.#failures = new j$.private.FailuresView(this.#urlBuilder);
      this.#htmlReporterMain = createDom(
        'div',
        { className: 'jasmine_html-reporter' },
        this.#banner.rootEl,
        this.#symbols.rootEl,
        this.#alerts.rootEl,
        this.#failures.rootEl
      );
      this.#getContainer().appendChild(this.#htmlReporterMain);
    }

    jasmineStarted(options) {
      this.#stateBuilder.jasmineStarted(options);
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

    specStarted() {}

    specDone(result) {
      this.#stateBuilder.specDone(result);
      this.#symbols.append(result, this.#config);

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

      if (this.#stateBuilder.anyNonTopSuiteFailures) {
        this.#alerts.addFailureToggle(
          () => this.#setMenuModeTo('jasmine-failure-list'),
          () => this.#setMenuModeTo('jasmine-spec-list')
        );

        this.#setMenuModeTo('jasmine-failure-list');
        this.#failures.show();
      }
    }

    #find(selector) {
      return this.#getContainer().querySelector(
        '.jasmine_html-reporter ' + selector
      );
    }

    #clearPrior() {
      const oldReporter = this.#find('');

      if (oldReporter) {
        this.#getContainer().removeChild(oldReporter);
      }
    }

    #setMenuModeTo(mode) {
      this.#htmlReporterMain.setAttribute(
        'class',
        'jasmine_html-reporter ' + mode
      );
    }
  }

  class UrlBuilder {
    #addToExistingQueryString;

    constructor(addToExistingQueryString) {
      this.#addToExistingQueryString = function(k, v) {
        // include window.location.pathname to fix issue with karma-jasmine-html-reporter in angular: see https://github.com/jasmine/jasmine/issues/1906
        return (
          (window.location.pathname || '') + addToExistingQueryString(k, v)
        );
      };
    }

    suiteHref(suite) {
      const els = [];

      while (suite && suite.parent) {
        els.unshift(suite.result.description);
        suite = suite.parent;
      }

      return this.#addToExistingQueryString('spec', els.join(' '));
    }

    specHref(result) {
      return this.#addToExistingQueryString('spec', result.fullName);
    }

    runAllHref() {
      return this.#addToExistingQueryString('spec', '');
    }

    seedHref(seed) {
      return this.#addToExistingQueryString('seed', seed);
    }
  }

  function defaultQueryString(key, value) {
    return '?' + key + '=' + value;
  }

  return HtmlReporter;
};
