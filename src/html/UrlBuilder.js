jasmineRequire.UrlBuilder = function() {
  'use strict';

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

  return UrlBuilder;
};
