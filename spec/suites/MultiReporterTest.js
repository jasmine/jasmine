describe("jasmine.MultiReporter", function() {
  var multiReporter, fakeReporter1, fakeReporter2;

  beforeEach(function() {
    multiReporter = new jasmine.MultiReporter();
    fakeReporter1 = jasmine.createSpyObj("fakeReporter1", ["reportSpecResults"]);
    fakeReporter2 = jasmine.createSpyObj("fakeReporter2", ["reportSpecResults", "reportRunnerStarting"]);
    multiReporter.addReporter(fakeReporter1);
    multiReporter.addReporter(fakeReporter2);
  });

  it("should support all the method calls that jasmine.Reporter supports", function() {
    multiReporter.reportRunnerStarting();
    multiReporter.reportRunnerResults();
    multiReporter.reportSuiteResults();
    multiReporter.reportSpecResults();
    multiReporter.log();
  });

  it("should delegate to any and all subreporters", function() {
    multiReporter.reportSpecResults('blah', 'foo');
    expect(fakeReporter1.reportSpecResults).wasCalledWith('blah', 'foo');
    expect(fakeReporter2.reportSpecResults).wasCalledWith('blah', 'foo');
  });

  it("should quietly skip delegating to any subreporters which lack the given method", function() {
    multiReporter.reportRunnerStarting('blah', 'foo');
    expect(fakeReporter2.reportRunnerStarting).wasCalledWith('blah', 'foo');
  });
});