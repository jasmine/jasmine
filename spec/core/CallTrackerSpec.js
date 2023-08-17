'use strict';

describe('CallTracker', function() {
  it('tracks that it was called when executed', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    expect(callTracker.any()).toBe(false);

    callTracker.track();

    expect(callTracker.any()).toBe(true);
  });

  it('tracks that number of times that it is executed', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    expect(callTracker.count()).toEqual(0);

    callTracker.track();

    expect(callTracker.count()).toEqual(1);
  });

  it('tracks the params from each execution', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    callTracker.track({ object: void 0, args: [] });
    callTracker.track({ object: {}, args: [0, 'foo'] });

    expect(callTracker.argsFor(0)).toEqual([]);

    expect(callTracker.argsFor(1)).toEqual([0, 'foo']);
  });

  it("tracks the 'this' object from each execution", function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    const this0 = {},
      this1 = {};
    callTracker.track({ object: this0, args: [] });
    callTracker.track({ object: this1, args: [] });
    callTracker.track({ args: [] });

    expect(callTracker.thisFor(0)).toBe(this0);
    expect(callTracker.thisFor(1)).toBe(this1);
    expect(callTracker.thisFor(2)).toBe(undefined);
  });

  it('returns any empty array when there was no call', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    expect(callTracker.argsFor(0)).toEqual([]);
  });

  it('allows access for the arguments for all calls', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    callTracker.track({ object: {}, args: [] });
    callTracker.track({ object: {}, args: [0, 'foo'] });

    expect(callTracker.allArgs()).toEqual([[], [0, 'foo']]);
  });

  it('tracks the context and arguments for each call', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    callTracker.track({ object: {}, args: [] });
    callTracker.track({ object: {}, args: [0, 'foo'] });

    expect(callTracker.all()[0]).toEqual({ object: {}, args: [] });

    expect(callTracker.all()[1]).toEqual({ object: {}, args: [0, 'foo'] });
  });

  it('simplifies access to the arguments for the last (most recent) call', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    callTracker.track();
    callTracker.track({ object: {}, args: [0, 'foo'] });

    expect(callTracker.mostRecent()).toEqual({
      object: {},
      args: [0, 'foo']
    });
  });

  it("returns a useful falsy value when there isn't a last (most recent) call", function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    expect(callTracker.mostRecent()).toBeFalsy();
  });

  it('simplifies access to the arguments for the first (oldest) call', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    callTracker.track({ object: {}, args: [0, 'foo'] });

    expect(callTracker.first()).toEqual({ object: {}, args: [0, 'foo'] });
  });

  it("returns a useful falsy value when there isn't a first (oldest) call", function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    expect(callTracker.first()).toBeFalsy();
  });

  it('allows the tracking to be reset', function() {
    const callTracker = new jasmineUnderTest.CallTracker();

    callTracker.track();
    callTracker.track({ object: {}, args: [0, 'foo'] });
    callTracker.reset();

    expect(callTracker.any()).toBe(false);
    expect(callTracker.count()).toEqual(0);
    expect(callTracker.argsFor(0)).toEqual([]);
    expect(callTracker.all()).toEqual([]);
    expect(callTracker.mostRecent()).toBeFalsy();
  });

  it('allows object arguments to be shallow cloned', function() {
    const callTracker = new jasmineUnderTest.CallTracker();
    callTracker.saveArgumentsByValue();

    const objectArg = { foo: 'bar' },
      arrayArg = ['foo', 'bar'];

    callTracker.track({
      object: {},
      args: [objectArg, arrayArg, false, undefined, null, NaN, '', 0, 1.0]
    });

    expect(callTracker.mostRecent().args[0]).not.toBe(objectArg);
    expect(callTracker.mostRecent().args[0]).toEqual(objectArg);
    expect(callTracker.mostRecent().args[1]).not.toBe(arrayArg);
    expect(callTracker.mostRecent().args[1]).toEqual(arrayArg);
  });

  it('saves primitive arguments by value', function() {
    const callTracker = new jasmineUnderTest.CallTracker(),
      args = [undefined, null, false, '', /\s/, 0, 1.2, NaN];

    callTracker.saveArgumentsByValue();
    callTracker.track({ object: {}, args: args });

    expect(callTracker.mostRecent().args).toEqual(args);
  });
});
