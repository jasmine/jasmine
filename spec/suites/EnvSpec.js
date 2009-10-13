describe("jasmine.Env", function() {
  var env;
  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
  });

  describe('ids', function () {

    it('nextSpecId should return consecutive integers, starting at 0', function () {
      expect(env.nextSpecId()).toEqual(0);
      expect(env.nextSpecId()).toEqual(1);
      expect(env.nextSpecId()).toEqual(2);
    });

    it('nextSuiteId should return consecutive integers, starting at 0', function () {
      expect(env.nextSuiteId()).toEqual(0);
      expect(env.nextSuiteId()).toEqual(1);
      expect(env.nextSuiteId()).toEqual(2);
    });
  });
  describe("reporting", function() {
    var fakeReporter;

    beforeEach(function() {
      fakeReporter = jasmine.createSpyObj("fakeReporter", ["log"]);
    });

    describe('version', function () {
      var oldVersion;

      beforeEach(function () {
        oldVersion = jasmine.version_;
      });

      afterEach(function () {
        jasmine.version_ = oldVersion;
      });

      it('should raise an error if version is not set', function () {
        jasmine.version_ = null;
        var exception;
        try {
          env.version();
        }
        catch (e) {
          exception = e;
        }
        expect(exception.message).toEqual('Version not set');

      });

      it("version should return the current version as an int", function() {
        jasmine.version_ = {
          "major": 1,
          "minor": 9,
          "build": 7,
          "revision": 8
        };
        expect(env.version()).toEqual({
          "major": 1,
          "minor": 9,
          "build": 7,
          "revision": 8
        });

      });
    });

    it("should allow reporters to be registered", function() {
      env.addReporter(fakeReporter);
      env.reporter.log("message");
      expect(fakeReporter.log).wasCalledWith("message");
    });
  });
});