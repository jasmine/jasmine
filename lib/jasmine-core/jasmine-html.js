/*
Copyright (c) 2008-2019 Pivotal Labs
Copyright (c) 2008-2026 The Jasmine developers

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// eslint-disable-next-line no-var
var jasmineRequire = window.jasmineRequire || require('./jasmine.js');

jasmineRequire.html = function(j$) {
  j$.private.ResultsNode = jasmineRequire.ResultsNode();
  j$.private.ResultsStateBuilder = jasmineRequire.ResultsStateBuilder(j$);
  j$.private.htmlReporterUtils = jasmineRequire.htmlReporterUtils(j$);
  j$.private.AlertsView = jasmineRequire.AlertsView(j$);
  j$.private.OverallStatusBar = jasmineRequire.OverallStatusBar(j$);
  j$.private.Banner = jasmineRequire.Banner(j$);
  j$.private.SymbolsView = jasmineRequire.SymbolsView(j$);
  j$.private.SummaryTreeView = jasmineRequire.SummaryTreeView(j$);
  j$.private.FailuresView = jasmineRequire.FailuresView(j$);
  j$.private.PerformanceView = jasmineRequire.PerformanceView(j$);
  j$.private.TabBar = jasmineRequire.TabBar(j$);
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.HtmlReporterV2Urls = jasmineRequire.HtmlReporterV2Urls(j$);
  j$.HtmlReporterV2 = jasmineRequire.HtmlReporterV2(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter(j$);
  j$.private.HtmlSpecFilterV2 = jasmineRequire.HtmlSpecFilterV2();
};

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
      this.#banner.showOptionsMenu(this.#config);

      if (
        this.#stateBuilder.specsExecuted < this.#stateBuilder.totalSpecsDefined
      ) {
        this.#alerts.addSkipped(
          this.#stateBuilder.specsExecuted,
          this.#stateBuilder.totalSpecsDefined
        );
      }

      const statusBar = new j$.private.OverallStatusBar(this.#urlBuilder);
      statusBar.showDone(doneResult, this.#stateBuilder);
      this.#alerts.addBar(statusBar.rootEl);

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
        this.#addFailureToggle();
        this.#setMenuModeTo('jasmine-failure-list');
        this.#failures.show();
      }
    }

    #addFailureToggle() {
      const onClickFailures = () => this.#setMenuModeTo('jasmine-failure-list');
      const onClickSpecList = () => this.#setMenuModeTo('jasmine-spec-list');
      const failuresLink = createDom(
        'a',
        { className: 'jasmine-failures-menu', href: '#' },
        'Failures'
      );
      let specListLink = createDom(
        'a',
        { className: 'jasmine-spec-list-menu', href: '#' },
        'Spec List'
      );

      failuresLink.onclick = function() {
        onClickFailures();
        return false;
      };

      specListLink.onclick = function() {
        onClickSpecList();
        return false;
      };

      this.#alerts.addBar(
        createDom(
          'span',
          { className: 'jasmine-menu jasmine-bar jasmine-spec-list' },
          [createDom('span', {}, 'Spec List | '), failuresLink]
        )
      );
      this.#alerts.addBar(
        createDom(
          'span',
          { className: 'jasmine-menu jasmine-bar jasmine-failure-list' },
          [specListLink, createDom('span', {}, ' | Failures ')]
        )
      );
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

jasmineRequire.HtmlSpecFilter = function(j$) {
  'use strict';

  /**
   * @class HtmlSpecFilter
   * @param options Options object. See lib/jasmine-core/boot1.js for details.
   * @deprecated Use {@link HtmlReporterV2Urls} instead.
   */
  function HtmlSpecFilter(options) {
    const env = options?.env ?? j$.getEnv();
    env.deprecated(
      'HtmlReporter and HtmlSpecFilter are deprecated. Use HtmlReporterV2 instead.'
    );

    const filterString =
      options &&
      options.filterString &&
      options.filterString() &&
      options.filterString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const filterPattern = new RegExp(filterString);

    /**
     * Determines whether the spec with the specified name should be executed.
     * @name HtmlSpecFilter#matches
     * @function
     * @param {string} specName The full name of the spec
     * @returns {boolean}
     */
    this.matches = function(specName) {
      return filterPattern.test(specName);
    };
  }

  return HtmlSpecFilter;
};

jasmineRequire.ResultsNode = function() {
  'use strict';

  function ResultsNode(result, type, parent) {
    this.result = result;
    this.type = type;
    this.parent = parent;

    this.children = [];

    this.addChild = function(result, type) {
      this.children.push(new ResultsNode(result, type, this));
    };

    this.last = function() {
      return this.children[this.children.length - 1];
    };

    this.updateResult = function(result) {
      this.result = result;
    };
  }

  return ResultsNode;
};

