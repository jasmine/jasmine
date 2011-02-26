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
    var delegate = {};
    multiReporter.addReporter(delegate);

    this.addMatchers({
      toDelegateMethod: function(methodName) {
        delegate[methodName] = jasmine.createSpy(methodName);
        this.actual[methodName]("whatever argument");

        return delegate[methodName].wasCalled && 
               delegate[methodName].mostRecentCall.args.length == 1 && 
               delegate[methodName].mostRecentCall.args[0] == "whatever argument";
      }
    });

    expect(multiReporter).toDelegateMethod('reportRunnerStarting');
    expect(multiReporter).toDelegateMethod('reportRunnerResults');
    expect(multiReporter).toDelegateMethod('reportSuiteResults');
    expect(multiReporter).toDelegateMethod('reportSpecStarting');
    expect(multiReporter).toDelegateMethod('reportSpecResults');
    expect(multiReporter).toDelegateMethod('log');
  });

  it("should delegate to any and all subreporters", function() {
    multiReporter.reportSpecResults('blah', 'foo');
    expect(fakeReporter1.reportSpecResults).toHaveBeenCalledWith('blah', 'foo');
    expect(fakeReporter2.reportSpecResults).toHaveBeenCalledWith('blah', 'foo');
  });

  it("should quietly skip delegating to any subreporters which lack the given method", function() {
    multiReporter.reportRunnerStarting('blah', 'foo');
    expect(fakeReporter2.reportRunnerStarting).toHaveBeenCalledWith('blah', 'foo');
  });
});