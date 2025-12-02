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
