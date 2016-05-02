describe("RunnableResourceRepository", function (){
  var repo;

  describe("#setDefaultResources", function(){
    describe("when no parent is provided", function(){
      beforeEach(function(){
        repo = new jasmineUnderTest.RunnableResourceRepository();
      });

      it("sets empty arrays for spies, customEqualityTesters, customMatchers", function(){
        repo.setDefaultResources("id under test");
        expect(repo.spies("id under test")).toEqual([]);
        expect(repo.equalityTesters("id under test")).toEqual([]);
        expect(repo.customMatchers("id under test")).toEqual({});
      });
    });

    describe("when a parent is provided", function(){
      var fakeEqualityTester;
      var fakeCustomMatcher;

      beforeEach(function(){
        repo = new jasmineUnderTest.RunnableResourceRepository();

        fakeEqualityTester = jasmine.createSpy("fakeEqualityTester");
        fakeCustomMatcher = jasmine.createSpy("fakeCustomMatcher");
        repo = new jasmineUnderTest.RunnableResourceRepository();
        repo.setDefaultResources("parent");
      });

      it("copies references to parent's customEqualityTesters and customMatchers", function(){
        repo.customEqualityTesters("parent", fakeEqualityTester);
        repo.addMatchers("parent", { fakeMatcher: fakeCustomMatcher });

        repo.setDefaultResources("child", "parent");
        expect(repo.equalityTesters("child")).toEqual([fakeEqualityTester]);
        expect(repo.customMatchers("child")).toEqual({ fakeMatcher: fakeCustomMatcher });
      });

      it("sets an empty array for spies", function(){
        repo.setDefaultResources("child", "parent");
        expect(repo.spies("child")).toEqual([]);
      });
    });
  });

  describe("#clear", function() {
    beforeEach(function(){
      repo = new jasmineUnderTest.RunnableResourceRepository();
    });

    it("deletes the resource from the runnableResources repo", function() {

      repo.setDefaultResources("some_runnable_id");
      expect(repo.spies("some_runnable_id")).toEqual([]);

      repo.clear("some_runnable_id");

      expect(function(){
        repo.spies("some_runnable_id");
      }).toThrow();
    });
  });

  // TODO fix naming
  describe("#customEqualityTesters", function(){
    beforeEach(function(){
      repo = new jasmineUnderTest.RunnableResourceRepository();
    });

    it("associates a custom equality tester with a resource", function() {
      var fakeEqualityTester = jasmine.createSpy("fakeEqualityTester");

      repo.setDefaultResources("some_runnable_id");
      repo.customEqualityTesters("some_runnable_id", fakeEqualityTester);
      expect(repo.equalityTesters("some_runnable_id")).toEqual([fakeEqualityTester]);
    });
  });

  describe("#equalityTesters", function(){
    beforeEach(function(){
      repo = new jasmineUnderTest.RunnableResourceRepository();
    });

    it("returns custom equality testers associated with a resource", function() {
      var fakeEqualityTester = jasmine.createSpy("fakeEqualityTester");

      repo.setDefaultResources("some_runnable_id");

      expect(repo.equalityTesters("some_runnable_id")).toEqual([]);
      repo.customEqualityTesters("some_runnable_id", fakeEqualityTester);

      expect(repo.equalityTesters("some_runnable_id")).toEqual([fakeEqualityTester]);
    });
  });

  describe("#customMatchers", function(){
    beforeEach(function(){
      repo = new jasmineUnderTest.RunnableResourceRepository();
    });

    it("returns a resource's custom matchers", function() {
      var fakeMatchers = { customMatcher0: function(){}, customMatcher1: function(){} };

      repo.setDefaultResources("some_runnable_id");
      repo.addMatchers("some_runnable_id", fakeMatchers);
      expect(repo.customMatchers("some_runnable_id")).toEqual(fakeMatchers);
    });
  });

  describe("#addMatchers", function (){
    beforeEach(function(){
      repo = new jasmineUnderTest.RunnableResourceRepository();
    });

    it("copies an object of custom matchers into a resource's matchers", function (){
      var fakeMatchers = { customMatcher0: function(){}, customMatcher1: function(){} };
      repo.setDefaultResources("some_runnable_id");
      expect(repo.customMatchers("some_runnable_id")).toEqual({});

      repo.addMatchers("some_runnable_id", fakeMatchers);
      expect(repo.customMatchers("some_runnable_id")).toEqual(fakeMatchers);
    });
  });

  describe("#spies", function (){
    beforeEach(function(){
      repo = new jasmineUnderTest.RunnableResourceRepository();
      repo.setDefaultResources("some_runnable_id");
    });

    it("returns all spies associated with a resource", function (){
      expect(repo.spies("some_runnable_id")).toEqual([]);
      var spyRegistry = new jasmineUnderTest.SpyRegistry({
        currentSpies: function(){
          return repo.spies("some_runnable_id");
        }
      });

      spyRegistry.spyOn({ someMethod: function(){}}, "someMethod");
      expect(repo.spies("some_runnable_id").length).toBe(1);
    });
  });
});

