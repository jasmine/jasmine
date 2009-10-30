describe("TrivialReporter", function() {
  var trivialReporter;
  var body;

  beforeEach(function() {
    body = document.createElement("body");
  });

  function fakeSpec(name) {
    return {
      getFullName: function() {
        return name;
      }
    };
  }

  it("should run only specs beginning with spec parameter", function() {
    var trivialReporter = new jasmine.TrivialReporter({ location: {search: "?spec=run%20this"} });
    expect(trivialReporter.specFilter(fakeSpec("run this"))).toBeTruthy();
    expect(trivialReporter.specFilter(fakeSpec("not the right spec"))).toBeFalsy();
    expect(trivialReporter.specFilter(fakeSpec("not run this"))).toBeFalsy();
  });

  it("should display empty divs for every suite when the runner is starting", function() {
    var trivialReporter = new jasmine.TrivialReporter({ body: body });
    trivialReporter.reportRunnerStarting({
      suites: function() {
        return [ new jasmine.Suite({}, "suite 1", null, null) ];
      }
    });

    var divs = body.getElementsByTagName("div");
    expect(divs.length).toEqual(2);
    expect(divs[1].innerHTML).toContain("suite 1");
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
      var env = new jasmine.Env();
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
      var trivialReporter = new jasmine.TrivialReporter({ body: body, location: {search: "?"} });
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

      spec = {
        suite: {
          getFullName: function() {
            return "suite 1";
          }
        },
        getFullName: function() {
          return "foo";
        },
        results: function() {
          return results;
        }
      };

      trivialReporter = new jasmine.TrivialReporter({ body: body });
      trivialReporter.reportRunnerStarting({
        suites: function() {
          return [ new jasmine.Suite({}, "suite 1", null, null) ];
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
      expect(divs[3].innerHTML).toEqual("Expected 'a' to be null, but it was not");
    });
  });

});
