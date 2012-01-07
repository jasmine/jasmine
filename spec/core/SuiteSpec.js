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
    var suite;

    beforeEach(function() {
      suite = env.describe('Suite 1', function () {
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
          env.sharedExamplesFor('Examples 1', function () {
            env.it('Spec 6', function () {
              this.runs(function () {
                this.expect(true).toEqual(true);
              });
            });
          });
          env.itBehavesLike('Examples 1');
        });
        env.it('Spec 4', function() {
          this.runs(function () {
            this.expect(true).toEqual(true);
          });
        });
        env.sharedExamplesFor('Examples 2', function () {
          env.it('Spec 5', function () {
            this.runs(function () {
              this.expect(true).toEqual(true)
            });
          });
        });
        env.itBehavesLike('Examples 2');
      });
    });
    
    it('#specs should return all immediate children that are specs.', function () {
      var suiteSpecs = suite.specs();
      expect(suiteSpecs.length).toEqual(3);
      expect(suiteSpecs[0].description).toEqual('Spec 1');
      expect(suiteSpecs[1].description).toEqual('Spec 2');
      expect(suiteSpecs[2].description).toEqual('Spec 4');
    });

    it("#suites should return all immediate children that are suites.", function() {
      var nestedSuites = suite.suites();
      expect(nestedSuites.length).toEqual(2);
      expect(nestedSuites[0].description).toEqual('Suite 2');
      expect(nestedSuites[1].description).toEqual('it behaves like Examples 2');
    });

    it("#children should return all immediate children including suites and specs.", function() {
      var children = suite.children();
      expect(children.length).toEqual(5);
      expect(children[0].description).toEqual('Spec 1');
      expect(children[1].description).toEqual('Spec 2');
      expect(children[2].description).toEqual('Suite 2');
      expect(children[3].description).toEqual('Spec 4');
      expect(children[4].description).toEqual('it behaves like Examples 2');
    });

    it("#sharedContexts should return all immediate children that are shared contexts.", function() {
      var sharedContexts = suite.sharedExampleGroups();
      expect(sharedContexts.length).toEqual(1);
      expect(sharedContexts[0].description).toEqual('Examples 2');
    });
  });

  describe('SharedSuite', function() {
    it("#sharedExamplesFor should throw an Error if the description is missing.", function() {
      expect(function() {
        env.sharedExamplesFor("", function() {});
      }).toThrow(new Error("Shared examples must have a description."));
    });

    it("#sharedExamplesFor should throw an Error if there is no suite.", function() {
      expect(function() {
        env.sharedExamplesFor("Shared Suite", function() {});
      }).toThrow(new Error("Shared examples must be defined within a suite."));
    });

    it("#sharedExamplesFor should throw an Error if the description is not unique.", function(){
      env.describe("Suite", function() {
        env.sharedExamplesFor("shared suite", function() {});
        env.describe("Nested suite", function() {
          expect(function() {
            env.sharedExamplesFor("shared suite", function() {});
          }).toThrow("Shared examples for \"shared suite\" already defined.");
        });
      });
    });

    it("#itBehavesLike should throw an Error if the shared suite is missing.", function() {
      expect(function() {
        env.itBehavesLike("missing suite");
      }).toThrow(new Error("Shared examples for \"missing suite\" not found."));
    });
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

      expect(suite.specs().length).toEqual(3);
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

      expect(suite.specs().length).toEqual(3);
    });
  });
});