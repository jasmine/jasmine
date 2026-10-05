getJasmineRequireObj().diffAwareTruncate = function(j$, private$) {
  'use strict';

  const ELLIPSIS = '…';

  // Truncate a and b to maxLen, while ensuring that at least part of the
  // difference between them and some context are included in the result.
  return function diffAwareTruncate(a, b, maxLen, preferredMinChunkLen) {
    // Wrapping quotes should be retained and don't count toward the limit
    const aQuoted = isQuoted(a);
    const bQuoted = isQuoted(b);

    if (
      maxLen < (preferredMinChunkLen + ELLIPSIS.length) * 2 ||
      (alreadyFits(a, aQuoted, maxLen) && alreadyFits(b, bQuoted, maxLen))
    ) {
      return [a, b];
    }

    if (aQuoted) {
      a = stripQuotes(a);
    }
    if (bQuoted) {
      b = stripQuotes(b);
    }

    // Assumptions:
    // * The most useful output to provide is the first part of the differing
    //   portion of the strings, plus a bit of context that immediately
    //   precedes it.
    // * It's usually better to include relatively little preceding context,
    //   to make the differing part easier to spot and to include more of the
    //   differing part.
    // * If multiple portions are different, then either they're close enough
    //   to each other to fit in a maxLen window or only the first one is
    //   important. A diff that is only understandable if two or more widely
    //   separated chunks are both included is an extreme edge case, and if
    //   anyone ever actually hits it, they should increase the value of
    //   MAX_PRETTY_PRINT_CHARS accordingly.

    const i = indexOfFirstDifference(a, b);

    if (i > preferredMinChunkLen) {
      let toRemove = i - preferredMinChunkLen;
      if (i - 1 === preferredMinChunkLen) {
        // Actually shorten rather than just replacing one char with an ellipsis
        toRemove++;
      }

      a = truncateLeft(a, toRemove);
      b = truncateLeft(b, toRemove);
    }

    a = truncateRight(a, maxLen);
    b = truncateRight(b, maxLen);

    if (aQuoted) {
      a = `'${a}'`;
    }
    if (bQuoted) {
      b = `'${b}'`;
    }

    return [a, b];
  };

  function isQuoted(s) {
    return s[0] === "'" && s[s.length - 1] === "'";
  }

  function stripQuotes(s) {
    return s.slice(1, s.length - 1);
  }

  function alreadyFits(s, isQuoted, maxLen) {
    if (isQuoted) {
      maxLen += 2;
    }

    return s.length <= maxLen;
  }

  function indexOfFirstDifference(a, b) {
    const commonLen = Math.min(a.length, b.length);

    for (let i = 0; i < commonLen; i++) {
      if (a[i] !== b[i]) {
        return i;
      }
    }

    return commonLen;
  }

  function truncateLeft(s, charsToRemove) {
    if (isStartOfSurrogatePair(s, charsToRemove - 1)) {
      // Keep the whole surrogate pair rather than splitting it.
      charsToRemove--;
    }

    if (charsToRemove === 0) {
      return s;
    }

    return ELLIPSIS + s.slice(charsToRemove);
  }

  function truncateRight(s, maxLen) {
    if (isStartOfSurrogatePair(s, maxLen - 2)) {
      // Keep the whole surrogate pair rather than splitting it.
      maxLen++;
    }

    if (s.length <= maxLen) {
      return s;
    }

    return s.slice(0, maxLen - 1) + ELLIPSIS;
  }

  function isStartOfSurrogatePair(s, i) {
    // Subscripting works on UTF-16 code units, not characters.
    // That's what we want.
    return i + 1 < s.length && s[i] >= '\uD800' && s[i] <= '\uDBFF';
  }
};
