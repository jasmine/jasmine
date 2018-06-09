describe('ExpectationFilterChain', function() {
  describe('#addFilter', function() {
    it('returns a new filter chain with the added filter', function() {
      var first = jasmine.createSpy('first'),
        second = jasmine.createSpy('second'),
        orig = new jasmineUnderTest.ExpectationFilterChain({
          modifyFailureMessage: first
        }),
        added = orig.addFilter({selectComparisonFunc: second});

      added.modifyFailureMessage();
      expect(first).toHaveBeenCalled();
      added.selectComparisonFunc();
      expect(second).toHaveBeenCalled();
    });

    it('does not modify the original filter chain', function() {
      var orig = new jasmineUnderTest.ExpectationFilterChain({}),
        f = jasmine.createSpy('f');

      orig.addFilter({selectComparisonFunc: f});

      orig.selectComparisonFunc();
      expect(f).not.toHaveBeenCalled();
    });
  });

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
        var first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          chain = new jasmineUnderTest.ExpectationFilterChain()
            .addFilter({selectComparisonFunc: first})
            .addFilter({selectComparisonFunc: second}),
          matcher = {},
          result;

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
        var first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          chain = new jasmineUnderTest.ExpectationFilterChain()
            .addFilter({buildFailureMessage: first})
            .addFilter({buildFailureMessage: second}),
          matcherResult = {pass: false},
          matcherName = 'foo',
          args = [],
          util = {},
          result;

        result = chain.buildFailureMessage(matcherResult, matcherName, args, util);

        expect(first).toHaveBeenCalledWith(matcherResult, matcherName, args, util);
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });
    });
  });

  describe('#modifyFailureMessage', function() {
    it('calls each filter with the return value of the next previously added filter', function() {
        var first = jasmine.createSpy('first').and.returnValue('first'),
          third = jasmine.createSpy('third').and.returnValue('third'),
          chain = new jasmineUnderTest.ExpectationFilterChain()
            .addFilter({modifyFailureMessage: first})
            .addFilter({})
            .addFilter({modifyFailureMessage: third}),
          result;

        result = chain.modifyFailureMessage('original');

        expect(first).toHaveBeenCalledWith('original');
        expect(third).toHaveBeenCalledWith('first');
        expect(result).toEqual('third');
    });
  });
});
