describe('SkipAfterBeforeAllErrorPolicy', function() {
  describe('#skipTo', function() {
    describe('When nothing has errored', function() {
      it('does not skip anything', function() {
        const policy = new jasmineUnderTest.SkipAfterBeforeAllErrorPolicy(
          arrayOfArbitraryFns(4)
        );

        expect(policy.skipTo(0)).toEqual(1);
        expect(policy.skipTo(1)).toEqual(2);
        expect(policy.skipTo(2)).toEqual(3);
        expect(policy.skipTo(3)).toEqual(4);
      });
    });

    describe('When anything but a beforeAll has errored', function() {
      it('does not skip anything', function() {
        const policy = new jasmineUnderTest.SkipAfterBeforeAllErrorPolicy(
          arrayOfArbitraryFns(4)
        );

        policy.fnErrored(0);
        expect(policy.skipTo(0)).toEqual(1);
        policy.fnErrored(1);
        expect(policy.skipTo(1)).toEqual(2);
        policy.fnErrored(2);
        expect(policy.skipTo(2)).toEqual(3);
        policy.fnErrored(3);
        expect(policy.skipTo(3)).toEqual(4);
      });
    });

    describe('When a beforeAll has errored', function() {
      it('skips subsequent functions other than afterAll', function() {
        const suite = {};
        const fns = [
          { type: 'beforeAll', fn: () => {}, suite },
          { fn: () => {} },
          { fn: () => {} },
          { type: 'afterAll', fn: () => {} },
          { type: 'afterAll', fn: () => {} }
        ];
        const policy = new jasmineUnderTest.SkipAfterBeforeAllErrorPolicy(fns);

        policy.fnErrored(0);
        expect(policy.skipTo(0)).toEqual(3);
        expect(policy.skipTo(3)).toEqual(4);
      });
    });
  });

  describe('#fnErrored', function() {
    describe('When the fn is a beforeAll', function() {
      it("sets the suite's hadBeforeAllFailure property to true", function() {
        const suite = {};
        const fns = [{ type: 'beforeAll', fn: () => {}, suite }];
        const policy = new jasmineUnderTest.SkipAfterBeforeAllErrorPolicy(fns);

        policy.fnErrored(0);

        expect(suite.hadBeforeAllFailure).toBeTrue();
      });
    });

    describe('When the fn is not a beforeAll', function() {
      it('does not try to access the suite, which is probably not there', function() {
        const fns = [{ fn: () => {} /* no suite */ }];
        const policy = new jasmineUnderTest.SkipAfterBeforeAllErrorPolicy(fns);

        expect(() => policy.fnErrored(0)).not.toThrow();
      });
    });
  });
});

function arrayOfArbitraryFns(n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push({ fn: () => {} });
  }

  return result;
}
