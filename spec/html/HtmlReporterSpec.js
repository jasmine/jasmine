describe("New HtmlReporter", function() {

  it("builds the initial DOM elements, including the title banner", function() {
    var env = new jasmine.Env(),
      container = document.createElement("div"),
      getContainer = function() { return container; },
      reporter = new jasmine.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); }
      });
    reporter.initialize();

    // Main top-level elements
    var divs = container.getElementsByTagName("div");
    expect(findElement(divs, "html-reporter")).toBeTruthy();
    expect(findElement(divs, "banner")).toBeTruthy();
    expect(findElement(divs, "alert")).toBeTruthy();
    expect(findElement(divs, "results")).toBeTruthy();

    var uls = container.getElementsByTagName("ul");
    expect(findElement(uls, "symbol-summary")).toBeTruthy();

    // title banner
    var banner = container.getElementsByClassName("banner")[0];

    var title = banner.getElementsByClassName("title")[0];
    expect(title.innerHTML).toMatch(/Jasmine/);

    var version = banner.getElementsByClassName("version")[0];
    expect(version.innerHTML).toMatch(/\d+\.\d+\.\d+\srevision\s+\d+/);
  });

  describe("when a spec is done", function() {
    it("reports the status symbol of a disabled spec", function() {
      var env = new jasmine.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
       getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
      reporter.initialize();

      reporter.specDone({id: 789, status: "disabled"});

      var statuses = container.getElementsByClassName('symbol-summary')[0];
      var specEl = statuses.getElementsByTagName('li')[0];
      expect(specEl.getAttribute("class")).toEqual("disabled");
      expect(specEl.getAttribute("id")).toEqual("spec_789");
    });

    it("reports the status symbol of a passing spec", function() {
      var env = new jasmine.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
       getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
      reporter.initialize();

      reporter.specDone({id: 123, status: "passed"});

      var statuses = container.getElementsByClassName("symbol-summary")[0];
      var specEl = statuses.getElementsByTagName("li")[0];
      expect(specEl.getAttribute("class")).toEqual("passed");
      expect(specEl.getAttribute("id")).toEqual("spec_123");
    });

    it("reports the status symbol of a failing spec", function() {
      var env = new jasmine.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
       getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });

      reporter.initialize();

      reporter.specDone({
        id: 345,
        status: "failed",
        failedExpectations: []
      });

      var statuses = container.getElementsByClassName('symbol-summary')[0];
      var specEl = statuses.getElementsByTagName('li')[0];
      expect(specEl.getAttribute("class")).toEqual("failed");
      expect(specEl.getAttribute("id")).toEqual("spec_345");
    });
  });

  describe("when Jasmine is done", function() {
    it("reports the run time", function() {
      var env = new jasmine.Env(),
        fakeNow = jasmine.createSpy('fake Date.now'),
        container = document.createElement("div"),
        getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          now: fakeNow,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });

      reporter.initialize();

      fakeNow.andReturn(500);
      reporter.jasmineStarted({});
      fakeNow.andReturn(600);
      reporter.jasmineDone();

      var banner = container.getElementsByClassName("banner")[0];
      var duration = banner.getElementsByClassName("duration")[0];
      expect(duration.innerHTML).toMatch(/finished in 0.1s/);
    });

    it("reports the suite and spec names with status", function() {
      var env = new jasmine.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.suiteStarted({
        id: 1,
        description: "A Suite",
        fullName: "A Suite"
      });

      var specResult = {
        id: 123,
        description: "with a spec",
        fullName: "A Suite with a spec",
        status: "passed"
      };
      reporter.specStarted(specResult);
      reporter.specDone(specResult);

      reporter.suiteStarted({
        id: 2,
        description: "inner suite",
        fullName: "A Suite inner suite"
      });

      var specResult = {
        id: 124,
        description: "with another spec",
        fullName: "A Suite inner suite with another spec",
        status: "passed"
      };
      reporter.specStarted(specResult);
      reporter.specDone(specResult);

      reporter.suiteDone({id: 2});

      specResult = {
        id: 209,
        description: "with a failing spec",
        fullName: "A Suite inner with a failing spec",
        status: "failed",
        failedExpectations: []
      };
      reporter.specStarted(specResult);
      reporter.specDone(specResult);

      reporter.suiteDone({id: 1});

      reporter.jasmineDone();
      var summary = container.getElementsByClassName("summary")[0];

      console.error("=============>", summary);
      expect(summary.childNodes.length).toEqual(1);

      var outerSuite = summary.childNodes[0];
      expect(outerSuite.childNodes.length).toEqual(4);

      var classes = [];
      for (var i = 0; i < outerSuite.childNodes.length; i++) {
        var node = outerSuite.childNodes[i];
        classes.push(node.getAttribute("class"));
      }
      expect(classes).toEqual(["suite-detail", "specs", "suite", "specs"]);

      var suiteDetail = outerSuite.childNodes[0];
      var suiteLink = suiteDetail.childNodes[0];
      expect(suiteLink.text).toEqual("A Suite");
      expect(suiteLink.getAttribute('href')).toEqual("?spec=A%20Suite");

      var specs = outerSuite.childNodes[1];
      var spec = specs.childNodes[0];
      expect(spec.getAttribute("class")).toEqual("passed");
      expect(spec.getAttribute("id")).toEqual("spec-123");

      var specLink = spec.childNodes[0];
      expect(specLink.text).toEqual("with a spec");
      expect(specLink.getAttribute("href")).toEqual("?spec=A%20Suite%20with%20a%20spec");
//      expect(specLink.getAttribute("title")).toEqual("A Suite with a spec");
    });

    describe("UI for raising/catching exceptions", function() {
      it("should be unchecked if the env is catching", function() {
        var env = new jasmine.Env(),
          container = document.createElement("div"),
          getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() { return document.createElement.apply(document, arguments); },
            createTextNode: function() { return document.createTextNode.apply(document, arguments); }
          });

        reporter.initialize();
        reporter.jasmineDone();

        var raisingExceptionsUI = container.getElementsByClassName("raise")[0];
        expect(raisingExceptionsUI.checked).toBe(false);
      });

      it("should be checked if the env is not catching", function() {
        var env = new jasmine.Env(),
          container = document.createElement("div"),
          fakeQueryString = "",
          fakeWindowLocation = {
            search: fakeQueryString
          },
          queryString = new jasmine.QueryString({
            getWindowLocation: function() { return fakeWindowLocation; }
          }),
          getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
            env: env,
            getContainer: getContainer,
            queryString: queryString,
            createElement: function() { return document.createElement.apply(document, arguments); },
            createTextNode: function() { return document.createTextNode.apply(document, arguments); }
          });

        reporter.initialize();
        env.catchExceptions(false);
        reporter.jasmineDone();

        var raisingExceptionsUI = container.getElementsByClassName("raise")[0];
        expect(raisingExceptionsUI.checked).toBe(true);
      });

      it("should affect the query param for catching exceptions", function() {
        var env = new jasmine.Env(),
          container = document.createElement("div"),
          fakeQueryString = "",
          fakeWindowLocation = {
            search: fakeQueryString
          },
          queryString = new jasmine.QueryString({
            getWindowLocation: function() { return fakeWindowLocation; }
          }),
          getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
            env: env,
            getContainer: getContainer,
            queryString: queryString,
            createElement: function() { return document.createElement.apply(document, arguments); },
            createTextNode: function() { return document.createTextNode.apply(document, arguments); }
          });

        reporter.initialize();
        reporter.jasmineDone();

        var input = container.getElementsByClassName("raise")[0];
        input.click();
        expect(queryString.getParam("catch")).toEqual(false);

        input.click();
        expect(queryString.getParam("catch")).toEqual(true);
      });
    });

    describe("and all specs pass", function() {
      var env, container, reporter;
      beforeEach(function() {
        env = new jasmine.Env();
        container = document.createElement("div");
        getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.specDone({
          id: 123,
          description: "with a spec",
          fullName: "A Suite with a spec",
          status: "passed"
        });
        reporter.specDone({
          id: 124,
          description: "with another spec",
          fullName: "A Suite inner suite with another spec",
          status: "passed"
        });
        reporter.jasmineDone();
      });

      it("reports the specs counts", function() {
        var alert = container.getElementsByClassName("alert")[0];
        var alertBars = alert.getElementsByClassName("bar");

        expect(alertBars.length).toEqual(1);
        expect(alertBars[0].getAttribute('class')).toMatch(/passed/);
        expect(alertBars[0].innerHTML).toMatch(/2 specs, 0 failures/);
      });

      it("reports no failure details", function() {
        var specFailure = container.getElementsByClassName("failures")[0];

        expect(specFailure.childNodes.length).toEqual(0);
      });
    });

    describe("and some tests fail", function() {
      var env, container, reporter;

      beforeEach(function() {
        env = new jasmine.Env();
        container = document.createElement("div");
        getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
        reporter.initialize();

        reporter.jasmineStarted({});

        var passingResult = {id: 123, status: "passed"};
        reporter.specStarted(passingResult);
        reporter.specDone(passingResult);

        var failingResult = {
          id: 124,
          status: "failed",
          description: "a failing spec",
          fullName: "a suite with a failing spec",
          failedExpectations: [
            {
              message: "a failure message",
              trace: {
                stack: "a stack trace"
              }
            }
          ]
        };
        reporter.specStarted(failingResult);
        reporter.specDone(failingResult);
        reporter.jasmineDone();
      });

      it("reports the specs counts", function() {
        var alert = container.getElementsByClassName("alert")[0];
        var alertBars = alert.getElementsByClassName("bar");

        expect(alertBars[0].getAttribute('class')).toMatch(/failed/);
        expect(alertBars[0].innerHTML).toMatch(/2 specs, 1 failure/);
      });

      it("reports failure messages and stack traces", function() {
        var specFailures = container.getElementsByClassName("failures")[0];

        var failure = specFailures.childNodes[0];
        expect(failure.getAttribute("class")).toMatch(/failed/);
        expect(failure.getAttribute("class")).toMatch(/spec-detail/);

        var specLink = failure.childNodes[0];
        expect(specLink.getAttribute("class")).toEqual("description");
        expect(specLink.getAttribute("title")).toEqual("a suite with a failing spec");
        expect(specLink.getAttribute("href")).toEqual("?spec=a%20suite%20with%20a%20failing%20spec");

        var message = failure.childNodes[1].childNodes[0];
        expect(message.getAttribute("class")).toEqual("result-message");
        expect(message.innerHTML).toEqual("a failure message");

        var stackTrace = failure.childNodes[1].childNodes[1];
        expect(stackTrace.getAttribute("class")).toEqual("stack-trace");
        expect(stackTrace.innerHTML).toEqual("a stack trace");
      });

      it("allows switching between failure details and the spec summary", function() {
        var menuBar = container.getElementsByClassName("bar")[1];

        expect(menuBar.getAttribute("class")).not.toMatch(/hidden/);

        var link = menuBar.getElementsByTagName('a')[0];
        expect(link.text).toEqual("Failures");
        expect(link.getAttribute("href")).toEqual("#");
      });

      it("sets the reporter to 'Failures List' mode", function() {
        var reporterNode = container.getElementsByClassName("html-reporter")[0];
        expect(reporterNode.getAttribute("class")).toMatch("failure-list");
      });
    });
  });

  describe("specFilter", function() {

    it("always returns true if there is no filter", function() {
      var env = new jasmine.Env(),
        container = document.createElement("div"),
        fakeQueryString = "",
        fakeWindowLocation = {
          search: fakeQueryString
        },
        queryString = new jasmine.QueryString({
          getWindowLocation: function() { return fakeWindowLocation; }
        }),
        getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          queryString: queryString,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        }),
        fakeSpec = {
          getFullName: function() { return "A suite with a spec"}
        };

      expect(reporter.specFilter(fakeSpec)).toBe(true);
    });

    it("matches a focused spec name", function() {
      var env = new jasmine.Env(),
        container = document.createElement("div"),
        fakeWindowLocation = {
          search: "?spec=A%20suite%20with%20a%20spec"
        },
        queryString = new jasmine.QueryString({
          getWindowLocation: function() { return fakeWindowLocation; }
        }),
        getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          queryString: queryString,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        }),
        fakeMatchingSpec = {
          getFullName: function() { return "A suite with a spec"}
        },
        fakeNonMatchingSpec = {
          getFullName: function() { return "sasquatch"}
        };

      expect(reporter.specFilter(fakeMatchingSpec)).toBe(true);
      expect(reporter.specFilter(fakeNonMatchingSpec)).toBe(false);
    });

    it("matches a substring of a spec name", function() {
      var env = new jasmine.Env(),
        container = document.createElement("div"),
        fakeWindowLocation = {
          search: "?spec=with"
        },
        queryString = new jasmine.QueryString({
          getWindowLocation: function() { return fakeWindowLocation; }
        }),
        getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          queryString: queryString,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        }),
        fakeMatchingSpec = {
          getFullName: function() { return "A suite with a spec" }
        },
        fakeNonMatchingSpec = {
          getFullName: function() { return "sasquatch"}
        };

      expect(reporter.specFilter(fakeMatchingSpec)).toBe(true);
      expect(reporter.specFilter(fakeNonMatchingSpec)).toBe(false);
    });
  });

  describe("when specs are filtered", function() {
    it("shows the count of run specs and defined specs", function() {
      var env = new jasmine.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
       reporter = new jasmine.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });

      reporter.initialize();

      reporter.jasmineStarted({
        totalSpecsDefined: 2
      });
      reporter.specDone({
        id: 123,
        description: "with a spec",
        fullName: "A Suite with a spec",
        status: "passed"
      });
      reporter.specDone({
        id: 124,
        description: "with another spec",
        fullName: "A Suite inner suite with another spec",
        status: "disabled"
      });
      reporter.jasmineDone();

      var skippedBar = container.getElementsByClassName("bar")[0];
      expect(skippedBar.getAttribute("class")).toMatch(/skipped/);

      var runAllLink = skippedBar.childNodes[0];
      expect(runAllLink.getAttribute("href")).toEqual("?");
      expect(runAllLink.text).toMatch(/Ran \d+ of \d+ specs - run all/);
    });
  });

  // try/catch

  // utility functions
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
});