jasmineRequire.QueryString = function() {
  'use strict';

  /**
   * Reads and manipulates the query string.
   * @since 2.0.0
   */
  class QueryString {
    #getWindowLocation;

    /**
     * @param options Object with a getWindowLocation property, which should be
     * a function returning the current value of window.location.
     */
    constructor(options) {
      this.#getWindowLocation = options.getWindowLocation;
    }

    /**
     * Sets the specified query parameter and navigates to the resulting URL.
     * @param {string} key
     * @param {string} value
     */
    navigateWithNewParam(key, value) {
      this.#getWindowLocation().search = this.fullStringWithNewParam(
        key,
        value
      );
    }

    /**
     * Returns a new URL based on the current location, with the specified
     * query parameter set.
     * @param {string} key
     * @param {string} value
     * @return {string}
     */
    fullStringWithNewParam(key, value) {
      const paramMap = this.#queryStringToParamMap();
      paramMap[key] = value;
      return toQueryString(paramMap);
    }

    /**
     * Gets the value of the specified query parameter.
     * @param {string} key
     * @return {string}
     */
    getParam(key) {
      return this.#queryStringToParamMap()[key];
    }

    #queryStringToParamMap() {
      const paramStr = this.#getWindowLocation().search.substring(1);
      let params = [];
      const paramMap = {};

      if (paramStr.length > 0) {
        params = paramStr.split('&');
        for (let i = 0; i < params.length; i++) {
          const p = params[i].split('=');
          let value = decodeURIComponent(p[1]);
          if (value === 'true' || value === 'false') {
            value = JSON.parse(value);
          }
          paramMap[decodeURIComponent(p[0])] = value;
        }
      }

      return paramMap;
    }
  }

  function toQueryString(paramMap) {
    const qStrPairs = [];
    for (const prop in paramMap) {
      qStrPairs.push(
        encodeURIComponent(prop) + '=' + encodeURIComponent(paramMap[prop])
      );
    }
    return '?' + qStrPairs.join('&');
  }

  return QueryString;
};

jasmineRequire.AlertsView = function(j$) {
  'use strict';

  const { createDom } = j$.private.htmlReporterUtils;
  const errorBarClassName = 'jasmine-bar jasmine-errored';
  const afterAllMessagePrefix = 'AfterAll ';

  class AlertsView {
    #urlBuilder;

    constructor(urlBuilder) {
      this.#urlBuilder = urlBuilder;
      this.rootEl = createDom('div', { className: 'jasmine-alert' });
    }

    addSkipped(numExecuted, numDefined) {
      this.#createAndAdd(
        'jasmine-bar jasmine-skipped',
        createDom(
          'a',
          { href: this.#urlBuilder.runAllHref(), title: 'Run all specs' },
          `Ran ${numExecuted} of ${numDefined} specs - run all`
        )
      );
    }

    addGlobalFailure(failure) {
      this.#createAndAdd(
        errorBarClassName,
        this.#globalFailureMessage(failure)
      );
    }

    #globalFailureMessage(failure) {
      if (failure.globalErrorType === 'load') {
        const prefix = 'Error during loading: ' + failure.message;

        if (failure.filename) {
          return prefix + ' in ' + failure.filename + ' line ' + failure.lineno;
        } else {
          return prefix;
        }
      } else if (failure.globalErrorType === 'afterAll') {
        return afterAllMessagePrefix + failure.message;
      } else {
        return failure.message;
      }
    }

    addDeprecationWarning(dw) {
      const children = [];
      let context;

      switch (dw.runnableType) {
        case 'spec':
          context = '(in spec: ' + dw.runnableName + ')';
          break;
        case 'suite':
          context = '(in suite: ' + dw.runnableName + ')';
          break;
        default:
          context = '';
      }

      for (const line of dw.message.split('\n')) {
        children.push(line);
        children.push(createDom('br'));
      }

      children[0] = 'DEPRECATION: ' + children[0];
      children.push(context);

      if (dw.stack) {
        children.push(this.#createExpander(dw.stack));
      }

      this.#createAndAdd('jasmine-bar jasmine-warning', children);
    }

    addBar(el) {
      this.rootEl.appendChild(el);
    }

    #createAndAdd(className, children) {
      this.rootEl.appendChild(createDom('span', { className }, children));
    }

    #createExpander(stackTrace) {
      const expandLink = createDom('a', { href: '#' }, 'Show stack trace');
      const root = createDom(
        'div',
        { className: 'jasmine-expander' },
        expandLink,
        createDom(
          'div',
          { className: 'jasmine-expander-contents jasmine-stack-trace' },
          stackTrace
        )
      );

      expandLink.addEventListener('click', function(e) {
        e.preventDefault();

        if (root.classList.contains('jasmine-expanded')) {
          root.classList.remove('jasmine-expanded');
          expandLink.textContent = 'Show stack trace';
        } else {
          root.classList.add('jasmine-expanded');
          expandLink.textContent = 'Hide stack trace';
        }
      });

      return root;
    }
  }

  return AlertsView;
};

