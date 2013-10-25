describe("j$.HtmlSpecFilter", function() {

  it("should match when no string is provided", function() {
    var specFilter = new j$.HtmlSpecFilter();

    expect(specFilter.matches("foo")).toBe(true);
    expect(specFilter.matches("*bar")).toBe(true);
  });

  it("should only match the provided string", function() {
    var specFilter = new j$.HtmlSpecFilter({
      filterString: function() { return "foo"; }
    });

    expect(specFilter.matches("foo")).toBe(true);
    expect(specFilter.matches("bar")).toBe(false);
  });
});
