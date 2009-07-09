describe("jasmine.MultiReporter", function() {
  it("should delegate to any and all subreporters", function() {
    var multiReporter = new jasmine.MultiReporter();
    var fakeReporter1 = jasmine.createSpyObj("fakeReporter1", ["reportSpecResults"]);
    var fakeReporter2 = jasmine.createSpyObj("fakeReporter2", ["reportSpecResults"]);
    multiReporter.addReporter(fakeReporter1);
    multiReporter.addReporter(fakeReporter2);

    multiReporter.reportSpecResults('blah', 'foo');
    expect(fakeReporter1.reportSpecResults).wasCalledWith('blah', 'foo');
    expect(fakeReporter2.reportSpecResults).wasCalledWith('blah', 'foo');
  });
});