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