jasmineRequire.Banner = function(j$) {
  'use strict';

  const { createDom } = j$.private.htmlReporterUtils;

  class Banner {
    #navigateWithNewParam;
    #omitHideDisabled;

    constructor(navigateWithNewParam, omitHideDisabled) {
      this.#navigateWithNewParam = navigateWithNewParam;
      this.#omitHideDisabled = omitHideDisabled;
      this.rootEl = createDom(
        'div',
        { className: 'jasmine-banner' },
        createDom('a', {
          className: 'jasmine-title',
          href: 'http://jasmine.github.io/',
          target: '_blank'
        }),
        createDom('span', { className: 'jasmine-version' }, j$.version)
      );
    }

    showOptionsMenu(config) {
      this.rootEl.appendChild(this.#optionsMenu(config));
    }

    #optionsMenu(config) {
      const items = [
        createDom(
          'div',
          { className: 'jasmine-stop-on-failure' },
          createDom('input', {
            className: 'jasmine-fail-fast',
            id: 'jasmine-fail-fast',
            type: 'checkbox'
          }),
          createDom(
            'label',
            { className: 'jasmine-label', for: 'jasmine-fail-fast' },
            'stop execution on spec failure'
          )
        ),
        createDom(
          'div',
          { className: 'jasmine-throw-failures' },
          createDom('input', {
            className: 'jasmine-throw',
            id: 'jasmine-throw-failures',
            type: 'checkbox'
          }),
          createDom(
            'label',
            { className: 'jasmine-label', for: 'jasmine-throw-failures' },
            'stop spec on expectation failure'
          )
        ),
        createDom(
          'div',
          { className: 'jasmine-random-order' },
          createDom('input', {
            className: 'jasmine-random',
            id: 'jasmine-random-order',
            type: 'checkbox'
          }),
          createDom(
            'label',
            { className: 'jasmine-label', for: 'jasmine-random-order' },
            'run tests in random order'
          )
        )
      ];

      if (!this.#omitHideDisabled) {
        items.push(
          createDom(
            'div',
            { className: 'jasmine-hide-disabled' },
            createDom('input', {
              className: 'jasmine-disabled',
              id: 'jasmine-hide-disabled',
              type: 'checkbox'
            }),
            createDom(
              'label',
              { className: 'jasmine-label', for: 'jasmine-hide-disabled' },
              'hide disabled tests'
            )
          )
        );
      }

      const optionsMenuDom = createDom(
        'div',
        { className: 'jasmine-run-options' },
        createDom('span', { className: 'jasmine-trigger' }, 'Options'),
        createDom('div', { className: 'jasmine-payload' }, items)
      );

      const failFastCheckbox = optionsMenuDom.querySelector(
        '#jasmine-fail-fast'
      );
      failFastCheckbox.checked = config.stopOnSpecFailure;
      failFastCheckbox.onclick = () => {
        this.#navigateWithNewParam(
          'stopOnSpecFailure',
          !config.stopOnSpecFailure
        );
      };

      const throwCheckbox = optionsMenuDom.querySelector(
        '#jasmine-throw-failures'
      );
      throwCheckbox.checked = config.stopSpecOnExpectationFailure;
      throwCheckbox.onclick = () => {
        this.#navigateWithNewParam(
          'stopSpecOnExpectationFailure',
          !config.stopSpecOnExpectationFailure
        );
      };

      const randomCheckbox = optionsMenuDom.querySelector(
        '#jasmine-random-order'
      );
      randomCheckbox.checked = config.random;
      randomCheckbox.onclick = () => {
        this.#navigateWithNewParam('random', !config.random);
      };

      if (!this.#omitHideDisabled) {
        const hideDisabled = optionsMenuDom.querySelector(
          '#jasmine-hide-disabled'
        );
        hideDisabled.checked = config.hideDisabled;
        hideDisabled.onclick = () => {
          this.#navigateWithNewParam('hideDisabled', !config.hideDisabled);
        };
      }

      const optionsTrigger = optionsMenuDom.querySelector('.jasmine-trigger'),
        optionsPayload = optionsMenuDom.querySelector('.jasmine-payload'),
        isOpen = /\bjasmine-open\b/;

      optionsTrigger.onclick = function() {
        if (isOpen.test(optionsPayload.className)) {
          optionsPayload.className = optionsPayload.className.replace(
            isOpen,
            ''
          );
        } else {
          optionsPayload.className += ' jasmine-open';
        }
      };

      return optionsMenuDom;
    }
  }

  return Banner;
};

