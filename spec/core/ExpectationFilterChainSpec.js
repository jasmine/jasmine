describe('ExpectationFilterChain', function() {
  describe('#addFilter', function() {
    it('returns a new filter chain with the added filter', function() {
      const first = jasmine.createSpy('first');
      const second = jasmine.createSpy('second');
      const orig = new privateUnderTest.ExpectationFilterChain({
        modifyFailureMessage: first
      });
      const added = orig.addFilter({ selectComparisonFunc: second });

      added.modifyFailureMessage();
      expect(first).toHaveBeenCalled();
      added.selectComparisonFunc();
      expect(second).toHaveBeenCalled();
    });

    it('does not modify the original filter chain', function() {
      const orig = new privateUnderTest.ExpectationFilterChain({});
      const f = jasmine.createSpy('f');

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
        const first = jasmine.createSpy('first').and.returnValue('first');
        const second = jasmine.createSpy('second').and.returnValue('second');
        const chain = new privateUnderTest.ExpectationFilterChain()
          .addFilter({ selectComparisonFunc: first })
          .addFilter({ selectComparisonFunc: second });
        const matcher = {};
        const result = chain.selectComparisonFunc(matcher);

        expect(first).toHaveBeenCalledWith(matcher);
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });

      it('applies wrapComparisonFunc around the selected comparison', function() {
        const inner = jasmine.createSpy('inner').and.returnValue('inner');
        const select = jasmine.createSpy('select').and.returnValue(inner);
        const wrap = jasmine
          .createSpy('wrap')
          .and.callFake(function(comparison) {
            return function() {
              return 'wrapped ' + comparison();
            };
          });
        const chain = new privateUnderTest.ExpectationFilterChain()
          .addFilter({ wrapComparisonFunc: wrap })
          .addFilter({ selectComparisonFunc: select });
        const matcher = {};
        const result = chain.selectComparisonFunc(matcher);

        expect(select).toHaveBeenCalledWith(matcher);
        expect(wrap).toHaveBeenCalledWith(inner, matcher);
        expect(result()).toEqual('wrapped inner');
      });

      it('wraps matcher.compare when no filter selects a comparison', function() {
        const compare = jasmine.createSpy('compare').and.returnValue('cmp');
        const wrap = jasmine
          .createSpy('wrap')
          .and.callFake(function(comparison) {
            return comparison;
          });
        const matcher = { compare: compare };
        const chain = new privateUnderTest.ExpectationFilterChain().addFilter({
          wrapComparisonFunc: wrap
        });
        const result = chain.selectComparisonFunc(matcher);

        expect(wrap).toHaveBeenCalledWith(compare, matcher);
        expect(result).toBe(compare);
        expect(result()).toEqual('cmp');
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
        const first = jasmine.createSpy('first').and.returnValue('first');
        const second = jasmine.createSpy('second').and.returnValue('second');
        const chain = new privateUnderTest.ExpectationFilterChain()
          .addFilter({ buildFailureMessage: first })
          .addFilter({ buildFailureMessage: second });
        const matcherResult = { pass: false };
        const matcherName = 'foo';
        const args = [];
        const matchersUtil = {};

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
        const first = jasmine.createSpy('first').and.returnValue('first');
        const second = jasmine.createSpy('second').and.returnValue('second');
        const chain = new privateUnderTest.ExpectationFilterChain()
          .addFilter({ modifyFailureMessage: first })
          .addFilter({ modifyFailureMessage: second });
        const result = chain.modifyFailureMessage('original');

        expect(first).toHaveBeenCalledWith('original');
        expect(second).not.toHaveBeenCalled();
        expect(result).toEqual('first');
      });
    });
  });
});
