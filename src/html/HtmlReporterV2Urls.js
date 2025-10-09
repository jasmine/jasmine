jasmineRequire.HtmlReporterV2Urls = function(j$) {
  'use strict';

  // TODO unify with V2 UrlBuilder?
  // TODO jsdoc
  class HtmlReporterV2Urls {
    constructor(options = {}) {
      // queryString is injectable for use in our own tests, but user code will
      // not pass any options.
      this.queryString =
        options.queryString ||
        new jasmine.QueryString({
          getWindowLocation: function() {
            return window.location;
          }
        });
    }

    // TODO jsdoc. This is public.
    configFromCurrentUrl() {
      const config = {
        stopOnSpecFailure: this.queryString.getParam('stopOnSpecFailure'),
        stopSpecOnExpectationFailure: this.queryString.getParam(
          'stopSpecOnExpectationFailure'
        ),
        hideDisabled: this.queryString.getParam('hideDisabled')
      };

      const random = this.queryString.getParam('random');

      if (random !== undefined && random !== '') {
        config.random = random;
      }

      const seed = this.queryString.getParam('seed');
      if (seed) {
        config.seed = seed;
      }

      const specFilter = new j$.private.HtmlSpecFilterV2({
        filterString: () => {
          return this.queryString.getParam('path');
        }
      });

      config.specFilter = function(spec) {
        return specFilter.matches(spec);
      };

      return config;
    }

    filteringSpecs() {
      return !!this.queryString.getParam('path');
    }
  }

  return HtmlReporterV2Urls;
};
