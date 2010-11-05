---
  layout: default
  title: Suites & Specs
---

## Specs

Each spec is, naturally, a JavaScript function.  You tell Jasmine about a spec with a call to `it()` with a description string and the function.  The string is a description of a behavior that you want your production code to exhibit; it should be meaningful to you when reading a report.

    it('should increment a variable', function () {
      var foo = 0;
      foo++;
    });

## Expectations

Within your spec you will express expectations about the behavior of your application code.  This is done using the `expect()` function and any of various expectation matchers, like this:

    it('should increment a variable', function () {
      var foo = 0;            // set up the world
      foo++;                  // call your application code

      expect(foo).toEqual(1); // passes because foo == 1
    });

Results of the expectations will be reported to you when the spec is run.

### Suites

Specs are grouped in Suites.  Suites are defined using the global `describe()` function:

    describe('Calculator', function () {
      it('can add a number', function () {
        ...
      });

      it('has multiply some numbers', function () {
        ...
      });
    });

The Suite name is typically the name of a class or other applicaton component, and will be reported with results when your specs are run.

Suites are executed in the order in which `describe()` calls are made, usually in the order in which their script files are included.  Additionally, specs within a suite share a functional scope.  So you may declare variables inside a describe block and they are accessible from within your specs.  For example:

    describe('Calculator', function () {
      var counter = 0

      it('can add a number', function () {
        counter = counter + 2;   // counter was 0 before
        expect(bar).toEqual(2);
      });

      it('can multiply a number', function () {
        counter = counter * 5;   // counter was 2 before
        expect(bar).toEqual(10);
      });
    });

Be aware that code directly inside the `describe()` function is only executed once, which is why `counter` in the above example is not reset to `0` for the second spec. If you want to initialize variables before each spec, use a `beforeEach()` function.

### Nested Describes

Jasmine supports nested describes. An example:

    describe('some suite', function () {

      var suiteWideFoo;

      beforeEach(function () {
        suiteWideFoo = 0;
      });

      describe('some nested suite', function() {
        var nestedSuiteBar;
        beforeEach(function() {
          nestedSuiteBar=1;
        });

        it('nested expectation', function () {
          expect(suiteWideFoo).toEqual(0);
          expect(nestedSuiteBar).toEqual(1);
        });

      });

      it('top-level describe', function () {
        expect(suiteWideFoo).toEqual(0);
        expect(nestedSuiteBar).toEqual(undefined);
      });
    });

### Disabling Tests & Suites

Specs may be disabled by calling `xit()` instead of `it()`.  Suites may be disabled by calling `xdescribe()` instead of `describe()`.

