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
      expect(suite.description).toEqual('Jasmine__TopLevel__Suite');
      expect(suite.getFullName()).toEqual('');
      expect(suite.children.length).toEqual(2);

      expect(suite.children[0].description).toEqual('a top level spec');
      expect(suite.children[0].getFullName()).toEqual('a top level spec');
      expect(suite.children[0].children).toBeFalsy();

      expect(suite.children[1].description).toEqual('a suite');
      expect(suite.children[1].getFullName()).toEqual('a suite');
      expect(suite.children[1].parentSuite).toBe(suite);
      expect(suite.children[1].children.length).toEqual(2);

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

    it('does not deprecate access to public Suite and Spec members', function() {
      jasmine.getEnv().requireProxy();
      var suite;
      spyOn(env, 'deprecated');

      env.it('a top level spec');
      env.describe('a suite', function() {
        env.it('a spec');
      });

      suite = env.topSuite();
      suite.id;
      suite.description;
      suite.getFullName();
      suite.children;
      suite.parentSuite;
      suite.children[0].id;
      suite.children[0].description;
      suite.children[0].getFullName();
      suite.children[0].children;

      suite.children[1].id;
      suite.children[1].description;
      suite.children[1].getFullName();
      suite.children[1].parentSuite;
      suite.children[1].children;

      expect(env.deprecated).not.toHaveBeenCalled();
    });

    it('deprecates access to internal Spec members via it(), fit(), and xit()', function() {
      jasmine.getEnv().requireProxy();
      spyOn(env, 'deprecated');

      ['it', 'fit', 'xit'].forEach(function(method) {
        var spec = env[method]('a spec', function() {});
        expect(env.deprecated).not.toHaveBeenCalled();

        spec.pend();
        expect(env.deprecated)
          .withContext('via ' + method)
          .toHaveBeenCalledWith(
            'Access to private Spec members (in this case `pend`) is not ' +
              'supported and will break in a future release. See ' +
              '<https://jasmine.github.io/api/edge/Spec.html> for correct usage.'
          );
        env.deprecated.calls.reset();

        spec.expectationFactory = {};
        expect(env.deprecated)
          .withContext('via ' + method)
          .toHaveBeenCalledWith(
            'Access to private Spec members (in this case `expectationFactory`) is not ' +
              'supported and will break in a future release. See ' +
              '<https://jasmine.github.io/api/edge/Spec.html> for correct usage.'
          );
        env.deprecated.calls.reset();

        spec.expectationFactory = {};
        expect(env.deprecated)
          .withContext('via ' + method)
          .toHaveBeenCalledWith(
            'Access to private Spec members (in this case `expectationFactory`) is not ' +
              'supported and will break in a future release. See ' +
              '<https://jasmine.github.io/api/edge/Spec.html> for correct usage.'
          );
        env.deprecated.calls.reset();
      });
    });

    it('deprecates access to internal Spec and Suite members via describe(), fdescribe(), and xdescribe()', function() {
      jasmine.getEnv().requireProxy();
      spyOn(env, 'deprecated');

      ['describe', 'fdescribe', 'xdescribe'].forEach(function(method) {
        var suite = env[method]('a suite', function() {
          env.it('a spec');
        });

        suite.expectationFactory;
        expect(env.deprecated)
          .withContext('via ' + method)
          .toHaveBeenCalledWith(
            'Access to private Suite ' +
              'members (in this case `expectationFactory`) is ' +
              'not supported and will break in a future release. See ' +
              '<https://jasmine.github.io/api/edge/Suite.html> for correct usage.'
          );
        env.deprecated.calls.reset();

        suite.expectationFactory = {};
        expect(env.deprecated)
          .withContext('via ' + method)
          .toHaveBeenCalledWith(
            'Access to private Suite ' +
              'members (in this case `expectationFactory`) is ' +
              'not supported and will break in a future release. See ' +
              '<https://jasmine.github.io/api/edge/Suite.html> for correct usage.'
          );
        env.deprecated.calls.reset();

        suite.status();
        expect(env.deprecated)
          .withContext('via ' + method)
          .toHaveBeenCalledWith(
            'Access to private Suite ' +
              'members (in this case `status`) is ' +
              'not supported and will break in a future release. See ' +
              '<https://jasmine.github.io/api/edge/Suite.html> for correct usage.'
          );
        env.deprecated.calls.reset();
      });
    });

    it('deprecates access to internal Suite and Spec members via topSuite', function() {
      jasmine.getEnv().requireProxy();
      var topSuite, expectationFactory, spec;

      env.it('a top level spec');
      spyOn(env, 'deprecated');
      topSuite = env.topSuite();

      topSuite.expectationFactory;
      expect(env.deprecated).toHaveBeenCalledWith(
        'Access to private Suite ' +
          'members (in this case `expectationFactory`) is ' +
          'not supported and will break in a future release. See ' +
          '<https://jasmine.github.io/api/edge/Suite.html> for correct usage.'
      );
      env.deprecated.calls.reset();

      topSuite.expectationFactory = expectationFactory;
      expect(env.deprecated).toHaveBeenCalledWith(
        'Access to private Suite ' +
          'members (in this case `expectationFactory`) is ' +
          'not supported and will break in a future release. See ' +
          '<https://jasmine.github.io/api/edge/Suite.html> for correct usage.'
      );

      topSuite.status();
      expect(env.deprecated).toHaveBeenCalledWith(
        'Access to private Suite ' +
          'members (in this case `status`) is ' +
          'not supported and will break in a future release. See ' +
          '<https://jasmine.github.io/api/edge/Suite.html> for correct usage.'
      );

      spec = topSuite.children[0];
      spec.pend();
      expect(env.deprecated).toHaveBeenCalledWith(
        'Access to private Spec ' +
          'members (in this case `pend`) ' +
          'is not supported and will break in a future release. See ' +
          '<https://jasmine.github.io/api/edge/Spec.html> for correct usage.'
      );

      expectationFactory = spec.expectationFactory;
      expect(env.deprecated).toHaveBeenCalledWith(
        'Access to private Spec ' +
          'members (in this case `expectationFactory`) ' +
          'is not supported and will break in a future release. See ' +
          '<https://jasmine.github.io/api/edge/Spec.html> for correct usage.'
      );
      env.deprecated.calls.reset();

      spec.expectationFactory = expectationFactory;
      expect(env.deprecated).toHaveBeenCalledWith(
        'Access to private Spec ' +
          'members (in this case `expectationFactory`) ' +
          'is not supported and will break in a future release. See ' +
          '<https://jasmine.github.io/api/edge/Spec.html> for correct usage.'
      );
    });
  });

  it('accepts its own current configureation', function() {
    env.configure(env.configuration());
  });

  it('can configure specs to throw errors on expectation failures', function() {
    env.configure({ stopSpecOnExpectationFailure: true });

    spyOn(jasmineUnderTest, 'Spec');
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
      failFast: true,
      failSpecWithNoExpectations: true,
      oneFailurePerSpec: true,
      stopSpecOnExpectationFailure: true,
      stopOnSpecFailure: true,
      hideDisabled: true
    };
    env.configure(initialConfig);

    env.configure({
      random: undefined,
      seed: undefined,
      failFast: undefined,
      failSpecWithNoExpectations: undefined,
      oneFailurePerSpec: undefined,
      stopSpecOnExpectationFailure: undefined,
      stopOnSpecFailure: undefined,
      hideDisabled: undefined
    });

    expect(env.configuration()).toEqual(
      jasmine.objectContaining(initialConfig)
    );
  });

  it('sets stopOnSpecFailure when failFast is set, and vice versa', function() {
    spyOn(env, 'deprecated');
    env.configure({ failFast: true });
    expect(env.configuration()).toEqual(
      jasmine.objectContaining({
        failFast: true,
        stopOnSpecFailure: true
      })
    );

    env.configure({ stopOnSpecFailure: false });
    expect(env.configuration()).toEqual(
      jasmine.objectContaining({
        failFast: false,
        stopOnSpecFailure: false
      })
    );
  });

  it('rejects a single call that sets stopOnSpecFailure and failFast to different values', function() {
    spyOn(env, 'deprecated');
    expect(function() {
      env.configure({ failFast: true, stopOnSpecFailure: false });
    }).toThrowError(
      'stopOnSpecFailure and failFast are aliases for each ' +
        "other. Don't set failFast if you also set stopOnSpecFailure."
    );
  });

  it('deprecates the failFast config property', function() {
    spyOn(env, 'deprecated');
    env.configure({ failFast: true });
    expect(env.deprecated).toHaveBeenCalledWith(
      'The `failFast` config property is deprecated and will be removed in a ' +
        'future version of Jasmine. Please use `stopOnSpecFailure` instead.',
      { ignoreRunnable: true }
    );
  });

  it('sets stopSpecOnExpectationFailure when oneFailurePerSpec is set, and vice versa', function() {
    spyOn(env, 'deprecated');
    env.configure({ oneFailurePerSpec: true });
    expect(env.configuration()).toEqual(
      jasmine.objectContaining({
        oneFailurePerSpec: true,
        stopSpecOnExpectationFailure: true
      })
    );

    env.configure({ stopSpecOnExpectationFailure: false });
    expect(env.configuration()).toEqual(
      jasmine.objectContaining({
        oneFailurePerSpec: false,
        stopSpecOnExpectationFailure: false
      })
    );
  });

  it('rejects a single call that sets stopSpecOnExpectationFailure and oneFailurePerSpec to different values', function() {
    spyOn(env, 'deprecated');
    expect(function() {
      env.configure({
        oneFailurePerSpec: true,
        stopSpecOnExpectationFailure: false
      });
    }).toThrowError(
      'stopSpecOnExpectationFailure and oneFailurePerSpec are ' +
        "aliases for each other. Don't set oneFailurePerSpec if you also set " +
        'stopSpecOnExpectationFailure.'
    );
  });

  it('deprecates the oneFailurePerSpec config property', function() {
    spyOn(env, 'deprecated');
    env.configure({ oneFailurePerSpec: true });
    expect(env.deprecated).toHaveBeenCalledWith(
      'The `oneFailurePerSpec` config property is deprecated and will be ' +
        'removed in a future version of Jasmine. Please use ' +
        '`stopSpecOnExpectationFailure` instead.',
      { ignoreRunnable: true }
    );
  });

  describe('promise library', function() {
    it('can be configured without a custom library', function() {
      env.configure({});
      env.configure({ Promise: undefined });
    });

    it('can be configured with a custom library', function() {
      spyOn(env, 'deprecated');
      var myLibrary = {
        resolve: jasmine.createSpy(),
        reject: jasmine.createSpy()
      };
      env.configure({ Promise: myLibrary });
      expect(env.deprecated).toHaveBeenCalledWith(
        'The `Promise` config property is deprecated. Future versions of ' +
          'Jasmine will create native promises even if the `Promise` config ' +
          'property is set. Please remove it.'
      );
    });

    it('cannot be configured with an invalid promise library', function() {
      var myLibrary = {};

      expect(function() {
        env.configure({ Promise: myLibrary });
      }).toThrowError(
        'Custom promise library missing `resolve`/`reject` functions'
      );
    });
  });

  it('defaults to multiple failures for specs', function() {
    spyOn(jasmineUnderTest, 'Spec');
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

  describe('#describe', function() {
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

    it('logs a deprecation when it has no children', function() {
      spyOn(env, 'deprecated');
      env.describe('no children', function() {});
      expect(env.deprecated).toHaveBeenCalledWith(
        'describe with no children' +
          ' (describe() or it()) is deprecated and will be removed in a future ' +
          'version of Jasmine. Please either remove the describe or add ' +
          'children to it.'
      );
    });
  });

  describe('#it', function() {
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
      jasmine.getEnv().requireAsyncAwait();
      expect(function() {
        env.it('async', jasmine.getEnv().makeAsyncAwaitFunction());
      }).not.toThrow();
    });

    it('throws an error when the timeout value is too large for setTimeout', function() {
      expect(function() {
        env.it('huge timeout', function() {}, 2147483648);
      }).toThrowError('Timeout value cannot be greater than 2147483647');
    });
  });

  describe('#xit', function() {
    it('calls spec.exclude with "Temporarily disabled with xit"', function() {
      var excludeSpy = jasmine.createSpy();
      spyOn(env, 'it_').and.returnValue({
        exclude: excludeSpy
      });
      env.xit('foo', function() {});
      expect(excludeSpy).toHaveBeenCalledWith('Temporarily disabled with xit');
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
      jasmine.getEnv().requireAsyncAwait();
      expect(function() {
        env.xit('async', jasmine.getEnv().makeAsyncAwaitFunction());
      }).not.toThrow();
    });
  });

  describe('#fit', function() {
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
      jasmine.getEnv().requireAsyncAwait();
      expect(function() {
        env.beforeEach(jasmine.getEnv().makeAsyncAwaitFunction());
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
      jasmine.getEnv().requireAsyncAwait();
      expect(function() {
        env.beforeAll(jasmine.getEnv().makeAsyncAwaitFunction());
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
      jasmine.getEnv().requireAsyncAwait();
      expect(function() {
        env.afterEach(jasmine.getEnv().makeAsyncAwaitFunction());
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
      jasmine.getEnv().requireAsyncAwait();
      expect(function() {
        env.afterAll(jasmine.getEnv().makeAsyncAwaitFunction());
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

  it("deprecates access to 'this' in describes", function() {
    jasmine.getEnv().requireProxy();
    var msg = "Access to 'this' in describe functions is deprecated.",
      ran = false;
    spyOn(env, 'deprecated');

    env.describe('a suite', function() {
      expect(this.description).toEqual('a suite');
      expect(env.deprecated).toHaveBeenCalledWith(msg);
      env.deprecated.calls.reset();

      this.foo = 1;
      expect(env.deprecated).toHaveBeenCalledWith(msg);
      expect(this.foo).toEqual(1);
      env.deprecated.calls.reset();

      expect(this.getFullName()).toEqual('a suite');
      expect(env.deprecated).toHaveBeenCalledWith(msg);
      env.deprecated.calls.reset();

      env.it('has a spec');
      ran = true;
    });

    expect(ran).toBeTrue();
  });

  // TODO: Remove this in the next major version. Suites were never meant to be
  // exposed via describe 'this' in >= 2.0, and user code should not rely on it.
  // This spec is just here to make sure we don't break user code that *does*
  // rely on it in older browsers (without Proxy) while deprecating it.
  it("sets 'this' to the Suite in describes", function() {
    var suiteThis;
    spyOn(env, 'deprecated');

    env.describe('a suite', function() {
      suiteThis = this;
      env.it('has a spec');
    });

    expect(suiteThis).toBeInstanceOf(jasmineUnderTest.Suite);
  });

  describe('#execute', function() {
    it('returns a promise when the environment supports promises', function() {
      jasmine.getEnv().requirePromises();
      expect(env.execute()).toBeInstanceOf(Promise);
    });

    it('returns a promise when a custom promise constructor is provided', function() {
      function CustomPromise() {}
      CustomPromise.resolve = function() {};
      CustomPromise.reject = function() {};

      spyOn(env, 'deprecated');
      env.configure({ Promise: CustomPromise });
      expect(env.execute()).toBeInstanceOf(CustomPromise);
    });

    it('returns undefined when promises are unavailable', function() {
      jasmine.getEnv().requireNoPromises();
      expect(env.execute()).toBeUndefined();
    });

    it('should reset the topSuite when run twice', function() {
      jasmine.getEnv().requirePromises();
      spyOn(env.topSuite(), 'reset');
      return env
        .execute() // 1
        .then(function() {
          return env.execute(); // 2
        })
        .then(function() {
          expect(env.topSuite().reset).toHaveBeenCalledOnceWith();
        });
    });
  });
});
