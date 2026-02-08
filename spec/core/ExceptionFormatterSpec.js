describe('ExceptionFormatter', function() {
  describe('#message', function() {
    it('formats Firefox exception messages', function() {
      const sampleFirefoxException = {
          fileName: 'foo.js',
          lineNumber: '1978',
          message: 'you got your foo in my bar',
          name: 'A Classic Mistake'
        },
        exceptionFormatter = new privateUnderTest.ExceptionFormatter(),
        message = exceptionFormatter.message(sampleFirefoxException);

      expect(message).toEqual(
        'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)'
      );
    });

    it('formats Webkit exception messages', function() {
      const sampleWebkitException = {
          sourceURL: 'foo.js',
          line: '1978',
          message: 'you got your foo in my bar',
          name: 'A Classic Mistake'
        },
        exceptionFormatter = new privateUnderTest.ExceptionFormatter(),
        message = exceptionFormatter.message(sampleWebkitException);

      expect(message).toEqual(
        'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)'
      );
    });

    it('formats V8 exception messages', function() {
      const sampleV8 = {
          message: 'you got your foo in my bar',
          name: 'A Classic Mistake'
        },
        exceptionFormatter = new privateUnderTest.ExceptionFormatter(),
        message = exceptionFormatter.message(sampleV8);

      expect(message).toEqual('A Classic Mistake: you got your foo in my bar');
    });

    it('formats unnamed exceptions with message', function() {
      const unnamedError = { message: 'This is an unnamed error message.' };

      const exceptionFormatter = new privateUnderTest.ExceptionFormatter(),
        message = exceptionFormatter.message(unnamedError);

      expect(message).toEqual('This is an unnamed error message.');
    });

    it('formats empty exceptions with toString format', function() {
      const EmptyError = function() {};
      EmptyError.prototype.toString = function() {
        return '[EmptyError]';
      };
      const emptyError = new EmptyError();

      const exceptionFormatter = new privateUnderTest.ExceptionFormatter(),
        message = exceptionFormatter.message(emptyError);

      expect(message).toEqual('[EmptyError] thrown');
    });

    it("formats thrown exceptions that aren't errors", function() {
      const thrown = 'crazy error',
        exceptionFormatter = new privateUnderTest.ExceptionFormatter(),
        message = exceptionFormatter.message(thrown);

      expect(message).toEqual('crazy error thrown');
    });
  });

  describe('#stack', function() {
    it('formats stack traces', function() {
      const error = new Error('an error');

      expect(new privateUnderTest.ExceptionFormatter().stack(error)).toMatch(
        /ExceptionFormatterSpec\.js.*\d+/
      );
    });

    it('filters Jasmine stack frames from V8-style traces but leaves unmatched lines intact', function() {
      const error = {
        message: 'nope',
        stack:
          'C:\\__spec__\\core\\UtilSpec.ts:120\n' +
          "                new Error('nope');\n" +
          '                ^\n' +
          '\n' +
          'Error: nope\n' +
          '    at fn1 (C:\\__spec__\\core\\UtilSpec.js:115:19)\n' +
          '        -> C:\\__spec__\\core\\UtilSpec.ts:120:15\n' +
          '    at fn2 (C:\\__jasmine__\\lib\\jasmine-core\\jasmine.js:7533:40)\n' +
          '    at fn3 (C:\\__jasmine__\\lib\\jasmine-core\\jasmine.js:7575:25)\n' +
          '    at fn4 (node:internal/timers:462:21)\n'
      };
      const subject = new privateUnderTest.ExceptionFormatter({
        jasmineFile: 'C:\\__jasmine__\\lib\\jasmine-core\\jasmine.js'
      });
      const result = subject.stack(error);
      expect(result).toEqual(
        'C:\\__spec__\\core\\UtilSpec.ts:120\n' +
          "                new Error('nope');\n" +
          '                ^\n' +
          'Error: nope\n' +
          '    at fn1 (C:\\__spec__\\core\\UtilSpec.js:115:19)\n' +
          '        -> C:\\__spec__\\core\\UtilSpec.ts:120:15\n' +
          '    at <Jasmine>\n' +
          '    at fn4 (node:internal/timers:462:21)'
      );
    });

    it('filters Jasmine stack frames from V8 style traces', function() {
      const error = {
        message: 'nope',
        stack:
          'Error: nope\n' +
          '    at fn1 (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
          '    at fn2 (http://localhost:8888/__jasmine__/jasmine.js:4320:20)\n' +
          '    at fn3 (http://localhost:8888/__jasmine__/jasmine.js:4320:20)\n' +
          '    at fn4 (http://localhost:8888/__spec__/core/UtilSpec.js:110:19)\n'
      };
      const subject = new privateUnderTest.ExceptionFormatter({
        jasmineFile: 'http://localhost:8888/__jasmine__/jasmine.js'
      });
      const result = subject.stack(error);
      expect(result).toEqual(
        'Error: nope\n' +
          '    at fn1 (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
          '    at <Jasmine>\n' +
          '    at fn4 (http://localhost:8888/__spec__/core/UtilSpec.js:110:19)'
      );
    });

    it('filters Jasmine stack frames from Webkit style traces', function() {
      const error = {
        stack:
          'http://localhost:8888/__spec__/core/UtilSpec.js:115:28\n' +
          'fn1@http://localhost:8888/__jasmine__/jasmine.js:4320:27\n' +
          'fn2@http://localhost:8888/__jasmine__/jasmine.js:4320:27\n' +
          'http://localhost:8888/__spec__/core/UtilSpec.js:115:28'
      };
      const subject = new privateUnderTest.ExceptionFormatter({
        jasmineFile: 'http://localhost:8888/__jasmine__/jasmine.js'
      });
      const result = subject.stack(error);
      expect(result).toEqual(
        'http://localhost:8888/__spec__/core/UtilSpec.js:115:28\n' +
          '<Jasmine>\n' +
          'http://localhost:8888/__spec__/core/UtilSpec.js:115:28'
      );
    });

    it('filters Jasmine stack frames with Firefox async annotations', function() {
      const error = {
        stack:
          'http://localhost:8888/__spec__/core/UtilSpec.js:115:28\n' +
          'promise callback*fn1@http://localhost:8888/__jasmine__/jasmine.js:4320:27\n' +
          'setTimeout handler*fn2@http://localhost:8888/__jasmine__/jasmine.js:4320:27\n' +
          'http://localhost:8888/__spec__/core/UtilSpec.js:115:28'
      };
      const subject = new privateUnderTest.ExceptionFormatter({
        jasmineFile: 'http://localhost:8888/__jasmine__/jasmine.js'
      });
      const result = subject.stack(error);
      expect(result).toEqual(
        'http://localhost:8888/__spec__/core/UtilSpec.js:115:28\n' +
          '<Jasmine>\n' +
          'http://localhost:8888/__spec__/core/UtilSpec.js:115:28'
      );
    });

    it('filters Jasmine stack frames in this environment', function() {
      const error = new Error('an error');
      const subject = new privateUnderTest.ExceptionFormatter({
        jasmineFile: jasmine.private.util.jasmineFile()
      });
      const result = subject.stack(error);
      jasmine.debugLog('Original stack trace: ' + error.stack);
      jasmine.debugLog('Filtered stack trace: ' + result);
      const lines = result.split('\n');

      if (lines[0].match(/an error/)) {
        lines.shift();
      }

      expect(lines[0]).toMatch(/ExceptionFormatterSpec.js/);
      expect(lines[1]).toMatch(/<Jasmine>/);

      // Node has some number of additional frames below Jasmine.
      for (let i = 2; i < lines.length; i++) {
        expect(lines[i]).not.toMatch(/jasmine.js/);
      }
    });

    it('handles multiline error messages in this environment', function() {
      const msg = 'an error\nwith two lines';
      const error = new Error(msg);

      if (error.stack.indexOf(msg) === -1) {
        pending("Stack traces don't have messages in this environment");
      }
      const subject = new privateUnderTest.ExceptionFormatter({
        jasmineFile: jasmine.private.util.jasmineFile()
      });
      const result = subject.stack(error);
      const lines = result.split('\n');

      expect(lines[0]).toMatch(/an error/);
      expect(lines[1]).toMatch(/with two lines/);
      expect(lines[2]).toMatch(/ExceptionFormatterSpec.js/);
      expect(lines[3]).toMatch(/<Jasmine>/);
    });

    it('returns null if no Error provided', function() {
      expect(new privateUnderTest.ExceptionFormatter().stack()).toBeNull();
    });

    it("includes the error's own properties in stack", function() {
      const error = new Error('an error');
      error.someProperty = 'hello there';

      const result = new privateUnderTest.ExceptionFormatter().stack(error);

      expect(result).toMatch(/error properties:.*someProperty.*hello there/);
    });

    it('does not include inherited error properties', function() {
      function CustomError(msg) {
        Error.call(this, msg);
      }

      CustomError.prototype = new Error();
      CustomError.prototype.anInheritedProp = 'something';
      const error = new CustomError('nope');

      const result = new privateUnderTest.ExceptionFormatter().stack(error);
      expect(result).not.toContain('anInheritedProp');
    });

    describe('When omitMessage is true', function() {
      it('filters the message from V8-style stack traces', function() {
        const error = {
          message: 'nope',
          stack:
            'Error: nope\n' +
            '    at fn1 (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
            '    at fn2 (http://localhost:8888/__jasmine__/jasmine.js:4320:20)\n' +
            '    at fn3 (http://localhost:8888/__jasmine__/jasmine.js:4320:20)\n' +
            '    at fn4 (http://localhost:8888/__spec__/core/UtilSpec.js:110:19)\n'
        };
        const subject = new privateUnderTest.ExceptionFormatter({
          jasmineFile: 'http://localhost:8888/__jasmine__/jasmine.js'
        });
        const result = subject.stack(error, { omitMessage: true });
        expect(result).toEqual(
          '    at fn1 (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
            '    at <Jasmine>\n' +
            '    at fn4 (http://localhost:8888/__spec__/core/UtilSpec.js:110:19)'
        );
      });

      it('handles Webkit style traces that do not include a message', function() {
        const error = {
          stack:
            'http://localhost:8888/__spec__/core/UtilSpec.js:115:28\n' +
            'fn1@http://localhost:8888/__jasmine__/jasmine.js:4320:27\n' +
            'fn2@http://localhost:8888/__jasmine__/jasmine.js:4320:27\n' +
            'http://localhost:8888/__spec__/core/UtilSpec.js:115:28'
        };
        const subject = new privateUnderTest.ExceptionFormatter({
          jasmineFile: 'http://localhost:8888/__jasmine__/jasmine.js'
        });
        const result = subject.stack(error, { omitMessage: true });
        expect(result).toEqual(
          'http://localhost:8888/__spec__/core/UtilSpec.js:115:28\n' +
            '<Jasmine>\n' +
            'http://localhost:8888/__spec__/core/UtilSpec.js:115:28'
        );
      });

      it('ensures that stack traces do not include the message in this environment', function() {
        const error = new Error('an error');
        const subject = new privateUnderTest.ExceptionFormatter({
          jasmineFile: jasmine.private.util.jasmineFile()
        });
        const result = subject.stack(error, { omitMessage: true });
        expect(result).not.toContain('an error');
      });
    });

    describe('when the error has a cause property', function() {
      it('recursively includes the cause in the stack trace in this environment', function() {
        const subject = new privateUnderTest.ExceptionFormatter();
        const rootCause = new Error('root cause');
        const proximateCause = new Error('proximate cause', {
          cause: rootCause
        });
        const symptom = new Error('symptom', { cause: proximateCause });

        const lines = subject.stack(symptom).split('\n');
        // Not all environments include the message in the stack trace.
        const hasRootMessage = lines[0].indexOf('symptom') !== -1;
        const firstSymptomStackIx = hasRootMessage ? 1 : 0;

        expect(lines[firstSymptomStackIx])
          .withContext('first symptom stack frame')
          .toContain('ExceptionFormatterSpec.js');
        const proximateCauseMsgIx = lines.indexOf(
          'Caused by: Error: proximate cause'
        );
        expect(proximateCauseMsgIx)
          .withContext('index of proximate cause message')
          .toBeGreaterThan(firstSymptomStackIx);
        expect(lines[proximateCauseMsgIx + 1])
          .withContext('first proximate cause stack frame')
          .toContain('ExceptionFormatterSpec.js');
        const rootCauseMsgIx = lines.indexOf('Caused by: Error: root cause');
        expect(rootCauseMsgIx)
          .withContext('index of root cause message')
          .toBeGreaterThan(proximateCauseMsgIx + 1);
        expect(lines[rootCauseMsgIx + 1])
          .withContext('first root cause stack frame')
          .toContain('ExceptionFormatterSpec.js');
      });

      it('does not throw if cause is a non Error', function() {
        const formatter = new privateUnderTest.ExceptionFormatter();

        expect(function() {
          formatter.stack(
            new Error('error', {
              cause: function() {}
            })
          );
        }).not.toThrowError();

        expect(function() {
          formatter.stack(
            new Error('error', {
              cause: 'another error'
            })
          );
        }).not.toThrowError();
      });
    });

    describe('when the error has an errors array (AggregateError)', function() {
      it('includes all aggregated errors in the stack trace', function() {
        const subject = new privateUnderTest.ExceptionFormatter();
        const error1 = (function fn1() {
          return new Error('first error');
        })();
        const error2 = (function fn2() {
          return new Error('second error');
        })();
        const aggregateError = (function fn3() {
          return new Error('Multiple errors occurred');
        })();
        aggregateError.errors = [error1, error2];

        const lines = subject.stack(aggregateError).split('\n');

        // TODO: be consistent across environments about whether the message is
        // included in the stack trace
        if (lines[0] === 'Error: Multiple errors occurred') {
          lines.shift();
        }

        // Exclude lines that vary from environment to environment
        const filteredLines = lines.filter(
          x =>
            !x.includes('/jasmine.js:') &&
            // Some Node 20 and 22 minors when running in parallel
            !x.includes('process.processTicksAndRejections')
        );

        for (let i = 0; i < filteredLines.length; i++) {
          jasmine.debugLog(`Line ${i} after filtering: ${filteredLines[i]}`);
        }

        // Inexact matching because stack frame formatting varies from runtime
        // to runtime
        const expectedPatterns = [
          // Overall error
          /fn3.*ExceptionFormatterSpec\.js/,
          /ExceptionFormatterSpec\.js/,
          /^$/,

          // First nested error
          /^   Error 1: Error: first error$/,
          /^   .*fn1.*ExceptionFormatterSpec\.js/,
          /^   .*ExceptionFormatterSpec\.js/,
          /^$/,

          // Second nested error
          /^   .*Error 2: Error: second error$/,
          /^   .*fn2.*ExceptionFormatterSpec\.js/,
          /^   .*ExceptionFormatterSpec\.js/
        ];

        expect(filteredLines).toEqual(
          expectedPatterns.map(p => jasmine.stringMatching(p))
        );
      });

      it('handles empty errors array', function() {
        const subject = new privateUnderTest.ExceptionFormatter();
        const aggregateError = new Error('No errors');
        aggregateError.errors = [];

        expect(function() {
          subject.stack(aggregateError);
        }).not.toThrowError();
      });

      it('handles nested AggregateError', function() {
        const subject = new privateUnderTest.ExceptionFormatter();
        const innerError1 = new Error('inner error 1');
        const innerError2 = new Error('inner error 2');
        const innerAggregate = new Error('Inner aggregate');
        innerAggregate.errors = [innerError1, innerError2];

        const outerError = new Error('outer error');
        const outerAggregate = new Error('Outer aggregate');
        outerAggregate.errors = [innerAggregate, outerError];

        const lines = subject.stack(outerAggregate).split('\n');

        const innerAggMsgIx = lines.findIndex(line =>
          line.includes('Error 1: Error: Inner aggregate')
        );
        expect(innerAggMsgIx).toBeGreaterThan(-1);

        const innerError1MsgIx = lines.findIndex(line =>
          line.includes('Error 1: Error: inner error 1')
        );
        expect(innerError1MsgIx).toBeGreaterThan(innerAggMsgIx);

        const innerError2MsgIx = lines.findIndex(line =>
          line.includes('Error 2: Error: inner error 2')
        );
        expect(innerError2MsgIx).toBeGreaterThan(innerError1MsgIx);

        const outerErrorMsgIx = lines.findIndex(line =>
          line.includes('Error 2: Error: outer error')
        );
        expect(outerErrorMsgIx).toBeGreaterThan(innerError2MsgIx);
      });

      it('handles AggregateError containing error with cause', function() {
        const subject = new privateUnderTest.ExceptionFormatter();
        const rootCause = new Error('root cause');
        const errorWithCause = new Error('error with cause', {
          cause: rootCause
        });
        const aggregateError = new Error('Aggregate with cause chain');
        aggregateError.errors = [errorWithCause];

        const lines = subject.stack(aggregateError).split('\n');

        const error1MsgIx = lines.findIndex(line =>
          line.includes('Error 1: Error: error with cause')
        );
        expect(error1MsgIx).toBeGreaterThan(-1);

        const causeMsgIx = lines.findIndex(line =>
          line.includes('Caused by: Error: root cause')
        );
        expect(causeMsgIx).toBeGreaterThan(error1MsgIx);
      });

      it('skips non-Error items in errors array', function() {
        const subject = new privateUnderTest.ExceptionFormatter();
        const error1 = new Error('real error');
        const aggregateError = new Error('Mixed array');
        aggregateError.errors = [
          error1,
          'string error',
          { message: 'object error' },
          null,
          undefined,
          42
        ];

        const lines = subject.stack(aggregateError).split('\n');

        const error1MsgIx = lines.findIndex(line =>
          line.includes('Error 1: Error: real error')
        );
        expect(error1MsgIx).toBeGreaterThan(-1);

        const hasStringError = lines.some(line =>
          line.includes('string error')
        );
        expect(hasStringError).toBe(false);

        const hasObjectError = lines.some(line =>
          line.includes('object error')
        );
        expect(hasObjectError).toBe(false);
      });

      it('works with native AggregateError constructor', function() {
        const subject = new privateUnderTest.ExceptionFormatter();
        const error1 = new Error('first error');
        const error2 = new Error('second error');
        const aggregateError = new AggregateError(
          [error1, error2],
          'Multiple errors'
        );

        const lines = subject.stack(aggregateError).split('\n');

        const error1MsgIx = lines.findIndex(line =>
          line.includes('Error 1: Error: first error')
        );
        expect(error1MsgIx).toBeGreaterThan(-1);

        const error2MsgIx = lines.findIndex(line =>
          line.includes('Error 2: Error: second error')
        );
        expect(error2MsgIx).toBeGreaterThan(error1MsgIx);
      });
    });
  });
});
