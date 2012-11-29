//TODO: expectation result may make more sense as a presentation of an expectation.
jasmine.ExpectationResult = function(params) {
  var self = this;
  var trace = (params.trace || new Error(this.message));
  var message = params.passed ? 'Passed.' : params.message;
  return jasmine.util.extend(self, {
    type: 'expect',
    matcherName: params.matcherName,
    expected: params.expected,
    actual:  params.actual,
    message: message,
    trace: params.passed ? '' : trace,
    toString: function() {
      return message;
    },
    passed: function() {
      return params.passed;
    }
  });
};
