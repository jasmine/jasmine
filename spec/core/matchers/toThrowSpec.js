'use strict';

describe('toThrow', function() {
  it('throws an error when the actual is not a function', function() {
    const matcher = jasmineUnderTest.matchers.toThrow();

    expect(function() {
      matcher.compare({});
      matcherComparator({});
    }).toThrowError(/Actual is not a Function/);
  });

  it('fails if actual does not throw', function() {
    const matcher = jasmineUnderTest.matchers.toThrow(),
      fn = function() {
        return true;
      };

    const result = matcher.compare(fn);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual('Expected function to throw an exception.');
  });

  it('passes if it throws but there is no expected', function() {
    const matchersUtil = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true),
        pp: jasmineUnderTest.makePrettyPrinter()
      },
      matcher = jasmineUnderTest.matchers.toThrow(matchersUtil),
      fn = function() {
        throw 5;
      };

    const result = matcher.compare(fn);

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      'Expected function not to throw, but it threw 5.'
    );
  });

  it('passes even if what is thrown is falsy', function() {
    const matcher = jasmineUnderTest.matchers.toThrow({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      fn = function() {
        throw undefined;
      };

    const result = matcher.compare(fn);
    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      'Expected function not to throw, but it threw undefined.'
    );
  });

  it('passes if what is thrown is equivalent to what is expected', function() {
    const matchersUtil = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true),
        pp: jasmineUnderTest.makePrettyPrinter()
      },
      matcher = jasmineUnderTest.matchers.toThrow(matchersUtil),
      fn = function() {
        throw 5;
      };

    const result = matcher.compare(fn, 5);

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual('Expected function not to throw 5.');
  });

  it('fails if what is thrown is not equivalent to what is expected', function() {
    const matchersUtil = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(false),
        pp: jasmineUnderTest.makePrettyPrinter()
      },
      matcher = jasmineUnderTest.matchers.toThrow(matchersUtil),
      fn = function() {
        throw 5;
      };

    const result = matcher.compare(fn, 'foo');

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      "Expected function to throw 'foo', but it threw 5."
    );
  });

  it('fails if what is thrown is not equivalent to undefined', function() {
    const matchersUtil = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(false),
        pp: jasmineUnderTest.makePrettyPrinter()
      },
      matcher = jasmineUnderTest.matchers.toThrow(matchersUtil),
      fn = function() {
        throw 5;
      };

    const result = matcher.compare(fn, void 0);

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      'Expected function to throw undefined, but it threw 5.'
    );
  });
});