jasmineRequire.FailuresView = function(j$) {
  'use strict';

  const { createDom } = j$.private.htmlReporterUtils;

  class FailuresView {
    #urlBuilder;
    #failureEls;
    #showing;

    constructor(urlBuilder) {
      this.#urlBuilder = urlBuilder;
      this.#failureEls = [];
      this.#showing = false;
      this.rootEl = createDom(
        'div',
        { className: 'jasmine-results' },
        createDom('div', { className: 'jasmine-failures' })
      );
    }

    append(result, parent) {
      // TODO: Figure out why the result is wrong if we build the DOM node later
      const el = this.#makeFailureEl(result, parent);

      if (this.#showing) {
        this.rootEl.querySelector('.jasmine-failures').appendChild(el);
      } else {
        this.#failureEls.push(el);
      }
    }

    show() {
      const failureNode = this.rootEl.querySelector('.jasmine-failures');

      for (const el of this.#failureEls) {
        failureNode.appendChild(el);
      }

      this.#showing = true;
    }

    #makeFailureEl(result, parent) {
      const failure = createDom(
        'div',
        { className: 'jasmine-spec-detail jasmine-failed' },
        this.#failureDescription(result, parent),
        createDom('div', { className: 'jasmine-messages' })
      );
      const messages = failure.childNodes[1];

      for (let i = 0; i < result.failedExpectations.length; i++) {
        const expectation = result.failedExpectations[i];
        messages.appendChild(
          createDom(
            'div',
            { className: 'jasmine-result-message' },
            expectation.message
          )
        );
        messages.appendChild(
          createDom(
            'div',
            { className: 'jasmine-stack-trace' },
            expectation.stack
          )
        );
      }

      if (result.failedExpectations.length === 0) {
        messages.appendChild(
          createDom(
            'div',
            { className: 'jasmine-result-message' },
            'Spec has no expectations'
          )
        );
      }

      if (result.debugLogs) {
        messages.appendChild(this.#debugLogTable(result.debugLogs));
      }

      return failure;
    }

    #failureDescription(result, suite) {
      const wrapper = createDom(
        'div',
        { className: 'jasmine-description' },
        createDom(
          'a',
          {
            title: result.description,
            href: this.#urlBuilder.specHref(result)
          },
          result.description
        )
      );
      let suiteLink;

      while (suite && suite.parent) {
        wrapper.insertBefore(
          document.createTextNode(' > '),
          wrapper.firstChild
        );
        suiteLink = createDom(
          'a',
          { href: this.#urlBuilder.suiteHref(suite) },
          suite.result.description
        );
        wrapper.insertBefore(suiteLink, wrapper.firstChild);

        suite = suite.parent;
      }

      return wrapper;
    }

    #debugLogTable(debugLogs) {
      const tbody = createDom('tbody');

      for (const entry of debugLogs) {
        tbody.appendChild(
          createDom(
            'tr',
            {},
            createDom('td', {}, entry.timestamp.toString()),
            createDom(
              'td',
              { className: 'jasmine-debug-log-msg' },
              entry.message
            )
          )
        );
      }

      return createDom(
        'div',
        { className: 'jasmine-debug-log' },
        createDom(
          'div',
          { className: 'jasmine-debug-log-header' },
          'Debug logs'
        ),
        createDom(
          'table',
          {},
          createDom(
            'thead',
            {},
            createDom(
              'tr',
              {},
              createDom('th', {}, 'Time (ms)'),
              createDom('th', {}, 'Message')
            )
          ),
          tbody
        )
      );
    }
  }

  return FailuresView;
};

jasmineRequire.htmlReporterUtils = function(j$) {
  'use strict';

  function createDom(type, attrs, childrenArrayOrVarArgs) {
    const el = document.createElement(type);
    let children;

    if (Array.isArray(childrenArrayOrVarArgs)) {
      children = childrenArrayOrVarArgs;
    } else {
      children = [];

      for (let i = 2; i < arguments.length; i++) {
        children.push(arguments[i]);
      }
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else {
        if (child) {
          el.appendChild(child);
        }
      }
    }

    for (const attr in attrs) {
      if (attr === 'className') {
        el[attr] = attrs[attr];
      } else {
        el.setAttribute(attr, attrs[attr]);
      }
    }

    return el;
  }

  function noExpectations(result) {
    const allExpectations =
      result.failedExpectations.length + result.passedExpectations.length;

    return (
      allExpectations === 0 &&
      (result.status === 'passed' || result.status === 'failed')
    );
  }

  return { createDom, noExpectations };
};

