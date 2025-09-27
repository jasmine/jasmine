describe('toHaveBeenCalled', function() {
  it('passes when the actual was called, with a custom .not fail message', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalled(),
      calledSpy = new privateUnderTest.Spy('called-spy');

    calledSpy();

    const result = matcher.compare(calledSpy);
    expect(result.pass).toBe(true);
    expect(result.message).toEqual(
      'Expected spy called-spy not to have been called.'
    );
  });

  it('fails when the actual was not called', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalled(),
      uncalledSpy = new privateUnderTest.Spy('uncalled spy');

    const result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
  });

  it('throws an exception when the actual is not a spy', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalled({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {};

    expect(function() {
      matcher.compare(fn);
    }).toThrowError(Error, /Expected a spy, but got Function./);
  });

  it('throws an exception when invoked with any arguments', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalled(),
      spy = new privateUnderTest.Spy('sample spy');

    expect(function() {
      matcher.compare(spy, 'foo');
    }).toThrowError(Error, /Does not take arguments, use toHaveBeenCalledWith/);
  });

  it('has a custom message on failure', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalled(),
      spy = new privateUnderTest.Spy('sample-spy');

    const result = matcher.compare(spy);

    expect(result.message).toEqual(
      'Expected spy sample-spy to have been called.'
    );
  });

  it('set the correct calls as verified when passing', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalled(),
      spy = new privateUnderTest.Spy('sample-spy');

    spy();

    matcher.compare(spy);

    expect(spy.calls.count()).toBe(1);
    expect(spy.calls.unverifiedCount()).toBe(0);
  });
});
