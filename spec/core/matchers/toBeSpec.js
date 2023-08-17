'use strict';

describe('toBe', function() {
  it('passes with no message when actual === expected', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.matchers.toBe(matchersUtil),
      result = matcher.compare(1, 1);
    expect(result.pass).toBe(true);
  });

  it('passes with a custom message when expected is an array', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.matchers.toBe(matchersUtil),
      array = [1];

    const result = matcher.compare(array, array);
    expect(result.pass).toBe(true);
    expect(result.message).toBe(
      'Expected [ 1 ] not to be [ 1 ]. Tip: To check for deep equality, use .toEqual() instead of .toBe().'
    );
  });

  it('passes with a custom message when expected is an object', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.matchers.toBe(matchersUtil),
      obj = { foo: 'bar' };

    const result = matcher.compare(obj, obj);
    expect(result.pass).toBe(true);
    expect(result.message).toBe(
      "Expected Object({ foo: 'bar' }) not to be Object({ foo: 'bar' }). Tip: To check for deep equality, use .toEqual() instead of .toBe()."
    );
  });

  it('fails with no message when actual !== expected', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.matchers.toBe(matchersUtil),
      result = matcher.compare(1, 2);
    expect(result.pass).toBe(false);
    expect(result.message).toBeUndefined();
  });

  it('fails with a custom message when expected is an array', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.matchers.toBe(matchersUtil),
      result = matcher.compare([1], [1]);

    expect(result.pass).toBe(false);
    expect(result.message).toBe(
      'Expected [ 1 ] to be [ 1 ]. Tip: To check for deep equality, use .toEqual() instead of .toBe().'
    );
  });

  it('fails with a custom message when expected is an object', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.matchers.toBe(matchersUtil),
      result = matcher.compare({ foo: 'bar' }, { foo: 'bar' });

    expect(result.pass).toBe(false);
    expect(result.message).toBe(
      "Expected Object({ foo: 'bar' }) to be Object({ foo: 'bar' }). Tip: To check for deep equality, use .toEqual() instead of .toBe()."
    );
  });

  it('works with custom object formatters when expected is an object', function() {
    const formatter = function(x) {
        return '<' + x.foo + '>';
      },
      prettyPrinter = jasmineUnderTest.makePrettyPrinter([formatter]),
      matchersUtil = new jasmineUnderTest.MatchersUtil({ pp: prettyPrinter }),
      matcher = jasmineUnderTest.matchers.toBe(matchersUtil),
      result = matcher.compare({ foo: 'bar' }, { foo: 'bar' });

    expect(result.pass).toBe(false);
    expect(result.message).toBe(
      'Expected <bar> to be <bar>. Tip: To check for deep equality, use .toEqual() instead of .toBe().'
    );
  });
});
