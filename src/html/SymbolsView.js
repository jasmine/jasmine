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
