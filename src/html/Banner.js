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
        // TODO: backfill tests for this!
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
