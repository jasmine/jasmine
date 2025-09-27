describe('Is', function() {
  it('passes for primitives that are ===', function() {
    const exactly = new privateUnderTest.Is(17);
    expect(exactly.asymmetricMatch(17)).toBeTrue();
  });

  it('fails for primitives that are not ===', function() {
    const exactly = new privateUnderTest.Is(42);
    expect(exactly.asymmetricMatch('42')).toBeFalse();
  });

  it('passes for the same object instance', function() {
    const obj = {};
    const exactly = new privateUnderTest.Is(obj);
    expect(exactly.asymmetricMatch(obj)).toBeTrue();
  });

  it('fails for different object instances, even if they are deep value equal', function() {
    const exactly = new privateUnderTest.Is({});
    expect(exactly.asymmetricMatch({})).toBeFalse();
  });

  it('describes itself for use in diffs and pretty printing', function() {
    const exactly = new privateUnderTest.Is({ foo: ['bar'] });
    const pp = privateUnderTest.basicPrettyPrinter;
    expect(exactly.jasmineToString(pp)).toEqual(
      "<jasmine.is(Object({ foo: [ 'bar' ] }))>"
    );
  });
});
