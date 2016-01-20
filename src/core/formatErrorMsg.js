getJasmineRequireObj().formatErrorMsg = function() {

  function generateErrorMsg(domain, usage, reco) {

    var usageDefinition = usage ? 'Usage: ' + usage + '\n' : '';
    var recoDefinition =  reco ? 'Tips: ' + reco  + '\n' : '';

    return function errorMsg(msg) {
      return domain + ' : ' + msg + '\n' + usageDefinition + recoDefinition;
    };
  }

  return generateErrorMsg;
};