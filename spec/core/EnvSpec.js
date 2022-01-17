// TODO: Fix these unit tests!
describe('Env', function() {
  var env;
  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  describe('#pending', function() {
    it('throws the Pending Spec exception', function() {
      expect(function() {
        env.pending();
      }).toThrow(jasmineUnderTest.Spec.pendingSpecExceptionMessage);
    });

    it('throws the Pending Spec exception with a custom message', function() {
      expect(function() {
        env.pending('custom message');
      }).toThrow(
        jasmineUnderTest.Spec.pendingSpecExceptionMessage + 'custom message'
      );
    });
  });

  describe('#topSuite', function() {
    it('returns an object that describes the tree of suites and specs', function() {
      var suite;
      spyOn(env, 'deprecated');

      env.it('a top level spec');
      env.describe('a suite', function() {
        env.it('a spec');
        env.describe('a nested suite', function() {
          env.it('a nested spec');
        });
      });

      suite = env.topSuite();
      expect(suite).not.toBeInstanceOf(jasmineUnderTest.Suite);
      expect(suite.description).toEqual('Jasmine__TopLevel__Suite');
      expect(suite.getFullName()).toEqual('');
      expect(suite.children.length).toEqual(2);

      expect(suite.children[0]).not.toBeInstanceOf(jasmineUnderTest.Spec);
      expect(suite.children[0].description).toEqual('a top level spec');
      expect(suite.children[0].getFullName()).toEqual('a top level spec');
      expect(suite.children[0].children).toBeFalsy();

      expect(suite.children[1]).not.toBeInstanceOf(jasmineUnderTest.Suite);
      expect(suite.children[1].description).toEqual('a suite');
      expect(suite.children[1].getFullName()).toEqual('a suite');
      expect(suite.children[1].parentSuite).toBe(suite);
      expect(suite.children[1].children.length).toEqual(2);

      expect(suite.children[1].children[0]).not.toBeInstanceOf(
        jasmineUnderTest.Spec
      );
      expect(suite.children[1].children[0].description).toEqual('a spec');
      expect(suite.children[1].children[0].getFullName()).toEqual(
        'a suite a spec'
      );
      expect(suite.children[1].children[0].children).toBeFalsy();

      expect(suite.children[1].children[1].description).toEqual(
        'a nested suite'
      );
      expect(suite.children[1].children[1].getFullName()).toEqual(
        'a suite a nested suite'
      );
      expect(suite.children[1].children[1].parentSuite).toBe(suite.children[1]);
      expect(suite.children[1].children[1].children.length).toEqual(1);

      expect(suite.children[1].children[1].children[0].description).toEqual(
        'a nested spec'
      );
      expect(suite.children[1].children[1].children[0].getFullName()).toEqual(
        'a suite a nested suite a nested spec'
      );
      expect(suite.children[1].children[1].children[0].children).toBeFalsy();
    });
  });

  it('accepts its own current configureation', function() {
    env.configure(env.configuration());
  });

  it('can configure specs to throw errors on expectation failures', function() {
    env.configure({ stopSpecOnExpectationFailure: true });

    spyOn(jasmineUnderTest, 'Spec').and.callThrough();
    env.it('foo', function() {});
    expect(jasmineUnderTest.Spec).toHaveBeenCalledWith(
      jasmine.objectContaining({
        throwOnExpectationFailure: true
      })
    );
  });

  it('can configure suites to throw errors on expectation failures', function() {
    env.configure({ stopSpecOnExpectationFailure: true });

    spyOn(jasmineUnderTest, 'Suite');
    env.describe('foo', function() {});
    expect(jasmineUnderTest.Suite).toHaveBeenCalledWith(
      jasmine.objectContaining({
        throwOnExpectationFailure: true
      })
    );
  });

  it('ignores configuration properties that are present but undefined', function() {
    spyOn(env, 'deprecated');
    var initialConfig = {
      random: true,
      seed: '123',
      failSpecWithNoExpectations: true,
      stopSpecOnExpectationFailure: true,
      stopOnSpecFailure: true,
      hideDisabled: true
    };
    env.configure(initialConfig);

    env.configure({
      random: undefined,
      seed: undefined,
      failSpecWithNoExpectations: undefined,
      stopSpecOnExpectationFailure: undefined,
      stopOnSpecFailure: undefined,
      hideDisabled: undefined
    });

    expect(env.configuration()).toEqual(
      jasmine.objectContaining(initialConfig)
    );
  });

  it('defaults to multiple failures for specs', function() {
    spyOn(jasmineUnderTest, 'Spec').and.callThrough();
    env.it('bar', function() {});
    expect(jasmineUnderTest.Spec).toHaveBeenCalledWith(
      jasmine.objectContaining({
        throwOnExpectationFailure: false
      })
    );
  });

  it('defaults to multiple failures for suites', function() {
    spyOn(jasmineUnderTest, 'Suite');
    env.describe('foo', function() {});
    expect(jasmineUnderTest.Suite).toHaveBeenCalledWith(
      jasmine.objectContaining({
        throwOnExpectationFailure: false
      })
    );
  });

  function behavesLikeDescribe(methodName) {
    it('returns a suite metadata object', function() {
      let innerSuite;
      let spec;
      const suite = env.describe('outer suite', function() {
        innerSuite = env.describe('inner suite', function() {
          spec = env.it('a spec');
        });
      });

      expect(suite.parentSuite).toEqual(
        jasmine.objectContaining({
          description: 'Jasmine__TopLevel__Suite'
        })
      );
      expect(suite.parentSuite.pend).toBeUndefined();
      expect(suite.pend).toBeUndefined();
      expect(suite.description).toEqual('outer suite');
      expect(suite.getFullName()).toEqual('outer suite');
      expect(suite.id).toBeInstanceOf(String);
      expect(suite.id).not.toEqual('');
      expect(suite.children.length).toEqual(1);
      expect(suite.children[0]).toBe(innerSuite);
      expect(innerSuite.children.length).toEqual(1);
      expect(innerSuite.children[0]).toBe(spec);
      expect(innerSuite.getFullName()).toEqual('outer suite inner suite');
      expect(innerSuite.parentSuite).toBe(suite);
      expect(spec.getFullName()).toEqual('outer suite inner suite a spec');
    });
  }

  describe('#describe', function() {
    behavesLikeDescribe('describe');

    it('throws an error when given arguments', function() {
      expect(function() {
        env.describe('done method', function(done) {});
      }).toThrowError('describe does not expect any arguments');
    });

    it('throws an error when it receives a non-fn argument', function() {
      // Some versions of PhantomJS return [object DOMWindow] when
      // Object.prototype.toString.apply is called with `undefined` or `null`.
      // In a similar fashion, IE8 gives [object Object] for both `undefined`
      // and `null`. We mostly just want these tests to check that using
      // anything other than a function throws an error.
      expect(function() {
        env.describe('undefined arg', undefined);
      }).toThrowError(
        /describe expects a function argument; received \[object (Undefined|DOMWindow|Object)\]/
      );
      expect(function() {
        env.describe('null arg', null);
      }).toThrowError(
        /describe expects a function argument; received \[object (Null|DOMWindow|Object)\]/
      );

      expect(function() {
        env.describe('array arg', []);
      }).toThrowError(
        'describe expects a function argument; received [object Array]'
      );
      expect(function() {
        env.describe('object arg', {});
      }).toThrowError(
        'describe expects a function argument; received [object Object]'
      );

      expect(function() {
        env.describe('fn arg', function() {
          env.it('has a spec', function() {});
        });
      }).not.toThrowError(
        'describe expects a function argument; received [object Function]'
      );
    });

    it('throws an error when it has no children', function() {
      let ran = false;
      env.describe('parent suite', function() {
        expect(function() {
          env.describe('child suite', function() {});
        }).toThrowError(
          'describe with no children (describe() or it()): parent suite child suite'
        );
        ran = true;
      });

      expect(ran).toBeTrue();
    });
  });

  describe('#fdescribe', function() {
    behavesLikeDescribe('fdescribe');
  });

  describe('xdescribe', function() {
    behavesLikeDescribe('xdescribe');
  });

  function behavesLikeIt(methodName) {
    it('returns a spec metadata object', function() {
      let spec;

      env.describe('a suite', function() {
        spec = env[methodName]('a spec', function() {});
      });

      expect(spec.description)
        .withContext('description')
        .toEqual('a spec');
      expect(spec.getFullName())
        .withContext('getFullName')
        .toEqual('a suite a spec');
      expect(spec.id)
        .withContext('id')
        .toBeInstanceOf(String);
      expect(spec.id)
        .withContext('id')
        .not.toEqual('');
      expect(spec.pend).toBeFalsy();
    });
  }

  describe('#it', function() {
    behavesLikeIt('it');

    it('throws an error when it receives a non-fn argument', function() {
      expect(function() {
        env.it('undefined arg', null);
      }).toThrowError(
        /it expects a function argument; received \[object (Null|DOMWindow|Object)\]/
      );
    });

    it('does not throw when it is not given a fn argument', function() {
      expect(function() {
        env.it('pending spec');
      }).not.toThrow();
    });

    it('accepts an async function', function() {
      expect(function() {
        env.it('async', async function() {});
      }).not.toThrow();
    });

    it('throws an error when the timeout value is too large for setTimeout', function() {
      expect(function() {
        env.it('huge timeout', function() {}, 2147483648);
      }).toThrowError('Timeout value cannot be greater than 2147483647');
    });
  });

  describe('#xit', function() {
    behavesLikeIt('xit');

    it('calls spec.exclude with "Temporarily disabled with xit"', function() {
      var excludeSpy = jasmine.createSpy();
      spyOn(env, 'it_').and.returnValue({
        exclude: excludeSpy
      });
      env.xit('foo', function() {});
      expect(excludeSpy).toHaveBeenCalledWith('Temporarily disabled with xit');
    });

    it('calls spec.pend with "Temporarily disabled with xit"', function() {
      var pendSpy = jasmine.createSpy();
      var realExclude = jasmineUnderTest.Spec.prototype.exclude;

      spyOn(env, 'it_').and.returnValue({
        exclude: realExclude,
        pend: pendSpy
      });
      env.xit('foo', function() {});
      expect(pendSpy).toHaveBeenCalledWith('Temporarily disabled with xit');
    });

    it('throws an error when it receives a non-fn argument', function() {
      expect(function() {
        env.xit('undefined arg', null);
      }).toThrowError(
        /xit expects a function argument; received \[object (Null|DOMWindow|Object)\]/
      );
    });

    it('does not throw when it is not given a fn argument', function() {
      expect(function() {
        env.xit('pending spec');
      }).not.toThrow();
    });

    it('accepts an async function', function() {
      expect(function() {
        env.xit('async', async function() {});
      }).not.toThrow();
    });
  });

  describe('#fit', function() {
    behavesLikeIt('fit');

    it('throws an error when it receives a non-fn argument', function() {
      expect(function() {
        env.fit('undefined arg', undefined);
      }).toThrowError(
        /fit expects a function argument; received \[object (Undefined|DOMWindow|Object)\]/
      );
    });

    it('throws an error when the timeout value is too large for setTimeout', function() {
      expect(function() {
        env.fit('huge timeout', function() {}, 2147483648);
      }).toThrowError('Timeout value cannot be greater than 2147483647');
    });
  });

  describe('#beforeEach', function() {
    it('throws an error when it receives a non-fn argument', function() {
      expect(function() {
        env.beforeEach(undefined);
      }).toThrowError(
        /beforeEach expects a function argument; received \[object (Undefined|DOMWindow|Object)\]/
      );
    });

    it('accepts an async function', function() {
      expect(function() {
        env.beforeEach(async function() {});
      }).not.toThrow();
    });

    it('throws an error when the timeout value is too large for setTimeout', function() {
      expect(function() {
        env.beforeEach(function() {}, 2147483648);
      }).toThrowError('Timeout value cannot be greater than 2147483647');
    });
  });

  describe('#beforeAll', function() {
    it('throws an error when it receives a non-fn argument', function() {
      expect(function() {
        env.beforeAll(undefined);
      }).toThrowError(
        /beforeAll expects a function argument; received \[object (Undefined|DOMWindow|Object)\]/
      );
    });

    it('accepts an async function', function() {
      expect(function() {
        env.beforeAll(async function() {});
      }).not.toThrow();
    });

    it('throws an error when the timeout value is too large for setTimeout', function() {
      expect(function() {
        env.beforeAll(function() {}, 2147483648);
      }).toThrowError('Timeout value cannot be greater than 2147483647');
    });
  });

  describe('#afterEach', function() {
    it('throws an error when it receives a non-fn argument', function() {
      expect(function() {
        env.afterEach(undefined);
      }).toThrowError(
        /afterEach expects a function argument; received \[object (Undefined|DOMWindow|Object)\]/
      );
    });

    it('accepts an async function', function() {
      expect(function() {
        env.afterEach(async function() {});
      }).not.toThrow();
    });

    it('throws an error when the timeout value is too large for setTimeout', function() {
      expect(function() {
        env.afterEach(function() {}, 2147483648);
      }).toThrowError('Timeout value cannot be greater than 2147483647');
    });
  });

  describe('#afterAll', function() {
    it('throws an error when it receives a non-fn argument', function() {
      expect(function() {
        env.afterAll(undefined);
      }).toThrowError(
        /afterAll expects a function argument; received \[object (Undefined|DOMWindow|Object)\]/
      );
    });

    it('accepts an async function', function() {
      expect(function() {
        env.afterAll(async function() {});
      }).not.toThrow();
    });

    it('throws an error when the timeout value is too large for setTimeout', function() {
      expect(function() {
        env.afterAll(function() {}, 2147483648);
      }).toThrowError('Timeout value cannot be greater than 2147483647');
    });
  });

  describe('when not constructed with suppressLoadErrors: true', function() {
    it('installs a global error handler on construction', function() {
      var globalErrors = jasmine.createSpyObj('globalErrors', [
        'install',
        'uninstall',
        'pushListener',
        'popListener'
      ]);
      spyOn(jasmineUnderTest, 'GlobalErrors').and.returnValue(globalErrors);
      env.cleanup_();
      env = new jasmineUnderTest.Env();
      expect(globalErrors.install).toHaveBeenCalled();
    });
  });

  describe('when constructed with suppressLoadErrors: true', function() {
    it('does not install a global error handler until execute is called', function() {
      var globalErrors = jasmine.createSpyObj('globalErrors', [
        'install',
        'uninstall',
        'pushListener',
        'popListener'
      ]);
      spyOn(jasmineUnderTest, 'GlobalErrors').and.returnValue(globalErrors);
      env.cleanup_();
      env = new jasmineUnderTest.Env({ suppressLoadErrors: true });
      expect(globalErrors.install).not.toHaveBeenCalled();
      env.execute();
      expect(globalErrors.install).toHaveBeenCalled();
    });
  });

  it('creates an expectationFactory that uses the current custom equality testers and object formatters', function(done) {
    function customEqualityTester() {}
    function customObjectFormatter() {}
    function prettyPrinter() {}
    var RealSpec = jasmineUnderTest.Spec,
      specInstance,
      expectationFactory;
    spyOn(jasmineUnderTest, 'MatchersUtil');
    spyOn(jasmineUnderTest, 'makePrettyPrinter').and.returnValue(prettyPrinter);
    spyOn(jasmineUnderTest, 'Spec').and.callFake(function(options) {
      expectationFactory = options.expectationFactory;
      specInstance = new RealSpec(options);
      return specInstance;
    });

    env.it('spec', function() {
      env.addCustomEqualityTester(customEqualityTester);
      env.addCustomObjectFormatter(customObjectFormatter);
      expectationFactory('actual', specInstance);
    });

    env.execute(null, function() {
      expect(jasmineUnderTest.makePrettyPrinter).toHaveBeenCalledWith([
        customObjectFormatter
      ]);
      expect(jasmineUnderTest.MatchersUtil).toHaveBeenCalledWith({
        customTesters: [customEqualityTester],
        pp: prettyPrinter
      });
      done();
    });
  });

  it('creates an asyncExpectationFactory that uses the current custom equality testers and object formatters', function(done) {
    function customEqualityTester() {}
    function customObjectFormatter() {}
    function prettyPrinter() {}
    var RealSpec = jasmineUnderTest.Spec,
      specInstance,
      asyncExpectationFactory;
    spyOn(jasmineUnderTest, 'MatchersUtil');
    spyOn(jasmineUnderTest, 'makePrettyPrinter').and.returnValue(prettyPrinter);
    spyOn(jasmineUnderTest, 'Spec').and.callFake(function(options) {
      asyncExpectationFactory = options.asyncExpectationFactory;
      specInstance = new RealSpec(options);
      return specInstance;
    });

    env.it('spec', function() {
      env.addCustomEqualityTester(customEqualityTester);
      env.addCustomObjectFormatter(customObjectFormatter);
      asyncExpectationFactory('actual', specInstance);
    });

    env.execute(null, function() {
      expect(jasmineUnderTest.makePrettyPrinter).toHaveBeenCalledWith([
        customObjectFormatter
      ]);
      expect(jasmineUnderTest.MatchersUtil).toHaveBeenCalledWith({
        customTesters: [customEqualityTester],
        pp: prettyPrinter
      });
      done();
    });
  });

  it("does not expose the suite as 'this'", function() {
    var suiteThis;
    spyOn(env, 'deprecated');

    env.describe('a suite', function() {
      suiteThis = this;
      env.it('has a spec');
    });

    expect(suiteThis).not.toBeInstanceOf(jasmineUnderTest.Suite);
  });

  describe('#execute', function() {
    it('returns a promise', function() {
      expect(env.execute()).toBeInstanceOf(Promise);
    });

    it('should reset the topSuite when run twice', function() {
      spyOn(jasmineUnderTest.Suite.prototype, 'reset');
      return env
        .execute() // 1
        .then(function() {
          return env.execute(); // 2
        })
        .then(function() {
          var id;
          expect(
            jasmineUnderTest.Suite.prototype.reset
          ).toHaveBeenCalledOnceWith();
          id = jasmineUnderTest.Suite.prototype.reset.calls.thisFor(0).id;
          expect(id).toBeTruthy();
          expect(id).toEqual(env.topSuite().id);
        });
    });
  });
});
