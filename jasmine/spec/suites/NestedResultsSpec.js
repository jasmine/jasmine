describe('jasmine.NestedResults', function() {
  it('#addResult increments counters', function() {
    // Leaf case
    var results = new jasmine.NestedResults();

    results.addResult(new jasmine.ExpectationResult(true,'Passed.'));

    expect(results.getItems().length).toEqual(1);
    expect(results.totalCount).toEqual(1);
    expect(results.passedCount).toEqual(1);
    expect(results.failedCount).toEqual(0);

    results.addResult(new jasmine.ExpectationResult(false, 'FAIL.'));

    expect(results.getItems().length).toEqual(2);
    expect(results.totalCount).toEqual(2);
    expect(results.passedCount).toEqual(1);
    expect(results.failedCount).toEqual(1);
  });

  it('should roll up counts for nested results', function() {
    // Branch case
    var leafResultsOne = new jasmine.NestedResults();
    leafResultsOne.addResult(new jasmine.ExpectationResult( true, ''));
    leafResultsOne.addResult(new jasmine.ExpectationResult( false, ''));

    var leafResultsTwo = new jasmine.NestedResults();
    leafResultsTwo.addResult(new jasmine.ExpectationResult( true, ''));
    leafResultsTwo.addResult(new jasmine.ExpectationResult( false, ''));

    var branchResults = new jasmine.NestedResults();
    branchResults.addResult(leafResultsOne);
    branchResults.addResult(leafResultsTwo);

    expect(branchResults.getItems().length).toEqual(2);
    expect(branchResults.totalCount).toEqual(4);
    expect(branchResults.passedCount).toEqual(2);
    expect(branchResults.failedCount).toEqual(2);
  });

});