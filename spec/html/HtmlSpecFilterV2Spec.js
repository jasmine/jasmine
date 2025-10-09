describe('HtmlSpecFilterV2', function() {
  it('matches everything when no string is provided', function() {
    const specFilter = new privateUnderTest.HtmlSpecFilterV2({
      filterString() {
        return '';
      }
    });

    expect(specFilter.matches({})).toBeTrue();
  });

  it('matches a spec with the exact same path', function() {
    const specFilter = new privateUnderTest.HtmlSpecFilterV2({
      filterString() {
        return '["a","b","c"]';
      }
    });

    expect(specFilter.matches(stubSpec(['a', 'b', 'c']))).toBeTrue();
  });

  it('matches a spec whose path has the filter path as a prefix', function() {
    const specFilter = new privateUnderTest.HtmlSpecFilterV2({
      filterString() {
        return '["a","b"]';
      }
    });

    expect(specFilter.matches(stubSpec(['a', 'b', 'c']))).toBeTrue();
  });

  it('does not match a spec with a different path', function() {
    const specFilter = new privateUnderTest.HtmlSpecFilterV2({
      filterString() {
        return '["a","b","c"]';
      }
    });

    expect(specFilter.matches(stubSpec(['a', 'd', 'c']))).toBeFalse();
  });

  function stubSpec(path) {
    return {
      getPath() {
        return path;
      }
    };
  }
});
