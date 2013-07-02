describe("SpyRegistry", function() {
  it("allows registering a spy", function() {
    var spyRegistry = new j$.SpyRegistry(),
        standIn = function() {},
        delegate = {},
        baseObj = {};

    spyRegistry.register(standIn, {
      delegate: delegate,
      baseObj: baseObj
    });

    expect(spyRegistry.lookupDelegate(standIn)).toEqual(delegate);
    expect(spyRegistry.lookupBaseObj(standIn)).toEqual(baseObj);
  });

  it("is undefined when the lookup key does not exist", function() {
    var spyRegistry = new j$.SpyRegistry();

    expect(spyRegistry.lookupDelegate(function() {})).toBeUndefined();
    expect(spyRegistry.lookupBaseObj({})).toBeUndefined();
  });

  it("resetting the registry", function() {
    var spyRegistry = new j$.SpyRegistry(),
        standIn = function() {},
        delegate = {};

    spyRegistry.register(standIn, delegate);

    spyRegistry.reset();

    expect(spyRegistry.lookupDelegate(function() {})).toBeUndefined();
    expect(spyRegistry.lookupBaseObj({})).toBeUndefined();
  });
});