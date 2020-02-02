describe('NullDiffBuilder', function () {
  it('responds to withPath() by calling the passed function', function () {
    var spy = jasmine.createSpy('callback');
    jasmineUnderTest.NullDiffBuilder().withPath('does not matter', spy);
    expect(spy).toHaveBeenCalled();
  });

});
