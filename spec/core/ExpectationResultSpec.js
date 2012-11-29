describe("buildExpectationResult", function() {

  it("defaults to passed", function() {
    var result = jasmine.buildExpectationResult({passed: 'some-value'});
    expect(result.passed).toBe('some-value');
  });

  it("has a type of expect", function() {
    var result = jasmine.buildExpectationResult({});
    expect(result.type).toBe('expect');
  });

  it("message defaults to Passed for passing specs", function() {
    var result = jasmine.buildExpectationResult({passed: true, message: 'some-value'});
    expect(result.message).toBe('Passed.');
  });

  it("message returns the message for failing specs", function() {
    var result = jasmine.buildExpectationResult({passed: false, message: 'some-value'});
    expect(result.message).toBe('some-value');
  });

  it("trace passes trace if exists", function() {
    var result = jasmine.buildExpectationResult({trace: 'some-value'});
    expect(result.trace).toBe('some-value');
  });

  it("trace returns a new error if trace is falsy", function() {
    var result = jasmine.buildExpectationResult({trace: false});
    expect(result.trace).toEqual(jasmine.any(Error));
  });

  it("matcherName returns passed matcherName", function() {
    var result = jasmine.buildExpectationResult({matcherName: 'some-value'});
    expect(result.matcherName).toBe('some-value');
  });

  it("expected returns passed expected", function() {
    var result = jasmine.buildExpectationResult({expected: 'some-value'});
    expect(result.expected).toBe('some-value');
  });

  it("actual returns passed actual", function() {
    var result = jasmine.buildExpectationResult({actual: 'some-value'});
    expect(result.actual).toBe('some-value');
  });

});
