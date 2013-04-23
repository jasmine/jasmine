// TODO: This should really be part of the Env Integration Spec
describe("jasmine spec running", function () {
  var env;
  var fakeTimer;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
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

    expect(it0.id).toEqual(0);
    expect(it1.id).toEqual(1);
    expect(it2.id).toEqual(2);
    expect(it3.id).toEqual(3);
    expect(it4.id).toEqual(4);
  });

  it('nested suites', function () {

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
    nested.execute();

    expect(foo).toEqual(1);
    expect(bar).toEqual(1);
    expect(baz).toEqual(1);
    expect(quux).toEqual(1);
  });

  it("should permit nested describes", function() {
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

    env.execute();


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
  });

  it("should run multiple befores and afters in the order they are declared", function() {
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

    env.execute();

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
  });

  it("shouldn't run disabled suites", function() {
    var specInADisabledSuite = originalJasmine.createSpy("specInADisabledSuite"),
    suite = env.describe('A Suite', function() {
      env.xdescribe('with a disabled suite', function(){
        env.it('spec inside a disabled suite', specInADisabledSuite);
      });
    });

    suite.execute();

    expect(specInADisabledSuite).not.toHaveBeenCalled();
  });

  it("should set all pending specs to pending when a suite is run", function() {
    var pendingSpec,
      suite = env.describe('default current suite', function() {
        pendingSpec = env.it("I am a pending spec");
      });

    suite.execute();

    expect(pendingSpec.status()).toBe("pending");
  });


  // TODO: is this useful? It doesn't catch syntax errors
  xit("should recover gracefully when there are errors in describe functions", function() {
    var specs = [];
    var superSimpleReporter = new jasmine.Reporter();
    superSimpleReporter.reportSpecResults = function(result) {
      specs.push("Spec: " + result.fullName);
    };

    try {
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
    } catch(e) {
    }

    env.describe("outer2", function() {
      env.it("should xxx", function() {
        this.expect(true).toEqual(true);
      });
    });

    env.addReporter(superSimpleReporter);
    env.execute();

    expect(specs.join('')).toMatch(new RegExp(
      'Spec: outer1 inner1 should thingy.' +
      'Spec: outer1 inner1 encountered a declaration exception.' +
      'Spec: outer1 inner2 should other thingy.' +
      'Spec: outer1 encountered a declaration exception.' +
      'Spec: outer2 should xxx.'
    ));

  });

  describe('ddescribe', function() {
    it('should run only ddescribe suites when at least one registered', function() {
      var normal = jasmine.createSpy('normal spec');
      var exclusive = jasmine.createSpy('exclusive spec');

      env.describe('normal', function() {
        env.it('not executed 1', normal);
        env.it('not executed 2', normal);
      });

      env.ddescribe('exclusive', function() {
        env.it('executed 1', exclusive);
        env.it('executed 2', exclusive);
        env.describe('nested exclusive', function() {
          env.it('executed 3', exclusive);
        });
      });

      env.describe('normal 2', function() {
        env.it('not executed 3', normal);
      });

      env.execute();
      expect(normal).not.toHaveBeenCalled();
      expect(exclusive).toHaveBeenCalled();
      expect(exclusive.callCount).toBe(3);
    });
  });

  describe('iit', function() {
    it('should run only iit specs when at least one registered', function() {
      var normal = jasmine.createSpy('normal spec');
      var exclusive = jasmine.createSpy('exclusive spec');

      env.describe('normal', function() {
        env.it('not executed 1', normal);
        env.iit('executed 1', exclusive);
      });

      env.ddescribe('exclusive', function() {
        env.it('not executed 2', normal);
        env.iit('executed 2', exclusive);
        env.describe('nested exclusive', function() {
          env.iit('executed 3', exclusive);
        });
      });

      env.ddescribe('normal 2', function() {
        env.it('not executed 3', normal);
      });

      env.execute();
      expect(normal).not.toHaveBeenCalled();
      expect(exclusive).toHaveBeenCalled();
      expect(exclusive.callCount).toBe(3);
    });
  });
});
