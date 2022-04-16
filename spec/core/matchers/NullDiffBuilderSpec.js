describe('NullDiffBuilder', function() {
  it('responds to withPath() by calling the passed function', function() {
    const spy = jasmine.createSpy('callback');
    jasmineUnderTest.NullDiffBuilder().withPath('does not matter', spy);
    expect(spy).toHaveBeenCalled();
  });
});
