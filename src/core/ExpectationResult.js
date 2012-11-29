//TODO: expectation result may make more sense as a presentation of an expectation.
jasmine.buildExpectationResult = function(params) {
  return {
    type: 'expect',
    matcherName: params.matcherName,
    expected: params.expected,
    actual:  params.actual,
    message: params.passed ? 'Passed.' : params.message,
    trace: params.passed ? '' : (params.trace || new Error(this.message)),
    passed: params.passed
  };
};
