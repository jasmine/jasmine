jasmineRequire.QueryString = function() {
  /**
   * Reads and manipulates the query string.
   * @since 2.0.0
   */
  class QueryString {
    #getWindowLocation;

    /**
     * @param options Object with a getWindowLocation property, which should be
     * a function returning the current value of window.location.
     */
    constructor(options) {
      this.#getWindowLocation = options.getWindowLocation;
    }

    /**
     * Sets the specified query parameter and navigates to the resulting URL.
     * @param {string} key
     * @param {string} value
     */
    navigateWithNewParam(key, value) {
      this.#getWindowLocation().search = this.fullStringWithNewParam(
        key,
        value
      );
    }

    /**
     * Returns a new URL based on the current location, with the specified
     * query parameter set.
     * @param {string} key
     * @param {string} value
     * @return {string}
     */
    fullStringWithNewParam(key, value) {
      const paramMap = this.#queryStringToParamMap();
      paramMap[key] = value;
      return toQueryString(paramMap);
    }

    /**
     * Gets the value of the specified query parameter.
     * @param {string} key
     * @return {string}
     */
    getParam(key) {
      return this.#queryStringToParamMap()[key];
    }

    #queryStringToParamMap() {
      const paramStr = this.#getWindowLocation().search.substring(1);
      let params = [];
      const paramMap = {};

      if (paramStr.length > 0) {
        params = paramStr.split('&');
        for (let i = 0; i < params.length; i++) {
          const p = params[i].split('=');
          let value = decodeURIComponent(p[1]);
          if (value === 'true' || value === 'false') {
            value = JSON.parse(value);
          }
          paramMap[decodeURIComponent(p[0])] = value;
        }
      }

      return paramMap;
    }
  }

  function toQueryString(paramMap) {
    const qStrPairs = [];
    for (const prop in paramMap) {
      qStrPairs.push(
        encodeURIComponent(prop) + '=' + encodeURIComponent(paramMap[prop])
      );
    }
    return '?' + qStrPairs.join('&');
  }

  return QueryString;
};
