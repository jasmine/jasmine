describe('JsApiReporterSpec', function () {


  describe('results', function () {
    var reporter, spec1, spec2, expectedSpec1Results, expectedSpec2Results;

    beforeEach(function() {
      var env = new jasmine.Env();
      var suite = new jasmine.Suite(env);
      spec1 = new jasmine.Spec(env, suite);
      spec1.runs(function () {
        this.expect(true).toEqual(true);
      });
      expectedSpec1Results = {
        messages: spec1.results().getItems(),
        result: "passed"
      };
      spec2 = new jasmine.Spec(env, suite);
      spec2.runs(function () {
        this.expect(true).toEqual(false);
      });
      expectedSpec2Results = {
        messages: spec2.results().getItems(),
        result: "failed"
      };

      spec1.execute();
      spec2.execute();

      reporter = new jasmine.JsApiReporter();
      reporter.reportSpecResults(spec1);
      reporter.reportSpecResults(spec2);
    });

    it('resultForSpec() should return the result for the given spec', function () {
      expect(reporter.resultsForSpec(spec1.id)).toEqual(expectedSpec1Results);
      expect(reporter.resultsForSpec(spec2.id)).toEqual(expectedSpec2Results);

    });

    it('results() should return a hash of all results, indexed by spec id', function () {
      expect(reporter.results()[spec1.id]).toEqual(expectedSpec1Results);
      expect(reporter.results()[spec2.id]).toEqual(expectedSpec2Results);
    });

  });
});