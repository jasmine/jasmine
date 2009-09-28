describe("TrivialReporter", function() {
  var trivialReporter;
  var body;

  beforeEach(function() {
    body = document.createElement("body");
  });

  function fakeSpec(name) {
    return {
      getFullName: function() { return name; }
    };
  }

  it("should run only specs beginning with spec parameter", function() {
    trivialReporter = new jasmine.TrivialReporter({ location: {search: "?spec=run%20this"} });
    expect(trivialReporter.specFilter(fakeSpec("run this"))).toBeTruthy();
    expect(trivialReporter.specFilter(fakeSpec("not the right spec"))).toBeFalsy();
    expect(trivialReporter.specFilter(fakeSpec("not run this"))).toBeFalsy();
  });

  it("should display empty divs for every suite when the runner is starting", function() {
    trivialReporter = new jasmine.TrivialReporter({ body: body });
    trivialReporter.reportRunnerStarting({
      suites: function() {
        return [ new jasmine.Suite({}, "suite 1", null, null) ];
      }
    });

    var divs = body.getElementsByTagName("div");
    expect(divs.length).toEqual(2);
    expect(divs[1].innerHTML).toContain("suite 1");
  });
  
});