describe("jasmine.Env", function() {
  describe("reporting", function() {
    var env;
    var fakeReporter;

    beforeEach(function() {
      env = new jasmine.Env();
      fakeReporter = jasmine.createSpyObj("fakeReporter", ["log"]);
    });

    it("should allow reporters to be registered", function() {
      env.addReporter(fakeReporter);
      env.reporter.log("message");
      expect(fakeReporter.log).wasCalledWith("message");
    });

    xit("should report when the tests start running", function() {
      
    });
  });
});