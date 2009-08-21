describe("jasmine.Env", function() {
  describe("reporting", function() {
    var env;
    var fakeReporter;

    beforeEach(function() {
      env = new jasmine.Env();
      fakeReporter = jasmine.createSpyObj("fakeReporter", ["log"]);
    });

    it("version should return the current version as an int", function() {
      var oldVersion = jasmine.version_;
      jasmine.version_ = {
       "major": 1,
       "minor": 9,
       "build": 7,
       "revision": 8
      };
      expect(env.version()).toEqual(1978);
      jasmine.version_ = oldVersion;
    });

    it("should allow reporters to be registered", function() {
      env.addReporter(fakeReporter);
      env.reporter.log("message");
      expect(fakeReporter.log).wasCalledWith("message");
    });
  });
});