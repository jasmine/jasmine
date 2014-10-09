describe("New HtmlReporter", function() {
  // TODO: Figure out why this isn't rendering...
  it("builds the initial DOM elements, including the title banner", function() {
    var env = new j$.Env(),
      container = document.createElement("div"),
      getContainer = function() { return container; },
      reporter = new j$.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); }
      });
    reporter.initialize();

    // Main top-level elements
    expect(container.querySelector("div.jasmine_html-reporter")).toBeTruthy();
    expect(container.querySelector("div.banner")).toBeTruthy();
    expect(container.querySelector("div.alert")).toBeTruthy();
    expect(container.querySelector("div.results")).toBeTruthy();

    expect(container.querySelector("ul.symbol-summary")).toBeTruthy();

    // title banner
    var banner = container.querySelector(".banner");

    var title = banner.querySelector("a.title");
    expect(title.getAttribute('href')).toEqual('http://jasmine.github.io/');
    expect(title.getAttribute('target')).toEqual('_blank');

    var version = banner.querySelector(".version"),
      versionText = 'textContent' in version ? version.textContent : version.innerText;
    expect(versionText).toEqual(j$.version);
  });

  it("builds a single reporter even if initialized multiple times", function() {
    var env = new j$.Env(),
      container = document.createElement("div"),
      getContainer = function() { return container; },
      reporter = new j$.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); }
      });
    reporter.initialize();
    reporter.initialize();
    reporter.initialize();

    expect(container.querySelectorAll("div.jasmine_html-reporter").length).toEqual(1);
  });

  it("starts the timer when jasmine begins", function() {
    var env = new jasmine.Env(),
        startTimerSpy = jasmine.createSpy("start-timer-spy"),
        reporter = new j$.HtmlReporter({
          env: env,
          createElement: function() { return document.createElement.apply(document, arguments); },
          timer: { start: startTimerSpy }
        });

    reporter.jasmineStarted({});

    expect(startTimerSpy).toHaveBeenCalled();
  });

  describe("when a spec is done", function() {
    it("logs errors to the console and prints a special symbol if it is an empty spec", function() {
      if (typeof console === "undefined") {
        console = { error: function(){} };
      }

      var env = new j$.Env(),
      container = document.createElement('div'),
      getContainer = function() {return container;},
      reporter = new j$.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); }
      });

      spyOn(console, 'error');

      reporter.initialize();

      reporter.specDone({
        status: "passed",
        fullName: 'Some Name',
        passedExpectations: [],
        failedExpectations: []
      });
      expect(console.error).toHaveBeenCalledWith("Spec \'Some Name\' has no expectations.");
      var specEl = container.querySelector('.symbol-summary li');
      expect(specEl.getAttribute("class")).toEqual("empty");
    });

    it("reports the status symbol of a disabled spec", function() {
      var env = new j$.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
        reporter = new j$.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
      reporter.initialize();

      reporter.specDone({id: 789, status: "disabled", fullName: "symbols should have titles", passedExpectations: [], failedExpectations: []});

      var specEl = container.querySelector('.symbol-summary li');
      expect(specEl.getAttribute("class")).toEqual("disabled");
      expect(specEl.getAttribute("id")).toEqual("spec_789");
      expect(specEl.getAttribute("title")).toEqual("symbols should have titles");
    });

    it("reports the status symbol of a pending spec", function() {
      var env = new j$.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
        reporter = new j$.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
      reporter.initialize();

      reporter.specDone({id: 789, status: "pending", passedExpectations: [], failedExpectations: []});

      var specEl = container.querySelector('.symbol-summary li');
      expect(specEl.getAttribute("class")).toEqual("pending");
      expect(specEl.getAttribute("id")).toEqual("spec_789");
    });

    it("reports the status symbol of a passing spec", function() {
      var env = new j$.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
        reporter = new j$.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
      reporter.initialize();

      reporter.specDone({id: 123, status: "passed", passedExpectations: [{passed: true}], failedExpectations: []});

      var statuses = container.querySelector(".symbol-summary");
      var specEl = statuses.querySelector("li");
      expect(specEl.getAttribute("class")).toEqual("passed");
      expect(specEl.getAttribute("id")).toEqual("spec_123");
    });

    it("reports the status symbol of a failing spec", function() {
      var env = new j$.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
        reporter = new j$.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });

      reporter.initialize();

      reporter.specDone({
        id: 345,
        status: "failed",
        failedExpectations: [],
        passedExpectations: []
      });

      var specEl = container.querySelector(".symbol-summary li");
      expect(specEl.getAttribute("class")).toEqual("failed");
      expect(specEl.getAttribute("id")).toEqual("spec_345");
    });
  });

  describe("when there are suite failures", function () {
    it("displays the exceptions in their own alert bars", function(){
      var env = new j$.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
        reporter = new j$.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });

      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.suiteDone({ status: 'failed', failedExpectations: [{ message: 'My After All Exception' }] });
      reporter.suiteDone({ status: 'failed', failedExpectations: [{ message: 'My Other Exception' }] });
      reporter.jasmineDone({});

      var alertBars = container.querySelectorAll(".alert .bar");

      expect(alertBars.length).toEqual(3);
      expect(alertBars[1].innerHTML).toMatch(/My After All Exception/);
      expect(alertBars[1].getAttribute("class")).toEqual('bar errored');
      expect(alertBars[2].innerHTML).toMatch(/My Other Exception/);
    });
  });

  describe("when Jasmine is done", function() {
    it("adds EMPTY to the link title of specs that have no expectations", function() {
      if (!window.console) {
        window.console = { error: function(){} };
      }
      var env = new j$.Env(),
      container = document.createElement('div'),
      getContainer = function() {return container;},
      reporter = new j$.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); }
      });

      spyOn(console, 'error');

      reporter.initialize();
      reporter.jasmineStarted({});
      reporter.suiteStarted({id: 1});
      reporter.specStarted({id: 1, status: 'passed', passedExpectations: [], failedExpectations: []});
      reporter.specDone({
        id: 1,
        status: 'passed',
        description: 'Spec Description',
        passedExpectations: [],
        failedExpectations: []
      });
      reporter.suiteDone({id: 1});
      reporter.jasmineDone({});

      var summary = container.querySelector('.summary');
      var suite = summary.childNodes[0];
      var specs = suite.childNodes[1];
      var spec = specs.childNodes[0];
      var specLink = spec.childNodes[0];
      expect(specLink.innerHTML).toMatch(/SPEC HAS NO EXPECTATIONS/);
    });

    it("reports the run time", function() {
      var env = new j$.Env(),
        container = document.createElement("div"),
        timer = jasmine.createSpyObj('timer', ['start', 'elapsed']),
        getContainer = function() { return container; },
        reporter = new j$.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); },
          timer: timer
        });

      reporter.initialize();

      reporter.jasmineStarted({});

      timer.elapsed.and.returnValue(100);
      reporter.jasmineDone();

      var duration = container.querySelector(".banner .duration");
      expect(duration.innerHTML).toMatch(/finished in 0.1s/);
    });

    it("reports the suite and spec names with status", function() {
      var env = new j$.Env(),
        container = document.createElement("div"),
        getContainer = function() { return container; },
        reporter = new j$.HtmlReporter({
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
        status: "passed",
        failedExpectations: [],
        passedExpectations: [{passed: true}]
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
        status: "passed",
        failedExpectations: [],
        passedExpectations: [{passed: true}]
      };
      reporter.specStarted(specResult);
      reporter.specDone(specResult);

      reporter.suiteDone({id: 2});

      specResult = {
        id: 209,
        description: "with a failing spec",
        fullName: "A Suite inner with a failing spec",
        status: "failed",
        failedExpectations: [{}],
        passedExpectations: []
      };
      reporter.specStarted(specResult);
      reporter.specDone(specResult);

      reporter.suiteDone({id: 1});

      reporter.jasmineDone({});
      var summary = container.querySelector(".summary");

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
      expect(suiteLink.innerHTML).toEqual("A Suite");
      expect(suiteLink.getAttribute('href')).toEqual("?spec=A%20Suite");

      var specs = outerSuite.childNodes[1];
      var spec = specs.childNodes[0];
      expect(spec.getAttribute("class")).toEqual("passed");
      expect(spec.getAttribute("id")).toEqual("spec-123");

      var specLink = spec.childNodes[0];
      expect(specLink.innerHTML).toEqual("with a spec");
      expect(specLink.getAttribute("href")).toEqual("?spec=A%20Suite%20with%20a%20spec");
//      expect(specLink.getAttribute("title")).toEqual("A Suite with a spec");
    });

    describe("UI for raising/catching exceptions", function() {
      it("should be unchecked if the env is catching", function() {
        var env = new j$.Env(),
          container = document.createElement("div"),
          getContainer = function() {
            return container;
          },
          reporter = new j$.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        reporter.jasmineDone({});

        var raisingExceptionsUI = container.querySelector(".raise");
        expect(raisingExceptionsUI.checked).toBe(false);
      });

      it("should be checked if the env is not catching", function() {
        var env = new j$.Env(),
          container = document.createElement("div"),
          getContainer = function() {
            return container;
          },
          reporter = new j$.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        env.catchExceptions(false);
        reporter.jasmineDone({});

        var raisingExceptionsUI = container.querySelector(".raise");
        expect(raisingExceptionsUI.checked).toBe(true);
      });

      it("should affect the query param for catching exceptions", function() {
        var env = new j$.Env(),
          container = document.createElement("div"),
          exceptionsClickHandler = jasmine.createSpy("raise exceptions checked"),
          getContainer = function() {
            return container;
          },
          reporter = new j$.HtmlReporter({
            env: env,
            getContainer: getContainer,
            onRaiseExceptionsClick: exceptionsClickHandler,
            createElement: function() {
              return document.createElement.apply(document, arguments);
            },
            createTextNode: function() {
              return document.createTextNode.apply(document, arguments);
            }
          });

        reporter.initialize();
        reporter.jasmineDone({});

        var input = container.querySelector(".raise");
        input.click();
        expect(exceptionsClickHandler).toHaveBeenCalled();
      });
    });

    it("shows a message if no specs are run", function(){
      var env, container, reporter;
      env = new j$.Env();
      container = document.createElement("div");
      var getContainer = function() { return container; },
      reporter = new j$.HtmlReporter({
        env: env,
        getContainer: getContainer,
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); }
      });
      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.jasmineDone({});

      var alertBars = container.querySelectorAll(".alert .bar");
      expect(alertBars[0].getAttribute('class')).toMatch(/skipped/);
      expect(alertBars[0].innerHTML).toMatch(/No specs found/);
    });

    describe("and all specs pass", function() {
      var env, container, reporter;
      beforeEach(function() {
        env = new j$.Env();
        container = document.createElement("div");
        var getContainer = function() { return container; },
          reporter = new j$.HtmlReporter({
            env: env,
            getContainer: getContainer,
            createElement: function() { return document.createElement.apply(document, arguments); },
            createTextNode: function() { return document.createTextNode.apply(document, arguments); }
          });
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 2 });
        reporter.specDone({
          id: 123,
          description: "with a spec",
          fullName: "A Suite with a spec",
          status: "passed",
          passedExpectations: [{passed: true}],
          failedExpectations: []
        });
        reporter.specDone({
          id: 124,
          description: "with another spec",
          fullName: "A Suite inner suite with another spec",
          status: "passed",
          passedExpectations: [{passed: true}],
          failedExpectations: []
        });
        reporter.jasmineDone({});
      });

      it("reports the specs counts", function() {
        var alertBars = container.querySelectorAll(".alert .bar");

        expect(alertBars.length).toEqual(1);
        expect(alertBars[0].getAttribute('class')).toMatch(/passed/);
        expect(alertBars[0].innerHTML).toMatch(/2 specs, 0 failures/);
      });

      it("reports no failure details", function() {
        var specFailure = container.querySelector(".failures");

        expect(specFailure.childNodes.length).toEqual(0);
      });

      it("reports no pending specs", function() {
        var alertBar = container.querySelector(".alert .bar");

        expect(alertBar.innerHTML).not.toMatch(/pending spec[s]/);
      });
    });

    describe("and there are pending specs", function() {
      var env, container, reporter;
      beforeEach(function() {
        env = new j$.Env();
        container = document.createElement("div");
        var getContainer = function() { return container; };
        reporter = new j$.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 1 });
        reporter.specDone({
          id: 123,
          description: "with a spec",
          fullName: "A Suite with a spec",
          status: "pending",
          passedExpectations: [],
          failedExpectations: []
        });
        reporter.jasmineDone({});
      });

      it("reports the pending specs count", function() {
        var alertBar = container.querySelector(".alert .bar");

        expect(alertBar.innerHTML).toMatch(/1 spec, 0 failures, 1 pending spec/);
      });

      it("reports no failure details", function() {
        var specFailure = container.querySelector(".failures");

        expect(specFailure.childNodes.length).toEqual(0);
      });
    });

    describe("and some tests fail", function() {
      var env, container, reporter;

      beforeEach(function() {
        env = new j$.Env();
        container = document.createElement("div");
        var getContainer = function() { return container; }
        reporter = new j$.HtmlReporter({
          env: env,
          getContainer: getContainer,
          createElement: function() { return document.createElement.apply(document, arguments); },
          createTextNode: function() { return document.createTextNode.apply(document, arguments); }
        });
        reporter.initialize();

        reporter.jasmineStarted({ totalSpecsDefined: 1 });

        var passingResult = {id: 123, status: "passed", passedExpectations: [{passed: true}], failedExpectations: []};
        reporter.specStarted(passingResult);
        reporter.specDone(passingResult);

        var failingResult = {
          id: 124,
          status: "failed",
          description: "a failing spec",
          fullName: "a suite with a failing spec",
          passedExpectations: [],
          failedExpectations: [
            {
              message: "a failure message",
              stack: "a stack trace"
            }
          ]
        };
        reporter.specStarted(failingResult);
        reporter.specDone(failingResult);
        reporter.jasmineDone({});
      });

      it("reports the specs counts", function() {
        var alertBar = container.querySelector(".alert .bar");

        expect(alertBar.getAttribute('class')).toMatch(/failed/);
        expect(alertBar.innerHTML).toMatch(/2 specs, 1 failure/);
      });

      it("reports failure messages and stack traces", function() {
        var specFailures = container.querySelector(".failures");

        var failure = specFailures.childNodes[0];
        expect(failure.getAttribute("class")).toMatch(/failed/);
        expect(failure.getAttribute("class")).toMatch(/spec-detail/);

        var specDiv = failure.childNodes[0];
        expect(specDiv.getAttribute("class")).toEqual("description");

        var specLink = specDiv.childNodes[0];
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
        var menuBar = container.querySelectorAll(".bar")[1];

        expect(menuBar.getAttribute("class")).not.toMatch(/hidden/);

        var link = menuBar.querySelector('a');
        expect(link.innerHTML).toEqual("Failures");
        expect(link.getAttribute("href")).toEqual("#");
      });

      it("sets the reporter to 'Failures List' mode", function() {
        var reporterNode = container.querySelector(".jasmine_html-reporter");
        expect(reporterNode.getAttribute("class")).toMatch("failure-list");
      });
    });
  });
});
