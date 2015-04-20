describe("toBeFalsy", function() {

  function test(matcher) {
    it("passes for 'falsy' values", function() {
      var result;

      result = matcher.compare(false);
      expect(result.pass).toBe(true);

      result = matcher.compare(0);
      expect(result.pass).toBe(true);

      result = matcher.compare('');
      expect(result.pass).toBe(true);

      result = matcher.compare(null);
      expect(result.pass).toBe(true);

      result = matcher.compare(void 0);
      expect(result.pass).toBe(true);
    });

    it("fails for 'truthy' values", function() {
      var result;

      result = matcher.compare(true);
      expect(result.pass).toBe(false);

      result = matcher.compare(1);
      expect(result.pass).toBe(false);

      result = matcher.compare("foo");
      expect(result.pass).toBe(false);

      result = matcher.compare({});
      expect(result.pass).toBe(false);
    });
  }

  test(j$.matchers.toBeFalsy());

  describe('with toBeFalsey alias', function() {
    test(j$.matchers.toBeFalsey());
  });

});
