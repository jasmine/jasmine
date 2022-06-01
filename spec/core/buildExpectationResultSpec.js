describe('buildExpectationResult', function() {
  it('defaults to passed', function() {
    const result = jasmineUnderTest.buildExpectationResult({
      passed: 'some-value'
    });
    expect(result.passed).toBe('some-value');
  });

  it('message defaults to Passed for passing specs', function() {
    const result = jasmineUnderTest.buildExpectationResult({
      passed: true,
      message: 'some-value'
    });
    expect(result.message).toBe('Passed.');
  });

  it('message returns the message for failing expectations', function() {
    const result = jasmineUnderTest.buildExpectationResult({
      passed: false,
      message: 'some-value'
    });
    expect(result.message).toBe('some-value');
  });

  it('delegates message formatting to the provided formatter if there was an Error', function() {
    const fakeError = { message: 'foo' },
      messageFormatter = jasmine
        .createSpy('exception message formatter')
        .and.returnValue(fakeError.message);

    const result = jasmineUnderTest.buildExpectationResult({
      passed: false,
      error: fakeError,
      messageFormatter: messageFormatter
    });

    expect(messageFormatter).toHaveBeenCalledWith(fakeError);
    expect(result.message).toEqual('foo');
  });

  it('delegates stack formatting to the provided formatter if there was an Error', function() {
    const fakeError = { stack: 'foo' },
      stackFormatter = jasmine
        .createSpy('stack formatter')
        .and.returnValue(fakeError.stack);

    const result = jasmineUnderTest.buildExpectationResult({
      passed: false,
      error: fakeError,
      stackFormatter: stackFormatter
    });

    expect(stackFormatter).toHaveBeenCalledWith(fakeError, {
      omitMessage: true
    });
    expect(result.stack).toEqual('foo');
  });

  it('delegates stack formatting to the provided formatter if there was a provided errorForStack', function() {
    const fakeError = { stack: 'foo' },
      stackFormatter = jasmine
        .createSpy('stack formatter')
        .and.returnValue(fakeError.stack);

    const result = jasmineUnderTest.buildExpectationResult({
      passed: false,
      errorForStack: fakeError,
      stackFormatter: stackFormatter
    });

    expect(stackFormatter).toHaveBeenCalledWith(fakeError, {
      omitMessage: true
    });
    expect(result.stack).toEqual('foo');
  });

  it('matcherName returns passed matcherName', function() {
    const result = jasmineUnderTest.buildExpectationResult({
      matcherName: 'some-value'
    });
    expect(result.matcherName).toBe('some-value');
  });

  it('expected returns passed expected', function() {
    const result = jasmineUnderTest.buildExpectationResult({
      expected: 'some-value'
    });
    expect(result.expected).toBe('some-value');
  });

  it('actual returns passed actual', function() {
    const result = jasmineUnderTest.buildExpectationResult({
      actual: 'some-value'
    });
    expect(result.actual).toBe('some-value');
  });

  it('handles nodejs assertions', function() {
    if (typeof require === 'undefined') {
      return;
    }
    const assert = require('assert');
    const value = 8421;
    const expectedValue = 'JasmineExpectationTestValue';
    let error;
    try {
      assert.equal(value, expectedValue);
    } catch (e) {
      error = e;
    }

    expect(error.code).toEqual('ERR_ASSERTION');
    expect(error.actual).toEqual(value);
    expect(error.expected).toEqual(expectedValue);
    expect(error.operator).toEqual('==');

    const result = jasmineUnderTest.buildExpectationResult({
      passed: false,
      matcherName: '',
      expected: '',
      actual: '',
      error: error
    });

    expect(result.code).toEqual('ERR_ASSERTION');
    expect(result.actual).toEqual(value);
    expect(result.expected).toEqual(expectedValue);
    expect(result.matcherName).toEqual('assert ==');
  });
});
