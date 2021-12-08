describe('StackTrace', function() {
  it('understands Chrome/Edge style traces', function() {
    var error = {
      message: 'nope',
      stack:
        'Error: nope\n' +
        '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
        '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)'
    };

    var result = new jasmineUnderTest.StackTrace(error);

    expect(result.message).toEqual('Error: nope');
    expect(result.style).toEqual('v8');
    expect(result.frames).toEqual([
      {
        raw:
          '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      },
      {
        raw:
          '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)',
        func: 'QueueRunner.run',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 4320
      }
    ]);
  });

  it('understands Chrome/Edge style traces with multiline messages', function() {
    var error = {
      message: 'line 1\nline 2',
      stack:
        'Error: line 1\nline 2\n' +
        '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
        '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)'
    };

    var result = new jasmineUnderTest.StackTrace(error);

    expect(result.message).toEqual('Error: line 1\nline 2');
    var rawFrames = result.frames.map(function(f) {
      return f.raw;
    });
    expect(rawFrames).toEqual([
      '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
      '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)'
    ]);
  });

  it('understands Node style traces', function() {
    var error = {
      message: 'nope',
      stack:
        'Error\n' +
        '  at /somewhere/jasmine/lib/jasmine-core/jasmine.js:4255:9\n' +
        '  at QueueRunner.complete [as onComplete] (/somewhere/jasmine/lib/jasmine-core/jasmine.js:579:9)\n' +
        '  at Immediate.<anonymous> (/somewhere/jasmine/lib/jasmine-core/jasmine.js:4314:12)\n' +
        '  at runCallback (timers.js:672:20)'
    };
    var result = new jasmineUnderTest.StackTrace(error);

    expect(result.message).toEqual('Error');
    expect(result.style).toEqual('v8');
    expect(result.frames).toEqual([
      {
        raw: '  at /somewhere/jasmine/lib/jasmine-core/jasmine.js:4255:9',
        func: undefined,
        file: '/somewhere/jasmine/lib/jasmine-core/jasmine.js',
        line: 4255
      },
      {
        raw:
          '  at QueueRunner.complete [as onComplete] (/somewhere/jasmine/lib/jasmine-core/jasmine.js:579:9)',
        func: 'QueueRunner.complete [as onComplete]',
        file: '/somewhere/jasmine/lib/jasmine-core/jasmine.js',
        line: 579
      },
      {
        raw:
          '  at Immediate.<anonymous> (/somewhere/jasmine/lib/jasmine-core/jasmine.js:4314:12)',
        func: 'Immediate.<anonymous>',
        file: '/somewhere/jasmine/lib/jasmine-core/jasmine.js',
        line: 4314
      },
      {
        raw: '  at runCallback (timers.js:672:20)',
        func: 'runCallback',
        file: 'timers.js',
        line: 672
      }
    ]);
  });

  it('understands Safari <=14/Firefox/Phantom-OS X style traces', function() {
    var error = {
      message: 'nope',
      stack:
        'http://localhost:8888/__spec__/core/UtilSpec.js:115:28\n' +
        'run@http://localhost:8888/__jasmine__/jasmine.js:4320:27'
    };
    var result = new jasmineUnderTest.StackTrace(error);

    expect(result.message).toBeFalsy();
    expect(result.style).toEqual('webkit');
    expect(result.frames).toEqual([
      {
        raw: 'http://localhost:8888/__spec__/core/UtilSpec.js:115:28',
        func: undefined,
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      },
      {
        raw: 'run@http://localhost:8888/__jasmine__/jasmine.js:4320:27',
        func: 'run',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 4320
      }
    ]);
  });

  it('understands Safari 15 style traces', function() {
    var error = {
      message: 'nope',
      stack:
        '@http://localhost:8888/__spec__/core/FooSpec.js:164:24\n' +
        'attempt@http://localhost:8888/__jasmine__/jasmine.js:8074:44\n'
    };
    var result = new jasmineUnderTest.StackTrace(error);

    expect(result.message).toBeFalsy();
    expect(result.style).toEqual('webkit');
    expect(result.frames).toEqual([
      {
        raw: '@http://localhost:8888/__spec__/core/FooSpec.js:164:24',
        func: undefined,
        file: 'http://localhost:8888/__spec__/core/FooSpec.js',
        line: 164
      },
      {
        raw: 'attempt@http://localhost:8888/__jasmine__/jasmine.js:8074:44',
        func: 'attempt',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 8074
      }
    ]);
  });

  it('does not mistake gibberish for Safari/Firefox/Phantom-OS X style traces', function() {
    var error = {
      message: 'nope',
      stack: 'randomcharsnotincludingwhitespace'
    };
    var result = new jasmineUnderTest.StackTrace(error);
    expect(result.style).toBeNull();
    expect(result.frames).toEqual([{ raw: error.stack }]);
  });

  it('understands Phantom-Linux style traces', function() {
    var error = {
      message: 'nope',
      stack:
        '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
        '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)'
    };

    var result = new jasmineUnderTest.StackTrace(error);

    expect(result.message).toBeFalsy();
    expect(result.style).toEqual('v8');
    expect(result.frames).toEqual([
      {
        raw:
          '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      },
      {
        raw:
          '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)',
        func: 'QueueRunner.run',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 4320
      }
    ]);
  });

  it('ignores blank lines', function() {
    var error = {
      message: 'nope',
      stack:
        '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n'
    };

    var result = new jasmineUnderTest.StackTrace(error);

    expect(result.frames).toEqual([
      {
        raw:
          '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      }
    ]);
  });

  it("omits properties except 'raw' for frames that are not understood", function() {
    var error = {
      message: 'nope',
      stack:
        '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
        '    but this is quite unexpected\n' +
        '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)'
    };

    var result = new jasmineUnderTest.StackTrace(error);
    expect(result.style).toEqual('v8');
    expect(result.frames).toEqual([
      {
        raw:
          '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      },
      {
        raw: '    but this is quite unexpected'
      },
      {
        raw:
          '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)',
        func: 'QueueRunner.run',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 4320
      }
    ]);
  });

  it('consideres different types of errors', function() {
    var error = {
      message: 'nope',
      stack:
        'TypeError: nope\n' +
        '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
        '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)'
    };

    var result = new jasmineUnderTest.StackTrace(error);

    expect(result.message).toEqual('TypeError: nope');
    expect(result.frames).toEqual([
      {
        raw:
          '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      },
      {
        raw:
          '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)',
        func: 'QueueRunner.run',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 4320
      }
    ]);

    var no_error = {
      message: 'nope',
      stack:
        'Type Error: nope\n' +
        '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
        '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)'
    };

    var result_no_error = new jasmineUnderTest.StackTrace(no_error);

    expect(result_no_error.message).not.toEqual(jasmine.anything());
  });
});
