/*
Copyright (c) 2008-2019 Pivotal Labs
Copyright (c) 2008-2025 The Jasmine developers

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
  j$.private.Banner = jasmineRequire.Banner(j$);
  j$.private.SymbolsView = jasmineRequire.SymbolsView(j$);
  j$.private.SummaryTreeView = jasmineRequire.SummaryTreeView(j$);
  j$.private.FailuresView = jasmineRequire.FailuresView(j$);
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.HtmlReporterV2 = jasmineRequire.HtmlReporterV2(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter();
  j$.HtmlSpecFilterV2 = jasmineRequire.HtmlSpecFilterV2();
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

jasmineRequire.HtmlSpecFilter = function() {
  'use strict';

  function HtmlSpecFilter(options) {
    const filterString =
      options &&
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

    addDuration(ms) {
      this.add('jasmine-duration', 'finished in ' + ms / 1000 + 's');
    }

    addSkipped(numExecuted, numDefined) {
      // TODO: backfill tests for this
      this.add(
        'jasmine-bar jasmine-skipped',
        createDom(
          'a',
          { href: this.#urlBuilder.runAllHref(), title: 'Run all specs' },
          `Ran ${numExecuted} of ${numDefined} specs - run all`
        )
      );
    }

    addFailureToggle(onClickFailures, onClickSpecList) {
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

      this.add('jasmine-menu jasmine-bar jasmine-spec-list', [
        createDom('span', {}, 'Spec List | '),
        failuresLink
      ]);
      this.add('jasmine-menu jasmine-bar jasmine-failure-list', [
        specListLink,
        createDom('span', {}, ' | Failures ')
      ]);
    }

    addGlobalFailure(failure) {
      this.add(errorBarClassName, this.#globalFailureMessage(failure));
    }

    // TODO check test coverage
    addSeedBar(doneResult, stateBuilder, order) {
      let statusBarMessage = '';
      let statusBarClassName = 'jasmine-overall-result jasmine-bar ';
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
        statusBarClassName += ' jasmine-passed ';
      } else if (doneResult.overallStatus === 'incomplete') {
        statusBarClassName += ' jasmine-incomplete ';
        statusBarMessage =
          'Incomplete: ' +
          doneResult.incompleteReason +
          ', ' +
          statusBarMessage;
      } else {
        statusBarClassName += ' jasmine-failed ';
      }

      let seedBar;
      if (order && order.random) {
        seedBar = createDom(
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
        );
      }

      this.add(statusBarClassName, [statusBarMessage, seedBar]);
    }

    // TODO check test coverage
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

      this.add('jasmine-bar jasmine-warning', children);
    }

    // TODO private?
    add(className, children) {
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

  function pluralize(singular, count) {
    const word = count == 1 ? singular : singular + 's';

    return '' + count + ' ' + word;
  }

  return AlertsView;
};

jasmineRequire.Banner = function(j$) {
  'use strict';

  const { createDom } = j$.private.htmlReporterUtils;

  class Banner {
    #navigateWithNewParam;

    constructor(navigateWithNewParam) {
      this.#navigateWithNewParam = navigateWithNewParam;
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
      const optionsMenuDom = createDom(
        'div',
        { className: 'jasmine-run-options' },
        createDom('span', { className: 'jasmine-trigger' }, 'Options'),
        createDom(
          'div',
          { className: 'jasmine-payload' },
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
          ),
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
        )
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

      const hideDisabled = optionsMenuDom.querySelector(
        '#jasmine-hide-disabled'
      );
      hideDisabled.checked = config.hideDisabled;
      // TODO: backfill tests for this!
      hideDisabled.onclick = () => {
        this.#navigateWithNewParam('hideDisabled', !config.hideDisabled);
      };

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

    constructor(urlBuilder) {
      this.#urlBuilder = urlBuilder;
      this.#failureEls = [];
      this.rootEl = createDom(
        'div',
        { className: 'jasmine-results' },
        createDom('div', { className: 'jasmine-failures' })
      );
    }

    append(result, parent) {
      // TODO: Figure out why the reuslt is wrong if we build the DOM node later
      this.#failureEls.push(this.#makeFailureEl(result, parent));
    }

    // TODO move this to state builder or something
    any() {
      return this.#failureEls.length > 0;
    }

    show() {
      const failureNode = this.rootEl.querySelector('.jasmine-failures');

      for (const el of this.#failureEls) {
        failureNode.appendChild(el);
      }
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

    if (j$.private.isArray(childrenArrayOrVarArgs)) {
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

  /**
   * @class HtmlReporterV2
   * @classdesc Displays results and allows re-running individual specs and suites.
   * @implements {Reporter}
   * @param options Options object. See lib/jasmine-core/boot1.js for details.
   * @since 6.0.0
   */
  class HtmlReporterV2 {
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

  return HtmlReporterV2;
};

jasmineRequire.HtmlSpecFilterV2 = function() {
  'use strict';

  function HtmlSpecFilterV2(options) {
    const filterString =
      options &&
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

  return HtmlSpecFilterV2;
};

jasmineRequire.ResultsStateBuilder = function(j$) {
  'use strict';

  class ResultsStateBuilder {
    constructor() {
      this.topResults = new j$.private.ResultsNode({}, '', null);
      this.currentParent = this.topResults;
      this.totalSpecsDefined = 0;
      this.specsExecuted = 0;
      this.failureCount = 0;
      this.pendingSpecCount = 0;
      this.deprecationWarnings = [];
    }

    suiteStarted(result) {
      this.currentParent.addChild(result, 'suite');
      this.currentParent = this.currentParent.last();
    }

    suiteDone(result) {
      this.currentParent.updateResult(result);
      this.#addDeprecationWarnings(result, 'suite');

      if (this.currentParent !== this.topResults) {
        this.currentParent = this.currentParent.parent;
      }

      if (result.status === 'failed') {
        this.failureCount++;
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
