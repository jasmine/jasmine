describe('Exactly', function() {
  it('passes for primitives that are ===', function() {
    const exactly = new jasmineUnderTest.Exactly(17);
    expect(exactly.asymmetricMatch(17)).toBeTrue();
  });

  it('fails for primitives that are not ===', function() {
    const exactly = new jasmineUnderTest.Exactly(42);
    expect(exactly.asymmetricMatch('42')).toBeFalse();
  });

  it('passes for the same object instance', function() {
    const obj = {};
    const exactly = new jasmineUnderTest.Exactly(obj);
    expect(exactly.asymmetricMatch(obj)).toBeTrue();
  });

  it('fails for different object instances, even if they are deep value equal', function() {
    const exactly = new jasmineUnderTest.Exactly({});
    expect(exactly.asymmetricMatch({})).toBeFalse();
  });

  it('describes itself for use in diffs and pretty printing', function() {
    const exactly = new jasmineUnderTest.Exactly({ foo: ['bar'] });
    const pp = jasmineUnderTest.basicPrettyPrinter_;
    expect(exactly.jasmineToString(pp)).toEqual(
      "<jasmine.exactly(Object({ foo: [ 'bar' ] }))>"
    );
  });
});
