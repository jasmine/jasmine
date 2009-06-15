describe('jasmine.NestedResults', function() {
  it('#addResult increments counters', function() {
    // Leaf case
    var results = new jasmine.NestedResults();

    results.addResult({passed: true, message: 'Passed.'});

    expect(results.getItems().length).toEqual(1);
    expect(results.totalCount).toEqual(1);
    expect(results.passedCount).toEqual(1);
    expect(results.failedCount).toEqual(0);

    results.addResult({passed: false, message: 'FAIL.'});

    expect(results.getItems().length).toEqual(2);
    expect(results.totalCount).toEqual(2);
    expect(results.passedCount).toEqual(1);
    expect(results.failedCount).toEqual(1);
  });

  it('should roll up counts for nested results', function() {
    // Branch case
    var leafResultsOne = new jasmine.NestedResults();
    leafResultsOne.addResult({passed: true, message: ''});
    leafResultsOne.addResult({passed: false, message: ''});

    var leafResultsTwo = new jasmine.NestedResults();
    leafResultsTwo.addResult({passed: true, message: ''});
    leafResultsTwo.addResult({passed: false, message: ''});

    var branchResults = new jasmine.NestedResults();
    branchResults.addResult(leafResultsOne);
    branchResults.addResult(leafResultsTwo);

    expect(branchResults.getItems().length).toEqual(2);
    expect(branchResults.totalCount).toEqual(4);
    expect(branchResults.passedCount).toEqual(2);
    expect(branchResults.failedCount).toEqual(2);
  });

});