describe("TrivialReporter", function() {
  function fakeSpec(name) {
    return {
      getFullName: function() { return name; }
    };
  }

  it("should allow for focused spec running", function() {
    var trivialReporter = new jasmine.TrivialReporter();
    spyOn(trivialReporter, 'getLocation').andReturn({search: "?spec=run%20this"});
    expect(trivialReporter.specFilter(fakeSpec("run this"))).toBeTruthy();
  });

  it("should not run specs that don't match the filter", function() {
    var trivialReporter = new jasmine.TrivialReporter();
    spyOn(trivialReporter, 'getLocation').andReturn({search: "?spec=run%20this"});
    expect(trivialReporter.specFilter(fakeSpec("not the right spec"))).toBeFalsy();
  });
});