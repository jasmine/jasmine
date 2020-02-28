describe('toHaveSize', function() {
  'use strict';

  it('delegates to equals function', function() {
    var matchersUtil = {
        equals: jasmine.createSpy('delegated-equals').and.returnValue(true),
        buildFailureMessage: function() {
          return 'does not matter';
        },
        DiffBuilder: new jasmineUnderTest.DiffBuilder()
      },
      matcher = jasmineUnderTest.matchers.toHaveSize(matchersUtil),
      result;

    result = matcher.compare([1], 1);

    expect(matchersUtil.equals).toHaveBeenCalledWith(1, 1, jasmine.anything());
    expect(result.pass).toBe(true);
  });

});