jasmineRequire.HtmlReporterV2 = function(j$) {
  'use strict';

  const { createDom, noExpectations } = j$.private.htmlReporterUtils;

  const specListTabId = 'jasmine-specListTab';
  const failuresTabId = 'jasmine-failuresTab';
  const perfTabId = 'jasmine-perfTab';

  /**
   * @class HtmlReporterV2
   * @classdesc Displays results and allows re-running individual specs and suites.
   * @implements {Reporter}
   * @param options Options object
   * @since 6.0.0
   * @example
   * const env = jasmine.getEnv();
   * const urls = new jasmine.HtmlReporterV2Urls();
   * const reporter = new jasmine.HtmlReporterV2({
   *    env,
   *    urls,
   *    // container is optional and defaults to document.body.
   *    container: someElement
   * });
   */
  class HtmlReporterV2 {
    #container;
    #queryString;
    #urlBuilder;
    #filterSpecs;
    #stateBuilder;
    #config;
    #htmlReporterMain;

    // Sub-views
    #alerts;
    #statusBar;
    #tabBar;
    #progress;
    #banner;
    #failures;

    constructor(options) {
      this.#container = options.container || document.body;
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

      this.#config = options.env ? options.env.configuration() : {};

      this.#stateBuilder = new j$.private.ResultsStateBuilder();

      this.#alerts = new j$.private.AlertsView(this.#urlBuilder);
      this.#statusBar = new j$.private.OverallStatusBar(this.#urlBuilder);
      this.#statusBar.showRunning();
      this.#alerts.addBar(this.#statusBar.rootEl);

      this.#tabBar = new j$.private.TabBar(
        [
          { id: specListTabId, label: 'Spec List' },
          { id: failuresTabId, label: 'Failures' },
          { id: perfTabId, label: 'Performance' }
        ],
        tabId => {
          if (tabId === specListTabId) {
            this.#setMenuModeTo('jasmine-spec-list');
          } else if (tabId === failuresTabId) {
            this.#setMenuModeTo('jasmine-failure-list');
          } else {
            this.#setMenuModeTo('jasmine-performance');
          }
        }
      );
      this.#alerts.addBar(this.#tabBar.rootEl);

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
      this.#failures.show();
    }

    jasmineStarted(options) {
      this.#stateBuilder.jasmineStarted(options);
      this.#progress.start(
        options.totalSpecsDefined - options.numExcludedSpecs
      );
    }

    suiteStarted(result) {
      this.#stateBuilder.suiteStarted(result);
    }

    suiteDone(result) {
      this.#stateBuilder.suiteDone(result);

      if (result.status === 'failed') {
        this.#failures.append(result, this.#stateBuilder.currentParent);
        this.#statusBar.showFailing();
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
        this.#statusBar.showFailing();
      }
    }

    jasmineDone(doneResult) {
      this.#stateBuilder.jasmineDone(doneResult);
      this.#progress.rootEl.style.visibility = 'hidden';
      this.#banner.showOptionsMenu(this.#config);

      if (
        this.#stateBuilder.specsExecuted < this.#stateBuilder.totalSpecsDefined
      ) {
        this.#alerts.addSkipped(
          this.#stateBuilder.specsExecuted,
          this.#stateBuilder.totalSpecsDefined
        );
      }

      this.#statusBar.showDone(doneResult, this.#stateBuilder);

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
      const perf = new j$.private.PerformanceView();
      perf.addResults(this.#stateBuilder.topResults);
      results.appendChild(perf.rootEl);
      this.#tabBar.showTab(specListTabId);
      this.#tabBar.showTab(perfTabId);

      if (this.#stateBuilder.anyNonTopSuiteFailures) {
        this.#tabBar.showTab(failuresTabId);
        this.#tabBar.selectTab(failuresTabId);
      } else {
        this.#tabBar.selectTab(specListTabId);
      }
    }

    #find(selector) {
      return this.#container.querySelector(
        '.jasmine_html-reporter ' + selector
      );
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
      if (result.status !== 'excluded') {
        this.rootEl.value = this.rootEl.value + 1;
      }

      if (result.status === 'failed') {
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

jasmineRequire.HtmlReporterV2Urls = function(j$) {
  'use strict';

  // TODO unify with V2 UrlBuilder?
  /**
   * @class HtmlReporterV2Urls
   * @classdesc Processes URLs for {@link HtmlReporterV2}.
   * @since 6.0.0
   */
  class HtmlReporterV2Urls {
    constructor(options = {}) {
      // queryString is injectable for use in our own tests, but user code will
      // not pass any options.
      this.queryString =
        options.queryString ||
        new jasmine.QueryString({
          getWindowLocation: function() {
            return window.location;
          }
        });
    }

    /**
     * Creates a {@link Configuration} from the current page's URL. Supported
     * query string parameters include all those set by {@link HtmlReporterV2}
     * as well as spec=partialPath, which filters out specs whose paths don't
     * contain partialPath.
     * @returns {Configuration}
     * @example
     * const urls = new jasmine.HtmlReporterV2Urls();
     * env.configure(urls.configFromCurrentUrl());
     */
    configFromCurrentUrl() {
      const config = {
        stopOnSpecFailure: this.queryString.getParam('stopOnSpecFailure'),
        stopSpecOnExpectationFailure: this.queryString.getParam(
          'stopSpecOnExpectationFailure'
        )
      };

      const random = this.queryString.getParam('random');

      if (random !== undefined && random !== '') {
        config.random = random;
      }

      const seed = this.queryString.getParam('seed');
      if (seed) {
        config.seed = seed;
      }

      const specFilter = new j$.private.HtmlSpecFilterV2({
        filterParams: () => ({
          path: this.queryString.getParam('path'),
          spec: this.queryString.getParam('spec')
        })
      });

      config.specFilter = function(spec) {
        return specFilter.matches(spec);
      };

      return config;
    }

    filteringSpecs() {
      return !!this.queryString.getParam('path');
    }
  }

  return HtmlReporterV2Urls;
};

jasmineRequire.HtmlSpecFilterV2 = function() {
  class HtmlSpecFilterV2 {
    #getFilterParams;

    constructor(options) {
      this.#getFilterParams = options.filterParams;
    }

    matches(spec) {
      const params = this.#getFilterParams();

      if (params.path) {
        return this.#matchesPath(spec, JSON.parse(params.path));
      } else if (params.spec) {
        // Like legacy HtmlSpecFilter, retained because it's convenient for
        // hand-constructing filter URLs
        return spec.getFullName().includes(params.spec);
      }

      return true;
    }

    #matchesPath(spec, path) {
      const specPath = spec.getPath();

      if (path.length > specPath.length) {
        return false;
      }

      for (let i = 0; i < path.length; i++) {
        if (specPath[i] !== path[i]) {
          return false;
        }
      }

      return true;
    }
  }

  return HtmlSpecFilterV2;
};

