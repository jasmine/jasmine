jasmineRequire.HtmlExactSpecFilter = function() {
  /**
   * Spec filter for use with {@link HtmlReporter}
   *
   * See lib/jasmine-core/boot1.js for usage.
   * @since 5.11.0
   */
  class HtmlExactSpecFilter {
    #getFilterString;

    /**
     * Create a filter instance.
     * @param options Object with a filterString method, which should
     * return the value of the "spec" query string parameter set by
     * {@link HtmlReporter}.
     */
    constructor(options) {
      if (typeof options?.filterString !== 'function') {
        throw new Error('options.filterString must be a function');
      }

      this.#getFilterString = options.filterString;
    }

    /**
     * Determines whether the specified spec should be executed.
     * @param {Spec} spec
     * @returns {boolean}
     */
    matches(spec) {
      const filterString = this.#getFilterString();

      if (!filterString) {
        return true;
      }

      const filterPath = JSON.parse(this.#getFilterString());
      const specPath = spec.getPath();

      if (filterPath.length > specPath.length) {
        return false;
      }

      for (let i = 0; i < filterPath.length; i++) {
        if (specPath[i] !== filterPath[i]) {
          return false;
        }
      }

      return true;
    }
  }

  return HtmlExactSpecFilter;
};
