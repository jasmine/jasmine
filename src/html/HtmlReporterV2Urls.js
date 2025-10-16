jasmineRequire.HtmlReporterV2Urls = function(j$) {
  'use strict';

  // TODO unify with V2 UrlBuilder?
  /**
   * @class HtmlReporterV2Urls
   * @classdesc Processes URLs for {@link HtmlReporterV2}.
   * @since 6.0.0
   */
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

    /**
     * Creates a {@link Configuration} from the current page's URL.
     * @returns {Configuration}
     * @example
     * const urls = new jasmine.HtmlReporterV2Urls();
     * env.configure(urls.configFromCurrentUrl());
     */
    configFromCurrentUrl() {
      const config = {
        stopOnSpecFailure: this.queryString.getParam('stopOnSpecFailure'),
        stopSpecOnExpectationFailure: this.queryString.getParam(
          'stopSpecOnExpectationFailure'
        )
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
