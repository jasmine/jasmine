describe('ExpectationFilterChainSpec', function() {
  describe('#selectComparisonFunc', function() {
    describe('When no filters have #selectComparisonFunc', function() {
      it('returns undefined', function() {
        var chain = new jasmineUnderTest.ExpectationFilterChain();
        chain.addFilter({});
        expect(chain.selectComparisonFunc()).toBeUndefined();
      });
    });

    describe('When some filters have #selectComparisonFunc', function() {
      it('calls the first filter that has #selectComparisonFunc', function() {
        var chain = new jasmineUnderTest.ExpectationFilterChain(),
          first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          matcher = {},
          result;

        chain.addFilter({selectComparisonFunc: first});
        chain.addFilter({selectComparisonFunc: second});
        result = chain.selectComparisonFunc(matcher);

        expect(first).toHaveBeenCalledWith(matcher);
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });
    });
  });

  describe('#buildFailureMessage', function() {
    describe('When no filters have #buildFailureMessage', function() {
      it('returns undefined', function() {
        var chain = new jasmineUnderTest.ExpectationFilterChain();
        chain.addFilter({});
        expect(chain.buildFailureMessage()).toBeUndefined();
      });
    });

    describe('When some filters have #buildFailureMessage', function() {
      it('calls the first filter that has #buildFailureMessage', function() {
        var chain = new jasmineUnderTest.ExpectationFilterChain(),
          first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          matcherResult = {pass: false},
          matcherName = 'foo',
          args = [],
          util = {},
          result;

        chain.addFilter({buildFailureMessage: first});
        chain.addFilter({buildFailureMessage: second});
        result = chain.buildFailureMessage(matcherResult, matcherName, args, util);

        expect(first).toHaveBeenCalledWith(matcherResult, matcherName, args, util);
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });
    });
  });

  describe('#modifyFailureMessage', function() {
    it('calls each filter with the return value of the next previously added filter', function() {
        var chain = new jasmineUnderTest.ExpectationFilterChain(),
          first = jasmine.createSpy('first').and.returnValue('first'),
          third = jasmine.createSpy('third').and.returnValue('third'),
          result;

        chain.addFilter({modifyFailureMessage: first});
        chain.addFilter({})
        chain.addFilter({modifyFailureMessage: third});
        result = chain.modifyFailureMessage('original');

        expect(third).toHaveBeenCalledWith('original');
        expect(first).toHaveBeenCalledWith('third');
        expect(result).toEqual('first');
    });
  });
});
