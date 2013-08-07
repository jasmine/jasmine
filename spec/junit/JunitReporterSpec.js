describe("JunitReporter", function() {
  var reporter, output, result;

  beforeEach(function() {
    reporter = new j$.JunitReporter();
    result = new j$.JunitResultsNode({}, "", null);
    spyOn(reporter, 'writeToFile').and.callFake(function(path, o) {
      output = o;
    });
    reporter.jasmineStarted();
  });

  it("starts with an xml tag", function() {
    reporter.jasmineDone();
    expect(reporter.writeToFile).toHaveBeenCalled();
    expect(new RegExp(/<\?xml/).test(output)).toBeTruthy();
  });

  it("reports a suite started", function() {
    reporter.suiteStarted(result);
    reporter.jasmineDone();
    expect(new RegExp(/<testsuites>/).test(output)).toBeTruthy();
    expect(new RegExp(/<testsuite/).test(output)).toBeTruthy();
  });

  it("reports a spec started", function() {
    reporter.specStarted(result);
    reporter.jasmineDone();
    expect(new RegExp(/<testcase/).test(output)).toBeTruthy();
  });

  it("reports a passed spec", function() {
    reporter.suiteStarted(result);
    reporter.specStarted(result);
    result.status = 'passed';
    reporter.specDone(result);
    reporter.jasmineDone();
    expect(new RegExp(/result="passed"/).test(output)).toBeTruthy();
    expect(new RegExp(/tests="1"/).test(output)).toBeTruthy();
  });

  it("reports a failed spec", function() {
    reporter.suiteStarted(result);
    reporter.specStarted(result);
    result.status = 'failed';
    result.failedExpectations = [''];
    reporter.specDone(result);
    reporter.jasmineDone();
    expect(new RegExp(/result="failed"/).test(output)).toBeTruthy();
    expect(new RegExp(/tests="1"/).test(output)).toBeTruthy();
  });

  it("reports a pending spec", function() {
    reporter.suiteStarted(result);
    reporter.specStarted(result);
    result.status = 'pending';
    result.failedExpectations = [''];
    reporter.specDone(result);
    reporter.jasmineDone();
    expect(new RegExp(/result="pending"/).test(output)).toBeTruthy();
    expect(new RegExp(/tests="1"/).test(output)).toBeTruthy();
  });

  it("rolls up spec status counts", function() {
    var outerSuiteResult = new j$.JunitResultsNode({ description: "Outer Suite"}, "", null);
    var innerSuiteResult = new j$.JunitResultsNode({ description: "Inner Suite"}, "", null);

    reporter.suiteStarted(outerSuiteResult);
    reporter.suiteStarted(innerSuiteResult);
    reporter.specStarted(result);
    result.status = 'failed';
    result.failedExpectations = [''];
    reporter.specDone(result);
    reporter.specDone(result);
    reporter.suiteDone(innerSuiteResult);
    reporter.suiteDone(outerSuiteResult);
    reporter.jasmineDone();
    expect(new RegExp(/(<testsuite.*failures="2"[^]*){2}[^]*<testcase.*"failed"/).test(output)).toBeTruthy();
    expect(new RegExp(/(<testsuite.*tests="2"[^]*){2}[^]*<testcase.*"failed"/).test(output)).toBeTruthy();
  });

  it("prints an error stack", function() {
    reporter.suiteStarted(result);
    reporter.specStarted(result);
    result.status = 'failed';
    result.failedExpectations = [{stack: 'error stack'}];
    reporter.specDone(result);
    reporter.jasmineDone();
    expect(new RegExp(/<failure>/).test(output)).toBeTruthy();
    expect(new RegExp(/error stack/).test(output)).toBeTruthy();
  });

  it("prints an error stack for each failed assertion within a spec", function() {
    reporter.suiteStarted(result);
    reporter.specStarted(result);
    result.status = 'failed';
    result.failedExpectations = [{stack: 'error stack'}, {stack: 'another stack'}];
    reporter.specDone(result);
    reporter.jasmineDone();
    expect(new RegExp(/<failure>/).test(output)).toBeTruthy();
    expect(new RegExp(/<testcase[^]*<failure[^]*error stack[^]*<failure[^]*another stack/).test(output)).toBeTruthy();
  });

  it("prints an error stack for each failed assertion within a spec", function() {
    reporter.suiteStarted(result);
    reporter.specStarted(result);
    result.status = 'failed';
    result.failedExpectations = [{stack: 'error stack'}, {stack: 'another stack'}];
    reporter.specDone(result);
    reporter.jasmineDone();
    expect(new RegExp(/<failure>/).test(output)).toBeTruthy();
    expect(new RegExp(/<testcase[^]*<failure[^]*error stack[^]*<failure[^]*another stack/).test(output)).toBeTruthy();
  });

  it("prints time taken per spec", function(){
    reporter.suiteStarted(result);
    reporter.specStarted(result);
    result.status = 'passed';
    reporter.specDone(result);
    result.duration = 1.23;
    reporter.jasmineDone();
    expect(new RegExp(/duration="1.23"/).test(output)).toBeTruthy();
  });
});