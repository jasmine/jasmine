describe('ResultsNode', function() {
  it('wraps a result', function() {
    const fakeResult = {
        id: 123,
        message: 'foo'
      },
      node = new privateUnderTest.ResultsNode(fakeResult, 'suite', null);

    expect(node.result).toBe(fakeResult);
    expect(node.type).toEqual('suite');
  });

  it('can add children with a type', function() {
    const fakeResult = {
        id: 123,
        message: 'foo'
      },
      fakeChildResult = {
        id: 456,
        message: 'bar'
      },
      node = new privateUnderTest.ResultsNode(fakeResult, 'suite', null);

    node.addChild(fakeChildResult, 'spec');

    expect(node.children.length).toEqual(1);
    expect(node.children[0].result).toEqual(fakeChildResult);
    expect(node.children[0].type).toEqual('spec');
  });

  it('has a pointer back to its parent ResultNode', function() {
    const fakeResult = {
        id: 123,
        message: 'foo'
      },
      fakeChildResult = {
        id: 456,
        message: 'bar'
      },
      node = new privateUnderTest.ResultsNode(fakeResult, 'suite', null);

    node.addChild(fakeChildResult, 'spec');

    expect(node.children[0].parent).toBe(node);
  });

  it('can provide the most recent child', function() {
    const fakeResult = {
        id: 123,
        message: 'foo'
      },
      fakeChildResult = {
        id: 456,
        message: 'bar'
      },
      node = new privateUnderTest.ResultsNode(fakeResult, 'suite', null);

    node.addChild(fakeChildResult, 'spec');

    expect(node.last()).toBe(node.children[node.children.length - 1]);
  });
});
