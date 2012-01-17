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

  describe("file load errors", function() {
    function suiteNames(suites) {
      var suiteDescriptions = [];
      for (var i = 0; i < suites.length; i++) {
        suiteDescriptions.push(suites[i].getFullName());
      }
      return suiteDescriptions;
    }

    function messagesFrom(env) {
      var messages = [];
      var suites = env.currentRunner().topLevelSuites();
      for (var i = 0; i < suites.length; i++) {
        var suite = suites[i];
        var subsuites = suite.suites();
        for (var j = 0; j < subsuites.length; j++) {
          suites.push(subsuites[j]);
        }
        var specs = suite.specs();
        for (j = 0; j < specs.length; j++) {
          var spec = specs[j];
          var items = spec.results().getItems();
          for (var k = 0; k < items.length; k++) {
            messages.push("[" + spec.getFullName() + "] " + items[k].toString());
          }
        }
      }
      return messages;
    }

    it("should create no extra suites or specs if the file loads properly", function () {
      env.aboutToLoad("some/file.js");
      env.finishedLoading();
      env.generateFileLoadErrors();

      env.currentRunner().execute();
      var runnerResults = env.currentRunner().results();
      expect(runnerResults.totalCount).toEqual(0);
      expect(runnerResults.passedCount).toEqual(0);
    });

    it("should create a failing spec if a file fails to signal that it loaded", function () {
      env.aboutToLoad("some/file.js");
      env.describe("Specs in some/file");
      env.generateFileLoadErrors();

      env.aboutToLoad("some/other/file.js");
      env.describe("Specs in some/other/file");
      env.generateFileLoadErrors();

      env.currentRunner().execute();
      var runnerResults = env.currentRunner().results();
      expect(runnerResults.totalCount).toEqual(4);
      expect(runnerResults.passedCount).toEqual(0);
      var suites = env.currentRunner().topLevelSuites();
      expect(suiteNames(suites)).toEqual([
        "Specs in some/file",
        "File some/file.js",
        "Specs in some/other/file",
        "File some/other/file.js"
      ]);
    });

    it("should create a failing spec if loading a file generates errors", function () {
      env.aboutToLoad("some/file.js");
      env.loadError("syntax error", "some/file.js", 15);
      env.generateFileLoadErrors();

      env.currentRunner().execute();
      var runnerResults = env.currentRunner().results();
      expect(runnerResults.totalCount).toEqual(2);
      expect(runnerResults.passedCount).toEqual(0);
      var suites = env.currentRunner().topLevelSuites();
      expect(suiteNames(suites)).toEqual([ "File some/file.js" ]);
      expect(messagesFrom(env)).toContain("[File some/file.js should have successfully loaded.] some/file.js: syntax error at some/file.js:15");
    });

    it("should set and restore an error handler via the provided function", function () {
      var fakeOnError = "original value";
      env.aboutToLoad("some/file.js", function(onError) {
        var old = fakeOnError;
        fakeOnError = onError;
        return old;
      });
      expect(fakeOnError).not.toEqual("original value");
      fakeOnError.call(null, "error message", "filename", 123);
      env.finishedLoading();
      expect(fakeOnError).toEqual("original value");

      env.generateFileLoadErrors();

      env.currentRunner().execute();
      var runnerResults = env.currentRunner().results();
      expect(runnerResults.totalCount).toEqual(1);
      expect(runnerResults.passedCount).toEqual(0);
      expect(messagesFrom(env)).toContain("[File some/file.js should have successfully loaded.] some/file.js: error message at filename:123");
    });
  });
});
