describe("RunnableResourceRegistry", function (){
  var registry;

  describe("#setDefaultResources", function(){
    describe("when no parent is provided", function(){
      beforeEach(function(){
        registry = new jasmineUnderTest.RunnableResourceRegistry();
      });

      it("sets empty arrays for spies, getCustomEqualityTesters, customMatchers", function(){
        registry.setDefaultResources("id under test");
        expect(registry.spies("id under test")).toEqual([]);
        expect(registry.getCustomEqualityTesters("id under test")).toEqual([]);
        expect(registry.getCustomMatchers("id under test")).toEqual({});
      });
    });

    describe("when a parent is provided", function(){
      var fakeEqualityTester;
      var fakeCustomMatcher;

      beforeEach(function(){
        registry = new jasmineUnderTest.RunnableResourceRegistry();

        fakeEqualityTester = jasmine.createSpy("fakeEqualityTester");
        fakeCustomMatcher = jasmine.createSpy("fakeCustomMatcher");
        registry = new jasmineUnderTest.RunnableResourceRegistry();
        registry.setDefaultResources("parent");
      });

      it("copies references to parent's getCustomEqualityTesters and customMatchers", function(){
        registry.addCustomEqualityTester("parent", fakeEqualityTester);
        registry.copyCustomMatchers("parent", { fakeMatcher: fakeCustomMatcher });

        registry.setDefaultResources("child", "parent");
        expect(registry.getCustomEqualityTesters("child")).toEqual([fakeEqualityTester]);
        expect(registry.getCustomMatchers("child")).toEqual({ fakeMatcher: fakeCustomMatcher });
      });

      it("sets an empty array for spies", function(){
        registry.setDefaultResources("child", "parent");
        expect(registry.spies("child")).toEqual([]);
      });
    });
  });

  describe("#remove", function() {
    beforeEach(function(){
      registry = new jasmineUnderTest.RunnableResourceRegistry();
    });

    it("deletes the resource from the runnableResources registry", function() {

      registry.setDefaultResources("some_runnable_id");
      expect(registry.spies("some_runnable_id")).toEqual([]);

      registry.remove("some_runnable_id");

      expect(function(){
        registry.spies("some_runnable_id");
      }).toThrow();
    });
  });

  describe("#addCustomEqualityTester", function(){
    beforeEach(function(){
      registry = new jasmineUnderTest.RunnableResourceRegistry();
    });

    it("associates a custom equality tester with a resource", function() {
      var fakeEqualityTester = jasmine.createSpy("fakeEqualityTester");

      registry.setDefaultResources("some_runnable_id");
      registry.addCustomEqualityTester("some_runnable_id", fakeEqualityTester);
      expect(registry.getCustomEqualityTesters("some_runnable_id")).toEqual([fakeEqualityTester]);
    });
  });

  describe("#getCustomGetCustomEqualityTesters", function(){
    beforeEach(function(){
      registry = new jasmineUnderTest.RunnableResourceRegistry();
    });

    it("returns custom equality testers associated with a resource", function() {
      var fakeEqualityTester = jasmine.createSpy("fakeEqualityTester");

      registry.setDefaultResources("some_runnable_id");

      expect(registry.getCustomEqualityTesters("some_runnable_id")).toEqual([]);
      registry.addCustomEqualityTester("some_runnable_id", fakeEqualityTester);

      expect(registry.getCustomEqualityTesters("some_runnable_id")).toEqual([fakeEqualityTester]);
    });
  });

  describe("#getCustomMatchers", function(){
    beforeEach(function(){
      registry = new jasmineUnderTest.RunnableResourceRegistry();
    });

    it("returns a resource's custom matchers", function() {
      var fakeMatchers = { customMatcher0: function(){}, customMatcher1: function(){} };

      registry.setDefaultResources("some_runnable_id");
      registry.copyCustomMatchers("some_runnable_id", fakeMatchers);
      expect(registry.getCustomMatchers("some_runnable_id")).toEqual(fakeMatchers);
    });
  });

  describe("#copyCustomMatchers", function (){
    beforeEach(function(){
      registry = new jasmineUnderTest.RunnableResourceRegistry();
    });

    it("copies an object of custom matchers into a resource's matchers", function (){
      var fakeMatchers = { customMatcher0: function(){}, customMatcher1: function(){} };
      registry.setDefaultResources("some_runnable_id");
      expect(registry.getCustomMatchers("some_runnable_id")).toEqual({});

      registry.copyCustomMatchers("some_runnable_id", fakeMatchers);
      expect(registry.getCustomMatchers("some_runnable_id")).toEqual(fakeMatchers);
    });
  });

  describe("#spies", function (){
    beforeEach(function(){
      registry = new jasmineUnderTest.RunnableResourceRegistry();
      registry.setDefaultResources("some_runnable_id");
    });

    it("returns all spies associated with a resource", function (){
      expect(registry.spies("some_runnable_id")).toEqual([]);
      var spyRegistry = new jasmineUnderTest.SpyRegistry({
        currentSpies: function(){
          return registry.spies("some_runnable_id");
        }
      });

      spyRegistry.spyOn({ someMethod: function(){}}, "someMethod");
      expect(registry.spies("some_runnable_id").length).toBe(1);
    });
  });
});

