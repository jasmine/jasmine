describe("StackTrace", function() {
  it("understands Chrome/IE/Edge style traces", function() {
    var raw = 
      'Error: nope\n' +
      '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
      '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)';

    var result = new jasmineUnderTest.StackTrace(raw);

    expect(result.message).toEqual('Error: nope');
    expect(result.style).toEqual('v8');
    expect(result.frames).toEqual([
      {
        raw: '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      },
      {
        raw: '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)',
        func: 'QueueRunner.run',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 4320
      }
    ]);
  });

  it("understands Node style traces", function() {
    var raw = 'Error\n' +
      '  at /somewhere/jasmine/lib/jasmine-core/jasmine.js:4255:9\n' +
      '  at QueueRunner.complete [as onComplete] (/somewhere/jasmine/lib/jasmine-core/jasmine.js:579:9)\n' +
      '  at Immediate.<anonymous> (/somewhere/jasmine/lib/jasmine-core/jasmine.js:4314:12)\n' +
      '  at runCallback (timers.js:672:20)';
    var result = new jasmineUnderTest.StackTrace(raw);

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
        raw: '  at QueueRunner.complete [as onComplete] (/somewhere/jasmine/lib/jasmine-core/jasmine.js:579:9)',
        func: 'QueueRunner.complete [as onComplete]',
        file: '/somewhere/jasmine/lib/jasmine-core/jasmine.js',
        line: 579
      },
      {
        raw: '  at Immediate.<anonymous> (/somewhere/jasmine/lib/jasmine-core/jasmine.js:4314:12)',
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

  it("understands Safari/Firefox/Phantom-OS X style traces", function() {
    var raw = 
      'http://localhost:8888/__spec__/core/UtilSpec.js:115:28\n' +
      'run@http://localhost:8888/__jasmine__/jasmine.js:4320:27';
    var result = new jasmineUnderTest.StackTrace(raw);

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

  it("does not mistake gibberish for Safari/Firefox/Phantom-OS X style traces", function() {
    var raw = 'randomcharsnotincludingwhitespace';
    var result = new jasmineUnderTest.StackTrace(raw);
    expect(result.style).toBeNull();
    expect(result.frames).toEqual([
      { raw: raw }
    ]);
  });

  it("understands Phantom-Linux style traces", function() {
    var raw = 
      '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
      '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)';

    var result = new jasmineUnderTest.StackTrace(raw);

    expect(result.message).toBeFalsy();
    expect(result.style).toEqual('v8');
    expect(result.frames).toEqual([
      {
        raw: '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      },
      {
        raw: '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)',
        func: 'QueueRunner.run',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 4320
      }
    ]);
  });

  it("ignores blank lines", function() {
    var raw = 
      '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n';

    var result = new jasmineUnderTest.StackTrace(raw);

    expect(result.frames).toEqual([
      {
        raw: '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      }
    ]);
  });

  it("omits properties except 'raw' for frames that are not understood", function() {
    var raw = 
      '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)\n' +
      '    but this is quite unexpected\n' +
      '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)';

    var result = new jasmineUnderTest.StackTrace(raw);
    expect(result.style).toEqual('v8');
    expect(result.frames).toEqual([
      {
        raw: '    at UserContext.<anonymous> (http://localhost:8888/__spec__/core/UtilSpec.js:115:19)',
        func: 'UserContext.<anonymous>',
        file: 'http://localhost:8888/__spec__/core/UtilSpec.js',
        line: 115
      },
      {
        raw: '    but this is quite unexpected'
      },
      {
        raw: '    at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)',
        func: 'QueueRunner.run',
        file: 'http://localhost:8888/__jasmine__/jasmine.js',
        line: 4320
      }
    ]);
  });
});
