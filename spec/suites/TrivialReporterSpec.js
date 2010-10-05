describe("TrivialReporter", function() {
  var env;
  var trivialReporter;
  var body;
  var fakeDocument;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;

    body = document.createElement("body");
    fakeDocument = { body: body, location: { search: "" } };
    trivialReporter = new jasmine.TrivialReporter(fakeDocument);
  });

  function fakeSpec(name) {
    return {
      getFullName: function() {
        return name;
      }
    };
  }

  function findElements(divs, withClass) {
    var els = [];
    for (var i = 0; i < divs.length; i++) {
      if (divs[i].className == withClass) els.push(divs[i]);
    }
    return els;
  }

  function findElement(divs, withClass) {
    var els = findElements(divs, withClass);
    if (els.length > 0) return els[0];
    throw new Error("couldn't find div with class " + withClass);
  }

  it("should run only specs beginning with spec parameter", function() {
    fakeDocument.location.search = "?spec=run%20this";
    expect(trivialReporter.specFilter(fakeSpec("run this"))).toBeTruthy();
    expect(trivialReporter.specFilter(fakeSpec("not the right spec"))).toBeFalsy();
    expect(trivialReporter.specFilter(fakeSpec("not run this"))).toBeFalsy();
  });

  it("should display empty divs for every suite when the runner is starting", function() {
    trivialReporter.reportRunnerStarting({
      env: env,
      suites: function() {
        return [ new jasmine.Suite({}, "suite 1", null, null) ];
      }
    });

    var divs = findElements(body.getElementsByTagName("div"), "suite");
    expect(divs.length).toEqual(1);
    expect(divs[0].innerHTML).toContain("suite 1");
  });

  describe('Matcher reporting', function () {
    var getResultMessageDiv = function (body) {
      var divs = body.getElementsByTagName("div");
      for (var i = 0; i < divs.length; i++) {
        if (divs[i].className.match(/resultMessage/)) {
          return divs[i];
        }
      }
    };

    var runner, spec, fakeTimer;
    beforeEach(function () {
      fakeTimer = new jasmine.FakeTimer();
      env.setTimeout = fakeTimer.setTimeout;
      env.clearTimeout = fakeTimer.clearTimeout;
      env.setInterval = fakeTimer.setInterval;
      env.clearInterval = fakeTimer.clearInterval;
      runner = env.currentRunner();
      var suite = new jasmine.Suite(env, 'some suite');
      runner.add(suite);
      spec = new jasmine.Spec(env, suite, 'some spec');
      suite.add(spec);
      fakeDocument.location.search = "?";
      env.addReporter(trivialReporter);
    });

    describe('toContain', function () {
      it('should show actual and expected', function () {
        spec.runs(function () {
          this.expect('foo').toContain('bar');
        });
        runner.execute();
        fakeTimer.tick(0);

        var resultEl = getResultMessageDiv(body);
        expect(resultEl.innerHTML).toMatch(/foo/);
        expect(resultEl.innerHTML).toMatch(/bar/);
      });
    });
  });


  describe("failure messages (integration)", function () {
    var spec, results, expectationResult;

    beforeEach(function() {
      results = {
        passed: function() {
          return false;
        },
        getItems: function() {
        }};

      var suite1 = new jasmine.Suite(env, "suite 1", null, null);

      spec = {
        suite: suite1,
        getFullName: function() {
          return "foo";
        },
        results: function() {
          return results;
        }
      };

      trivialReporter.reportRunnerStarting({
        env: env,
        suites: function() {
          return [ suite1 ];
        }
      });
    });

    it("should add the failure message to the DOM (non-toEquals matchers)", function() {
      expectationResult = new jasmine.ExpectationResult({
        matcherName: "toBeNull", passed: false, message: "Expected 'a' to be null, but it was not"
      });

      spyOn(results, 'getItems').andReturn([expectationResult]);

      trivialReporter.reportSpecResults(spec);

      var divs = body.getElementsByTagName("div");
      var errorDiv = findElement(divs, 'resultMessage fail');
      expect(errorDiv.innerHTML).toEqual("Expected 'a' to be null, but it was not");
    });

    it("should add the failure message to the DOM (non-toEquals matchers) html escaping", function() {
      expectationResult = new jasmine.ExpectationResult({
        matcherName: "toBeNull", passed: false, message: "Expected '1 < 2' to <b>e null, & it was not"
      });

      spyOn(results, 'getItems').andReturn([expectationResult]);

      trivialReporter.reportSpecResults(spec);

      var divs = body.getElementsByTagName("div");
      var errorDiv = findElement(divs, 'resultMessage fail');
      expect(errorDiv.innerHTML).toEqual("Expected '1 &lt; 2' to &lt;b&gt;e null, &amp; it was not");
    });
  });

  describe("log messages", function() {
    it("should appear in the report", function() {
      env.describe("suite", function() {
        env.it("will have log messages", function() {
          this.log("this is a", "multipart log message");
        });
      });

      env.addReporter(trivialReporter);
      env.execute();

      var divs = body.getElementsByTagName("div");
      var errorDiv = findElement(divs, 'resultMessage log');
      expect(errorDiv.innerHTML).toEqual("this is a multipart log message");
    });

    xit("should work on IE without console.log.apply", function() {
    });
  });

  describe("duplicate example names", function() {
    it("should report failures correctly", function() {
      var suite1 = env.describe("suite", function() {
        env.it("will have log messages", function() {
          this.log("this one fails!");
          this.expect(true).toBeFalsy();
        });
      });

      var suite2 = env.describe("suite", function() {
        env.it("will have log messages", function() {
          this.log("this one passes!");
          this.expect(true).toBeTruthy();
        });
      });

      env.addReporter(trivialReporter);
      env.execute();

      var divs = body.getElementsByTagName("div");
      var passedSpecDiv = findElement(divs, 'suite passed');
      expect(passedSpecDiv.className).toEqual('suite passed');
      expect(passedSpecDiv.innerHTML).toContain("this one passes!");
      expect(passedSpecDiv.innerHTML).not.toContain("this one fails!");

      var failedSpecDiv = findElement(divs, 'suite failed');
      expect(failedSpecDiv.className).toEqual('suite failed');
      expect(failedSpecDiv.innerHTML).toContain("this one fails!");
      expect(failedSpecDiv.innerHTML).not.toContain("this one passes!");
    });
  });

  describe('#reportSpecStarting', function() {
    var spec1;
    beforeEach(function () {
      env.describe("suite 1", function() {
        spec1 = env.it("spec 1", function() {
        });
      });
    });

    it('DOES NOT log running specs by default', function() {
      spyOn(trivialReporter, 'log');

      trivialReporter.reportSpecStarting(spec1);

      expect(trivialReporter.log).not.toHaveBeenCalled();
    });

    it('logs running specs when log_running_specs is true', function() {
      trivialReporter.logRunningSpecs = true;
      spyOn(trivialReporter, 'log');

      trivialReporter.reportSpecStarting(spec1);

      expect(trivialReporter.log).toHaveBeenCalledWith('>> Jasmine Running suite 1 spec 1...');
    });
  });
});
