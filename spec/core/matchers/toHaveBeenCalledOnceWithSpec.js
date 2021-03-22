describe('toHaveBeenCalledOnceWith', function() {
  it('passes when the actual was called only once and with matching parameters', function() {
    var pp = jasmineUnderTest.makePrettyPrinter(),
      util = new jasmineUnderTest.MatchersUtil({ pp: pp }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(true);
    expect(result.message).toEqual(
      "Expected spy called-spy to have been called 0 times, multiple times, or once, but with arguments different from:\n  [ 'a', 'b' ]\nBut the actual call was:\n  [ 'a', 'b' ].\n\n"
    );
  });

  it('supports custom equality testers', function() {
    var customEqualityTesters = [
        function() {
          return true;
        }
      ],
      matchersUtil = new jasmineUnderTest.MatchersUtil({
        customTesters: customEqualityTesters
      }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(
        matchersUtil
      ),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'a');

    expect(result.pass).toBe(true);
  });

  it('fails when the actual was never called', function() {
    var pp = jasmineUnderTest.makePrettyPrinter(),
      util = new jasmineUnderTest.MatchersUtil({ pp: pp }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual(
      "Expected spy called-spy to have been called only once, and with given args:\n  [ 'a', 'b' ]\nBut it was never called.\n\n"
    );
  });

  it('fails when the actual was called once with different parameters', function() {
    var pp = jasmineUnderTest.makePrettyPrinter(),
      util = new jasmineUnderTest.MatchersUtil({ pp: pp }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'c');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual(
      "Expected spy called-spy to have been called only once, and with given args:\n  [ 'a', 'b' ]\nBut the actual call was:\n  [ 'a', 'c' ].\nExpected $[1] = 'c' to equal 'b'.\n\n"
    );
  });

  it('fails when the actual was called multiple times with expected parameters', function() {
    var pp = jasmineUnderTest.makePrettyPrinter(),
      util = new jasmineUnderTest.MatchersUtil({ pp: pp }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'b');
    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual(
      "Expected spy called-spy to have been called only once, and with given args:\n  [ 'a', 'b' ]\nBut the actual calls were:\n  [ 'a', 'b' ],\n  [ 'a', 'b' ].\n\n"
    );
  });

  it('fails when the actual was called multiple times (one of them - with expected parameters)', function() {
    var pp = jasmineUnderTest.makePrettyPrinter(),
      util = new jasmineUnderTest.MatchersUtil({ pp: pp }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'b');
    calledSpy('a', 'c');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual(
      "Expected spy called-spy to have been called only once, and with given args:\n  [ 'a', 'b' ]\nBut the actual calls were:\n  [ 'a', 'b' ],\n  [ 'a', 'c' ].\n\n"
    );
  });

  it('throws an exception when the actual is not a spy', function() {
    var pp = jasmineUnderTest.makePrettyPrinter(),
      util = new jasmineUnderTest.MatchersUtil({ pp: pp }),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      fn = function() {};

    expect(function() {
      matcher.compare(fn);
    }).toThrowError(/Expected a spy, but got Function./);
  });
});
