jasmineRequire.QueryString = function() {
  'use strict';

  function QueryString(options) {
    this.navigateWithNewParam = function(key, value) {
      options.getWindowLocation().search = this.fullStringWithNewParam(
        key,
        value
      );
    };

    this.fullStringWithNewParam = function(key, value) {
      const paramMap = queryStringToParamMap();
      paramMap[key] = value;
      return toQueryString(paramMap);
    };

    this.getParam = function(key) {
      return queryStringToParamMap()[key];
    };

    return this;

    function toQueryString(paramMap) {
      const qStrPairs = [];
      for (const prop in paramMap) {
        qStrPairs.push(
          encodeURIComponent(prop) + '=' + encodeURIComponent(paramMap[prop])
        );
      }
      return '?' + qStrPairs.join('&');
    }

    function queryStringToParamMap() {
      const paramStr = options.getWindowLocation().search.substring(1);
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

  return QueryString;
};
