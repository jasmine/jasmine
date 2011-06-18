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

      describe("versionString", function() {
        it("should return a stringified version number", function() {
          jasmine.version_ = {
            "major": 1,
            "minor": 9,
            "build": 7,
            "release_candidate": "1",
            "revision": 8
          };
          expect(env.versionString()).toEqual("1.9.7.rc1 revision 8");
        });

        it("should return a nice string when version is unknown", function() {
          jasmine.version_ = null;
          expect(env.versionString()).toEqual("version unknown");
        });
      });
    });

    it("should allow reporters to be registered", function() {
      env.addReporter(fakeReporter);
      env.reporter.log("message");
      expect(fakeReporter.log).toHaveBeenCalledWith("message");
    });
  });

  describe("equality testing", function() {
    describe("with custom equality testers", function() {
      var aObj, bObj, isEqual;

      beforeEach(function() {
        env.addEqualityTester(function(a, b) {
          aObj = a;
          bObj = b;
          return isEqual;
        });
      });

      it("should call the custom equality tester with two objects for comparison", function() {
        env.equals_("1", "2");
        expect(aObj).toEqual("1");
        expect(bObj).toEqual("2");
      });

      describe("when the custom equality tester returns false", function() {
        beforeEach(function() {
          isEqual = false;
        });

        it("should give custom equality testers precedence", function() {
          expect(env.equals_('abc', 'abc')).toBeFalsy();
          var o = {};
          expect(env.equals_(o, o)).toBeFalsy();
        });
      });


      describe("when the custom equality tester returns true", function() {
        beforeEach(function() {
          isEqual = true;
        });

        it("should give custom equality testers precedence", function() {
          expect(env.equals_('abc', 'def')).toBeTruthy();
          expect(env.equals_(true, false)).toBeTruthy();
        });
      });

      describe("when the custom equality tester returns undefined", function() {
        beforeEach(function() {
          isEqual = jasmine.undefined;
        });

        it("should use normal equality rules", function() {
          expect(env.equals_('abc', 'abc')).toBeTruthy();
          expect(env.equals_('abc', 'def')).toBeFalsy();
        });

        describe("even if there are several", function() {
          beforeEach(function() {
            env.addEqualityTester(function(a, b) { return jasmine.undefined; });
            env.addEqualityTester(function(a, b) { return jasmine.undefined; });
          });

          it("should use normal equality rules", function() {
            expect(env.equals_('abc', 'abc')).toBeTruthy();
            expect(env.equals_('abc', 'def')).toBeFalsy();
          });
        });
      });

      it("should evaluate custom equality testers in the order they are declared", function() {
        isEqual = false;
        env.addEqualityTester(function(a, b) { return true; });
        expect(env.equals_('abc', 'abc')).toBeFalsy();
      });
    });
  });
});
