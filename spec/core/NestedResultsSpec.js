describe('jasmine.NestedResults', function() {
  it('#addResult increments counters', function() {
    // Leaf case
    var results = new jasmine.NestedResults();

    results.addResult(new jasmine.ExpectationResult({
      matcherName: "foo", passed: true, message: 'Passed.', actual: 'bar', expected: 'bar'}
    ));

    expect(results.getItems().length).toEqual(1);
    expect(results.totalCount).toEqual(1);
    expect(results.passedCount).toEqual(1);
    expect(results.failedCount).toEqual(0);

    results.addResult(new jasmine.ExpectationResult({
      matcherName: "baz", passed: false, message: 'FAIL.', actual: "corge", expected: "quux"
    }));

    expect(results.getItems().length).toEqual(2);
    expect(results.totalCount).toEqual(2);
    expect(results.passedCount).toEqual(1);
    expect(results.failedCount).toEqual(1);
  });

  it('should roll up counts for nested results', function() {
    // Branch case
    var leafResultsOne = new jasmine.NestedResults();
    leafResultsOne.addResult(new jasmine.ExpectationResult({
      matcherName: "toSomething", passed: true, message: 'message', actual: '', expected:''
    }));

    leafResultsOne.addResult(new jasmine.ExpectationResult({
      matcherName: "toSomethingElse", passed: false, message: 'message', actual: 'a', expected: 'b'
    }));

    var leafResultsTwo = new jasmine.NestedResults();
    leafResultsTwo.addResult(new jasmine.ExpectationResult({
      matcherName: "toSomething", passed: true, message: 'message', actual: '', expected: ''
    }));
    leafResultsTwo.addResult(new jasmine.ExpectationResult({
      matcherName: "toSomethineElse", passed: false, message: 'message', actual: 'c', expected: 'd'
    }));

    var branchResults = new jasmine.NestedResults();
    branchResults.addResult(leafResultsOne);
    branchResults.addResult(leafResultsTwo);

    expect(branchResults.getItems().length).toEqual(2);
    expect(branchResults.totalCount).toEqual(4);
    expect(branchResults.passedCount).toEqual(2);
    expect(branchResults.failedCount).toEqual(2);
  });

  describe("#updateResult", function() {
    var results, result1, result2;

    beforeEach(function() {
      results = new jasmine.NestedResults();
      result1 = new jasmine.ExpectationResult({
        passed: true,
        message: "Passed."
      });
      result2 = new jasmine.ExpectationResult({
        passed: false,
        message: "fail."
      });

      results.addResult(result1);
      results.addResult(result2);
    });

    describe("when a result that was passing is updated to fail", function() {
      beforeEach(function() {
        results.updateResult(result1, { passed: false, message: "nope. failed." });
      });

      it("increments the failed count and decrements the passed count", function() {
        expect(results.totalCount).toEqual(2);
        expect(results.passedCount).toEqual(0);
        expect(results.failedCount).toEqual(2);
      });

      it("updates the message and passing status of the result", function() {
        expect(result1.passed()).toBeFalsy();
        expect(result1.message).toBe("nope. failed.");
      });
    });

    describe("when a result that was failing is updated to pass", function() {
      beforeEach(function() {
        results.updateResult(result2, { passed: true });
      });

      it("increments the failed count and decrements the passed count", function() {
        expect(results.totalCount).toEqual(2);
        expect(results.passedCount).toEqual(2);
        expect(results.failedCount).toEqual(0);
      });

      it("updates the message and passing status of the result", function() {
        expect(result2.passed()).toBeTruthy();
        expect(result2.message).toBe("Passed.");
      });
    });
  });
});
