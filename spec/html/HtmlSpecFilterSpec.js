describe("jasmine.HtmlSpecFilter", function() {

  it("should match when no string is provided", function() {
    var specFilter = new jasmine.HtmlSpecFilter();

    expect(specFilter.matches("foo")).toBe(true);
    expect(specFilter.matches("*bar")).toBe(true);
  });

  it("should only match the provided string", function() {
    var specFilter = new jasmine.HtmlSpecFilter({
      filterString: function() { return "foo"; }
    });

    expect(specFilter.matches("foo")).toBe(true);
    expect(specFilter.matches("bar")).toBe(false);
  });
});