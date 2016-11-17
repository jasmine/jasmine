describe('NullDiffBuilder', function() {
  it('responds to withPath() by calling the passed function', function() {
    var spy = jasmine.createSpy('callback');
    jasmineUnderTest.NullDiffBuilder().withPath('does not matter', spy);
    expect(spy).toHaveBeenCalled();
  });

  it('responds to record()', function() {
    expect(function() {
      jasmineUnderTest.NullDiffBuilder().record('does not matter');
    }).not.toThrow();
  })
});
