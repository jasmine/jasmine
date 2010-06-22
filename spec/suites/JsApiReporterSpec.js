describe('jasmine.jsApiReporter', function() {
  describe('results', function () {
    var reporter, spec1, spec2, spec3, expectedSpec1Results, expectedSpec2Results;
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
          })
        });

        spec3 = env.it("spec 3", function() {
          this.log('some debug message');
        });
      });

      reporter = new jasmine.JsApiReporter();
      env.addReporter(reporter);

      env.execute();

      expectedSpec1Results = {
        messages: spec1.results().getItems(),
        result: "passed"
      };
      expectedSpec2Results = {
        messages: spec2.results().getItems(),
        result: "failed"
      };
    });

    it('resultForSpec() should return the result for the given spec', function () {
      expect(reporter.resultsForSpec(spec1.id)).toEqual(expectedSpec1Results);
      expect(reporter.resultsForSpec(spec2.id)).toEqual(expectedSpec2Results);
    });

    it('results() should return a hash of all results, indexed by spec id', function () {
      expect(reporter.results()[spec1.id]).toEqual(expectedSpec1Results);
      expect(reporter.results()[spec2.id]).toEqual(expectedSpec2Results);
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
            { id: 3, name: 'spec 3', type: 'spec', children: [ ] }
          ]
        }
      ]);
    });

    describe("#summarizeResult_", function() {
      it("should summarize a passing result", function() {
        var result = reporter.results()[spec1.id];
        var summarizedResult = reporter.summarizeResult_(result);
        expect(summarizedResult.result).toEqual('passed');
        expect(summarizedResult.messages.length).toEqual(1);
        expect(summarizedResult.messages[0].message).toEqual(result.messages[0].message);
        expect(summarizedResult.messages[0].passed).toBeTruthy();
        expect(summarizedResult.messages[0].type).toEqual('expect');
        expect(summarizedResult.messages[0].text).toBeUndefined();
        expect(summarizedResult.messages[0].trace.stack).toBeUndefined();
      });

      it("should have a stack trace for failing specs", function() {
        var result = reporter.results()[spec2.id];
        var summarizedResult = reporter.summarizeResult_(result);
        expect(summarizedResult.result).toEqual('failed');
        expect(summarizedResult.messages[0].trace.stack).toEqual(result.messages[0].trace.stack);
      });

      it("should have messages for specs with messages", function() {
        var result = reporter.results()[spec3.id];
        var summarizedResult = reporter.summarizeResult_(result);
        expect(summarizedResult.result).toEqual('passed');
        expect(summarizedResult.messages[0].type).toEqual('log');
        expect(summarizedResult.messages[0].text).toEqual('some debug message');
      });
    });
  });
});