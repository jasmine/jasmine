describe("toHaveBeenCalledWith", function() {
  it("passes when the actual was called with matching parameters", function() {
    var fakeSpyDelegate = {
          calls: function() {},
          identity: function() { return "called-spy"; }
        },
        util = {
          contains: jasmine.createSpy("delegated-contains").andReturn(true),
          spyLookup: function() { return fakeSpyDelegate; }
        },
        matcher = j$.matchers.toHaveBeenCalledWith(util),
        calledSpy = jasmine.createSpy("called-spy"),
        result;

    calledSpy('a', 'b');

    result = matcher.compare(calledSpy, "a", "b");

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected spy called-spy not to have been called.");
  });

  it("fails when the actual was not called", function() {
    var fakeSpyDelegate = {
          calls: function() {},
          identity: function() { return "uncalled-spy"; }
        },
        util = {
          contains: jasmine.createSpy("delegated-contains").andReturn(false),
          spyLookup: function() { return fakeSpyDelegate; }
        },
        matcher = j$.matchers.toHaveBeenCalledWith(util),
        uncalledSpy = jasmine.createSpy("uncalled-spy"),
        result;

    result = matcher.compare(uncalledSpy);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected spy uncalled-spy to have been called.");
  });

  it("fails when the actual was called with different parameters", function() {
    var fakeSpyDelegate = {
          calls: function() {},
          identity: function() { return "called-spy"; }

        },
        util = {
          contains: jasmine.createSpy("delegated-contains").andReturn(false),
          spyLookup: function() { return fakeSpyDelegate; }
        },
        matcher = j$.matchers.toHaveBeenCalledWith(util),
        calledSpy = jasmine.createSpy("called-spy"),
        result;

    calledSpy('a');
    result = matcher.compare(calledSpy, "a", "b");

    expect(result.pass).toBe(false);
  });

  it("throws an exception when the actual is not a spy", function() {
    var util = {
          spyLookup: function() { return void 0; }
        },
        matcher = j$.matchers.toHaveBeenCalledWith(util),
        fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrow(new Error("Expected a spy, but got Function."));
  });
});
