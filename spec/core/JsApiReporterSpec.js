xdescribe('JsApiReporter (integration specs)', function() {
  describe('results', function() {
    var reporter, spec1, spec2;
    var env;
    var suite, nestedSuite, nestedSpec;

    beforeEach(function() {
      env = new jasmine.Env();
      env.updateInterval = 0;

      suite = env.describe("top-level suite", function() {
        spec1 = env.it("spec 1", function() {
          this.expect(true).toEqual(true);

        });

        spec2 = env.it("spec 2", function() {
          this.expect(true).toEqual(false);
        });

        nestedSuite = env.describe("nested suite", function() {
          nestedSpec = env.it("nested spec", function() {
            expect(true).toEqual(true);
          });
        });

      });

      reporter = new jasmine.JsApiReporter(jasmine);
      env.addReporter(reporter);

      env.execute();

    });

    it('results() should return a hash of all results, indexed by spec id', function() {
      var expectedSpec1Results = {
          result: "passed"
        },
        expectedSpec2Results = {
          result: "failed"
        };
      expect(reporter.results()[spec1.id].result).toEqual('passed');
      expect(reporter.results()[spec2.id].result).toEqual('failed');
    });

    it("should return nested suites as children of their parents", function() {
      expect(reporter.suites()).toEqual([
        { id: 0, name: 'top-level suite', type: 'suite',
          children: [
            { id: 0, name: 'spec 1', type: 'spec', children: [ ] },
            { id: 1, name: 'spec 2', type: 'spec', children: [ ] },
            { id: 1, name: 'nested suite', type: 'suite',
              children: [
                { id: 2, name: 'nested spec', type: 'spec', children: [ ] }
              ]
            },
          ]
        }
      ]);
    });

    describe("#summarizeResult_", function() {
      it("should summarize a passing result", function() {
        var result = reporter.results()[spec1.id];
        var summarizedResult = reporter.summarizeResult_(result);
        expect(summarizedResult.result).toEqual('passed');
        expect(summarizedResult.messages.length).toEqual(0);
      });

      it("should have a stack trace for failing specs", function() {
        var result = reporter.results()[spec2.id];
        var summarizedResult = reporter.summarizeResult_(result);
        expect(summarizedResult.result).toEqual('failed');
        expect(summarizedResult.messages[0].trace.stack).toEqual(result.messages[0].trace.stack);
      });

    });
  });
});


describe("JsApiReporter", function() {

  it("knows when a full environment is started", function() {
    var reporter = new jasmine.JsApiReporter();

    expect(reporter.started).toBe(false);
    expect(reporter.finished).toBe(false);

    reporter.jasmineStarted();

    expect(reporter.started).toBe(true);
    expect(reporter.finished).toBe(false);
  });

  it("knows when a full environment is done", function() {
    var reporter = new jasmine.JsApiReporter();

    expect(reporter.started).toBe(false);
    expect(reporter.finished).toBe(false);

    reporter.jasmineStarted();
    reporter.jasmineDone();

    expect(reporter.finished).toBe(true);
  });

  it("defaults to 'loaded' status", function() {
    var reporter = new jasmine.JsApiReporter();

    expect(reporter.status()).toEqual('loaded');
  });

  it("reports 'started' when Jasmine has started", function() {
    var reporter = new jasmine.JsApiReporter();

    reporter.jasmineStarted();

    expect(reporter.status()).toEqual('started');
  });

  it("reports 'done' when Jasmine is done", function() {
    var reporter = new jasmine.JsApiReporter();

    reporter.jasmineDone();

    expect(reporter.status()).toEqual('done');
  });

  it("tracks a suite", function() {
    var reporter = new jasmine.JsApiReporter();

    reporter.suiteStarted({
      id: 123,
      description: "A suite"
    });

    var suites = reporter.suites();

    expect(suites).toEqual({123: {id: 123, description: "A suite"}});

    reporter.suiteDone({
      id: 123,
      description: "A suite",
      status: 'passed'
    });

    expect(suites).toEqual({123: {id: 123, description: "A suite", status: 'passed'}});
  });

  it("tracks a spec", function() {
    var reporter = new jasmine.JsApiReporter();

    reporter.specStarted({
      id: 123,
      description: "A spec"
    });

    var specs = reporter.specs();

    expect(specs).toEqual({123: {id: 123, description: "A spec"}});

    reporter.specDone({
      id: 123,
      description: "A spec",
      status: 'passed'
    });

    expect(specs).toEqual({123: {id: 123, description: "A spec", status: 'passed'}});
  });
});
