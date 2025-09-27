describe('toHaveBeenCalledTimes', function() {
  it('passes when the actual 0 matches the expected 0 ', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes(),
      calledSpy = new privateUnderTest.Spy('called-spy'),
      result = matcher.compare(calledSpy, 0);
    expect(result.pass).toBeTruthy();
  });
  it('passes when the actual matches the expected', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes(),
      calledSpy = new privateUnderTest.Spy('called-spy');
    calledSpy();

    const result = matcher.compare(calledSpy, 1);
    expect(result.pass).toBe(true);
  });

  it('fails when expected numbers is not supplied', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes(),
      spy = new privateUnderTest.Spy('spy');

    spy();
    expect(function() {
      matcher.compare(spy);
    }).toThrowError(
      /The expected times failed is a required argument and must be a number./
    );
  });

  it('fails when the actual was called less than the expected', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes(),
      uncalledSpy = new privateUnderTest.Spy('uncalled spy');

    const result = matcher.compare(uncalledSpy, 2);
    expect(result.pass).toBe(false);
  });

  it('fails when the actual was called more than expected', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes(),
      uncalledSpy = new privateUnderTest.Spy('uncalled spy');

    uncalledSpy();
    uncalledSpy();

    const result = matcher.compare(uncalledSpy, 1);
    expect(result.pass).toBe(false);
  });

  it('throws an exception when the actual is not a spy', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {};

    expect(function() {
      matcher.compare(fn);
    }).toThrowError(/Expected a spy, but got Function./);
  });

  it('has a custom message on failure that tells it was called only once', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes(),
      spy = new privateUnderTest.Spy('sample-spy');
    spy();
    spy();
    spy();
    spy();

    const result = matcher.compare(spy, 1);
    expect(result.message).toEqual(
      'Expected spy sample-spy to have been called once. It was called ' +
        4 +
        ' times.'
    );
  });

  it('has a custom message on failure that tells how many times it was called', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes(),
      spy = new privateUnderTest.Spy('sample-spy');
    spy();
    spy();
    spy();
    spy();

    const result = matcher.compare(spy, 2);
    expect(result.message).toEqual(
      'Expected spy sample-spy to have been called 2 times. It was called ' +
        4 +
        ' times.'
    );
  });

  it('set the correct calls as verified when passing', function() {
    const matcher = privateUnderTest.matchers.toHaveBeenCalledTimes(),
      spy = new privateUnderTest.Spy('sample-spy');

    spy();
    spy();

    matcher.compare(spy, 2);

    expect(spy.calls.count()).toBe(2);
    expect(spy.calls.unverifiedCount()).toBe(0);
  });
});
