getJasmineRequireObj().formatErrorMsg = function(j$) {
  j$.private.formatErrorMsg = function(domain, usage) {
    const usageDefinition = usage ? '\nUsage: ' + usage : '';

    return function errorMsg(msg) {
      return domain + ' : ' + msg + usageDefinition;
    };
  };
};
