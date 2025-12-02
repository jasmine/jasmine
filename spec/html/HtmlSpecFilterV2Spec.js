describe('HtmlSpecFilterV2', function() {
  describe('When both query parameters are falsy', function() {
    it('matches everything', function() {
      const specFilter = new privateUnderTest.HtmlSpecFilterV2({
        filterParams() {
          return { path: '', spec: '' };
        }
      });

      expect(specFilter.matches({})).toBeTrue();
    });
  });

  describe('When the path parameter is truthy', function() {
    it('matches a spec with the exact same path', function() {
      const specFilter = new privateUnderTest.HtmlSpecFilterV2({
        filterParams() {
          return { path: '["a","b","c"]', spec: '' };
        }
      });

      expect(specFilter.matches(stubSpec(['a', 'b', 'c']))).toBeTrue();
    });

    it('matches a spec whose path has the filter path as a prefix', function() {
      const specFilter = new privateUnderTest.HtmlSpecFilterV2({
        filterParams() {
          return { path: '["a","b"]', spec: '' };
        }
      });

      expect(specFilter.matches(stubSpec(['a', 'b', 'c']))).toBeTrue();
    });

    it('does not match a spec with a different path', function() {
      const specFilter = new privateUnderTest.HtmlSpecFilterV2({
        filterParams() {
          return { path: '["a","b","c"]', spec: '' };
        }
      });

      expect(specFilter.matches(stubSpec(['a', 'd', 'c']))).toBeFalse();
    });
  });

  describe('When the path parameter is falsy and the spec parameter is truthy', function() {
    it('matches specs with full names containing the parameter value', function() {
      const specFilter = new privateUnderTest.HtmlSpecFilterV2({
        filterParams() {
          return { path: '', spec: 'bar' };
        }
      });

      expect(specFilter.matches(stubSpec('', 'foo bar baz'))).toBeTrue();
      expect(specFilter.matches(stubSpec('', 'foo baz'))).toBeFalse();
      expect(specFilter.matches(stubSpec('', 'sandbars'))).toBeTrue();
    });
  });

  function stubSpec(path, fullName) {
    return {
      getPath() {
        return path;
      },
      getFullName() {
        return fullName;
      }
    };
  }
});
