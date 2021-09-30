describe('SkipAfterBeforeAllErrorPolicy', function() {
  describe('#skipTo', function() {
    describe('When nothing has errored', function() {
      it('does not skip anything', function() {
        const policy = new jasmineUnderTest.SkipAfterBeforeAllErrorPolicy(
          arrayOfArbitraryFns(4),
          2
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
          arrayOfArbitraryFns(4),
          2
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
        const fns = [
          { type: 'beforeAll', fn: () => {} },
          { fn: () => {} },
          { fn: () => {} },
          { type: 'afterAll', fn: () => {} },
          { type: 'afterAll', fn: () => {} }
        ];
        const policy = new jasmineUnderTest.SkipAfterBeforeAllErrorPolicy(
          fns,
          2
        );

        policy.fnErrored(0);
        expect(policy.skipTo(0)).toEqual(3);
        expect(policy.skipTo(3)).toEqual(4);
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
