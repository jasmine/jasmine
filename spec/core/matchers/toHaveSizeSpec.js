describe('toHaveSize', function() {
  'use strict';

  it('passes for an array whose length matches', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare([1, 2], 2);

    expect(result.pass).toBe(true);
  });

  it('fails for an array whose length does not match', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare([1, 2, 3], 2);

    expect(result.pass).toBe(false);
  });

  it('passes for an object with the proper number of keys', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare({ a: 1, b: 2 }, 2);

    expect(result.pass).toBe(true);
  });

  it('fails for an object with a different number of keys', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare({ a: 1, b: 2 }, 1);

    expect(result.pass).toBe(false);
  });

  it('passes for an object with an explicit `length` property that matches', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare({ a: 1, b: 2, length: 5 }, 5);

    expect(result.pass).toBe(true);
  });

  it('fails for an object with an explicit `length` property that does not match', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare({ a: 1, b: 2, length: 5 }, 1);

    expect(result.pass).toBe(false);
  });

  it('passes for a string whose length matches', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare('ab', 2);

    expect(result.pass).toBe(true);
  });

  it('fails for a string whose length does not match', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare('abc', 2);

    expect(result.pass).toBe(false);
  });

  it('passes for a Map whose length matches', function() {
    var map = new Map();
    map.set('a', 1);
    map.set('b', 2);

    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare(map, 2);

    expect(result.pass).toBe(true);
  });

  it('fails for a Map whose length does not match', function() {
    var map = new Map();
    map.set('a', 1);
    map.set('b', 2);

    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare(map, 1);

    expect(result.pass).toBe(false);
  });

  it('passes for a Set whose length matches', function() {
    var set = new Set();
    set.add('a');
    set.add('b');

    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare(set, 2);

    expect(result.pass).toBe(true);
  });

  it('fails for a Set whose length does not match', function() {
    var set = new Set();
    set.add('a');
    set.add('b');

    var matcher = jasmineUnderTest.matchers.toHaveSize(),
      result = matcher.compare(set, 1);

    expect(result.pass).toBe(false);
  });

  it('throws an error for WeakSet', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize();

    expect(function() {
      matcher.compare(new WeakSet(), 2);
    }).toThrowError('Cannot get size of [object WeakSet].');
  });

  it('throws an error for WeakMap', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize();

    expect(function() {
      matcher.compare(new WeakMap(), 2);
    }).toThrowError(/Cannot get size of \[object (WeakMap|Object)\]\./);
  });

  it('throws an error for DataView', function() {
    var matcher = jasmineUnderTest.matchers.toHaveSize();

    expect(function() {
      matcher.compare(new DataView(new ArrayBuffer(128)), 2);
    }).toThrowError(/Cannot get size of \[object (DataView|Object)\]\./);
  });
});
