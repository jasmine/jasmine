//describe('Suite', function() {
//  var env;
//
//  beforeEach(function() {
//    env = new jasmine.Env();
//    env.updateInterval = 0;
//  });
//
//  describe('Specs', function () {
//    var suite;
//
//    beforeEach(function() {
//      suite = env.describe('Suite 1', function () {
//        env.it('Spec 1', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//        env.it('Spec 2', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//        env.describe('Suite 2', function () {
//          env.it('Spec 3', function() {
//            this.runs(function () {
//              this.expect(true).toEqual(true);
//            });
//          });
//        });
//        env.it('Spec 4', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//      });
//    });
//
//    it('#specs should return all immediate children that are specs.', function () {
//      var suiteSpecs = suite.specs();
//      expect(suiteSpecs.length).toEqual(3);
//      expect(suiteSpecs[0].description).toEqual('Spec 1');
//      expect(suiteSpecs[1].description).toEqual('Spec 2');
//      expect(suiteSpecs[2].description).toEqual('Spec 4');
//    });
//
//    it("#suites should return all immediate children that are suites.", function() {
//      var nestedSuites = suite.suites();
//      expect(nestedSuites.length).toEqual(1);
//      expect(nestedSuites[0].description).toEqual('Suite 2');
//    });
//
//    it("#children should return all immediate children including suites and specs.", function() {
//      var children = suite.children();
//      expect(children.length).toEqual(4);
//      expect(children[0].description).toEqual('Spec 1');
//      expect(children[1].description).toEqual('Spec 2');
//      expect(children[2].description).toEqual('Suite 2');
//      expect(children[3].description).toEqual('Spec 4');
//    });
//  });
//
//  describe('SpecCount', function () {
//
//    it('should keep a count of the number of specs that are run', function() {
//      var suite = env.describe('one suite description', function () {
//        env.it('should be a test', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//        env.it('should be another test', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//        env.it('should be a third test', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//      });
//
//      expect(suite.specs().length).toEqual(3);
//    });
//
//    it('specCount should be correct even with runs/waits blocks', function() {
//      var suite = env.describe('one suite description', function () {
//        env.it('should be a test', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//        env.it('should be another test', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//          this.waits(10);
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//        env.it('should be a third test', function() {
//          this.runs(function () {
//            this.expect(true).toEqual(true);
//          });
//        });
//      });
//
//      expect(suite.specs().length).toEqual(3);
//    });
//  });
//});

describe("Suite (unit tests)", function() {

  it("keeps its id", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        id: 456,
        description: "I am a suite"
      });

    expect(suite.id).toEqual(456);
  });

  it("returns its full name", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite"
      });

    expect(suite.getFullName()).toEqual("I am a suite");
  });

  it("returns its full name when it has parent suites", function() {
    var env = new jasmine.Env(),
      parentSuite = new jasmine.Suite({
        env: env,
        description: "I am a suite"
      });
    suite = new jasmine.Suite({
      env: env,
      description: "I am a suite"
    });

    expect(suite.getFullName()).toEqual("I am a suite");

  });

  it("adds before functions in order of needed execution", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite"
      }),
      outerBefore = jasmine.createSpy('outerBeforeEach'),
      innerBefore = jasmine.createSpy('insideBeforeEach');

    suite.beforeEach(outerBefore);
    suite.beforeEach(innerBefore);

    expect(suite.beforeFns).toEqual([innerBefore, outerBefore]);
  });

  it("adds after functions in order of needed execution", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite"
      }),
      outerAfter = jasmine.createSpy('outerAfterEach'),
      innerAfter = jasmine.createSpy('insideAfterEach');

    suite.afterEach(outerAfter);
    suite.afterEach(innerAfter);

    expect(suite.afterFns).toEqual([innerAfter, outerAfter]);
  });

  it("adds specs", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite"
      }),
      fakeSpec = {};

    expect(suite.specs.length).toEqual(0);

    suite.addSpec(fakeSpec);

    expect(suite.specs.length).toEqual(1);git
  });

});

// TODO:
describe("Suite (acceptance)", function() {

  it("can execute and run all of its befores, specs, and afters", function() {
    var env = new jasmine.Env(),
      calls = [];

    env.describe("A suite", function() {
      env.beforeEach(function() {
        calls.push('before');
      });

      env.it("with a spec", function() {
        calls.push('spec');
      });

      env.afterEach(function() {
        calls.push('after');
      });
    });

    env.execute();
    expect(calls).toEqual(['before', 'spec', 'after']);
  });

});