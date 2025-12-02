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
