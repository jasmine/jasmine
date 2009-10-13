describe('Spec', function () {
  var env, suite;
  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
    suite = new jasmine.Suite(env, 'suite 1');
  });

  describe('initialization', function () {

    it('should raise an error if an env is not passed', function () {
      try {
        new jasmine.Spec();
      }
      catch (e) {
        expect(e.message).toEqual('jasmine.Env() required');
      }
    });

    it('should raise an error if a suite is not passed', function () {
      try {
        new jasmine.Spec(env);
      }
      catch (e) {
        expect(e.message).toEqual('jasmine.Suite() required');
      }
    });

    it('should assign sequential ids for specs belonging to the same env', function () {
      var spec1 = new jasmine.Spec(env, suite);
      var spec2 = new jasmine.Spec(env, suite);
      var spec3 = new jasmine.Spec(env, suite);
      expect(spec1.id).toEqual(0);
      expect(spec2.id).toEqual(1);
      expect(spec3.id).toEqual(2);
    });

  });

  it('getFullName returns suite & spec description', function () {
    var spec = new jasmine.Spec(env, suite, 'spec 1');
    expect(spec.getFullName()).toEqual('suite 1 spec 1.')
  });

  describe('results', function () {
    var spec, results;
    beforeEach(function () {
      spec = new jasmine.Spec(env, suite);
      results = spec.results();
      expect(results.totalCount).toEqual(0);
      spec.runs(function () {
        this.expect(true).toEqual(true);
        this.expect(true).toEqual(true);
      });
    });


    it('results shows the total number of expectations for each spec after execution', function () {
      expect(results.totalCount).toEqual(0);
      spec.execute();
      expect(results.totalCount).toEqual(2);
    });

    it('results shows the number of passed expectations for each spec after execution', function () {
      expect(results.passedCount).toEqual(0);
      spec.execute();
      expect(results.passedCount).toEqual(2);
    });

    it('results shows the number of failed expectations for each spec after execution', function () {
      spec.runs(function () {
        this.expect(true).toEqual(false);
      });
      expect(results.failedCount).toEqual(0);
      spec.execute();
      expect(results.failedCount).toEqual(1);
    });

    describe('results.passed', function () {
      it('is true if all spec expectations pass', function () {
        spec.runs(function () {
          this.expect(true).toEqual(true);
        });
        spec.execute();
        expect(results.passed()).toEqual(true);
      });

      it('is false if one spec expectation fails', function () {
        spec.runs(function () {
          this.expect(true).toEqual(false);
        });
        spec.execute();
        expect(results.passed()).toEqual(false);
      });

      it('a spec with no expectations will return true', function () {
        var specWithoutExpectations = new jasmine.Spec(env, suite);
        specWithoutExpectations.runs(function() {

        });
        specWithoutExpectations.execute();
        expect(results.passed()).toEqual(true);
      });

      it('an unexecuted spec will return true', function () {
        expect(results.passed()).toEqual(true);
      });
    });
  });
});