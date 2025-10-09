jasmineRequire.HtmlSpecFilter = function(j$) {
  'use strict';

  function HtmlSpecFilter(options) {
    j$.getEnv().deprecated(
      'HtmlReporter and HtmlSpecFilter are deprecated. Use HtmlReporterV2 instead.'
    );

    const filterString =
      options &&
      options.filterString() &&
      options.filterString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const filterPattern = new RegExp(filterString);

    /**
     * Determines whether the spec with the specified name should be executed.
     * @name HtmlSpecFilter#matches
     * @function
     * @param {string} specName The full name of the spec
     * @returns {boolean}
     * @deprcated
     */
    this.matches = function(specName) {
      return filterPattern.test(specName);
    };
  }

  return HtmlSpecFilter;
};
