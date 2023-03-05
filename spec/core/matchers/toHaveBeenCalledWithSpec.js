describe('toHaveBeenCalledWith', function() {
  it('passes when the actual was called with matching parameters', function() {
    const matchersUtil = {
        contains: jasmine.createSpy('delegated-contains').and.returnValue(true),
        pp: jasmineUnderTest.makePrettyPrinter()
      },
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(matchersUtil),
      calledSpy = new jasmineUnderTest.Spy('called-spy');

    calledSpy('a', 'b');
    const result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      "Expected spy called-spy not to have been called with:\n  [ 'a', 'b' ]\nbut it was."
    );
  });

  it('supports custom equality testers', function() {
    const customEqualityTesters = [
        function() {
          return true;
        }
      ],
      matchersUtil = new jasmineUnderTest.MatchersUtil({
        customTesters: customEqualityTesters
      }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(matchersUtil),
      calledSpy = new jasmineUnderTest.Spy('called-spy');

    calledSpy('a', 'b');
    const result = matcher.compare(calledSpy, 'a', 'b');
    expect(result.pass).toBe(true);
  });

  it('fails when the actual was not called', function() {
    const matchersUtil = {
        contains: jasmine
          .createSpy('delegated-contains')
          .and.returnValue(false),
        pp: jasmineUnderTest.makePrettyPrinter()
      },
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(matchersUtil),
      uncalledSpy = new jasmineUnderTest.Spy('uncalled spy');

    const result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      'Expected spy uncalled spy to have been called with:\n  [  ]\nbut it was never called.'
    );
  });

  it('fails when the actual was called with different parameters', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(matchersUtil),
      calledSpy = new jasmineUnderTest.Spy('called spy');

    calledSpy('a');
    calledSpy('c', 'd');
    calledSpy('a', 'b', 'c');
    const result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      'Expected spy called spy to have been called with:\n' +
        "  [ 'a', 'b' ]\n" +
        'but actual calls were:\n' +
        "  [ 'a' ],\n" +
        "  [ 'c', 'd' ],\n" +
        "  [ 'a', 'b', 'c' ].\n\n" +
        'Call 0:\n' +
        '  Expected $.length = 1 to equal 2.\n' +
        "  Expected $[1] = undefined to equal 'b'.\n" +
        'Call 1:\n' +
        "  Expected $[0] = 'c' to equal 'a'.\n" +
        "  Expected $[1] = 'd' to equal 'b'.\n" +
        'Call 2:\n' +
        '  Expected $.length = 3 to equal 2.\n' +
        "  Unexpected $[2] = 'c' in array."
    );
  });

  it('throws an exception when the actual is not a spy', function() {
    const matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      fn = function() {};

    expect(function() {
      matcher.compare(fn);
    }).toThrowError(/Expected a spy, but got Function./);
  });

  it('set that spy call interaction was checked', function() {
    const matchersUtil = {
        contains: jasmine.createSpy('interaction-check').and.returnValue(true),
        pp: jasmineUnderTest.makePrettyPrinter()
      },
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(matchersUtil),
      calledSpy = new jasmineUnderTest.Spy('called-spy');

    calledSpy('a', 'b');
    matcher.compare(calledSpy, 'a', 'b');
    expect(calledSpy.calls.getInteractionChecked()).toBeTrue();
  });
});
