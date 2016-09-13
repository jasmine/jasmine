describe("jasmine spec running", function () {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  it('should assign spec ids sequentially', function() {
    var it0, it1, it2, it3, it4;
    env.describe('test suite', function() {
      it0 = env.it('spec 0', function() {
      });
      it1 = env.it('spec 1', function() {
      });
      it2 = env.xit('spec 2', function() {
      });
      it3 = env.it('spec 3', function() {
      });
    });
    env.describe('test suite 2', function() {
      it4 = env.it('spec 4', function() {
      });
    });

    expect(it0.id).toEqual('spec0');
    expect(it1.id).toEqual('spec1');
    expect(it2.id).toEqual('spec2');
    expect(it3.id).toEqual('spec3');
    expect(it4.id).toEqual('spec4');
  });

  it('nested suites', function (done) {

    var foo = 0;
    var bar = 0;
    var baz = 0;
    var quux = 0;
    var nested = env.describe('suite', function () {
      env.describe('nested', function () {
        env.it('should run nested suites', function () {
          foo++;
        });
        env.it('should run nested suites', function () {
          bar++;
        });
      });

      env.describe('nested 2', function () {
        env.it('should run suites following nested suites', function () {
          baz++;
        });
      });

      env.it('should run tests following nested suites', function () {
        quux++;
      });
    });

    expect(foo).toEqual(0);
    expect(bar).toEqual(0);
    expect(baz).toEqual(0);
    expect(quux).toEqual(0);
    var assertions = function() {
      expect(foo).toEqual(1);
      expect(bar).toEqual(1);
      expect(baz).toEqual(1);
      expect(quux).toEqual(1);
      done();
    };

    env.addReporter({ jasmineDone: assertions });

    env.execute();
  });

  it("should permit nested describes", function(done) {
    var actions = [];

    env.beforeEach(function () {
      actions.push('topSuite beforeEach');
    });

    env.afterEach(function () {
      actions.push('topSuite afterEach');
    });

    env.describe('Something', function() {
      env.beforeEach(function() {
        actions.push('outer beforeEach');
      });

      env.afterEach(function() {
        actions.push('outer afterEach');
      });

      env.it('does it 1', function() {
        actions.push('outer it 1');
      });

      env.describe('Inner 1', function() {
        env.beforeEach(function() {
          actions.push('inner 1 beforeEach');
        });

        env.afterEach(function() {
          actions.push('inner 1 afterEach');
        });

        env.it('does it 2', function() {
          actions.push('inner 1 it');
        });
      });

      env.it('does it 3', function() {
        actions.push('outer it 2');
      });

      env.describe('Inner 2', function() {
        env.beforeEach(function() {
          actions.push('inner 2 beforeEach');
        });

        env.afterEach(function() {
          actions.push('inner 2 afterEach');
        });

        env.it('does it 2', function() {
          actions.push('inner 2 it');
        });
      });
    });

    var assertions = function() {
      var expected = [
        "topSuite beforeEach",
        "outer beforeEach",
        "outer it 1",
        "outer afterEach",
        "topSuite afterEach",

        "topSuite beforeEach",
        "outer beforeEach",
        "inner 1 beforeEach",
        "inner 1 it",
        "inner 1 afterEach",
        "outer afterEach",
        "topSuite afterEach",

        "topSuite beforeEach",
        "outer beforeEach",
        "outer it 2",
        "outer afterEach",
        "topSuite afterEach",

        "topSuite beforeEach",
        "outer beforeEach",
        "inner 2 beforeEach",
        "inner 2 it",
        "inner 2 afterEach",
        "outer afterEach",
        "topSuite afterEach"
      ];
      expect(actions).toEqual(expected);
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });

  it("should run multiple befores and afters ordered so functions declared later are treated as more specific", function(done) {
    var actions = [];

    env.beforeEach(function () {
      actions.push('runner beforeEach1');
    });

    env.afterEach(function () {
      actions.push('runner afterEach1');
    });

    env.beforeEach(function () {
      actions.push('runner beforeEach2');
    });

    env.afterEach(function () {
      actions.push('runner afterEach2');
    });

    env.describe('Something', function() {
      env.beforeEach(function() {
        actions.push('beforeEach1');
      });

      env.afterEach(function() {
        actions.push('afterEach1');
      });

      env.beforeEach(function() {
        actions.push('beforeEach2');
      });

      env.afterEach(function() {
        actions.push('afterEach2');
      });

      env.it('does it 1', function() {
        actions.push('outer it 1');
      });
    });

    var assertions = function() {
      var expected = [
        "runner beforeEach1",
        "runner beforeEach2",
        "beforeEach1",
        "beforeEach2",
        "outer it 1",
        "afterEach2",
        "afterEach1",
        "runner afterEach2",
        "runner afterEach1"
      ];
      expect(actions).toEqual(expected);
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });

  it('should run beforeAlls before beforeEachs and afterAlls after afterEachs', function(done) {
    var actions = [];

    env.beforeAll(function() {
      actions.push('runner beforeAll');
    });

    env.afterAll(function() {
      actions.push('runner afterAll');
    });

    env.beforeEach(function () {
      actions.push('runner beforeEach');
    });

    env.afterEach(function () {
      actions.push('runner afterEach');
    });

    env.describe('Something', function() {
      env.beforeEach(function() {
        actions.push('inner beforeEach');
      });

      env.afterEach(function() {
        actions.push('inner afterEach');
      });

      env.beforeAll(function() {
        actions.push('inner beforeAll');
      });

      env.afterAll(function() {
        actions.push('inner afterAll');
      });

      env.it('does something or other', function() {
        actions.push('it');
      });
    });

    var assertions = function() {
      var expected = [
        "runner beforeAll",
        "inner beforeAll",
        "runner beforeEach",
        "inner beforeEach",
        "it",
        "inner afterEach",
        "runner afterEach",
        "inner afterAll",
        "runner afterAll"
      ];
      expect(actions).toEqual(expected);
      done();
    };

    env.addReporter({jasmineDone: assertions});
    env.execute();
  });

  it('should run beforeAlls and afterAlls in the order declared when runnablesToRun is provided', function(done) {
    var actions = [],
      spec,
      spec2;

    env.beforeAll(function() {
      actions.push('runner beforeAll');
    });

    env.afterAll(function() {
      actions.push('runner afterAll');
    });

    env.beforeEach(function () {
      actions.push('runner beforeEach');
    });

    env.afterEach(function () {
      actions.push('runner afterEach');
    });

    env.describe('Something', function() {
      env.beforeEach(function() {
        actions.push('inner beforeEach');
      });

      env.afterEach(function() {
        actions.push('inner afterEach');
      });

      env.beforeAll(function() {
        actions.push('inner beforeAll');
      });

      env.afterAll(function() {
        actions.push('inner afterAll');
      });

      spec = env.it('does something', function() {
        actions.push('it');
      });

      spec2 = env.it('does something or other', function() {
        actions.push('it2');
      });
    });

    var assertions = function() {
      var expected = [
        "runner beforeAll",
        "inner beforeAll",
        "runner beforeEach",
        "inner beforeEach",
        "it2",
        "inner afterEach",
        "runner afterEach",

        "runner beforeEach",
        "inner beforeEach",
        "it",
        "inner afterEach",
        "runner afterEach",
        "inner afterAll",
        "runner afterAll"
      ];
      expect(actions).toEqual(expected);
      done();
    };

    env.addReporter({jasmineDone: assertions});
    env.execute([spec2.id, spec.id]);
  });

  it('only runs *Alls once in a focused suite', function(done){
    var actions = [];

    env.fdescribe('Suite', function() {
      env.beforeAll(function(){
        actions.push('beforeAll');
      });
      env.it('should run beforeAll once', function() {
        actions.push('spec');
      });
      env.afterAll(function(){
        actions.push('afterAll');
      });
    });

    var assertions = function() {
      expect(actions).toEqual(['beforeAll', 'spec', 'afterAll']);
      done();
    };

    env.addReporter({jasmineDone: assertions});
    env.execute();
  });

  describe('focused runnables', function() {
    it('runs the relevant alls and eachs for each runnable', function(done) {
      var actions = [];
      env.beforeAll(function() {actions.push('beforeAll')});
      env.afterAll(function() {actions.push('afterAll')});
      env.beforeEach(function() {actions.push('beforeEach')});
      env.afterEach(function() {actions.push('afterEach')});

      env.fdescribe('a focused suite', function() {
        env.it('is run', function() {
          actions.push('spec in fdescribe')
        });
      });

      env.describe('an unfocused suite', function() {
        env.fit('has a focused spec', function() {
          actions.push('focused spec')
        });
      });

      var assertions = function() {
        var expected = [
          'beforeAll',
          'beforeEach',
          'spec in fdescribe',
          'afterEach',

          'beforeEach',
          'focused spec',
          'afterEach',
          'afterAll'
        ];
        expect(actions).toEqual(expected);
        done();
      };

      env.addReporter({jasmineDone: assertions});
      env.execute();
    });

    it('focused specs in focused suites cause non-focused siblings to not run', function(done){
      var actions = [];

      env.fdescribe('focused suite', function() {
        env.it('unfocused spec', function() {
          actions.push('unfocused spec')
        });
        env.fit('focused spec', function() {
          actions.push('focused spec')
        });
      });

      var assertions = function() {
        var expected = ['focused spec'];
        expect(actions).toEqual(expected);
        done();
      };

      env.addReporter({jasmineDone: assertions});
      env.execute();
    });

    it('focused suites in focused suites cause non-focused siblings to not run', function(done){
      var actions = [];

      env.fdescribe('focused suite', function() {
        env.it('unfocused spec', function() {
          actions.push('unfocused spec')
        });
        env.fdescribe('inner focused suite', function() {
          env.it('inner spec', function() {
            actions.push('inner spec');
          });
        });
      });

      var assertions = function() {
        var expected = ['inner spec'];
        expect(actions).toEqual(expected);
        done();
      };

      env.addReporter({jasmineDone: assertions});
      env.execute();
    });

    it('focused runnables unfocus ancestor focused suites', function() {
      var actions = [];

      env.fdescribe('focused suite', function() {
        env.it('unfocused spec', function() {
          actions.push('unfocused spec')
        });
        env.describe('inner focused suite', function() {
          env.fit('focused spec', function() {
            actions.push('focused spec');
          });
        });
      });

      var assertions = function() {
        var expected = ['focused spec'];
        expect(actions).toEqual(expected);
        done();
      };

      env.addReporter({jasmineDone: assertions});
      env.execute();
    });
  });

  it("shouldn't run disabled suites", function(done) {
    var specInADisabledSuite = jasmine.createSpy("specInADisabledSuite"),
    suite = env.describe('A Suite', function() {
      env.xdescribe('with a disabled suite', function(){
        env.it('spec inside a disabled suite', specInADisabledSuite);
      });
    });

    var assertions = function() {
      expect(specInADisabledSuite).not.toHaveBeenCalled();
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });

  it("should allow top level suites to be disabled", function() {
    var specInADisabledSuite = jasmine.createSpy("specInADisabledSuite"),
      otherSpec = jasmine.createSpy("otherSpec");

    env.xdescribe('A disabled suite', function() {
      env.it('spec inside a disabled suite', specInADisabledSuite);
    });
    env.describe('Another suite', function() {
      env.it('another spec', otherSpec);
    });

    var assertions = function() {
      expect(specInADisabledSuite).not.toHaveBeenCalled();
      expect(otherSpec).toHaveBeenCalled();
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });

  it("should set all pending specs to pending when a suite is run", function(done) {
    var pendingSpec,
      suite = env.describe('default current suite', function() {
        pendingSpec = env.it("I am a pending spec");
      });

    var assertions = function() {
      expect(pendingSpec.status()).toBe("pending");
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });

  it("should recover gracefully when there are errors in describe functions", function(done) {
    var specs = [],
      reporter = jasmine.createSpyObj(['specDone', 'jasmineDone']);

    reporter.specDone.and.callFake(function(result) {
      specs.push(result.fullName);
    });

    reporter.jasmineDone.and.callFake(function() {
      expect(specs).toContain('outer1 inner1 should thingy');
      expect(specs).toContain('outer1 inner1 encountered a declaration exception');
      expect(specs).toContain('outer1 inner2 should other thingy');
      expect(specs).toContain('outer1 encountered a declaration exception');
      expect(specs).toContain('outer2 should xxx');
      done();
    });

    expect(function() {
      env.describe("outer1", function() {
        env.describe("inner1", function() {
          env.it("should thingy", function() {
            this.expect(true).toEqual(true);
          });

          throw new Error("fake error");
        });

        env.describe("inner2", function() {
          env.it("should other thingy", function() {
            this.expect(true).toEqual(true);
          });
        });

        throw new Error("fake error");

      });
    }).not.toThrow();

    env.describe("outer2", function() {
      env.it("should xxx", function() {
        this.expect(true).toEqual(true);
      });
    });

    env.addReporter(reporter);
    env.execute();
  });

  it("re-enters suites that have no *Alls", function(done) {
    var actions = [],
        spec1, spec2, spec3;

    env.describe("top", function() {
      spec1 = env.it("spec1", function() {
        actions.push("spec1");
      });

      spec2 = env.it("spec2", function() {
        actions.push("spec2");
      });
    });

    spec3 = env.it("spec3", function() {
      actions.push("spec3");
    });

    env.addReporter({
      jasmineDone: function() {
        expect(actions).toEqual(["spec2", "spec3", "spec1"]);
        done();
      }
    });

    env.execute([spec2.id, spec3.id, spec1.id]);
  });

  it("refuses to re-enter suites with a beforeAll", function() {
    var actions = [],
        spec1, spec2, spec3;

    env.describe("top", function() {
      env.beforeAll(function() {});

      spec1 = env.it("spec1", function() {
        actions.push("spec1");
      });

      spec2 = env.it("spec2", function() {
        actions.push("spec2");
      });
    });

    spec3 = env.it("spec3", function() {
      actions.push("spec3");
    });

    env.addReporter({
      jasmineDone: function() {
        expect(actions).toEqual([]);
        done();
      }
    });

    expect(function() {
      env.execute([spec2.id, spec3.id, spec1.id]);
    }).toThrowError(/beforeAll/);
  });

  it("refuses to re-enter suites with a afterAll", function() {
    var actions = [],
        spec1, spec2, spec3;

    env.describe("top", function() {
      env.afterAll(function() {});

      spec1 = env.it("spec1", function() {
        actions.push("spec1");
      });

      spec2 = env.it("spec2", function() {
        actions.push("spec2");
      });
    });

    spec3 = env.it("spec3", function() {
      actions.push("spec3");
    });

    env.addReporter({
      jasmineDone: function() {
        expect(actions).toEqual([]);
        done();
      }
    });

    expect(function() {
      env.execute([spec2.id, spec3.id, spec1.id]);
    }).toThrowError(/afterAll/);
  });

  it("should run the tests in a consistent order when a seed is supplied", function(done) {
    var actions = [];
    env.randomizeTests(true);
    env.seed('123456');

    env.beforeEach(function () {
      actions.push('topSuite beforeEach');
    });

    env.afterEach(function () {
      actions.push('topSuite afterEach');
    });

    env.describe('Something', function() {
      env.beforeEach(function() {
        actions.push('outer beforeEach');
      });

      env.afterEach(function() {
        actions.push('outer afterEach');
      });

      env.it('does it 1', function() {
        actions.push('outer it 1');
      });

      env.describe('Inner 1', function() {
        env.beforeEach(function() {
          actions.push('inner 1 beforeEach');
        });

        env.afterEach(function() {
          actions.push('inner 1 afterEach');
        });

        env.it('does it 2', function() {
          actions.push('inner 1 it');
        });
      });

      env.it('does it 3', function() {
        actions.push('outer it 2');
      });

      env.describe('Inner 2', function() {
        env.beforeEach(function() {
          actions.push('inner 2 beforeEach');
        });

        env.afterEach(function() {
          actions.push('inner 2 afterEach');
        });

        env.it('does it 2', function() {
          actions.push('inner 2 it');
        });
      });
    });

    var assertions = function() {
      var expected = [
        'topSuite beforeEach',
        'outer beforeEach',
        'outer it 2',
        'outer afterEach',
        'topSuite afterEach',

        'topSuite beforeEach',
        'outer beforeEach',
        'inner 2 beforeEach',
        'inner 2 it',
        'inner 2 afterEach',
        'outer afterEach',
        'topSuite afterEach',

        'topSuite beforeEach',
        'outer beforeEach',
        'inner 1 beforeEach',
        'inner 1 it',
        'inner 1 afterEach',
        'outer afterEach',
        'topSuite afterEach',

        'topSuite beforeEach',
        'outer beforeEach',
        'outer it 1',
        'outer afterEach',
        'topSuite afterEach'
      ];
      expect(actions).toEqual(expected);
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });

});
