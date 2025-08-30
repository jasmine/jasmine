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

  describe('When the error property is provided', function() {
    it('sets the message to the formatted error', function() {
      const result = jasmineUnderTest.buildExpectationResult({
        passed: false,
        error: { message: 'foo', fileName: 'somefile.js' }
      });

      expect(result.message).toEqual('foo in somefile.js');
    });

    it('delegates stack formatting to the provided formatter', function() {
      const result = jasmineUnderTest.buildExpectationResult({
        passed: false,
        error: { stack: 'foo', extra: 'wombat' }
      });

      expect(result.stack).toEqual(
        "error properties: Object({ extra: 'wombat' })\nfoo"
      );
    });
  });

  describe('When the errorForStack property is provided', function() {
    it('builds the stack trace using errorForStack instead of Error', function() {
      const result = jasmineUnderTest.buildExpectationResult({
        passed: false,
        errorForStack: { stack: 'foo' },
        error: { stack: 'bar' }
      });

      expect(result.stack).toEqual('bar');
    });
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
      pending('This test only runs in Node');
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
