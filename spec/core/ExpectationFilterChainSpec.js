describe('ExpectationFilterChain', function() {
  describe('#addFilter', function() {
    it('returns a new filter chain with the added filter', function() {
      const first = jasmine.createSpy('first'),
        second = jasmine.createSpy('second'),
        orig = new privateUnderTest.ExpectationFilterChain({
          modifyFailureMessage: first
        }),
        added = orig.addFilter({ selectComparisonFunc: second });

      added.modifyFailureMessage();
      expect(first).toHaveBeenCalled();
      added.selectComparisonFunc();
      expect(second).toHaveBeenCalled();
    });

    it('does not modify the original filter chain', function() {
      const orig = new privateUnderTest.ExpectationFilterChain({}),
        f = jasmine.createSpy('f');

      orig.addFilter({ selectComparisonFunc: f });

      orig.selectComparisonFunc();
      expect(f).not.toHaveBeenCalled();
    });
  });

  describe('#selectComparisonFunc', function() {
    describe('When no filters have #selectComparisonFunc', function() {
      it('returns undefined', function() {
        const chain = new privateUnderTest.ExpectationFilterChain();
        chain.addFilter({});
        expect(chain.selectComparisonFunc()).toBeUndefined();
      });
    });

    describe('When some filters have #selectComparisonFunc', function() {
      it('calls the first filter that has #selectComparisonFunc', function() {
        const first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          chain = new privateUnderTest.ExpectationFilterChain()
            .addFilter({ selectComparisonFunc: first })
            .addFilter({ selectComparisonFunc: second }),
          matcher = {},
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
        const chain = new privateUnderTest.ExpectationFilterChain();
        chain.addFilter({});
        expect(chain.buildFailureMessage()).toBeUndefined();
      });
    });

    describe('When some filters have #buildFailureMessage', function() {
      it('calls the first filter that has #buildFailureMessage', function() {
        const first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          chain = new privateUnderTest.ExpectationFilterChain()
            .addFilter({ buildFailureMessage: first })
            .addFilter({ buildFailureMessage: second }),
          matcherResult = { pass: false },
          matcherName = 'foo',
          args = [],
          matchersUtil = {};

        const result = chain.buildFailureMessage(
          matcherResult,
          matcherName,
          args,
          matchersUtil
        );

        expect(first).toHaveBeenCalledWith(
          matcherResult,
          matcherName,
          args,
          matchersUtil
        );
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });
    });
  });

  describe('#modifyFailureMessage', function() {
    describe('When no filters have #modifyFailureMessage', function() {
      it('returns the original message', function() {
        const chain = new privateUnderTest.ExpectationFilterChain();
        chain.addFilter({});
        expect(chain.modifyFailureMessage('msg')).toEqual('msg');
      });
    });

    describe('When some filters have #modifyFailureMessage', function() {
      it('calls the first filter that has #modifyFailureMessage', function() {
        const first = jasmine.createSpy('first').and.returnValue('first'),
          second = jasmine.createSpy('second').and.returnValue('second'),
          chain = new privateUnderTest.ExpectationFilterChain()
            .addFilter({ modifyFailureMessage: first })
            .addFilter({ modifyFailureMessage: second }),
          result = chain.modifyFailureMessage('original');

        expect(first).toHaveBeenCalledWith('original');
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });
    });
  });
});
