jasmineRequire.HtmlSpecFilter = function() {
  // Legacy HTML spec filter, preserved for backward compatibility with
  // boot files that predate HtmlExactSpecFilterV2
  function HtmlSpecFilter(options) {
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
     */
    this.matches = function(specName) {
      return filterPattern.test(specName);
    };
  }

  return HtmlSpecFilter;
};
