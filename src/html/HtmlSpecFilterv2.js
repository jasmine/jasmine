jasmineRequire.HtmlSpecFilterV2 = function() {
  class HtmlSpecFilterV2 {
    #getFilterString;

    constructor(options) {
      this.#getFilterString = options.filterString;
    }

    /**
     * Determines whether the spec with the specified name should be executed.
     * @name HtmlSpecFilterV2#matches
     * @function
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

  return HtmlSpecFilterV2;
};
