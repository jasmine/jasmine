jasmineRequire.HtmlReporter = function(j$) {
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

  const errorBarClassName = 'jasmine-bar jasmine-errored';
  const afterAllMessagePrefix = 'AfterAll ';

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
    #domContext;
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
      this.#domContext = new j$.private.DomContext();
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

      this.#stateBuilder = new ResultsStateBuilder();

      this.#alerts = new AlertsView(this.#domContext, this.#urlBuilder);
      this.#symbols = new SymbolsView(this.#domContext);
      this.#banner = new Banner(this.#domContext, this.#navigateWithNewParam);
      this.#failures = new FailuresView(this.#domContext, this.#urlBuilder);
      this.#htmlReporterMain = this.#domContext.create(
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
      const summary = new SummaryTreeView(
        this.#domContext,
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

  function noExpectations(result) {
    const allExpectations =
      result.failedExpectations.length + result.passedExpectations.length;

    return (
      allExpectations === 0 &&
      (result.status === 'passed' || result.status === 'failed')
    );
  }

  function pluralize(singular, count) {
    const word = count == 1 ? singular : singular + 's';

    return '' + count + ' ' + word;
  }

  function defaultQueryString(key, value) {
    return '?' + key + '=' + value;
  }

  class AlertsView {
    #domContext;
    #urlBuilder;

    constructor(domContext, urlBuilder) {
      this.#domContext = domContext;
      this.#urlBuilder = urlBuilder;
      this.rootEl = domContext.create('div', { className: 'jasmine-alert' });
    }

    addDuration(ms) {
      this.add('jasmine-duration', 'finished in ' + ms / 1000 + 's');
    }

    addSkipped(numExecuted, numDefined) {
      // TODO: backfill tests for this
      this.add(
        'jasmine-bar jasmine-skipped',
        this.#domContext.create(
          'a',
          { href: this.#urlBuilder.runAllHref(), title: 'Run all specs' },
          `Ran ${numExecuted} of ${numDefined} specs - run all`
        )
      );
    }

    addFailureToggle(onClickFailures, onClickSpecList) {
      const failuresLink = this.#domContext.create(
        'a',
        { className: 'jasmine-failures-menu', href: '#' },
        'Failures'
      );
      let specListLink = this.#domContext.create(
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
        this.#domContext.create('span', {}, 'Spec List | '),
        failuresLink
      ]);
      this.add('jasmine-menu jasmine-bar jasmine-failure-list', [
        specListLink,
        this.#domContext.create('span', {}, ' | Failures ')
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
        seedBar = this.#domContext.create(
          'span',
          { className: 'jasmine-seed-bar' },
          ', randomized with seed ',
          this.#domContext.create(
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
        children.push(this.#domContext.create('br'));
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
      this.rootEl.appendChild(
        this.#domContext.create('span', { className }, children)
      );
    }

    #createExpander(stackTrace) {
      const expandLink = this.#domContext.create(
        'a',
        { href: '#' },
        'Show stack trace'
      );
      const root = this.#domContext.create(
        'div',
        { className: 'jasmine-expander' },
        expandLink,
        this.#domContext.create(
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

  class Banner {
    #domContext;
    #navigateWithNewParam;

    constructor(domContext, navigateWithNewParam) {
      this.#domContext = domContext;
      this.#navigateWithNewParam = navigateWithNewParam;
      this.rootEl = domContext.create(
        'div',
        { className: 'jasmine-banner' },
        domContext.create('a', {
          className: 'jasmine-title',
          href: 'http://jasmine.github.io/',
          target: '_blank'
        }),
        domContext.create('span', { className: 'jasmine-version' }, j$.version)
      );
    }

    showOptionsMenu(config) {
      this.rootEl.appendChild(this.#optionsMenu(config));
    }

    #optionsMenu(config) {
      const optionsMenuDom = this.#domContext.create(
        'div',
        { className: 'jasmine-run-options' },
        this.#domContext.create(
          'span',
          { className: 'jasmine-trigger' },
          'Options'
        ),
        this.#domContext.create(
          'div',
          { className: 'jasmine-payload' },
          this.#domContext.create(
            'div',
            { className: 'jasmine-stop-on-failure' },
            this.#domContext.create('input', {
              className: 'jasmine-fail-fast',
              id: 'jasmine-fail-fast',
              type: 'checkbox'
            }),
            this.#domContext.create(
              'label',
              { className: 'jasmine-label', for: 'jasmine-fail-fast' },
              'stop execution on spec failure'
            )
          ),
          this.#domContext.create(
            'div',
            { className: 'jasmine-throw-failures' },
            this.#domContext.create('input', {
              className: 'jasmine-throw',
              id: 'jasmine-throw-failures',
              type: 'checkbox'
            }),
            this.#domContext.create(
              'label',
              { className: 'jasmine-label', for: 'jasmine-throw-failures' },
              'stop spec on expectation failure'
            )
          ),
          this.#domContext.create(
            'div',
            { className: 'jasmine-random-order' },
            this.#domContext.create('input', {
              className: 'jasmine-random',
              id: 'jasmine-random-order',
              type: 'checkbox'
            }),
            this.#domContext.create(
              'label',
              { className: 'jasmine-label', for: 'jasmine-random-order' },
              'run tests in random order'
            )
          ),
          this.#domContext.create(
            'div',
            { className: 'jasmine-hide-disabled' },
            this.#domContext.create('input', {
              className: 'jasmine-disabled',
              id: 'jasmine-hide-disabled',
              type: 'checkbox'
            }),
            this.#domContext.create(
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

  class SymbolsView {
    #domContext;

    constructor(domContext) {
      this.#domContext = domContext;
      this.rootEl = domContext.create('ul', {
        className: 'jasmine-symbol-summary'
      });
    }

    append(result, config) {
      this.rootEl.appendChild(
        this.#domContext.create('li', {
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

  class SummaryTreeView {
    #domContext;
    #urlBuilder;
    #filterSpecs;

    constructor(domContext, urlBuilder, filterSpecs) {
      this.#domContext = domContext;
      this.#urlBuilder = urlBuilder;
      this.#filterSpecs = filterSpecs;
      this.rootEl = domContext.create('div', { className: 'jasmine-summary' });
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
          const suiteListNode = this.#domContext.create(
            'ul',
            { className: 'jasmine-suite', id: 'suite-' + resultNode.result.id },
            this.#domContext.create(
              'li',
              {
                className:
                  'jasmine-suite-detail jasmine-' + resultNode.result.status
              },
              this.#domContext.create(
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
            specListNode = this.#domContext.create('ul', {
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
            this.#domContext.create(
              'li',
              {
                className: 'jasmine-' + resultNode.result.status,
                id: 'spec-' + resultNode.result.id
              },
              this.#domContext.create(
                'a',
                { href: this.#urlBuilder.specHref(resultNode.result) },
                specDescription
              ),
              this.#domContext.create(
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

  class FailuresView {
    #domContext;
    #urlBuilder;
    #failureEls;

    constructor(domContext, urlBuilder) {
      this.#domContext = domContext;
      this.#urlBuilder = urlBuilder;
      this.#failureEls = [];
      this.rootEl = domContext.create(
        'div',
        { className: 'jasmine-results' },
        domContext.create('div', { className: 'jasmine-failures' })
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
      const failure = this.#domContext.create(
        'div',
        { className: 'jasmine-spec-detail jasmine-failed' },
        this.#failureDescription(result, parent),
        this.#domContext.create('div', { className: 'jasmine-messages' })
      );
      const messages = failure.childNodes[1];

      for (let i = 0; i < result.failedExpectations.length; i++) {
        const expectation = result.failedExpectations[i];
        messages.appendChild(
          this.#domContext.create(
            'div',
            { className: 'jasmine-result-message' },
            expectation.message
          )
        );
        messages.appendChild(
          this.#domContext.create(
            'div',
            { className: 'jasmine-stack-trace' },
            expectation.stack
          )
        );
      }

      if (result.failedExpectations.length === 0) {
        messages.appendChild(
          this.#domContext.create(
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
      const wrapper = this.#domContext.create(
        'div',
        { className: 'jasmine-description' },
        this.#domContext.create(
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
        suiteLink = this.#domContext.create(
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
      const tbody = this.#domContext.create('tbody');

      for (const entry of debugLogs) {
        tbody.appendChild(
          this.#domContext.create(
            'tr',
            {},
            this.#domContext.create('td', {}, entry.timestamp.toString()),
            this.#domContext.create(
              'td',
              { className: 'jasmine-debug-log-msg' },
              entry.message
            )
          )
        );
      }

      return this.#domContext.create(
        'div',
        { className: 'jasmine-debug-log' },
        this.#domContext.create(
          'div',
          { className: 'jasmine-debug-log-header' },
          'Debug logs'
        ),
        this.#domContext.create(
          'table',
          {},
          this.#domContext.create(
            'thead',
            {},
            this.#domContext.create(
              'tr',
              {},
              this.#domContext.create('th', {}, 'Time (ms)'),
              this.#domContext.create('th', {}, 'Message')
            )
          ),
          tbody
        )
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

  return HtmlReporter;
};
