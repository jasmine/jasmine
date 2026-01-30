jasmineRequire.HtmlSpecFilterV2 = function() {
  class HtmlSpecFilterV2 {
    #getFilterParams;

    constructor(options) {
      this.#getFilterParams = options.filterParams;
    }

    matches(spec) {
      const params = this.#getFilterParams();

      if (params.path) {
        try {
          return this.#matchesPath(spec, JSON.parse(params.path));
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          return true;
        }
      } else if (params.spec) {
        // Like legacy HtmlSpecFilter, retained because it's convenient for
        // hand-constructing filter URLs
        return spec.getFullName().includes(params.spec);
      }

      return true;
    }

    #matchesPath(spec, path) {
      const specPath = spec.getPath();

      if (path.length > specPath.length) {
        return false;
      }

      for (let i = 0; i < path.length; i++) {
        if (specPath[i] !== path[i]) {
          return false;
        }
      }

      return true;
    }
  }

  return HtmlSpecFilterV2;
};
