describe("Given", function() {
  given('testValue', function() {return "a";});
  given('myLazyValue', function() {return [given.testValue];});

  describe("with no refinements of lazy-values", function() {
    it("should load lazy values on first call", function() {
      var lazy = given();
      expect(lazy).not.toBeUndefined();
      expect(lazy.values).toEqual( {} );
      expect(given.myLazyValue).toEqual(["a"]);
      expect(lazy.values).not.toEqual( {} );
      expect(lazy.values).toEqual( {"myLazyValue":["a"],"testValue":"a"} );
    });
  });

  describe("with refinements of lazy-values", function() {
    given("testValue", function() {return 1;}); // changing testValue

    it("should load lazy values on first call", function() {
      var lazy = given();
      expect(lazy).not.toBeUndefined();
      expect(lazy.values).toEqual( {} );
      expect(given.myLazyValue).toEqual([1]);
      expect(lazy.values).not.toEqual( {} );
      expect(lazy.values).toEqual( {"myLazyValue":[1],"testValue":1} );
    });
  });

  it("should cache values", function() {
    var cachedValue = given.myLazyValue;
    expect(given.myLazyValue).not.toBe(["a"]);
    expect(given.myLazyValue).toEqual(["a"]);
    expect(given.myLazyValue).toBe(cachedValue);
  });

  it("should ignore unknown lazy-values", function() {
    expect(given.unknownLazyValue).toBeUndefined();
  });
});
