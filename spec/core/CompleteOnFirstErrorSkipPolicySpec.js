describe('CompleteOnFirstErrorSkipPolicy', function() {
  describe('#skipTo', function() {
    describe('When errored is false', function() {
      it('returns the next index', function() {
        const policy = new jasmineUnderTest.CompleteOnFirstErrorSkipPolicy(
          arrayOfArbitraryFns(4),
          4
        );
        expect(policy.skipTo(1, false)).toEqual(2);
      });
    });

    describe('When errored is true', function() {
      it('returns the first cleanup fn when called with a non cleanup fn', function() {
        const policy = new jasmineUnderTest.CompleteOnFirstErrorSkipPolicy(
          arrayOfArbitraryFns(4),
          2
        );

        expect(policy.skipTo(0, true)).toEqual(2);
        expect(policy.skipTo(1, true)).toEqual(2);
      });

      it('returns the next index when called with a cleanup fn', function() {
        const policy = new jasmineUnderTest.CompleteOnFirstErrorSkipPolicy(
          arrayOfArbitraryFns(4),
          1
        );

        expect(policy.skipTo(1, true)).toEqual(2);
        expect(policy.skipTo(2, true)).toEqual(3);
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
