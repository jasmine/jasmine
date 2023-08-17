'use strict';

describe('Any', function() {
  it('matches a string', function() {
    const any = new jasmineUnderTest.Any(String);

    expect(any.asymmetricMatch('foo')).toBe(true);
  });

  it('matches a number', function() {
    const any = new jasmineUnderTest.Any(Number);

    expect(any.asymmetricMatch(1)).toBe(true);
  });

  it('matches a function', function() {
    const any = new jasmineUnderTest.Any(Function);

    expect(any.asymmetricMatch(function() {})).toBe(true);
  });

  it('matches an Object', function() {
    const any = new jasmineUnderTest.Any(Object);

    expect(any.asymmetricMatch({})).toBe(true);
  });

  it('matches a Boolean', function() {
    const any = new jasmineUnderTest.Any(Boolean);

    expect(any.asymmetricMatch(true)).toBe(true);
  });

  it('matches a Map', function() {
    const any = new jasmineUnderTest.Any(Map);

    expect(any.asymmetricMatch(new Map())).toBe(true);
  });

  it('matches a Set', function() {
    const any = new jasmineUnderTest.Any(Set);

    expect(any.asymmetricMatch(new Set())).toBe(true);
  });

  it('matches a TypedArray', function() {
    const any = new jasmineUnderTest.Any(Uint32Array);

    expect(any.asymmetricMatch(new Uint32Array([]))).toBe(true);
  });

  it('matches a Symbol', function() {
    const any = new jasmineUnderTest.Any(Symbol);

    expect(any.asymmetricMatch(Symbol())).toBe(true);
  });

  it('matches another constructed object', function() {
    const Thing = function() {},
      any = new jasmineUnderTest.Any(Thing);

    expect(any.asymmetricMatch(new Thing())).toBe(true);
  });

  it('does not treat null as an Object', function() {
    const any = new jasmineUnderTest.Any(Object);

    expect(any.asymmetricMatch(null)).toBe(false);
  });

  it("jasmineToString's itself", function() {
    const any = new jasmineUnderTest.Any(Number);

    expect(any.jasmineToString()).toEqual('<jasmine.any(Number)>');
    expect(any.jasmineToString()).toEqual('<jasmine.any(Number)>');
  });

  describe('when called without an argument', function() {
    it('tells the user to pass a constructor or use jasmine.anything()', function() {
      expect(function() {
        new jasmineUnderTest.Any();
      }).toThrowError(TypeError, /constructor.*anything/);
    });
  });
});