jasmineRequire.OverallStatusBar = function(j$) {
  'use strict';

  const { createDom } = j$.private.htmlReporterUtils;
  const staticClassNames = 'jasmine-overall-result jasmine-bar';

  class OverallStatusBar {
    #urlBuilder;

    constructor(urlBuilder) {
      this.#urlBuilder = urlBuilder;
      this.rootEl = createDom('span', {
        className: staticClassNames,
        'aria-live': 'polite'
      });
    }

    showRunning() {
      this.rootEl.textContent = 'Running...';
      this.rootEl.classList.add('jasmine-in-progress');
    }

    showFailing() {
      this.rootEl.textContent = 'Failing...';
      this.rootEl.classList.add('jasmine-failed');
    }

    showDone(doneResult, stateBuilder) {
      // Clear any classes added to represent in-progress state
      this.rootEl.className = staticClassNames;

      let statusBarMessage = '';
      const globalFailures =
        (doneResult && doneResult.failedExpectations) || [];
      const failed = stateBuilder.failureCount + globalFailures.length > 0;

      if (stateBuilder.totalSpecsDefined > 0 || failed) {
        statusBarMessage +=
          pluralize('spec', stateBuilder.specsExecuted) +
          ', ' +
          pluralize('failure', stateBuilder.failureCount);
        if (stateBuilder.pendingSpecCount) {
          statusBarMessage +=
            ', ' + pluralize('pending spec', stateBuilder.pendingSpecCount);
        }
      }

      if (doneResult.overallStatus === 'passed') {
        this.rootEl.classList.add('jasmine-passed');
      } else if (doneResult.overallStatus === 'incomplete') {
        this.rootEl.classList.add('jasmine-incomplete');
        statusBarMessage =
          'Incomplete: ' +
          doneResult.incompleteReason +
          ', ' +
          statusBarMessage;
      } else {
        this.rootEl.classList.add('jasmine-failed');
      }

      // Replace any existing children with the message
      this.rootEl.textContent = statusBarMessage;

      const order = doneResult.order;
      if (order && order.random) {
        this.#addSeedBar(order);
      }

      this.#addDuration(doneResult);
    }

    #addSeedBar(order) {
      this.rootEl.appendChild(
        createDom(
          'span',
          { className: 'jasmine-seed-bar' },
          ', randomized with seed ',
          createDom(
            'a',
            {
              title: 'randomized with seed ' + order.seed,
              href: this.#urlBuilder.seedHref(order.seed)
            },
            order.seed
          )
        )
      );
    }

    #addDuration(doneResult) {
      const secs = doneResult.totalTime / 1000;
      this.rootEl.appendChild(
        createDom(
          'span',
          { className: 'jasmine-duration' },
          `finished in ${secs}s`
        )
      );
    }
  }

  function pluralize(singular, count) {
    const word = count === 1 ? singular : singular + 's';
    return '' + count + ' ' + word;
  }

  return OverallStatusBar;
};

