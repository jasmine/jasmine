describe("Any", function() {
  it("matches a string", function() {
    var any = new j$.Any(String);

    expect(any.jasmineMatches("foo")).toBe(true);
  });

  it("matches a number", function() {
    var any = new j$.Any(Number);

    expect(any.jasmineMatches(1)).toBe(true);
  });

  it("matches a function", function() {
    var any = new j$.Any(Function);

    expect(any.jasmineMatches(function(){})).toBe(true);
  });

  it("matches an Object", function() {
    var any = new j$.Any(Object);

    expect(any.jasmineMatches({})).toBe(true);
  });
  
  it("matches a Boolean", function() {
    var any = new j$.Any(Boolean);

    expect(any.jasmineMatches(true)).toBe(true);
  });

  it("matches another constructed object", function() {
    var Thing = function() {},
      any = new j$.Any(Thing);

    expect(any.jasmineMatches(new Thing())).toBe(true);
  });

  it("jasmineToString's itself", function() {
    var any = new j$.Any(Number);

    expect(any.jasmineToString()).toMatch('<jasmine.any');
    expect(any.jasmineToString()).toMatch('Number');
  });

});
