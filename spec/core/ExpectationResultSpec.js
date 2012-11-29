describe("ExpectationResult", function() {

  it("defaults to passed", function() {
    var result = new jasmine.ExpectationResult({passed: 'some-value'});
    expect(result.passed()).toBe('some-value');
  });

  it("#toString returns message when failing", function() {
    var result = new jasmine.ExpectationResult({passed: false, message: 'some-value'});
    expect(result.toString()).toBe('some-value');
  });

  it("#toString returns Passed when passing", function() {
    var result = new jasmine.ExpectationResult({passed: true, message: 'some-value'});
    expect(result.toString()).toBe('Passed.');
  });

  it("has a type of expect", function() {
    var result = new jasmine.ExpectationResult({});
    expect(result.type).toBe('expect');
  });

  it("message defaults to Passed for passing specs", function() {
    var result = new jasmine.ExpectationResult({passed: true, message: 'some-value'});
    expect(result.message).toBe('Passed.');
  });

  it("message returns the message for failing specs", function() {
    var result = new jasmine.ExpectationResult({passed: false, message: 'some-value'});
    expect(result.message).toBe('some-value');
  });

  it("trace passes trace if exists", function() {
    var result = new jasmine.ExpectationResult({trace: 'some-value'});
    expect(result.trace).toBe('some-value');
  });

  it("trace returns a new error if trace is falsy", function() {
    var result = new jasmine.ExpectationResult({trace: false});
    expect(result.trace).toEqual(jasmine.any(Error));
  });

  it("matcherName returns passed matcherName", function() {
    var result = new jasmine.ExpectationResult({matcherName: 'some-value'});
    expect(result.matcherName).toBe('some-value');
  });

  it("expected returns passed expected", function() {
    var result = new jasmine.ExpectationResult({expected: 'some-value'});
    expect(result.expected).toBe('some-value');
  });

  it("actual returns passed actual", function() {
    var result = new jasmine.ExpectationResult({actual: 'some-value'});
    expect(result.actual).toBe('some-value');
  });

});
