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
    fakeDocument.getElementById = function(id) {
      var divs = body.getElementsByTagName("div");
      for (var i = 0; i < divs.length; i++) {
        if (divs[i].id === "HTMLReporter") {
          return divs[i];
        }
      }
      return null;
    };
    htmlReporter = new jasmine.HtmlReporter(fakeDocument);
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
      env.addReporter(htmlReporter);
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

  describe("log messages", function() {
    it("should appear in the report of a failed spec", function() {
      env.describe("suite", function() {
        env.it("will have log messages", function() {
          this.log("this is a", "multipart log message");
          this.expect(true).toBeFalsy();
        });
      });

      env.addReporter(htmlReporter);
      env.execute();

      var divs = body.getElementsByTagName("div");
      var errorDiv = findElement(divs, 'specDetail failed');
      expect(errorDiv.innerHTML).toMatch("this is a multipart log message");
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

      env.addReporter(htmlReporter);
      env.execute();

      var divs = body.getElementsByTagName("div");
      var failedSpecDiv = findElement(divs, 'specDetail failed');
      expect(failedSpecDiv.className).toEqual('specDetail failed');
      expect(failedSpecDiv.innerHTML).toContain("this one fails!");
      expect(failedSpecDiv.innerHTML).not.toContain("this one passes!");
    });
  });

  describe('#reportSpecStarting', function() {
    beforeEach(function () {
      env.describe("suite 1", function() {
        env.it("spec 1", function() {
        });
      });
      spyOn(htmlReporter, 'log').andCallThrough();
    });

    it('DOES NOT log running specs by default', function() {
      env.addReporter(htmlReporter);
      env.execute();

      expect(htmlReporter.log).not.toHaveBeenCalled();
    });

    it('logs running specs when log_running_specs is true', function() {
      htmlReporter.logRunningSpecs = true;
      env.addReporter(htmlReporter);
      env.execute();

      expect(htmlReporter.log).toHaveBeenCalledWith('>> Jasmine Running suite 1 spec 1...');
    });
  });

  describe('result report', function() {
    beforeEach(function () {
      env.describe("some suite", function() {
        env.it("some spec", function() {
          this.log("this one passes!");
          this.expect(true).toBeTruthy();
        });
      });

      env.addReporter(htmlReporter);
    });

    it('should appear in an div element with id HTMLReporter if it exists', function() {
      var div1 = document.createElement("div");
      var div2 = document.createElement("div");
      var div3 = document.createElement("div");

      div1.setAttribute("id", "some_element");
      div2.setAttribute("id", "HTMLReporter");
      div3.setAttribute("id", "another_element");

      div1.appendChild(div2);
      div1.appendChild(div3);
      body.appendChild(div1);

      env.execute();

      expect(body.firstChild.id).toEqual("some_element");
      expect(body.firstChild.childNodes.length).toEqual(2);
      expect(body.lastChild.id).toEqual("some_element");

      var fc = body.firstChild.firstChild;
      expect(fc.id).toEqual("HTMLReporter");
      expect(fc.className).toEqual("jasmine_reporter");
      expect(fc.childNodes.length).toEqual(4);
      expect(fc.childNodes[0].className).toEqual("banner");
      expect(fc.childNodes[1].className).toEqual("symbolSummary");
      expect(fc.childNodes[2].className).toEqual("alert");
      expect(fc.childNodes[3].className).toEqual("results");

      var lc = body.firstChild.lastChild;
      expect(lc.id).toEqual("another_element");
      expect(lc.childNodes.length).toEqual(0);
    });

    it('should appear in a new div element in body if none with id HTMLReporter can be found', function() {
      env.execute();

      var fc = body.firstChild;
      expect(fc.id).toEqual("HTMLReporter");
      expect(fc.className).toEqual("jasmine_reporter");
      expect(fc.childNodes.length).toEqual(4);
      expect(fc.childNodes[0].className).toEqual("banner");
      expect(fc.childNodes[1].className).toEqual("symbolSummary");
      expect(fc.childNodes[2].className).toEqual("alert");
      expect(fc.childNodes[3].className).toEqual("results");

      expect(body.lastChild.id).toEqual("HTMLReporter");
    });
  });
});
