describe('Exceptions:', function() {
  var env;

  beforeEach(function() {
    env = new jasmine.Env();
  });

  it('jasmine.formatException formats Firefox exception maessages as expected', function() {
    var sampleFirefoxException = {
      fileName: 'foo.js',
      line: '1978',
      message: 'you got your foo in my bar',
      name: 'A Classic Mistake'
    };

    var expected = 'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)';

    expect(jasmine.util.formatException(sampleFirefoxException)).toEqual(expected);
  });

  it('jasmine.formatException formats Webkit exception maessages as expected', function() {
    var sampleWebkitException = {
      sourceURL: 'foo.js',
      lineNumber: '1978',
      message: 'you got your foo in my bar',
      name: 'A Classic Mistake'
    };

    var expected = 'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)';

    expect(jasmine.util.formatException(sampleWebkitException)).toEqual(expected);
  });

});
