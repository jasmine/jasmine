jasmineRequire.HtmlReporter = function(j$) {

  var noopTimer = {
    start: function() {},
    elapsed: function() { return 0; }
  };

  function HtmlReporter(options) {
    var env = options.env || {},
      getContainer = options.getContainer,
      createElement = options.createElement,
      createTextNode = options.createTextNode,
      onRaiseExceptionsClick = options.onRaiseExceptionsClick || function() {},
      onThrowExpectationsClick = options.onThrowExpectationsClick || function() {},
      addToExistingQueryString = options.addToExistingQueryString || defaultQueryString,
      timer = options.timer || noopTimer,
      results = [],
      specsExecuted = 0,
      failureCount = 0,
      pendingSpecCount = 0,
      htmlReporterMain,
      symbols,
      failedSuites = [];

    this.initialize = function() {
      clearPrior();
      htmlReporterMain = createDom('div', {className: 'jasmine_html-reporter'},
        createDom('div', {className: 'banner_jasmine-css'},
          createDom('a', {className: 'title_jasmine-css', href: 'http://jasmine.github.io/', target: '_blank'}),
          createDom('span', {className: 'version_jasmine-css'}, j$.version)
        ),
        createDom('ul', {className: 'symbol-summary_jasmine-css'}),
        createDom('div', {className: 'alert_jasmine-css'}),
        createDom('div', {className: 'results_jasmine-css'},
          createDom('div', {className: 'failures_jasmine-css'})
        )
      );
      getContainer().appendChild(htmlReporterMain);

      symbols = find('.symbol-summary_jasmine-css');
    };

    var totalSpecsDefined;
    this.jasmineStarted = function(options) {
      totalSpecsDefined = options.totalSpecsDefined || 0;
      timer.start();
    };

    var summary = createDom('div', {className: 'summary_jasmine-css'});

    var topResults = new j$.ResultsNode({}, '', null),
      currentParent = topResults;

    this.suiteStarted = function(result) {
      currentParent.addChild(result, 'suite');
      currentParent = currentParent.last();
    };

    this.suiteDone = function(result) {
      if (result.status == 'failed') {
        failedSuites.push(result);
      }

      if (currentParent == topResults) {
        return;
      }

      currentParent = currentParent.parent;
    };

    this.specStarted = function(result) {
      currentParent.addChild(result, 'spec');
    };

    var failures = [];
    this.specDone = function(result) {
      if(noExpectations(result) && typeof console !== 'undefined' && typeof console.error !== 'undefined') {
        console.error('Spec \'' + result.fullName + '\' has no expectations.');
      }

      if (result.status != 'disabled') {
        specsExecuted++;
      }

      symbols.appendChild(createDom('li', {
          className: noExpectations(result) ? 'empty_jasmine-css' : result.status + '_jasmine-css',
          id: 'spec_' + result.id,
          title: result.fullName
        }
      ));

      if (result.status == 'failed') {
        failureCount++;

        var failure =
          createDom('div', {className: 'spec-detail_jasmine-css failed_jasmine-css'},
            createDom('div', {className: 'description_jasmine-css'},
              createDom('a', {title: result.fullName, href: specHref(result)}, result.fullName)
            ),
            createDom('div', {className: 'messages_jasmine-css'})
          );
        var messages = failure.childNodes[1];

        for (var i = 0; i < result.failedExpectations.length; i++) {
          var expectation = result.failedExpectations[i];
          messages.appendChild(createDom('div', {className: 'result-message_jasmine-css'}, expectation.message));
          messages.appendChild(createDom('div', {className: 'stack-trace_jasmine-css'}, expectation.stack));
        }

        failures.push(failure);
      }

      if (result.status == 'pending') {
        pendingSpecCount++;
      }
    };

    this.jasmineDone = function() {
      var banner = find('.banner_jasmine-css');
      var alert = find('.alert_jasmine-css');
      alert.appendChild(createDom('span', {className: 'duration_jasmine-css'}, 'finished in ' + timer.elapsed() / 1000 + 's'));

      banner.appendChild(
        createDom('div', { className: 'run-options_jasmine-css' },
          createDom('span', { className: 'trigger_jasmine-css' }, 'Options'),
          createDom('div', { className: 'payload_jasmine-css' },
            createDom('div', { className: 'exceptions_jasmine-css' },
              createDom('input', {
                className: 'raise_jasmine-css',
                id: 'raise-exceptions_jasmine-css',
                type: 'checkbox'
              }),
              createDom('label', { className: 'label_jasmine-css', 'for': 'raise-exceptions_jasmine-css' }, 'raise exceptions')),
            createDom('div', { className: 'throw-failures_jasmine-css' },
              createDom('input', {
                className: 'throw_jasmine-css',
                id: 'throw-failures_jasmine-css',
                type: 'checkbox'
              }),
              createDom('label', { className: 'label_jasmine-css', 'for': 'throw-failures_jasmine-css' }, 'stop spec on expectation failure'))
          )
        ));

      var raiseCheckbox = find('#raise-exceptions_jasmine-css');

      raiseCheckbox.checked = !env.catchingExceptions();
      raiseCheckbox.onclick = onRaiseExceptionsClick;

      var throwCheckbox = find('#throw-failures_jasmine-css');
      throwCheckbox.checked = env.throwingExpectationFailures();
      throwCheckbox.onclick = onThrowExpectationsClick;

      var optionsMenu = find('.run-options_jasmine-css'),
          optionsTrigger = optionsMenu.querySelector('.trigger_jasmine-css'),
          optionsPayload = optionsMenu.querySelector('.payload_jasmine-css'),
          isOpen = /\bopen_jasmine-css\b/;

      optionsTrigger.onclick = function() {
        if (isOpen.test(optionsPayload.className)) {
          optionsPayload.className = optionsPayload.className.replace(isOpen, '');
        } else {
          optionsPayload.className += ' open_jasmine-css';
        }
      };

      if (specsExecuted < totalSpecsDefined) {
        var skippedMessage = 'Ran ' + specsExecuted + ' of ' + totalSpecsDefined + ' specs - run all';
        alert.appendChild(
          createDom('span', {className: 'bar_jasmine-css skipped_jasmine-css'},
            createDom('a', {href: '?', title: 'Run all specs'}, skippedMessage)
          )
        );
      }
      var statusBarMessage = '';
      var statusBarClassName = 'bar_jasmine-css ';

      if (totalSpecsDefined > 0) {
        statusBarMessage += pluralize('spec', specsExecuted) + ', ' + pluralize('failure', failureCount);
        if (pendingSpecCount) { statusBarMessage += ', ' + pluralize('pending spec', pendingSpecCount); }
        statusBarClassName += (failureCount > 0) ? 'failed_jasmine-css' : 'passed_jasmine-css';
      } else {
        statusBarClassName += 'skipped_jasmine-css';
        statusBarMessage += 'No specs found';
      }

      alert.appendChild(createDom('span', {className: statusBarClassName}, statusBarMessage));

      for(i = 0; i < failedSuites.length; i++) {
        var failedSuite = failedSuites[i];
        for(var j = 0; j < failedSuite.failedExpectations.length; j++) {
          var errorBarMessage = 'AfterAll ' + failedSuite.failedExpectations[j].message;
          var errorBarClassName = 'bar_jasmine-css errored_jasmine-css';
          alert.appendChild(createDom('span', {className: errorBarClassName}, errorBarMessage));
        }
      }

      var results = find('.results_jasmine-css');
      results.appendChild(summary);

      summaryList(topResults, summary);

      function summaryList(resultsTree, domParent) {
        var specListNode;
        for (var i = 0; i < resultsTree.children.length; i++) {
          var resultNode = resultsTree.children[i];
          if (resultNode.type == 'suite') {
            var suiteListNode = createDom('ul', {className: 'suite_jasmine-css', id: 'suite-' + resultNode.result.id},
              createDom('li', {className: 'suite-detail_jasmine-css'},
                createDom('a', {href: specHref(resultNode.result)}, resultNode.result.description)
              )
            );

            summaryList(resultNode, suiteListNode);
            domParent.appendChild(suiteListNode);
          }
          if (resultNode.type == 'spec') {
            if (domParent.getAttribute('class') != 'specs_jasmine-css') {
              specListNode = createDom('ul', {className: 'specs_jasmine-css'});
              domParent.appendChild(specListNode);
            }
            var specDescription = resultNode.result.description;
            if(noExpectations(resultNode.result)) {
              specDescription = 'SPEC HAS NO EXPECTATIONS ' + specDescription;
            }
            if(resultNode.result.status === 'pending' && resultNode.result.pendingReason !== '') {
              specDescription = specDescription + ' PENDING WITH MESSAGE: ' + resultNode.result.pendingReason;
            }
            specListNode.appendChild(
              createDom('li', {
                  className: resultNode.result.status + '_jasmine-css',
                  id: 'spec-' + resultNode.result.id
                },
                createDom('a', {href: specHref(resultNode.result)}, specDescription)
              )
            );
          }
        }
      }

      if (failures.length) {
        alert.appendChild(
          createDom('span', {className: 'menu_jasmine-css bar_jasmine-css spec-list_jasmine-css'},
            createDom('span', {}, 'Spec List | '),
            createDom('a', {className: 'failures-menu_jasmine-css', href: '#'}, 'Failures')));
        alert.appendChild(
          createDom('span', {className: 'menu_jasmine-css bar_jasmine-css failure-list_jasmine-css'},
            createDom('a', {className: 'spec-list-menu_jasmine-css', href: '#'}, 'Spec List'),
            createDom('span', {}, ' | Failures ')));

        find('.failures-menu_jasmine-css').onclick = function() {
          setMenuModeTo('failure-list_jasmine-css');
        };
        find('.spec-list-menu_jasmine-css').onclick = function() {
          setMenuModeTo('spec-list_jasmine-css');
        };

        setMenuModeTo('failure-list_jasmine-css');

        var failureNode = find('.failures_jasmine-css');
        for (var i = 0; i < failures.length; i++) {
          failureNode.appendChild(failures[i]);
        }
      }
    };

    return this;

    function find(selector) {
      return getContainer().querySelector('.jasmine_html-reporter ' + selector);
    }

    function clearPrior() {
      // return the reporter
      var oldReporter = find('');

      if(oldReporter) {
        getContainer().removeChild(oldReporter);
      }
    }

    function createDom(type, attrs, childrenVarArgs) {
      var el = createElement(type);

      for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];

        if (typeof child === 'string') {
          el.appendChild(createTextNode(child));
        } else {
          if (child) {
            el.appendChild(child);
          }
        }
      }

      for (var attr in attrs) {
        if (attr == 'className') {
          el[attr] = attrs[attr];
        } else {
          el.setAttribute(attr, attrs[attr]);
        }
      }

      return el;
    }

    function pluralize(singular, count) {
      var word = (count == 1 ? singular : singular + 's');

      return '' + count + ' ' + word;
    }

    function specHref(result) {
      return addToExistingQueryString('spec', result.fullName);
    }

    function defaultQueryString(key, value) {
      return '?' + key + '=' + value;
    }

    function setMenuModeTo(mode) {
      htmlReporterMain.setAttribute('class', 'jasmine_html-reporter ' + mode);
    }

    function noExpectations(result) {
      return (result.failedExpectations.length + result.passedExpectations.length) === 0 &&
        result.status === 'passed';
    }
  }

  return HtmlReporter;
};
