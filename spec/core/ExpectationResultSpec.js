describe("buildExpectationResult", function() {
  it("defaults to passed", function() {
    var result = j$.buildExpectationResult({passed: 'some-value'});
    expect(result.passed).toBe('some-value');
  });

  it("message defaults to Passed for passing specs", function() {
    var result = j$.buildExpectationResult({passed: true, message: 'some-value'});
    expect(result.message).toBe('Passed.');
  });

  it("message returns the message for failing expecations", function() {
    var result = j$.buildExpectationResult({passed: false, message: 'some-value'});
    expect(result.message).toBe('some-value');
  });

  it("delegates message formatting to the provided formatter if there was an Error", function() {
    var fakeError = {message: 'foo'},
      messageFormatter = jasmine.createSpy("exception message formatter").and.returnValue(fakeError.message);

    var result = j$.buildExpectationResult(
      {
        passed: false,
        error: fakeError,
        messageFormatter: messageFormatter
      });

    expect(messageFormatter).toHaveBeenCalledWith(fakeError);
    expect(result.message).toEqual('foo');
  });

  it("delegates stack formatting to the provided formatter if there was an Error", function() {
    var fakeError = {stack: 'foo'},
      stackFormatter = jasmine.createSpy("stack formatter").and.returnValue(fakeError.stack);

    var result = j$.buildExpectationResult(
      {
        passed: false,
        error: fakeError,
        stackFormatter: stackFormatter
      });

    expect(stackFormatter).toHaveBeenCalledWith(fakeError);
    expect(result.stack).toEqual('foo');
  });

  it("matcherName returns passed matcherName", function() {
    var result = j$.buildExpectationResult({matcherName: 'some-value'});
    expect(result.matcherName).toBe('some-value');
  });

  it("expected returns passed expected", function() {
    var result = j$.buildExpectationResult({expected: 'some-value'});
    expect(result.expected).toBe('some-value');
  });

  it("actual returns passed actual", function() {
    var result = j$.buildExpectationResult({actual: 'some-value'});
    expect(result.actual).toBe('some-value');
  });
});
