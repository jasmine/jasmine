describe('diffAwareTruncate', function() {
  describe('When neither string is longer than the limit', function() {
    it('returns the strings as-is', function() {
      const result = privateUnderTest.diffAwareTruncate('abc', 'def', 3);
      expect(result).toEqual(['abc', 'def']);
    });
  });

  describe('When maxLen is very small', function() {
    it('returns the strings as-is', function() {
      const preferredMinChunkLen = 16;
      const maxLen = 33;
      expect(maxLen).toBeLessThan((preferredMinChunkLen + 1) * 2);
      const prefix = 'x'.repeat(1000);
      const a = prefix + 'a';
      const b = prefix + 'b';
      const result = privateUnderTest.diffAwareTruncate(
        a,
        b,
        maxLen,
        preferredMinChunkLen
      );
      expect(result).toEqual([a, b]);
    });
  });

  describe('When there are more than preferredMinChunkLen characters before the first difference', function() {
    it('truncates the prefix to preferredMinChunkLen characters, from the left', function() {
      const maxLen = 22;
      const preferredMinChunkLen = 4;
      const prefix = 'x'.repeat(6);
      const suffix = 'y'.repeat(14);
      const a = prefix + 'abc' + suffix;
      const b = prefix + 'def' + suffix;
      const result = privateUnderTest.diffAwareTruncate(
        a,
        b,
        maxLen,
        preferredMinChunkLen
      );
      expect(result).toEqual([
        '…' + 'x'.repeat(4) + 'abc' + suffix,
        '…' + 'x'.repeat(4) + 'def' + suffix
      ]);
    });

    describe('When the string is still too long after truncating the prefix', function() {
      it('truncates the resulting string from the right', function() {
        const maxLen = 34;
        const preferredMinChunkLen = 16;
        const prefix = 'x'.repeat(18);
        const suffix = 'y'.repeat(15);
        const a = prefix + 'abc' + suffix;
        const b = prefix + 'defg' + suffix;
        const result = privateUnderTest.diffAwareTruncate(
          a,
          b,
          maxLen,
          preferredMinChunkLen
        );
        expect(result).toEqual([
          '…' + 'x'.repeat(16) + 'abc' + 'y'.repeat(13) + '…',
          '…' + 'x'.repeat(16) + 'defg' + 'y'.repeat(12) + '…'
        ]);
      });
    });

    describe('When there is exactly one character too many on either side', function() {
      it('removes two characters and adds an ellipsis', function() {
        const maxLen = 8;
        const preferredMinChunkLen = 3;
        const a = 'xxxxayyyyy';
        const b = 'xxxxbyyyyy';
        const result = privateUnderTest.diffAwareTruncate(
          a,
          b,
          maxLen,
          preferredMinChunkLen
        );
        expect(result).toEqual(['…xxayyy…', '…xxbyyy…']);
      });
    });
  });

  describe('When there are preferredMinChunkLen or fewer characters before the first difference', function() {
    it('truncates only from the right', function() {
      const maxLen = 9;
      const preferredMinChunkLen = 3;
      const prefix = 'xxx';
      const a = prefix + 'abcdefgh';
      const b = prefix + 'd';
      const result = privateUnderTest.diffAwareTruncate(
        a,
        b,
        maxLen,
        preferredMinChunkLen
      );
      expect(result).toEqual([prefix + 'abcde…', b]);
    });
  });

  it("retains quotes and doesn't count them toward the limit", function() {
    const maxLen = 34;
    const preferredMinChunkLen = 16;
    const prefix = "'" + 'x'.repeat(18);
    const suffix = 'y'.repeat(15) + "'";
    const a = prefix + 'abc' + suffix;
    const b = prefix + 'defg' + suffix;
    const result = privateUnderTest.diffAwareTruncate(
      a,
      b,
      maxLen,
      preferredMinChunkLen
    );
    expect(result).toEqual([
      "'…" + 'x'.repeat(16) + 'abc' + 'y'.repeat(13) + "…'",
      "'…" + 'x'.repeat(16) + 'defg' + 'y'.repeat(12) + "…'"
    ]);
  });

  describe('Surrogate pair handling', function() {
    // Test both ends of the high surrogate range, with an arbitrarily chosen
    // value for the low surrogate.
    const firstPair = '\uD800\uDC00';
    const lastPair = '\uDBFF\uDC00';

    it("doesn't split a surrogate pair at the start", function() {
      for (const pair of [firstPair, lastPair]) {
        const maxLen = 8;
        const preferredMinChunkLen = 3;
        const a = `xx${pair}xxayyyyy`;
        const b = `xx${pair}xxbyyyyy`;
        const result = privateUnderTest.diffAwareTruncate(
          a,
          b,
          maxLen,
          preferredMinChunkLen
        );
        expect(result)
          .withContext(`Surrogate pair: ${pair}`)
          .toEqual([`…${pair}xxay…`, `…${pair}xxby…`]);
      }
    });

    it("doesn't split a surrogate pair at the end", function() {
      for (const pair of [firstPair, lastPair]) {
        const maxLen = 6;
        const a = `abc${pair}xx`;
        const b = `def${pair}xx`;
        const result = privateUnderTest.diffAwareTruncate(
          a,
          b,
          maxLen,
          1 /* arbitrary */
        );
        expect(result)
          .withContext(`Surrogate pair: ${pair}`)
          .toEqual([`abc${pair}…`, `def${pair}…`]);
      }
    });
  });
});
