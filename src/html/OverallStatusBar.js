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

      this.rootEl.textContent = statusBarMessage;

      const order = doneResult.order;
      if (order && order.random) {
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
    }
  }

  function pluralize(singular, count) {
    const word = count === 1 ? singular : singular + 's';
    return '' + count + ' ' + word;
  }

  return OverallStatusBar;
};
