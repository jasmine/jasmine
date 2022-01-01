describe('spec running', function() {
  var env;

  beforeEach(function() {
    jasmine.getEnv().registerIntegrationMatchers();
    env = new jasmineUnderTest.Env();
    env.configure({ random: false });
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('should assign spec ids sequentially', function() {
    var it0, it1, it2, it3, it4;
    env.describe('test suite', function() {
      it0 = env.it('spec 0', function() {});
      it1 = env.it('spec 1', function() {});
      it2 = env.xit('spec 2', function() {});
      it3 = env.it('spec 3', function() {});
    });
    env.describe('test suite 2', function() {
      it4 = env.it('spec 4', function() {});
    });

    expect(it0.id).toEqual('spec0');
    expect(it1.id).toEqual('spec1');
    expect(it2.id).toEqual('spec2');
    expect(it3.id).toEqual('spec3');
    expect(it4.id).toEqual('spec4');
  });

  it('nested suites', function(done) {
    var foo = 0;
    var bar = 0;
    var baz = 0;
    var quux = 0;
    var nested = env.describe('suite', function() {
      env.describe('nested', function() {
        env.it('should run nested suites', function() {
          foo++;
        });
        env.it('should run nested suites', function() {
          bar++;
        });
      });

      env.describe('nested 2', function() {
        env.it('should run suites following nested suites', function() {
          baz++;
        });
      });

      env.it('should run tests following nested suites', function() {
        quux++;
      });
    });

    expect(foo).toEqual(0);
    expect(bar).toEqual(0);
    expect(baz).toEqual(0);
    expect(quux).toEqual(0);

    env.execute(null, function() {
      expect(foo).toEqual(1);
      expect(bar).toEqual(1);
      expect(baz).toEqual(1);
      expect(quux).toEqual(1);
      done();
    });
  });

  it('should permit nested describes', function(done) {
    var actions = [];

    env.beforeEach(function() {
      actions.push('topSuite beforeEach');
    });

    env.afterEach(function() {
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

    env.execute(null, function() {
      var expected = [
        'topSuite beforeEach',
        'outer beforeEach',
        'outer it 1',
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
        'outer it 2',
        'outer afterEach',
        'topSuite afterEach',

        'topSuite beforeEach',
        'outer beforeEach',
        'inner 2 beforeEach',
        'inner 2 it',
        'inner 2 afterEach',
        'outer afterEach',
        'topSuite afterEach'
      ];
      expect(actions).toEqual(expected);
      done();
    });
  });

  it('should run multiple befores and afters ordered so functions declared later are treated as more specific', function(done) {
    var actions = [];

    env.beforeAll(function() {
      actions.push('runner beforeAll1');
    });

    env.afterAll(function() {
      actions.push('runner afterAll1');
    });

    env.beforeAll(function() {
      actions.push('runner beforeAll2');
    });

    env.afterAll(function() {
      actions.push('runner afterAll2');
    });

    env.beforeEach(function() {
      actions.push('runner beforeEach1');
    });

    env.afterEach(function() {
      actions.push('runner afterEach1');
    });

    env.beforeEach(function() {
      actions.push('runner beforeEach2');
    });

    env.afterEach(function() {
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

    env.execute(null, function() {
      var expected = [
        'runner beforeAll1',
        'runner beforeAll2',
        'runner beforeEach1',
        'runner beforeEach2',
        'beforeEach1',
        'beforeEach2',
        'outer it 1',
        'afterEach2',
        'afterEach1',
        'runner afterEach2',
        'runner afterEach1',
        'runner afterAll2',
        'runner afterAll1'
      ];
      expect(actions).toEqual(expected);
      done();
    });
  });

  it('should run beforeAlls before beforeEachs and afterAlls after afterEachs', function(done) {
    var actions = [];

    env.beforeAll(function() {
      actions.push('runner beforeAll');
    });

    env.afterAll(function() {
      actions.push('runner afterAll');
    });

    env.beforeEach(function() {
      actions.push('runner beforeEach');
    });

    env.afterEach(function() {
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

    env.execute(null, function() {
      var expected = [
        'runner beforeAll',
        'inner beforeAll',
        'runner beforeEach',
        'inner beforeEach',
        'it',
        'inner afterEach',
        'runner afterEach',
        'inner afterAll',
        'runner afterAll'
      ];
      expect(actions).toEqual(expected);
      done();
    });
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

    env.beforeEach(function() {
      actions.push('runner beforeEach');
    });

    env.afterEach(function() {
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

    env.execute([spec2.id, spec.id], function() {
      var expected = [
        'runner beforeAll',
        'inner beforeAll',
        'runner beforeEach',
        'inner beforeEach',
        'it2',
        'inner afterEach',
        'runner afterEach',

        'runner beforeEach',
        'inner beforeEach',
        'it',
        'inner afterEach',
        'runner afterEach',
        'inner afterAll',
        'runner afterAll'
      ];
      expect(actions).toEqual(expected);
      done();
    });
  });

  it('only runs *Alls once in a focused suite', function(done) {
    var actions = [];

    env.fdescribe('Suite', function() {
      env.beforeAll(function() {
        actions.push('beforeAll');
      });
      env.it('should run beforeAll once', function() {
        actions.push('spec');
      });
      env.afterAll(function() {
        actions.push('afterAll');
      });
    });

    env.execute(null, function() {
      expect(actions).toEqual(['beforeAll', 'spec', 'afterAll']);
      done();
    });
  });

  describe('focused runnables', function() {
    it('runs the relevant alls and eachs for each runnable', function(done) {
      var actions = [];
      env.beforeAll(function() {
        actions.push('beforeAll');
      });
      env.afterAll(function() {
        actions.push('afterAll');
      });
      env.beforeEach(function() {
        actions.push('beforeEach');
      });
      env.afterEach(function() {
        actions.push('afterEach');
      });

      env.fdescribe('a focused suite', function() {
        env.it('is run', function() {
          actions.push('spec in fdescribe');
        });
      });

      env.describe('an unfocused suite', function() {
        env.fit('has a focused spec', function() {
          actions.push('focused spec');
        });
      });

      env.execute(null, function() {
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
      });
    });

    it('focused specs in focused suites cause non-focused siblings to not run', function(done) {
      var actions = [];

      env.fdescribe('focused suite', function() {
        env.it('unfocused spec', function() {
          actions.push('unfocused spec');
        });
        env.fit('focused spec', function() {
          actions.push('focused spec');
        });
      });

      env.execute(null, function() {
        var expected = ['focused spec'];
        expect(actions).toEqual(expected);
        done();
      });
    });

    it('focused suites in focused suites cause non-focused siblings to not run', function(done) {
      var actions = [];

      env.fdescribe('focused suite', function() {
        env.it('unfocused spec', function() {
          actions.push('unfocused spec');
        });
        env.fdescribe('inner focused suite', function() {
          env.it('inner spec', function() {
            actions.push('inner spec');
          });
        });
      });

      env.execute(null, function() {
        var expected = ['inner spec'];
        expect(actions).toEqual(expected);
        done();
      });
    });

    it('focused runnables unfocus ancestor focused suites', function(done) {
      var actions = [];

      env.fdescribe('focused suite', function() {
        env.it('unfocused spec', function() {
          actions.push('unfocused spec');
        });
        env.describe('inner focused suite', function() {
          env.fit('focused spec', function() {
            actions.push('focused spec');
          });
        });
      });

      env.execute(null, function() {
        var expected = ['focused spec'];
        expect(actions).toEqual(expected);
        done();
      });
    });
  });

  it("shouldn't run disabled suites", function(done) {
    var specInADisabledSuite = jasmine.createSpy('specInADisabledSuite'),
      suite = env.describe('A Suite', function() {
        env.xdescribe('with a disabled suite', function() {
          env.it('spec inside a disabled suite', specInADisabledSuite);
        });
      });

    env.execute(null, function() {
      expect(specInADisabledSuite).not.toHaveBeenCalled();
      done();
    });
  });

  it("shouldn't run before/after functions in disabled suites", function(done) {
    var shouldNotRun = jasmine.createSpy('shouldNotRun'),
      suite = env.xdescribe('A disabled Suite', function() {
        // None of the before/after functions should run.
        env.beforeAll(shouldNotRun);
        env.beforeEach(shouldNotRun);
        env.afterEach(shouldNotRun);
        env.afterAll(shouldNotRun);

        env.it('spec inside a disabled suite', shouldNotRun);
      });

    env.execute(null, function() {
      expect(shouldNotRun).not.toHaveBeenCalled();
      done();
    });
  });

  it('should allow top level suites to be disabled', function(done) {
    var specInADisabledSuite = jasmine.createSpy('specInADisabledSuite'),
      otherSpec = jasmine.createSpy('otherSpec');

    env.xdescribe('A disabled suite', function() {
      env.it('spec inside a disabled suite', specInADisabledSuite);
    });
    env.describe('Another suite', function() {
      env.it('another spec', otherSpec);
    });

    env.execute(null, function() {
      expect(specInADisabledSuite).not.toHaveBeenCalled();
      expect(otherSpec).toHaveBeenCalled();
      done();
    });
  });

  it('should set all pending specs to pending when a suite is run', function(done) {
    var pendingSpec,
      suite = env.describe('default current suite', function() {
        pendingSpec = env.it('I am a pending spec');
      }),
      reporter = jasmine.createSpyObj('reporter', ['specDone']);

    env.addReporter(reporter);

    env.execute(null, function() {
      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          status: 'pending'
        })
      );
      done();
    });
  });

  it('should recover gracefully when there are errors in describe functions', function(done) {
    var specs = [],
      reporter = jasmine.createSpyObj(['specDone', 'suiteDone']);

    reporter.specDone.and.callFake(function(result) {
      specs.push(result.fullName);
    });

    expect(function() {
      env.describe('outer1', function() {
        env.describe('inner1', function() {
          env.it('should thingy', function() {
            this.expect(true).toEqual(true);
          });

          throw new Error('inner error');
        });

        env.describe('inner2', function() {
          env.it('should other thingy', function() {
            this.expect(true).toEqual(true);
          });
        });

        throw new Error('outer error');
      });
    }).not.toThrow();

    env.describe('outer2', function() {
      env.it('should xxx', function() {
        this.expect(true).toEqual(true);
      });
    });

    env.addReporter(reporter);
    env.execute(null, function() {
      expect(specs).toEqual([
        'outer1 inner1 should thingy',
        'outer1 inner2 should other thingy',
        'outer2 should xxx'
      ]);
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'outer1 inner1',
        [/inner error/]
      );
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('outer1', [
        /outer error/
      ]);
      done();
    });
  });

  it('re-enters suites that have no *Alls', function(done) {
    var actions = [],
      spec1,
      spec2,
      spec3;

    env.describe('top', function() {
      spec1 = env.it('spec1', function() {
        actions.push('spec1');
      });

      spec2 = env.it('spec2', function() {
        actions.push('spec2');
      });
    });

    spec3 = env.it('spec3', function() {
      actions.push('spec3');
    });

    env.execute([spec2.id, spec3.id, spec1.id], function() {
      expect(actions).toEqual(['spec2', 'spec3', 'spec1']);
      done();
    });
  });

  it('refuses to re-enter suites with a beforeAll', function() {
    var actions = [],
      spec1,
      spec2,
      spec3;

    env.describe('top', function() {
      env.beforeAll(function() {});

      spec1 = env.it('spec1', function() {
        actions.push('spec1');
      });

      spec2 = env.it('spec2', function() {
        actions.push('spec2');
      });
    });

    spec3 = env.it('spec3', function() {
      actions.push('spec3');
    });

    expect(function() {
      env.execute([spec2.id, spec3.id, spec1.id]);
    }).toThrowError(/beforeAll/);
    expect(actions).toEqual([]);
  });

  it('refuses to re-enter suites with a afterAll', function() {
    var actions = [],
      spec1,
      spec2,
      spec3;

    env.describe('top', function() {
      env.afterAll(function() {});

      spec1 = env.it('spec1', function() {
        actions.push('spec1');
      });

      spec2 = env.it('spec2', function() {
        actions.push('spec2');
      });
    });

    spec3 = env.it('spec3', function() {
      actions.push('spec3');
    });

    expect(function() {
      env.execute([spec2.id, spec3.id, spec1.id]);
    }).toThrowError(/afterAll/);
    expect(actions).toEqual([]);
  });

  it('should run the tests in a consistent order when a seed is supplied', function(done) {
    var actions = [];
    env.configure({ random: true, seed: '123456' });

    env.beforeEach(function() {
      actions.push('topSuite beforeEach');
    });

    env.afterEach(function() {
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

    env.execute(null, function() {
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
    });
  });

  function hasStandardErrorHandlingBehavior() {
    it('skips to cleanup functions after a thrown error', async function() {
      const actions = [];

      env.describe('Something', function() {
        env.beforeEach(function() {
          actions.push('outer beforeEach');
          throw new Error('error');
        });

        env.afterEach(function() {
          actions.push('outer afterEach');
        });

        env.describe('Inner', function() {
          env.beforeEach(function() {
            actions.push('inner beforeEach');
          });

          env.afterEach(function() {
            actions.push('inner afterEach');
          });

          env.it('does it', function() {
            actions.push('inner it');
          });
        });
      });

      await env.execute();

      expect(actions).toEqual(['outer beforeEach', 'outer afterEach']);
    });

    it('skips to cleanup functions after a rejected promise', async function() {
      const actions = [];

      env.describe('Something', function() {
        env.beforeEach(function() {
          actions.push('outer beforeEach');
          return Promise.reject(new Error('error'));
        });

        env.afterEach(function() {
          actions.push('outer afterEach');
        });

        env.describe('Inner', function() {
          env.beforeEach(function() {
            actions.push('inner beforeEach');
          });

          env.afterEach(function() {
            actions.push('inner afterEach');
          });

          env.it('does it', function() {
            actions.push('inner it');
          });
        });
      });

      await env.execute();

      expect(actions).toEqual(['outer beforeEach', 'outer afterEach']);
    });

    it('skips to cleanup functions after done.fail is called', async function() {
      const actions = [];

      env.describe('Something', function() {
        env.beforeEach(function(done) {
          actions.push('beforeEach');
          done.fail('error');
        });

        env.afterEach(function() {
          actions.push('afterEach');
        });

        env.it('does it', function() {
          actions.push('it');
        });
      });

      await env.execute();

      expect(actions).toEqual(['beforeEach', 'afterEach']);
    });

    it('skips to cleanup functions when an async function times out', async function() {
      const actions = [];

      env.describe('Something', function() {
        env.beforeEach(function(innerDone) {
          actions.push('beforeEach');
        }, 1);

        env.afterEach(function() {
          actions.push('afterEach');
        });

        env.it('does it', function() {
          actions.push('it');
        });
      });

      await env.execute();

      expect(actions).toEqual(['beforeEach', 'afterEach']);
    });

    it('skips to cleanup functions after pending() is called', async function() {
      const actions = [];

      env.describe('Something', function() {
        env.beforeEach(function() {
          actions.push('outer beforeEach');
          pending();
        });

        env.afterEach(function() {
          actions.push('outer afterEach');
        });

        env.describe('Inner', function() {
          env.beforeEach(function() {
            actions.push('inner beforeEach');
          });

          env.afterEach(function() {
            actions.push('inner afterEach');
          });

          env.it('does it', function() {
            actions.push('inner it');
          });
        });
      });

      await env.execute();

      expect(actions).toEqual(['outer beforeEach', 'outer afterEach']);
    });

    it('runs all reporter callbacks even if one fails', async function() {
      const laterReporter = jasmine.createSpyObj('laterReporter', ['specDone']);

      env.it('a spec', function() {});
      env.addReporter({
        specDone: function() {
          throw new Error('nope');
        }
      });
      env.addReporter(laterReporter);

      await env.execute();

      expect(laterReporter.specDone).toHaveBeenCalled();
    });

    it('skips cleanup functions that are defined in child suites when a beforeEach errors', async function() {
      const parentAfterEachFn = jasmine.createSpy('parentAfterEachFn');
      const childAfterEachFn = jasmine.createSpy('childAfterEachFn');

      env.describe('parent suite', function() {
        env.beforeEach(function() {
          throw new Error('nope');
        });

        env.afterEach(parentAfterEachFn);

        env.describe('child suite', function() {
          env.it('a spec', function() {});
          env.afterEach(childAfterEachFn);
        });
      });

      await env.execute();

      expect(parentAfterEachFn).toHaveBeenCalled();
      expect(childAfterEachFn).not.toHaveBeenCalled();
    });
  }

  describe('When stopSpecOnExpectationFailure is true', function() {
    beforeEach(function() {
      env.configure({ stopSpecOnExpectationFailure: true });
    });

    hasStandardErrorHandlingBehavior();

    it('skips to cleanup functions after an expectation failure', async function() {
      var actions = [];

      env.describe('Something', function() {
        env.beforeEach(function() {
          actions.push('outer beforeEach');
          env.expect(1).toBe(2);
        });

        env.afterEach(function() {
          actions.push('outer afterEach');
        });

        env.describe('Inner', function() {
          env.beforeEach(function() {
            actions.push('inner beforeEach');
          });

          env.afterEach(function() {
            actions.push('inner afterEach');
          });

          env.it('does it', function() {
            actions.push('inner it');
          });
        });
      });

      await env.execute();

      expect(actions).toEqual(['outer beforeEach', 'outer afterEach']);
    });
  });

  describe('When stopSpecOnExpectationFailure is false', function() {
    beforeEach(function() {
      env.configure({ stopSpecOnExpectationFailure: false });
    });

    hasStandardErrorHandlingBehavior();

    it('does not skip anything after an expectation failure', async function() {
      var actions = [];

      env.describe('Something', function() {
        env.beforeEach(function() {
          actions.push('outer beforeEach');
          env.expect(1).toBe(2);
        });

        env.afterEach(function() {
          actions.push('outer afterEach');
        });

        env.describe('Inner', function() {
          env.beforeEach(function() {
            actions.push('inner beforeEach');
          });

          env.afterEach(function() {
            actions.push('inner afterEach');
          });

          env.it('does it', function() {
            actions.push('inner it');
          });
        });
      });

      await env.execute();

      expect(actions).toEqual([
        'outer beforeEach',
        'inner beforeEach',
        'inner it',
        'inner afterEach',
        'outer afterEach'
      ]);
    });
  });

  describe('When a top-level beforeAll function fails', function() {
    it('skips and reports contained specs', async function() {
      const outerBeforeEach = jasmine.createSpy('outerBeforeEach');
      const nestedBeforeEach = jasmine.createSpy('nestedBeforeEach');
      const outerAfterEach = jasmine.createSpy('outerAfterEach');
      const nestedAfterEach = jasmine.createSpy('nestedAfterEach');
      const outerIt = jasmine.createSpy('outerIt');
      const nestedIt = jasmine.createSpy('nestedIt');
      const nestedBeforeAll = jasmine.createSpy('nestedBeforeAll');

      env.beforeAll(function() {
        throw new Error('nope');
      });

      env.beforeEach(outerBeforeEach);
      env.it('a spec', outerIt);
      env.describe('a nested suite', function() {
        env.beforeAll(nestedBeforeAll);
        env.beforeEach(nestedBeforeEach);
        env.it('a nested spec', nestedIt);
        env.afterEach(nestedAfterEach);
      });
      env.afterEach(outerAfterEach);

      const reporter = jasmine.createSpyObj('reporter', [
        'suiteStarted',
        'suiteDone',
        'specStarted',
        'specDone'
      ]);
      env.addReporter(reporter);

      await env.execute();

      expect(outerBeforeEach).not.toHaveBeenCalled();
      expect(outerIt).not.toHaveBeenCalled();
      expect(nestedBeforeAll).not.toHaveBeenCalled();
      expect(nestedBeforeEach).not.toHaveBeenCalled();
      expect(nestedIt).not.toHaveBeenCalled();
      expect(nestedAfterEach).not.toHaveBeenCalled();
      expect(outerAfterEach).not.toHaveBeenCalled();

      expect(reporter.suiteStarted).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a nested suite'
        })
      );

      // The child suite should be reported as passed, for consistency with
      // suites that contain failing specs but no suite-level errors.
      expect(reporter.suiteDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a nested suite',
          status: 'passed',
          failedExpectations: []
        })
      );

      expect(reporter.specStarted).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a spec'
        })
      );
      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a spec',
          status: 'failed',
          failedExpectations: [
            jasmine.objectContaining({
              passed: false,
              message:
                'Not run because a beforeAll function failed. The ' +
                'beforeAll failure will be reported on the suite that ' +
                'caused it.'
            })
          ]
        })
      );

      expect(reporter.specStarted).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a nested suite a nested spec'
        })
      );
      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a nested suite a nested spec',
          status: 'failed',
          failedExpectations: [
            jasmine.objectContaining({
              passed: false,
              message:
                'Not run because a beforeAll function failed. The ' +
                'beforeAll failure will be reported on the suite that ' +
                'caused it.'
            })
          ]
        })
      );
    });
  });

  describe('When a suite beforeAll function fails', function() {
    it('skips and reports contained specs', async function() {
      const outerBeforeEach = jasmine.createSpy('outerBeforeEach');
      const nestedBeforeEach = jasmine.createSpy('nestedBeforeEach');
      const outerAfterEach = jasmine.createSpy('outerAfterEach');
      const nestedAfterEach = jasmine.createSpy('nestedAfterEach');
      const outerIt = jasmine.createSpy('outerIt');
      const nestedIt = jasmine.createSpy('nestedIt');
      const nestedBeforeAll = jasmine.createSpy('nestedBeforeAll');

      env.describe('a suite', function() {
        env.beforeAll(function() {
          throw new Error('nope');
        });

        env.beforeEach(outerBeforeEach);
        env.it('a spec', outerIt);
        env.describe('a nested suite', function() {
          env.beforeAll(nestedBeforeAll);
          env.beforeEach(nestedBeforeEach);
          env.it('a nested spec', nestedIt);
          env.afterEach(nestedAfterEach);
        });
        env.afterEach(outerAfterEach);
      });

      const reporter = jasmine.createSpyObj('reporter', [
        'suiteStarted',
        'suiteDone',
        'specStarted',
        'specDone'
      ]);
      env.addReporter(reporter);

      await env.execute();

      expect(outerBeforeEach).not.toHaveBeenCalled();
      expect(outerIt).not.toHaveBeenCalled();
      expect(nestedBeforeAll).not.toHaveBeenCalled();
      expect(nestedBeforeEach).not.toHaveBeenCalled();
      expect(nestedIt).not.toHaveBeenCalled();
      expect(nestedAfterEach).not.toHaveBeenCalled();
      expect(outerAfterEach).not.toHaveBeenCalled();

      expect(reporter.suiteStarted).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a suite a nested suite'
        })
      );

      // The child suite should be reported as passed, for consistency with
      // suites that contain failing specs but no suite-level errors.
      expect(reporter.suiteDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a suite a nested suite',
          status: 'passed',
          failedExpectations: []
        })
      );

      expect(reporter.specStarted).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a suite a spec'
        })
      );
      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a suite a spec',
          status: 'failed',
          failedExpectations: [
            jasmine.objectContaining({
              passed: false,
              message:
                'Not run because a beforeAll function failed. The ' +
                'beforeAll failure will be reported on the suite that ' +
                'caused it.'
            })
          ]
        })
      );

      expect(reporter.specStarted).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a suite a nested suite a nested spec'
        })
      );
      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fullName: 'a suite a nested suite a nested spec',
          status: 'failed',
          failedExpectations: [
            jasmine.objectContaining({
              passed: false,
              message:
                'Not run because a beforeAll function failed. The ' +
                'beforeAll failure will be reported on the suite that ' +
                'caused it.'
            })
          ]
        })
      );
    });

    it('runs afterAll functions in the current suite and outer scopes', async function() {
      const outerAfterAll = jasmine.createSpy('outerAfterAll');
      const nestedAfterAll = jasmine.createSpy('nestedAfterAll');
      const secondNestedAfterAll = jasmine.createSpy('secondNestedAfterAll');

      env.describe('a nested suite', function() {
        env.beforeAll(function() {
          throw new Error('nope');
        });

        env.describe('more nesting', function() {
          env.it('a nested spec', function() {});
          env.afterAll(secondNestedAfterAll);
        });

        env.afterAll(nestedAfterAll);
      });
      env.afterAll(outerAfterAll);

      await env.execute();

      expect(secondNestedAfterAll).not.toHaveBeenCalled();
      expect(nestedAfterAll).toHaveBeenCalled();
      expect(outerAfterAll).toHaveBeenCalled();
    });
  });

  describe('when stopOnSpecFailure is on', function() {
    it('does not run further specs when one fails', function(done) {
      var actions = [],
        config;

      env.describe('wrapper', function() {
        env.it('fails', function() {
          actions.push('fails');
          env.expect(1).toBe(2);
        });
      });

      env.describe('holder', function() {
        env.it('does not run', function() {
          actions.push('does not run');
        });
      });

      env.configure({ random: false });
      env.configure({ stopOnSpecFailure: true });

      env.execute(null, function() {
        expect(actions).toEqual(['fails']);
        done();
      });
    });

    it('runs afterAll functions', async function() {
      const actions = [];

      env.describe('outer suite', function() {
        env.describe('inner suite', function() {
          env.it('fails', function() {
            actions.push('fails');
            env.expect(1).toBe(2);
          });

          env.afterAll(function() {
            actions.push('inner afterAll');
          });
        });

        env.afterAll(function() {
          actions.push('outer afterAll');
        });
      });

      env.afterAll(function() {
        actions.push('top afterAll');
      });

      env.configure({ stopOnSpecFailure: true });
      await env.execute();

      expect(actions).toEqual([
        'fails',
        'inner afterAll',
        'outer afterAll',
        'top afterAll'
      ]);
    });
  });

  describe('run multiple times', function() {
    beforeEach(function() {
      env.configure({ autoCleanClosures: false, random: false });
    });

    it('should be able to run multiple times', function(done) {
      var actions = [];

      env.describe('Suite', function() {
        env.it('spec1', function() {
          actions.push('spec1');
        });
        env.describe('inner suite', function() {
          env.it('spec2', function() {
            actions.push('spec2');
          });
        });
      });

      env.execute(null, function() {
        expect(actions).toEqual(['spec1', 'spec2']);
        env.execute(null, function() {
          expect(actions).toEqual(['spec1', 'spec2', 'spec1', 'spec2']);
          done();
        });
      });
    });

    it('should reset results between runs', function(done) {
      var specResults = {};
      var suiteResults = {};
      var firstExecution = true;

      env.addReporter({
        specDone: function(spec) {
          specResults[spec.description] = spec.status;
        },
        suiteDone: function(suite) {
          suiteResults[suite.description] = suite.status;
        },
        jasmineDone: function() {
          firstExecution = false;
        }
      });

      env.describe('suite0', function() {
        env.it('spec1', function() {
          if (firstExecution) {
            env.expect(1).toBe(2);
          }
        });
        env.describe('suite1', function() {
          env.it('spec2', function() {
            if (firstExecution) {
              env.pending();
            }
          });
          env.xit('spec3', function() {}); // Always pending
        });
        env.describe('suite2', function() {
          env.it('spec4', function() {
            if (firstExecution) {
              throw new Error('spec 3 fails');
            }
          });
        });
        env.describe('suite3', function() {
          env.beforeEach(function() {
            throw new Error('suite 3 fails');
          });
          env.it('spec5', function() {});
        });
        env.xdescribe('suite4', function() {
          // Always pending
          env.it('spec6', function() {});
        });
        env.describe('suite5', function() {
          env.it('spec7');
        });
      });

      env.execute(null, function() {
        expect(specResults).toEqual({
          spec1: 'failed',
          spec2: 'pending',
          spec3: 'pending',
          spec4: 'failed',
          spec5: 'failed',
          spec6: 'pending',
          spec7: 'pending'
        });
        expect(suiteResults).toEqual({
          suite0: 'passed',
          suite1: 'passed',
          suite2: 'passed',
          suite3: 'passed',
          suite4: 'pending',
          suite5: 'passed'
        });
        env.execute(null, function() {
          expect(specResults).toEqual({
            spec1: 'passed',
            spec2: 'passed',
            spec3: 'pending',
            spec4: 'passed',
            spec5: 'failed',
            spec6: 'pending',
            spec7: 'pending'
          });
          expect(suiteResults).toEqual({
            suite0: 'passed',
            suite1: 'passed',
            suite2: 'passed',
            suite3: 'passed',
            suite4: 'pending',
            suite5: 'passed'
          });
          done();
        });
      });
    });

    it('should execute before and after hooks per run', function(done) {
      var timeline = [];
      var timelineFn = function(hookName) {
        return function() {
          timeline.push(hookName);
        };
      };
      var expectedTimeLine = [
        'beforeAll',
        'beforeEach',
        'spec1',
        'afterEach',
        'beforeEach',
        'spec2',
        'afterEach',
        'afterAll'
      ];

      env.describe('suite0', function() {
        env.beforeAll(timelineFn('beforeAll'));
        env.beforeEach(timelineFn('beforeEach'));
        env.afterEach(timelineFn('afterEach'));
        env.afterAll(timelineFn('afterAll'));
        env.it('spec1', timelineFn('spec1'));
        env.it('spec2', timelineFn('spec2'));
      });
      env.execute(null, function() {
        expect(timeline).toEqual(expectedTimeLine);
        timeline = [];
        env.execute(null, function() {
          expect(timeline).toEqual(expectedTimeLine);
          done();
        });
      });
    });

    it('should be able to filter out different tests in subsequent runs', function(done) {
      var specResults = {};
      var focussedSpec = 'spec1';

      env.configure({
        specFilter: function(spec) {
          return spec.description === focussedSpec;
        }
      });

      env.addReporter({
        specDone: function(spec) {
          specResults[spec.description] = spec.status;
        }
      });

      env.describe('suite0', function() {
        env.it('spec1', function() {});
        env.it('spec2', function() {});
        env.it('spec3', function() {});
      });

      env.execute(null, function() {
        expect(specResults).toEqual({
          spec1: 'passed',
          spec2: 'excluded',
          spec3: 'excluded'
        });
        focussedSpec = 'spec2';
        env.execute(null, function() {
          expect(specResults).toEqual({
            spec1: 'excluded',
            spec2: 'passed',
            spec3: 'excluded'
          });
          focussedSpec = 'spec3';
          env.execute(null, function() {
            expect(specResults).toEqual({
              spec1: 'excluded',
              spec2: 'excluded',
              spec3: 'passed'
            });
            done();
          });
        });
      });
    });
  });
});
