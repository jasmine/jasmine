/* eslint no-console: 0 */
describe('Deprecator', function() {
  describe('#deprecate', function() {
    beforeEach(function() {
      spyOn(console, 'error');
    });

    it('logs the mesage without context when the runnable is the top suite', function() {
      var runnable = { addDeprecationWarning: function() {} };
      var deprecator = new jasmineUnderTest.Deprecator(runnable);
      deprecator.verboseDeprecations(true);

      deprecator.addDeprecationWarning(runnable, 'the message', {
        omitStackTrace: true
      });

      expect(console.error).toHaveBeenCalledWith('DEPRECATION: the message');
    });

    it('logs the message in a descendant suite', function() {
      var runnable = {
        addDeprecationWarning: function() {},
        getFullName: function() {
          return 'the suite';
        },
        children: []
      };
      var deprecator = new jasmineUnderTest.Deprecator({});
      deprecator.verboseDeprecations(true);

      deprecator.addDeprecationWarning(runnable, 'the message', {
        omitStackTrace: true
      });

      expect(console.error).toHaveBeenCalledWith(
        'DEPRECATION: the message (in suite: the suite)'
      );
    });

    it('logs and reports the message in a spec', function() {
      var runnable = {
        addDeprecationWarning: function() {},
        getFullName: function() {
          return 'the spec';
        }
      };
      var deprecator = new jasmineUnderTest.Deprecator({});
      deprecator.verboseDeprecations(true);

      deprecator.addDeprecationWarning(runnable, 'the message', {
        omitStackTrace: true
      });

      expect(console.error).toHaveBeenCalledWith(
        'DEPRECATION: the message (in spec: the spec)'
      );
    });

    it('logs and reports the message without runnable info when ignoreRunnable is true', function() {
      var topSuite = jasmine.createSpyObj('topSuite', [
        'addDeprecationWarning',
        'getFullName'
      ]);
      var deprecator = new jasmineUnderTest.Deprecator(topSuite);
      var runnable = jasmine.createSpyObj('spec', [
        'addDeprecationWarning',
        'getFullName'
      ]);
      runnable.getFullName.and.returnValue('a spec');

      deprecator.addDeprecationWarning(runnable, 'the message', {
        ignoreRunnable: true
      });

      expect(topSuite.addDeprecationWarning).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: jasmine.stringMatching(/^the message/)
        })
      );
      expect(runnable.addDeprecationWarning).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/the message/)
      );
      expect(console.error).not.toHaveBeenCalledWith(
        jasmine.stringMatching(/a spec/)
      );
    });

    describe('with no options', function() {
      it('includes the stack trace', function() {
        testStackTrace(undefined);
      });
    });

    it('omits the stack trace when omitStackTrace is true', function() {
      testNoStackTrace({ omitStackTrace: true });
    });

    it('includes the stack trace when omitStackTrace is false', function() {
      testStackTrace({ omitStackTrace: false });
    });

    it('includes the stack trace when omitStackTrace is undefined', function() {
      testStackTrace({ includeStackTrace: undefined });
    });

    it('emits the deprecation only once when verboseDeprecations is not set', function() {
      var deprecator = new jasmineUnderTest.Deprecator({});
      var runnable1 = jasmine.createSpyObj('runnable1', [
        'addDeprecationWarning',
        'getFullName'
      ]);
      var runnable2 = jasmine.createSpyObj('runnable2', [
        'addDeprecationWarning',
        'getFullName'
      ]);

      deprecator.addDeprecationWarning(runnable1, 'the message');
      deprecator.addDeprecationWarning(runnable1, 'the message');
      deprecator.addDeprecationWarning(runnable2, 'the message');

      expect(runnable1.addDeprecationWarning).toHaveBeenCalledTimes(1);
      expect(runnable2.addDeprecationWarning).not.toHaveBeenCalled();
    });

    it('emits the deprecation only once when verboseDeprecations is false', function() {
      var deprecator = new jasmineUnderTest.Deprecator({});
      var runnable1 = jasmine.createSpyObj('runnable1', [
        'addDeprecationWarning',
        'getFullName'
      ]);
      var runnable2 = jasmine.createSpyObj('runnable2', [
        'addDeprecationWarning',
        'getFullName'
      ]);

      deprecator.verboseDeprecations(false);
      deprecator.addDeprecationWarning(runnable1, 'the message');
      deprecator.addDeprecationWarning(runnable1, 'the message');
      deprecator.addDeprecationWarning(runnable2, 'the message');

      expect(runnable1.addDeprecationWarning).toHaveBeenCalledTimes(1);
      expect(runnable2.addDeprecationWarning).not.toHaveBeenCalled();
    });

    it('emits the deprecation for each call when verboseDeprecations is true', function() {
      var deprecator = new jasmineUnderTest.Deprecator({});
      var runnable1 = jasmine.createSpyObj('runnable1', [
        'addDeprecationWarning',
        'getFullName'
      ]);
      var runnable2 = jasmine.createSpyObj('runnable2', [
        'addDeprecationWarning',
        'getFullName'
      ]);

      deprecator.verboseDeprecations(true);
      deprecator.addDeprecationWarning(runnable1, 'the message');
      deprecator.addDeprecationWarning(runnable1, 'the message');
      deprecator.addDeprecationWarning(runnable2, 'the message');

      expect(runnable1.addDeprecationWarning).toHaveBeenCalledTimes(2);
      expect(runnable2.addDeprecationWarning).toHaveBeenCalled();
    });

    it('includes a note about verboseDeprecations', function() {
      var deprecator = new jasmineUnderTest.Deprecator({});
      var runnable = jasmine.createSpyObj('runnable', [
        'addDeprecationWarning',
        'getFullName'
      ]);

      deprecator.addDeprecationWarning(runnable, 'the message');

      expect(runnable.addDeprecationWarning).toHaveBeenCalledTimes(1);
      expect(
        runnable.addDeprecationWarning.calls.argsFor(0)[0].message
      ).toContain(verboseDeprecationsNote());
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error.calls.argsFor(0)[0]).toContain(
        verboseDeprecationsNote()
      );
    });

    it('omits the note about verboseDeprecations when verboseDeprecations is true', function() {
      var deprecator = new jasmineUnderTest.Deprecator({});
      var runnable = jasmine.createSpyObj('runnable', [
        'addDeprecationWarning',
        'getFullName'
      ]);

      deprecator.verboseDeprecations(true);
      deprecator.addDeprecationWarning(runnable, 'the message');

      expect(runnable.addDeprecationWarning).toHaveBeenCalledTimes(1);
      expect(
        runnable.addDeprecationWarning.calls.argsFor(0)[0].message
      ).not.toContain(verboseDeprecationsNote());
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error.calls.argsFor(0)[0]).not.toContain(
        verboseDeprecationsNote()
      );
    });

    describe('When the deprecation is an Error', function() {
      // This form is used by external systems like atom-jasmine3-test-runner
      // to report their own deprecations through Jasmine. See
      // <https://github.com/jasmine/jasmine/pull/1498>.
      it('passes the error through unchanged', function() {
        var deprecator = new jasmineUnderTest.Deprecator({});
        var runnable = jasmine.createSpyObj('runnable', [
          'addDeprecationWarning',
          'getFullName'
        ]);
        var exceptionFormatter = new jasmineUnderTest.ExceptionFormatter();
        var deprecation, originalStack;

        try {
          throw new Error('the deprecation');
        } catch (err) {
          deprecation = err;
          originalStack = err.stack;
        }

        deprecator.addDeprecationWarning(runnable, deprecation);

        expect(runnable.addDeprecationWarning).toHaveBeenCalledTimes(1);
        expect(
          runnable.addDeprecationWarning.calls.argsFor(0)[0].message
        ).toEqual('the deprecation');
        expect(runnable.addDeprecationWarning.calls.argsFor(0)[0].stack).toBe(
          originalStack
        );
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error.calls.argsFor(0)[0].message).toEqual(
          'the deprecation'
        );
        expect(console.error.calls.argsFor(0)[0].stack).toEqual(originalStack);
      });

      it('reports the deprecation every time, regardless of config.verboseDeprecations', function() {
        var deprecator = new jasmineUnderTest.Deprecator({});
        var runnable = jasmine.createSpyObj('runnable', [
          'addDeprecationWarning',
          'getFullName'
        ]);
        var deprecation;

        try {
          throw new Error('the deprecation');
        } catch (err) {
          deprecation = err;
        }

        deprecator.addDeprecationWarning(runnable, deprecation);
        deprecator.addDeprecationWarning(runnable, deprecation);

        expect(runnable.addDeprecationWarning).toHaveBeenCalledTimes(2);
        expect(console.error).toHaveBeenCalledTimes(2);
      });

      it('omits the note about verboseDeprecations', function() {
        var deprecator = new jasmineUnderTest.Deprecator({});
        var runnable = jasmine.createSpyObj('runnable', [
          'addDeprecationWarning',
          'getFullName'
        ]);
        var deprecation;

        try {
          throw new Error('the deprecation');
        } catch (err) {
          deprecation = err;
        }

        deprecator.addDeprecationWarning(runnable, deprecation);

        expect(runnable.addDeprecationWarning).toHaveBeenCalledTimes(1);
        expect(
          runnable.addDeprecationWarning.calls.argsFor(0)[0].message
        ).not.toContain(verboseDeprecationsNote());
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error.calls.argsFor(0)[0]).not.toContain(
          verboseDeprecationsNote()
        );
      });
    });

    function verboseDeprecationsNote() {
      return (
        'Note: This message will be shown only once. Set the ' +
        'verboseDeprecations config property to true to see every occurrence.'
      );
    }

    function testStackTrace(options) {
      var deprecator = new jasmineUnderTest.Deprecator({});
      var runnable = jasmine.createSpyObj('runnable', [
        'addDeprecationWarning',
        'getFullName'
      ]);

      deprecator.addDeprecationWarning(runnable, 'the message', options);

      expect(runnable.addDeprecationWarning).toHaveBeenCalledWith({
        message: jasmine.stringMatching(/^the message/),
        omitStackTrace: false
      });
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error.calls.argsFor(0)[0]).toContain('the message');
      expect(console.error.calls.argsFor(0)[0]).toContain('DeprecatorSpec.js');
    }

    function testNoStackTrace(options) {
      var deprecator = new jasmineUnderTest.Deprecator({});
      var runnable = jasmine.createSpyObj('runnable', [
        'addDeprecationWarning',
        'getFullName'
      ]);

      deprecator.addDeprecationWarning(runnable, 'the message', options);

      expect(runnable.addDeprecationWarning).toHaveBeenCalledWith({
        message: jasmine.stringMatching(/^the message/),
        omitStackTrace: true
      });
    }
  });
});
