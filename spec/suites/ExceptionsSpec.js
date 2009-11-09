describe('Exceptions:', function() {
  var env;

  beforeEach(function() {
    env = new jasmine.Env();
      env.updateInterval = 0;
  });

  it('jasmine.formatException formats Firefox exception messages as expected', function() {
    var sampleFirefoxException = {
      fileName: 'foo.js',
      line: '1978',
      message: 'you got your foo in my bar',
      name: 'A Classic Mistake'
    };

    var expected = 'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)';

    expect(jasmine.util.formatException(sampleFirefoxException)).toEqual(expected);
  });

  it('jasmine.formatException formats Webkit exception messages as expected', function() {
    var sampleWebkitException = {
      sourceURL: 'foo.js',
      lineNumber: '1978',
      message: 'you got your foo in my bar',
      name: 'A Classic Mistake'
    };

    var expected = 'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)';

    expect(jasmine.util.formatException(sampleWebkitException)).toEqual(expected);
  });

  it('should handle exceptions thrown, but continue', function() {
    var fakeTimer = new jasmine.FakeTimer();
    env.setTimeout = fakeTimer.setTimeout;
    env.clearTimeout = fakeTimer.clearTimeout;
    env.setInterval = fakeTimer.setInterval;
    env.clearInterval = fakeTimer.clearInterval;
    
    //we run two exception tests to make sure we continue after throwing an exception
    var suite = env.describe('Suite for handles exceptions', function () {
      env.it('should be a test that fails because it throws an exception', function() {
        throw new Error('fake error 1');
      });

      env.it('should be another test that fails because it throws an exception', function() {
        this.runs(function () {
          throw new Error('fake error 2');
        });
        this.runs(function () {
          this.expect(true).toEqual(true);
        });
      });

      env.it('should be a passing test that runs after exceptions are thrown', function() {
        this.expect(true).toEqual(true);
      });

      env.it('should be another test that fails because it throws an exception after a wait', function() {
        this.runs(function () {
          var foo = 'foo';
        });
        this.waits(250);
        this.runs(function () {
          throw new Error('fake error 3');
        });
      });

      env.it('should be a passing test that runs after exceptions are thrown from a async test', function() {
        this.expect(true).toEqual(true);
      });
    });

    var runner = env.currentRunner();
    suite.execute();
    fakeTimer.tick(2500);

    var suiteResults = suite.results();
    var specResults = suiteResults.getItems();

    expect(suiteResults.passed()).toEqual(false);
    //
    expect(specResults.length).toEqual(5);
    expect(specResults[0].passed()).toMatch(false);
    var blockResults = specResults[0].getItems();
    expect(blockResults[0].passed()).toEqual(false);
    expect(blockResults[0].message).toMatch(/fake error 1/);

    expect(specResults[1].passed()).toEqual(false);
    var blockResults = specResults[1].getItems();
    expect(blockResults[0].passed()).toEqual(false);
    expect(blockResults[0].message).toMatch(/fake error 2/),
    expect(blockResults[1].passed()).toEqual(true);

    expect(specResults[2].passed()).toEqual(true);

    expect(specResults[3].passed()).toEqual(false);
    blockResults = specResults[3].getItems();
    expect(blockResults[0].message).toMatch(/fake error 3/);

    expect(specResults[4].passed()).toEqual(true);

  });

});