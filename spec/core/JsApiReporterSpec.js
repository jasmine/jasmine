describe('jasmine.jsApiReporter', function() {
  describe('results', function () {
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

    it('results() should return a hash of all results, indexed by spec id', function () {
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