jasmineRequire.PerformanceView = function(j$) {
  const createDom = j$.private.htmlReporterUtils.createDom;
  const MAX_SLOW_SPECS = 20;

  class PerformanceView {
    #summary;
    #tbody;

    constructor() {
      this.#tbody = document.createElement('tbody');
      this.#summary = document.createElement('div');
      this.rootEl = createDom(
        'div',
        { className: 'jasmine-performance-view' },
        createDom('h2', {}, 'Performance'),
        this.#summary,
        createDom('h3', {}, 'Slowest Specs'),
        createDom(
          'table',
          {},
          createDom(
            'thead',
            {},
            createDom(
              'tr',
              {},
              createDom('th', {}, 'Duration'),
              createDom('th', {}, 'Spec Name')
            )
          ),
          this.#tbody
        )
      );
    }

    addResults(resultsTree) {
      const specResults = [];
      getSpecResults(resultsTree, specResults);

      if (specResults.length === 0) {
        return;
      }

      specResults.sort(function(a, b) {
        if (a.duration < b.duration) {
          return 1;
        } else if (a.duration > b.duration) {
          return -1;
        } else {
          return 0;
        }
      });

      this.#populateSumary(specResults);
      this.#populateTable(specResults);
    }

    #populateSumary(specResults) {
      const total = specResults.map(r => r.duration).reduce((a, b) => a + b, 0);
      const mean = total / specResults.length;
      const median = specResults[Math.floor(specResults.length / 2)].duration;
      this.#summary.appendChild(
        document.createTextNode(`Mean spec run time: ${mean.toFixed(0)}ms`)
      );
      this.#summary.appendChild(document.createElement('br'));
      this.#summary.appendChild(
        document.createTextNode(`Median spec run time: ${median}ms`)
      );
    }

    #populateTable(specResults) {
      specResults = specResults.slice(0, MAX_SLOW_SPECS);

      for (const r of specResults) {
        this.#tbody.appendChild(
          createDom(
            'tr',
            {},
            createDom('td', {}, `${r.duration}ms`),
            createDom('td', {}, r.fullName)
          )
        );
      }
    }
  }

  function getSpecResults(resultsTree, dest) {
    for (const node of resultsTree.children) {
      if (node.type === 'suite') {
        getSpecResults(node, dest);
      } else if (node.result.status !== 'excluded') {
        dest.push(node.result);
      }
    }
  }

  return PerformanceView;
};

jasmineRequire.ResultsStateBuilder = function(j$) {
  'use strict';

  class ResultsStateBuilder {
    constructor() {
      this.topResults = new j$.private.ResultsNode({}, '', null);
      this.currentParent = this.topResults;
      this.suitesById = {};
      this.totalSpecsDefined = 0;
      this.specsExecuted = 0;
      this.failureCount = 0;
      this.anyNonTopSuiteFailures = false;
      this.pendingSpecCount = 0;
      this.deprecationWarnings = [];
    }

    suiteStarted(result) {
      this.currentParent.addChild(result, 'suite');
      this.currentParent = this.currentParent.last();
      this.suitesById[result.id] = this.currentParent;
    }

    suiteDone(result) {
      this.currentParent.updateResult(result);
      this.#addDeprecationWarnings(result, 'suite');

      if (this.currentParent !== this.topResults) {
        this.currentParent = this.currentParent.parent;
      }

      if (result.status === 'failed') {
        this.failureCount++;
        this.anyNonTopSuiteFailures = true;
      }
    }

    specDone(result) {
      this.currentParent.addChild(result, 'spec');
      this.#addDeprecationWarnings(result, 'spec');

      if (result.status !== 'excluded') {
        this.specsExecuted++;
      }

      if (result.status === 'failed') {
        this.failureCount++;
        this.anyNonTopSuiteFailures = true;
      }

      if (result.status == 'pending') {
        this.pendingSpecCount++;
      }
    }

    jasmineStarted(result) {
      this.totalSpecsDefined = result.totalSpecsDefined;
    }

    jasmineDone(result) {
      if (result.failedExpectations) {
        this.failureCount += result.failedExpectations.length;
      }

      this.#addDeprecationWarnings(result);
    }

    #addDeprecationWarnings(result, runnableType) {
      if (result.deprecationWarnings) {
        for (const dw of result.deprecationWarnings) {
          this.deprecationWarnings.push({
            message: dw.message,
            stack: dw.stack,
            runnableName: result.fullName,
            runnableType: runnableType
          });
        }
      }
    }
  }

  return ResultsStateBuilder;
};

