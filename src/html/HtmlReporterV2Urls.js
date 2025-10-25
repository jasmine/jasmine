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
     * Creates a {@link Configuration} from the current page's URL. Supported
     * query string parameters include all those set by {@link HtmlReporterV2}
     * as well as spec=partialPath, which filters out specs whose paths don't
     * contain partialPath.
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
        filterParams: () => ({
          path: this.queryString.getParam('path'),
          spec: this.queryString.getParam('spec')
        })
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
