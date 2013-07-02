describe("SpyRegistry", function() {
  it("allows registering a spy to a spyDelegate", function() {
    var spyRegistry = new j$.SpyRegistry(),
        standIn = function() {},
        delegate = {};

    spyRegistry.register(standIn, delegate);
    expect(spyRegistry.lookup(standIn)).toEqual(delegate);
  });

  it("is undefined when the lookup key does not exist", function() {
    var spyRegistry = new j$.SpyRegistry();

    expect(spyRegistry.lookup(function() {})).toBeUndefined();
  });

  it("resetting the registry", function() {
    var spyRegistry = new j$.SpyRegistry(),
        standIn = function() {},
        delegate = {};

    spyRegistry.register(standIn, delegate);

    spyRegistry.reset();

    expect(spyRegistry.lookup(standIn)).toBeUndefined();
  });
});