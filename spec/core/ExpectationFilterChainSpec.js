describe('ExpectationFilterChain', function() {
  describe('#addFilter', function() {
    it('returns a new filter chain with the added filter', function() {
      var first = jasmine.createSpy('first'),
        second = jasmine.createSpy('second'),
        orig = new jasmineUnderTest.ExpectationFilterChain({
          modifyOutputMessage: first
        }),
        added = orig.addFilter({selectComparisonFunc: second});

      added.modifyOutputMessage();
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

  describe('#buildOutputMessage', function() {
    describe('When no filters have #buildOutputMessage', function() {
      it('returns undefined', function() {
        var chain = new jasmineUnderTest.ExpectationFilterChain();
        chain.addFilter({});
        expect(chain.buildOutputMessage()).toBeUndefined();
      });
    });

    describe('When some filters have #buildOutputMessage', function() {
      it('calls the first filter that has #buildOutputMessage', function() {
        var first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          chain = new jasmineUnderTest.ExpectationFilterChain()
            .addFilter({buildOutputMessage: first})
            .addFilter({buildOutputMessage: second}),
          matcherResult = {pass: false},
          matcherName = 'foo',
          args = [],
          util = {},
          result;

        result = chain.buildOutputMessage(matcherResult, matcherName, args, util);

        expect(first).toHaveBeenCalledWith(matcherResult, matcherName, args, util);
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });
    });
  });

  describe('#modifyOutputMessage', function() {
    describe('When no filters have #modifyOutputMessage', function() {
      it('returns the original message', function() {
        var chain = new jasmineUnderTest.ExpectationFilterChain();
        chain.addFilter({});
        expect(chain.modifyOutputMessage('msg')).toEqual('msg');
      });
    });

    describe('When some filters have #modifyOutputMessage', function() {
      it('calls the first filter that has #modifyOutputMessage', function() {
        var first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          chain = new jasmineUnderTest.ExpectationFilterChain()
            .addFilter({modifyOutputMessage: first})
            .addFilter({modifyOutputMessage: second}),
          result;

        result = chain.modifyOutputMessage('original');

        expect(first).toHaveBeenCalledWith('original');
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });
    });
  });
});
