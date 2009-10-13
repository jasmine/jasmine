describe('jasmine.jsApiReporter', function() {


  describe('results', function () {
    var reporter, spec1, spec2, spec3, expectedSpec1Results, expectedSpec2Results;

    beforeEach(function() {
      var env = new jasmine.Env();
      env.updateInterval = 0;
      var suite = new jasmine.Suite(env);
      spec1 = new jasmine.Spec(env, suite, 'spec 1');
      spec1.runs(function () {
        this.expect(true).toEqual(true);
      });
      expectedSpec1Results = {
        messages: spec1.results().getItems(),
        result: "passed"
      };
      spec2 = new jasmine.Spec(env, suite, 'spec 2');
      spec2.runs(function () {
        this.expect(true).toEqual(false);
      });
      expectedSpec2Results = {
        messages: spec2.results().getItems(),
        result: "failed"
      };

      spec3 = new jasmine.Spec(env, suite, 'spec 3');
      spec3.runs(function () {
        this.log('some debug message')
      });

      spec1.execute();
      spec2.execute();
      spec3.execute();

      reporter = new jasmine.JsApiReporter();
      reporter.reportSpecResults(spec1);
      reporter.reportSpecResults(spec2);
      reporter.reportSpecResults(spec3);
    });

    it('resultForSpec() should return the result for the given spec', function () {
      expect(reporter.resultsForSpec(spec1.id)).toEqual(expectedSpec1Results);
      expect(reporter.resultsForSpec(spec2.id)).toEqual(expectedSpec2Results);

    });

    it('results() should return a hash of all results, indexed by spec id', function () {
      expect(reporter.results()[spec1.id]).toEqual(expectedSpec1Results);
      expect(reporter.results()[spec2.id]).toEqual(expectedSpec2Results);
    });

    describe("#summarizeResult_", function() {
      it("should summarize a passing result", function() {
        var result = reporter.results()[spec1.id];
        var summarizedResult = reporter.summarizeResult_(result);
        expect(summarizedResult.result).toEqual('passed');
        expect(summarizedResult.messages.length).toEqual(1);
        expect(summarizedResult.messages[0].message).toEqual(result.messages[0].message);
        expect(summarizedResult.messages[0].passed).toBeTruthy();
        expect(summarizedResult.messages[0].type).toEqual('ExpectationResult');
        expect(summarizedResult.messages[0].text).toEqual(undefined);
        expect(summarizedResult.messages[0].trace.stack).toEqual(undefined);
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
        expect(summarizedResult.messages[0].text).toEqual('some debug message');
      });
    });
  });
});