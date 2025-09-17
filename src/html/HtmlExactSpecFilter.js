jasmineRequire.HtmlExactSpecFilter = function() {
  class HtmlExactSpecFilter {
    #getFilterString;

    constructor(options) {
      if (typeof options?.filterString !== 'function') {
        throw new Error('options.filterString must be a function');
      }

      this.#getFilterString = options.filterString;
    }

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
