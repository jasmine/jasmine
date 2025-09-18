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
  j$.ResultsNode = jasmineRequire.ResultsNode();
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter();
  j$.HtmlExactSpecFilter = jasmineRequire.HtmlExactSpecFilter();
};

jasmineRequire.HtmlReporter = function(j$) {
  function ResultsStateBuilder() {
    this.topResults = new j$.ResultsNode({}, '', null);
    this.currentParent = this.topResults;
    this.specsExecuted = 0;
    this.failureCount = 0;
    this.pendingSpecCount = 0;
    this.suitesById = [];
  }

  ResultsStateBuilder.prototype.suiteStarted = function(result) {
    this.currentParent.addChild(result, 'suite');
    this.currentParent = this.currentParent.last();
    this.suitesById[result.id] = this.currentParent;
  };

  ResultsStateBuilder.prototype.suiteDone = function(result) {
    this.currentParent.updateResult(result);
    if (this.currentParent !== this.topResults) {
      this.currentParent = this.currentParent.parent;
    }

    if (result.status === 'failed') {
      this.failureCount++;
    }
  };

  ResultsStateBuilder.prototype.specStarted = function(result) {};

  ResultsStateBuilder.prototype.specDone = function(result) {
    this.currentParent.addChild(result, 'spec');

    if (result.status !== 'excluded') {
      this.specsExecuted++;
    }

    if (result.status === 'failed') {
      this.failureCount++;
    }

    if (result.status == 'pending') {
      this.pendingSpecCount++;
    }
  };

  ResultsStateBuilder.prototype.jasmineDone = function(result) {
    if (result.failedExpectations) {
      this.failureCount += result.failedExpectations.length;
    }
  };

  /**
   * @class HtmlReporter
   * @classdesc Displays results and allows re-running individual specs and suites.
   * @implements {Reporter}
   * @param options Options object. See lib/jasmine-core/boot1.js for details.
   * @since 1.2.0
   */
  function HtmlReporter(options) {
    function config() {
      return (options.env && options.env.configuration()) || {};
    }

    const getContainer = options.getContainer;
    const createElement = options.createElement;
    const createTextNode = options.createTextNode;
    // TODO: in the next major release, replace navigateWithNewParam and
    // addToExistingQueryString with direct usage of options.queryString
    const navigateWithNewParam = options.navigateWithNewParam || function() {};
    const addToExistingQueryString =
      options.addToExistingQueryString || defaultQueryString;
    const filterSpecs = options.queryString
      ? !!options.queryString.getParam('spec')
      : options.filterSpecs; // For compatibility with pre-5.11 boot files
    let htmlReporterMain;
    let symbols;
    const deprecationWarnings = [];
    const failures = [];

    /**
     * Initializes the reporter. Should be called before {@link Env#execute}.
     * @function
     * @name HtmlReporter#initialize
     */
    this.initialize = function() {
      clearPrior();
      htmlReporterMain = createDom(
        'div',
        { className: 'jasmine_html-reporter' },
        createDom(
          'div',
          { className: 'jasmine-banner' },
          createDom('a', {
            className: 'jasmine-title',
            href: 'http://jasmine.github.io/',
            target: '_blank'
          }),
          createDom('span', { className: 'jasmine-version' }, j$.version)
        ),
        createDom('ul', { className: 'jasmine-symbol-summary' }),
        createDom('div', { className: 'jasmine-alert' }),
        createDom(
          'div',
          { className: 'jasmine-results' },
          createDom('div', { className: 'jasmine-failures' })
        )
      );
      getContainer().appendChild(htmlReporterMain);
    };

    let totalSpecsDefined;
    this.jasmineStarted = function(options) {
      totalSpecsDefined = options.totalSpecsDefined || 0;
    };

    const summary = createDom('div', { className: 'jasmine-summary' });

    const stateBuilder = new ResultsStateBuilder();

    this.suiteStarted = function(result) {
      stateBuilder.suiteStarted(result);
    };

    this.suiteDone = function(result) {
      stateBuilder.suiteDone(result);

      if (result.status === 'failed') {
        failures.push(failureDom(result));
      }
      addDeprecationWarnings(result, 'suite');
    };

    this.specStarted = function(result) {
      stateBuilder.specStarted(result);
    };

    this.specDone = function(result) {
      stateBuilder.specDone(result);

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

      if (!symbols) {
        symbols = find('.jasmine-symbol-summary');
      }

      symbols.appendChild(
        createDom('li', {
          className: this.displaySpecInCorrectFormat(result),
          id: 'spec_' + result.id,
          title: result.fullName
        })
      );

      if (result.status === 'failed') {
        failures.push(failureDom(result));
      }

      addDeprecationWarnings(result, 'spec');
    };

    this.displaySpecInCorrectFormat = function(result) {
      return noExpectations(result) && result.status === 'passed'
        ? 'jasmine-empty'
        : this.resultStatus(result.status);
    };

    this.resultStatus = function(status) {
      if (status === 'excluded') {
        return config().hideDisabled
          ? 'jasmine-excluded-no-display'
          : 'jasmine-excluded';
      }
      return 'jasmine-' + status;
    };

    this.jasmineDone = function(doneResult) {
      stateBuilder.jasmineDone(doneResult);
      const banner = find('.jasmine-banner');
      const alert = find('.jasmine-alert');
      const order = doneResult && doneResult.order;

      alert.appendChild(
        createDom(
          'span',
          { className: 'jasmine-duration' },
          'finished in ' + doneResult.totalTime / 1000 + 's'
        )
      );

      banner.appendChild(optionsMenu(config()));

      if (stateBuilder.specsExecuted < totalSpecsDefined) {
        const skippedMessage =
          'Ran ' +
          stateBuilder.specsExecuted +
          ' of ' +
          totalSpecsDefined +
          ' specs - run all';
        // include window.location.pathname to fix issue with karma-jasmine-html-reporter in angular: see https://github.com/jasmine/jasmine/issues/1906
        const skippedLink =
          (window.location.pathname || '') +
          addToExistingQueryString('spec', '');
        alert.appendChild(
          createDom(
            'span',
            { className: 'jasmine-bar jasmine-skipped' },
            createDom(
              'a',
              { href: skippedLink, title: 'Run all specs' },
              skippedMessage
            )
          )
        );
      }
      let statusBarMessage = '';
      let statusBarClassName = 'jasmine-overall-result jasmine-bar ';
      const globalFailures =
        (doneResult && doneResult.failedExpectations) || [];
      const failed = stateBuilder.failureCount + globalFailures.length > 0;

      if (totalSpecsDefined > 0 || failed) {
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
              href: seedHref(order.seed)
            },
            order.seed
          )
        );
      }

      alert.appendChild(
        createDom(
          'span',
          { className: statusBarClassName },
          statusBarMessage,
          seedBar
        )
      );

      const errorBarClassName = 'jasmine-bar jasmine-errored';
      const afterAllMessagePrefix = 'AfterAll ';

      for (let i = 0; i < globalFailures.length; i++) {
        alert.appendChild(
          createDom(
            'span',
            { className: errorBarClassName },
            globalFailureMessage(globalFailures[i])
          )
        );
      }

      function globalFailureMessage(failure) {
        if (failure.globalErrorType === 'load') {
          const prefix = 'Error during loading: ' + failure.message;

          if (failure.filename) {
            return (
              prefix + ' in ' + failure.filename + ' line ' + failure.lineno
            );
          } else {
            return prefix;
          }
        } else if (failure.globalErrorType === 'afterAll') {
          return afterAllMessagePrefix + failure.message;
        } else {
          return failure.message;
        }
      }

      addDeprecationWarnings(doneResult);

      for (let i = 0; i < deprecationWarnings.length; i++) {
        const children = [];
        let context;

        switch (deprecationWarnings[i].runnableType) {
          case 'spec':
            context = '(in spec: ' + deprecationWarnings[i].runnableName + ')';
            break;
          case 'suite':
            context = '(in suite: ' + deprecationWarnings[i].runnableName + ')';
            break;
          default:
            context = '';
        }

        deprecationWarnings[i].message.split('\n').forEach(function(line) {
          children.push(line);
          children.push(createDom('br'));
        });

        children[0] = 'DEPRECATION: ' + children[0];
        children.push(context);

        if (deprecationWarnings[i].stack) {
          children.push(createExpander(deprecationWarnings[i].stack));
        }

        alert.appendChild(
          createDom(
            'span',
            { className: 'jasmine-bar jasmine-warning' },
            children
          )
        );
      }

      const results = find('.jasmine-results');
      results.appendChild(summary);

      summaryList(stateBuilder.topResults, summary);

      if (failures.length) {
        alert.appendChild(
          createDom(
            'span',
            { className: 'jasmine-menu jasmine-bar jasmine-spec-list' },
            createDom('span', {}, 'Spec List | '),
            createDom(
              'a',
              { className: 'jasmine-failures-menu', href: '#' },
              'Failures'
            )
          )
        );
        alert.appendChild(
          createDom(
            'span',
            { className: 'jasmine-menu jasmine-bar jasmine-failure-list' },
            createDom(
              'a',
              { className: 'jasmine-spec-list-menu', href: '#' },
              'Spec List'
            ),
            createDom('span', {}, ' | Failures ')
          )
        );

        find('.jasmine-failures-menu').onclick = function() {
          setMenuModeTo('jasmine-failure-list');
          return false;
        };
        find('.jasmine-spec-list-menu').onclick = function() {
          setMenuModeTo('jasmine-spec-list');
          return false;
        };

        setMenuModeTo('jasmine-failure-list');

        const failureNode = find('.jasmine-failures');
        for (let i = 0; i < failures.length; i++) {
          failureNode.appendChild(failures[i]);
        }
      }
    };

    return this;

    function failureDom(result) {
      const failure = createDom(
        'div',
        { className: 'jasmine-spec-detail jasmine-failed' },
        failureDescription(result, stateBuilder.currentParent),
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
        messages.appendChild(debugLogTable(result.debugLogs));
      }

      return failure;
    }

    function debugLogTable(debugLogs) {
      const tbody = createDom('tbody');

      debugLogs.forEach(function(entry) {
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
      });

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

    function summaryList(resultsTree, domParent) {
      let specListNode;
      for (let i = 0; i < resultsTree.children.length; i++) {
        const resultNode = resultsTree.children[i];
        if (filterSpecs && !hasActiveSpec(resultNode)) {
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
                { href: specHref(resultNode.result) },
                resultNode.result.description
              )
            )
          );

          summaryList(resultNode, suiteListNode);
          domParent.appendChild(suiteListNode);
        }
        if (resultNode.type === 'spec') {
          if (domParent.getAttribute('class') !== 'jasmine-specs') {
            specListNode = createDom('ul', { className: 'jasmine-specs' });
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
                { href: specHref(resultNode.result) },
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

    function optionsMenu(config) {
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
      failFastCheckbox.onclick = function() {
        navigateWithNewParam('stopOnSpecFailure', !config.stopOnSpecFailure);
      };

      const throwCheckbox = optionsMenuDom.querySelector(
        '#jasmine-throw-failures'
      );
      throwCheckbox.checked = config.stopSpecOnExpectationFailure;
      throwCheckbox.onclick = function() {
        navigateWithNewParam(
          'stopSpecOnExpectationFailure',
          !config.stopSpecOnExpectationFailure
        );
      };

      const randomCheckbox = optionsMenuDom.querySelector(
        '#jasmine-random-order'
      );
      randomCheckbox.checked = config.random;
      randomCheckbox.onclick = function() {
        navigateWithNewParam('random', !config.random);
      };

      const hideDisabled = optionsMenuDom.querySelector(
        '#jasmine-hide-disabled'
      );
      hideDisabled.checked = config.hideDisabled;
      hideDisabled.onclick = function() {
        navigateWithNewParam('hideDisabled', !config.hideDisabled);
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

    function failureDescription(result, suite) {
      const wrapper = createDom(
        'div',
        { className: 'jasmine-description' },
        createDom(
          'a',
          { title: result.description, href: specHref(result) },
          result.description
        )
      );
      let suiteLink;

      while (suite && suite.parent) {
        wrapper.insertBefore(createTextNode(' > '), wrapper.firstChild);
        suiteLink = createDom(
          'a',
          { href: suiteHref(suite) },
          suite.result.description
        );
        wrapper.insertBefore(suiteLink, wrapper.firstChild);

        suite = suite.parent;
      }

      return wrapper;
    }

    function addDeprecationWarnings(result, runnableType) {
      if (result && result.deprecationWarnings) {
        for (let i = 0; i < result.deprecationWarnings.length; i++) {
          const warning = result.deprecationWarnings[i].message;
          deprecationWarnings.push({
            message: warning,
            stack: result.deprecationWarnings[i].stack,
            runnableName: result.fullName,
            runnableType: runnableType
          });
        }
      }
    }

    function createExpander(stackTrace) {
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

    function find(selector) {
      return getContainer().querySelector('.jasmine_html-reporter ' + selector);
    }

    function clearPrior() {
      const oldReporter = find('');

      if (oldReporter) {
        getContainer().removeChild(oldReporter);
      }
    }

    function createDom(type, attrs, childrenArrayOrVarArgs) {
      const el = createElement(type);
      let children;

      if (j$.isArray_(childrenArrayOrVarArgs)) {
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
          el.appendChild(createTextNode(child));
        } else {
          if (child) {
            el.appendChild(child);
          }
        }
      }

      for (const attr in attrs) {
        if (attr == 'className') {
          el[attr] = attrs[attr];
        } else {
          el.setAttribute(attr, attrs[attr]);
        }
      }

      return el;
    }

    function pluralize(singular, count) {
      const word = count == 1 ? singular : singular + 's';

      return '' + count + ' ' + word;
    }

    function suitePath(suite) {
      const els = [];

      while (suite && suite.parent) {
        els.unshift(suite.result.description);
        suite = suite.parent;
      }

      return els;
    }

    function suiteHref(suite) {
      return pathHref(suitePath(suite));
    }

    function specHref(result) {
      const suite = stateBuilder.suitesById[result.parentSuiteId];
      const path = suitePath(suite);
      path.push(result.description);
      return pathHref(path);
    }

    function pathHref(path) {
      // include window.location.pathname to fix issue with karma-jasmine-html-reporter in angular: see https://github.com/jasmine/jasmine/issues/1906
      return (
        (window.location.pathname || '') +
        addToExistingQueryString('spec', JSON.stringify(path))
      );
    }

    function seedHref(seed) {
      // include window.location.pathname to fix issue with karma-jasmine-html-reporter in angular: see https://github.com/jasmine/jasmine/issues/1906
      return (
        (window.location.pathname || '') +
        addToExistingQueryString('seed', seed)
      );
    }

    function defaultQueryString(key, value) {
      return '?' + key + '=' + value;
    }

    function setMenuModeTo(mode) {
      htmlReporterMain.setAttribute('class', 'jasmine_html-reporter ' + mode);
    }

    function noExpectations(result) {
      const allExpectations =
        result.failedExpectations.length + result.passedExpectations.length;

      return (
        allExpectations === 0 &&
        (result.status === 'passed' || result.status === 'failed')
      );
    }

    function hasActiveSpec(resultNode) {
      if (resultNode.type == 'spec' && resultNode.result.status != 'excluded') {
        return true;
      }

      if (resultNode.type == 'suite') {
        for (let i = 0, j = resultNode.children.length; i < j; i++) {
          if (hasActiveSpec(resultNode.children[i])) {
            return true;
          }
        }
      }
    }
  }

  return HtmlReporter;
};

jasmineRequire.HtmlSpecFilter = function() {
  /**
   * @name HtmlSpecFilter
   * @classdesc Legacy HTML spec filter, for backward compatibility
   * with boot files that predate {@link HtmlExactSpecFilter}.
   * @param options Object with a filterString method
   * @constructor
   * @deprecated
   * @since 1.2.0
   */
  // Legacy HTML spec filter, preserved for backward compatibility with
  // boot files that predate HtmlExactSpecFilterV2
  function HtmlSpecFilter(options) {
    let filterString = (options && options.filterString()) || '';

    if (filterString.startsWith('[')) {
      // Convert an HtmlExactSpecFilterV2 string into something we can use
      filterString = JSON.parse(filterString).join(' ');
    }

    filterString = filterString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

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

jasmineRequire.HtmlExactSpecFilter = function() {
  /**
   * Spec filter for use with {@link HtmlReporter}
   *
   * See lib/jasmine-core/boot1.js for usage.
   * @since 5.11.0
   */
  class HtmlExactSpecFilter {
    #getFilterString;

    /**
     * Create a filter instance.
     * @param options Object with a queryString property, which should be an
     * instance of {@link QueryString}.
     */
    constructor(options) {
      this.#getFilterString = function() {
        return options.queryString.getParam('spec');
      };
    }

    /**
     * Determines whether the specified spec should be executed.
     * @param {Spec} spec
     * @returns {boolean}
     */
    matches(spec) {
      const filterString = this.#getFilterString();

      if (!filterString) {
        return true;
      }

      const filterPath = JSON.parse(this.#getFilterString());
      const specPath = spec.getPath();

      if (filterPath.length > specPath.length) {
        return false;
      }

      for (let i = 0; i < filterPath.length; i++) {
        if (specPath[i] !== filterPath[i]) {
          return false;
        }
      }

      return true;
    }
  }

  return HtmlExactSpecFilter;
};
