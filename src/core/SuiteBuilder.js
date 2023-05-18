getJasmineRequireObj().SuiteBuilder = function(j$) {
  class SuiteBuilder {
    constructor(options) {
      this.env_ = options.env;
      this.expectationFactory_ = options.expectationFactory;
      this.suiteAsyncExpectationFactory_ = function(actual, suite) {
        return options.asyncExpectationFactory(actual, suite, 'Suite');
      };
      this.specAsyncExpectationFactory_ = function(actual, suite) {
        return options.asyncExpectationFactory(actual, suite, 'Spec');
      };
      this.onLateError_ = options.onLateError;
      this.specResultCallback_ = options.specResultCallback;
      this.specStarted_ = options.specStarted;

      this.nextSuiteId_ = 0;
      this.nextSpecId_ = 0;

      this.topSuite = this.suiteFactory_('Jasmine__TopLevel__Suite');
      this.currentDeclarationSuite_ = this.topSuite;
      this.totalSpecsDefined = 0;
      this.focusedRunables = [];
    }

    inDescribe() {
      return this.currentDeclarationSuite_ !== this.topSuite;
    }

    parallelReset() {
      this.topSuite.removeChildren();
      this.topSuite.reset();
      this.totalSpecsDefined = 0;
      this.focusedRunables = [];
    }

    describe(description, definitionFn, filename) {
      ensureIsFunction(definitionFn, 'describe');
      const suite = this.suiteFactory_(description, filename);
      if (definitionFn.length > 0) {
        throw new Error('describe does not expect any arguments');
      }
      if (this.currentDeclarationSuite_.markedExcluding) {
        suite.exclude();
      }
      this.addSpecsToSuite_(suite, definitionFn);
      return suite;
    }

    fdescribe(description, definitionFn, filename) {
      ensureIsFunction(definitionFn, 'fdescribe');
      const suite = this.suiteFactory_(description, filename);
      suite.isFocused = true;

      this.focusedRunables.push(suite.id);
      this.unfocusAncestor_();
      this.addSpecsToSuite_(suite, definitionFn);

      return suite;
    }

    xdescribe(description, definitionFn, filename) {
      ensureIsFunction(definitionFn, 'xdescribe');
      const suite = this.suiteFactory_(description, filename);
      suite.exclude();
      this.addSpecsToSuite_(suite, definitionFn);

      return suite;
    }

    it(description, fn, timeout, filename) {
      // it() sometimes doesn't have a fn argument, so only check the type if
      // it's given.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'it');
      }

      return this.it_(description, fn, timeout, filename);
    }

    xit(description, fn, timeout, filename) {
      // xit(), like it(), doesn't always have a fn argument, so only check the
      // type when needed.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'xit');
      }
      const spec = this.it_(description, fn, timeout, filename);
      spec.exclude('Temporarily disabled with xit');
      return spec;
    }

    fit(description, fn, timeout, filename) {
      // Unlike it and xit, the function is required because it doesn't make
      // sense to focus on nothing.
      ensureIsFunctionOrAsync(fn, 'fit');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }
      const spec = this.specFactory_(description, fn, timeout, filename);
      this.currentDeclarationSuite_.addChild(spec);
      this.focusedRunables.push(spec.id);
      this.unfocusAncestor_();
      return spec;
    }

    oit(description, fn, timeout, filename, options) {
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'it');
      }

      let optionsObjects = {
        suiteBuilder: this,
        unitTests: [],
        originalValues: {
          description: description,
          fn: fn,
          timeout: timeout,
          filename: filename,
          options: options
        }
      };

      let optionsProcessor = j$.options.getOptionsProcessor(optionsObjects, j$);
      let unitTests = optionsProcessor.execute();

      let specs = [];
      for (
        let unitTestIndex = 0;
        unitTestIndex < unitTests.length;
        unitTestIndex++
      ) {
        let unitTest = unitTests[unitTestIndex];
        const spec = this.it_(
          unitTest.description,
          unitTest.fn,
          unitTest.timeout,
          unitTest.filename
        );
        if (unitTest.excludedMsg != undefined) {
          spec.exclude(unitTest.excludedMsg);
        }
        if (unitTest.stopOnFailure != undefined && unitTest.stopOnFailure) {
          spec.throwOnExpectationFailure = true;
        }
        specs.push(spec);
      }

      return specs;
    }

    beforeEach(beforeEachFunction, timeout) {
      ensureIsFunctionOrAsync(beforeEachFunction, 'beforeEach');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      this.currentDeclarationSuite_.beforeEach({
        fn: beforeEachFunction,
        timeout: timeout || 0
      });
    }

    beforeAll(beforeAllFunction, timeout) {
      ensureIsFunctionOrAsync(beforeAllFunction, 'beforeAll');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      this.currentDeclarationSuite_.beforeAll({
        fn: beforeAllFunction,
        timeout: timeout || 0
      });
    }

    afterEach(afterEachFunction, timeout) {
      ensureIsFunctionOrAsync(afterEachFunction, 'afterEach');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      afterEachFunction.isCleanup = true;
      this.currentDeclarationSuite_.afterEach({
        fn: afterEachFunction,
        timeout: timeout || 0
      });
    }

    afterAll(afterAllFunction, timeout) {
      ensureIsFunctionOrAsync(afterAllFunction, 'afterAll');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      this.currentDeclarationSuite_.afterAll({
        fn: afterAllFunction,
        timeout: timeout || 0
      });
    }

    it_(description, fn, timeout, filename) {
      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      const spec = this.specFactory_(description, fn, timeout, filename);
      if (this.currentDeclarationSuite_.markedExcluding) {
        spec.exclude();
      }
      this.currentDeclarationSuite_.addChild(spec);

      return spec;
    }

    suiteFactory_(description, filename) {
      const config = this.env_.configuration();
      const parentSuite = this.currentDeclarationSuite_;
      const reportedParentSuiteId =
        parentSuite === this.topSuite ? null : parentSuite.id;
      return new j$.Suite({
        id: 'suite' + this.nextSuiteId_++,
        description,
        filename,
        parentSuite,
        reportedParentSuiteId,
        timer: new j$.Timer(),
        expectationFactory: this.expectationFactory_,
        asyncExpectationFactory: this.suiteAsyncExpectationFactory_,
        throwOnExpectationFailure: config.stopSpecOnExpectationFailure,
        autoCleanClosures: config.autoCleanClosures,
        onLateError: this.onLateError_
      });
    }

    addSpecsToSuite_(suite, definitionFn) {
      const parentSuite = this.currentDeclarationSuite_;
      parentSuite.addChild(suite);
      this.currentDeclarationSuite_ = suite;
      let threw = false;

      try {
        definitionFn();
      } catch (e) {
        suite.handleException(e);
        threw = true;
      }

      if (suite.parentSuite && !suite.children.length && !threw) {
        throw new Error(
          `describe with no children (describe() or it()): ${suite.getFullName()}`
        );
      }

      this.currentDeclarationSuite_ = parentSuite;
    }

    specFactory_(description, fn, timeout, filename) {
      this.totalSpecsDefined++;
      const config = this.env_.configuration();
      const suite = this.currentDeclarationSuite_;
      const parentSuiteId = suite === this.topSuite ? null : suite.id;
      const spec = new j$.Spec({
        id: 'spec' + this.nextSpecId_++,
        filename,
        parentSuiteId,
        beforeAndAfterFns: beforeAndAfterFns(suite),
        expectationFactory: this.expectationFactory_,
        asyncExpectationFactory: this.specAsyncExpectationFactory_,
        onLateError: this.onLateError_,
        resultCallback: (result, next) => {
          this.specResultCallback_(spec, result, next);
        },
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: (spec, next) => this.specStarted_(spec, suite, next),
        description: description,
        userContext: function() {
          return suite.clonedSharedUserContext();
        },
        queueableFn: {
          fn: fn,
          timeout: timeout || 0
        },
        throwOnExpectationFailure: config.stopSpecOnExpectationFailure,
        autoCleanClosures: config.autoCleanClosures,
        timer: new j$.Timer()
      });
      return spec;
    }

    unfocusAncestor_() {
      const focusedAncestor = findFocusedAncestor(
        this.currentDeclarationSuite_
      );

      if (focusedAncestor) {
        for (let i = 0; i < this.focusedRunables.length; i++) {
          if (this.focusedRunables[i] === focusedAncestor) {
            this.focusedRunables.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  function findFocusedAncestor(suite) {
    while (suite) {
      if (suite.isFocused) {
        return suite.id;
      }
      suite = suite.parentSuite;
    }

    return null;
  }

  function ensureIsFunction(fn, caller) {
    if (!j$.isFunction_(fn)) {
      throw new Error(
        caller + ' expects a function argument; received ' + j$.getType_(fn)
      );
    }
  }

  function ensureIsFunctionOrAsync(fn, caller) {
    if (!j$.isFunction_(fn) && !j$.isAsyncFunction_(fn)) {
      throw new Error(
        caller + ' expects a function argument; received ' + j$.getType_(fn)
      );
    }
  }

  function beforeAndAfterFns(targetSuite) {
    return function() {
      let befores = [],
        afters = [],
        suite = targetSuite;

      while (suite) {
        befores = befores.concat(suite.beforeFns);
        afters = afters.concat(suite.afterFns);

        suite = suite.parentSuite;
      }

      return {
        befores: befores.reverse(),
        afters: afters
      };
    };
  }

  function getSpecName(spec, suite) {
    const fullName = [spec.description],
      suiteFullName = suite.getFullName();

    if (suiteFullName !== '') {
      fullName.unshift(suiteFullName);
    }
    return fullName.join(' ');
  }

  return SuiteBuilder;
};