jasmineRequire.SummaryTreeView = function(j$) {
  'use strict';

  const { createDom, noExpectations } = j$.private.htmlReporterUtils;

  class SummaryTreeView {
    #urlBuilder;
    #filterSpecs;

    constructor(urlBuilder, filterSpecs) {
      this.#urlBuilder = urlBuilder;
      this.#filterSpecs = filterSpecs;
      this.rootEl = createDom('div', {
        className: 'jasmine-summary'
      });
    }

    addResults(resultsTree) {
      this.#addResults(resultsTree, this.rootEl);
    }

    #addResults(resultsTree, domParent) {
      let specListNode;
      for (let i = 0; i < resultsTree.children.length; i++) {
        const resultNode = resultsTree.children[i];
        if (this.#filterSpecs && !hasActiveSpec(resultNode)) {
          continue;
        }
        if (resultNode.type === 'suite') {
          const suiteListNode = createDom(
            'ul',
            { className: 'jasmine-suite', id: 'suite-' + resultNode.result.id },
            createDom(
              'li',
              {
                className:
                  'jasmine-suite-detail jasmine-' + resultNode.result.status
              },
              createDom(
                'a',
                { href: this.#urlBuilder.specHref(resultNode.result) },
                resultNode.result.description
              )
            )
          );

          this.#addResults(resultNode, suiteListNode);
          domParent.appendChild(suiteListNode);
        }
        if (resultNode.type === 'spec') {
          if (domParent.getAttribute('class') !== 'jasmine-specs') {
            specListNode = createDom('ul', {
              className: 'jasmine-specs'
            });
            domParent.appendChild(specListNode);
          }
          let specDescription = resultNode.result.description;
          if (noExpectations(resultNode.result)) {
            specDescription = 'SPEC HAS NO EXPECTATIONS ' + specDescription;
          }
          if (resultNode.result.status === 'pending') {
            if (resultNode.result.pendingReason !== '') {
              specDescription +=
                ' PENDING WITH MESSAGE: ' + resultNode.result.pendingReason;
            } else {
              specDescription += ' PENDING';
            }
          }
          specListNode.appendChild(
            createDom(
              'li',
              {
                className: 'jasmine-' + resultNode.result.status,
                id: 'spec-' + resultNode.result.id
              },
              createDom(
                'a',
                { href: this.#urlBuilder.specHref(resultNode.result) },
                specDescription
              ),
              createDom(
                'span',
                { className: 'jasmine-spec-duration' },
                '(' + resultNode.result.duration + 'ms)'
              )
            )
          );
        }
      }
    }
  }

  function hasActiveSpec(resultNode) {
    if (resultNode.type === 'spec' && resultNode.result.status !== 'excluded') {
      return true;
    }

    if (resultNode.type === 'suite') {
      for (let i = 0, j = resultNode.children.length; i < j; i++) {
        if (hasActiveSpec(resultNode.children[i])) {
          return true;
        }
      }
    }
  }

  return SummaryTreeView;
};

jasmineRequire.SymbolsView = function(j$) {
  'use strict';

  const { createDom, noExpectations } = j$.private.htmlReporterUtils;

  class SymbolsView {
    constructor() {
      this.rootEl = createDom('ul', {
        className: 'jasmine-symbol-summary'
      });
    }

    append(result, config) {
      this.rootEl.appendChild(
        createDom('li', {
          className: this.#className(result, config),
          id: 'spec_' + result.id,
          title: result.fullName
        })
      );
    }

    #className(result, config) {
      if (noExpectations(result) && result.status === 'passed') {
        return 'jasmine-empty';
      } else if (result.status === 'excluded') {
        if (config.hideDisabled) {
          return 'jasmine-excluded-no-display';
        } else {
          return 'jasmine-excluded';
        }
      } else {
        return 'jasmine-' + result.status;
      }
    }
  }

  return SymbolsView;
};

jasmineRequire.TabBar = function(j$) {
  const createDom = j$.private.htmlReporterUtils.createDom;

  class TabBar {
    #tabs;
    #onSelectTab;

    // tabSpecs should be an array of {id, label}.
    // All tabs are initially not visible and not selected.
    constructor(tabSpecs, onSelectTab) {
      this.#onSelectTab = onSelectTab;
      this.#tabs = [];
      this.#tabs = tabSpecs.map(ts => new Tab(ts, () => this.selectTab(ts.id)));

      this.rootEl = createDom(
        'span',
        { className: 'jasmine-menu jasmine-bar' },
        this.#tabs.map(t => t.rootEl)
      );
    }

    showTab(id) {
      for (const tab of this.#tabs) {
        if (tab.rootEl.id === id) {
          tab.setVisibility(true);
        }
      }
    }

    selectTab(id) {
      for (const tab of this.#tabs) {
        tab.setSelected(tab.rootEl.id === id);
      }

      this.#onSelectTab(id);
    }
  }

  class Tab {
    #spec;
    #onClick;

    constructor(spec, onClick) {
      this.#spec = spec;
      this.#onClick = onClick;
      this.rootEl = createDom(
        'span',
        { id: spec.id, className: 'jasmine-tab jasmine-hidden' },
        this.#createLink()
      );
    }

    setVisibility(visible) {
      this.rootEl.classList.toggle('jasmine-hidden', !visible);
    }

    setSelected(selected) {
      if (selected) {
        this.rootEl.textContent = this.#spec.label;
      } else {
        this.rootEl.textContent = '';
        this.rootEl.appendChild(this.#createLink());
      }
    }

    #createLink() {
      const link = createDom('a', { href: '#' }, this.#spec.label);
      link.addEventListener('click', e => {
        e.preventDefault();
        this.#onClick();
      });
      return link;
    }
  }

  return TabBar;
};
