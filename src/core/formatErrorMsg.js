getJasmineRequireObj().formatErrorMsg = function() {
  'use strict';

  function generateErrorMsg(domain, usage) {
    const usageDefinition = usage ? '\nUsage: ' + usage : '';

    return function errorMsg(msg) {
      return domain + ' : ' + msg + usageDefinition;
    };
  }

  return generateErrorMsg;
};
