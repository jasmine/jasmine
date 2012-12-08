describe("HtmlReporter", function() {
  var env;
  var htmlReporter;
  var body;
  var fakeDocument;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;


    body = document.createElement("body");
    fakeDocument = { body: body, location: { search: "" } };
    htmlReporter = new jasmine.HtmlReporter(fakeDocument, null, {
      catchingExceptions: function() { return true; },
      catchExceptions: function() { }
    }, {yieldForRender: function(fn) { fn() }});
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
    if (els.length > 0) {
      return els[0];
    }
    throw new Error("couldn't find div with class " + withClass);
  }

  it("should run only specs beginning with spec parameter", function() {
    fakeDocument.location.search = "?spec=run%20this";
    expect(htmlReporter.specFilter(fakeSpec("run this"))).toBeTruthy();
    expect(htmlReporter.specFilter(fakeSpec("not the right spec"))).toBeFalsy();
    expect(htmlReporter.specFilter(fakeSpec("not run this"))).toBeFalsy();
  });

  describe("running without any specs", function() {
    var runner;
    beforeEach(function() {
      runner = env.currentRunner();
      env.addReporter(htmlReporter);
    });

    it("should not error", function() {
      var exec = function() {
        runner.execute();
      };
      expect(exec).not.toThrow();
    });
  });

  describe('Matcher reporting', function() {
    var getResultMessageDiv = function(body) {
      var divs = body.getElementsByTagName("div");
      for (var i = 0; i < divs.length; i++) {
        if (divs[i].className.match(/resultMessage/)) {
          return divs[i];
        }
      }
    };

    var runner, spec, fakeTimer;
    beforeEach(function() {
      env.addReporter(htmlReporter);
    });

    describe('toContain', function() {
      it('should show actual and expected', function() {
        env.describe('test suite', function() {
          env.it('spec 0', function() {
            this.expect('foo').toContain('bar');
          });
        });

        env.execute();

        var resultEl = getResultMessageDiv(body);
        expect(resultEl.innerHTML).toMatch(/foo/);
        expect(resultEl.innerHTML).toMatch(/bar/);
      });
    });
  });

  describe("failure messages (integration)", function() {
    var spec, results, expectationResult;

    it("should add the failure message to the DOM (non-toEquals matchers)", function() {
      env.describe("suite", function() {
        env.it("will have log messages", function() {
          this.expect('a').toBeNull();
        });
      });

      env.addReporter(htmlReporter);
      env.execute();

      var divs = body.getElementsByTagName("div");
      var errorDiv = findElement(divs, 'resultMessage fail');
      expect(errorDiv.innerHTML).toMatch(/Expected 'a' to be null/);
    });

    it("should add the failure message to the DOM (non-toEquals matchers) html escaping", function() {
      env.describe("suite", function() {
        env.it("will have log messages", function() {
          this.expect('1 < 2').toBeNull();
        });
      });

      env.addReporter(htmlReporter);
      env.execute();

      var divs = body.getElementsByTagName("div");
      var errorDiv = findElement(divs, 'resultMessage fail');
      expect(errorDiv.innerHTML).toMatch(/Expected '1 &lt; 2' to be null/);
    });
  });

  describe("duplicate example names", function() {
    it("should report failures correctly", function() {
      var suite1 = env.describe("suite", function() {
        env.it("will have log messages", function() {
          this.expect(true).toBeFalsy();
        });
      });

      var suite2 = env.describe("suite", function() {
        env.it("will have log messages", function() {
          this.expect(true).toBeTruthy();
        });
      });

      env.addReporter(htmlReporter);
      env.execute();

      var divs = body.getElementsByTagName("div");
      var failedSpecDiv = findElement(divs, 'specDetail failed');
      expect(failedSpecDiv.className).toEqual('specDetail failed');
      expect(failedSpecDiv.innerHTML).not.toContain("this one passes!");
    });
  });
});
