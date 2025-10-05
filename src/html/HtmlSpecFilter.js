jasmineRequire.HtmlSpecFilter = function() {
  'use strict';

  /**
   * @name HtmlSpecFilter
   * @classdesc Legacy HTML spec filter, for backward compatibility
   * with boot files that predate {@link HtmlExactSpecFilter}.
   * @param options Object with a filterString method
   * @constructor
   * @deprecated
   * @since 1.2.0
   */
  // Legacy HTML spec filter, preserved for backward compatibility with
  // boot files that predate HtmlExactSpecFilterV2
  function HtmlSpecFilter(options) {
    let filterString = (options && options.filterString()) || '';

    if (filterString.startsWith('[')) {
      // Convert an HtmlExactSpecFilterV2 string into something we can use
      filterString = JSON.parse(filterString).join(' ');
    }

    filterString = filterString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

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
