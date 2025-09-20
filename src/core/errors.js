getJasmineRequireObj().errors = function(j$) {
  function ExpectationFailed() {}

  ExpectationFailed.prototype = new Error();
  ExpectationFailed.prototype.constructor = ExpectationFailed;

  j$.private.errors = {
    ExpectationFailed: ExpectationFailed
  };
};
