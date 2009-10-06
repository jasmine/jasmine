describe('Suite', function() {
  var fakeTimer;
  var env;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;

    fakeTimer = new jasmine.FakeTimer();
    env.setTimeout = fakeTimer.setTimeout;
    env.clearTimeout = fakeTimer.clearTimeout;
    env.setInterval = fakeTimer.setInterval;
    env.clearInterval = fakeTimer.clearInterval;
  });

  describe('Specs', function () {
    it('#specs should return all immediate children that are specs.', function () {
      var suite =env.describe('Suite 1', function () {
        env.it('Spec 1', function() {
          this.runs(function () {
            this.expect(true).toEqual(true);
          });
        });
        env.it('Spec 2', function() {
          this.runs(function () {
            this.expect(true).toEqual(true);
          });
        });
        env.describe('Suite 2', function () {
          env.it('Spec 3', function() {
            this.runs(function () {
              this.expect(true).toEqual(true);
            });
          });
        });
        env.it('Spec 4', function() {
          this.runs(function () {
            this.expect(true).toEqual(true);
          });
        });
      });

      var suiteSpecs = suite.specs();
      expect(suiteSpecs.length).toEqual(3);
      expect(suiteSpecs[0].description).toEqual('Spec 1');
      expect(suiteSpecs[1].description).toEqual('Spec 2');
      expect(suiteSpecs[2].description).toEqual('Spec 4');
    });

    describe('SpecCount', function () {

      it('should keep a count of the number of specs that are run', function() {
       var suite = env.describe('one suite description', function () {
          env.it('should be a test', function() {
            this.runs(function () {
              this.expect(true).toEqual(true);
            });
          });
          env.it('should be another test', function() {
            this.runs(function () {
              this.expect(true).toEqual(true);
            });
          });
          env.it('should be a third test', function() {
            this.runs(function () {
              this.expect(true).toEqual(true);
            });
          });
        });

        expect(suite.specCount()).toEqual(3);
      });

      it('specCount should be correct even with runs/waits blocks', function() {
       var suite = env.describe('one suite description', function () {
          env.it('should be a test', function() {
            this.runs(function () {
              this.expect(true).toEqual(true);
            });
          });
          env.it('should be another test', function() {
            this.runs(function () {
              this.expect(true).toEqual(true);
            });
            this.waits(10);
            this.runs(function () {
              this.expect(true).toEqual(true);
            });
          });
          env.it('should be a third test', function() {
            this.runs(function () {
              this.expect(true).toEqual(true);
            });
          });
        });

        expect(suite.specCount()).toEqual(3);
      });
    });
  });
});