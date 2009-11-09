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

});
