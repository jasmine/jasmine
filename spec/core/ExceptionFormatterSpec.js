describe("ExceptionFormatter", function() {

  it('formats Firefox exception messages', function() {
    var sampleFirefoxException = {
        fileName: 'foo.js',
        line: '1978',
        message: 'you got your foo in my bar',
        name: 'A Classic Mistake'
      },
      message = jasmine.exceptionMessageFor(sampleFirefoxException);

    expect(message).toEqual('A Classic Mistake: you got your foo in my bar in foo.js (line 1978)');
  });

  it('formats Webkit exception messages', function() {
    var sampleWebkitException = {
        sourceURL: 'foo.js',
        lineNumber: '1978',
        message: 'you got your foo in my bar',
        name: 'A Classic Mistake'
      },
      message = jasmine.exceptionMessageFor(sampleWebkitException);

    expect(message).toEqual('A Classic Mistake: you got your foo in my bar in foo.js (line 1978)');
  });
});