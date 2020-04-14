describe('ObjectPath', function() {
  var ObjectPath = jasmineUnderTest.ObjectPath;

  it('represents the path to a node in an object tree', function() {
    expect(new ObjectPath(['foo', 'bar']).toString()).toEqual('$.foo.bar');
  });

  it('has a depth', function() {
    expect(new ObjectPath().depth()).toEqual(0);
    expect(new ObjectPath(['foo']).depth()).toEqual(1);
  });

  it('renders numbers as array access', function() {
    expect(new ObjectPath(['foo', 0]).toString()).toEqual('$.foo[0]');
  });

  it('renders properties that are valid identifiers with dot notation', function() {
    expect(new ObjectPath(['foo123']).toString()).toEqual('$.foo123');
    expect(new ObjectPath(['x_y']).toString()).toEqual('$.x_y');
    expect(new ObjectPath(['A$B']).toString()).toEqual('$.A$B');
  });

  it('renders properties with non-identifier-safe characters with square bracket notation', function() {
    expect(new ObjectPath(['a b c']).toString()).toEqual("$['a b c']");
    expect(new ObjectPath(['1hello']).toString()).toEqual("$['1hello']");
  });

  it('renders as the empty string when empty', function() {
    expect(new ObjectPath().toString()).toEqual('');
  });

  it('stringifies properties that are not strings or numbers', function() {
    expect(new ObjectPath([{}]).toString()).toEqual("$['[object Object]']");
  });

  it('can be created based on another path', function() {
    var root = new ObjectPath();
    var path = root.add('foo');

    expect(path.toString()).toEqual('$.foo');
    expect(root.toString()).toEqual('');
  });
});
