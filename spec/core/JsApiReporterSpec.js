describe('JsApiReporter', function() {
  it('knows when a full environment is started', function() {
    var reporter = new jasmineUnderTest.JsApiReporter({});

    expect(reporter.started).toBe(false);
    expect(reporter.finished).toBe(false);

    reporter.jasmineStarted();

    expect(reporter.started).toBe(true);
    expect(reporter.finished).toBe(false);
  });

  it('knows when a full environment is done', function() {
    var reporter = new jasmineUnderTest.JsApiReporter({});

    expect(reporter.started).toBe(false);
    expect(reporter.finished).toBe(false);

    reporter.jasmineStarted();
    reporter.jasmineDone({});

    expect(reporter.finished).toBe(true);
  });

  it("defaults to 'loaded' status", function() {
    var reporter = new jasmineUnderTest.JsApiReporter({});

    expect(reporter.status()).toEqual('loaded');
  });

  it("reports 'started' when Jasmine has started", function() {
    var reporter = new jasmineUnderTest.JsApiReporter({});

    reporter.jasmineStarted();

    expect(reporter.status()).toEqual('started');
  });

  it("reports 'done' when Jasmine is done", function() {
    var reporter = new jasmineUnderTest.JsApiReporter({});

    reporter.jasmineDone({});

    expect(reporter.status()).toEqual('done');
  });

  it('tracks a suite', function() {
    var reporter = new jasmineUnderTest.JsApiReporter({});

    reporter.suiteStarted({
      id: 123,
      description: 'A suite'
    });

    var suites = reporter.suites();

    expect(suites).toEqual({ 123: { id: 123, description: 'A suite' } });

    reporter.suiteDone({
      id: 123,
      description: 'A suite',
      status: 'passed'
    });

    expect(suites).toEqual({
      123: { id: 123, description: 'A suite', status: 'passed' }
    });
  });

  describe('#specResults', function() {
    var reporter, specResult1, specResult2;
    beforeEach(function() {
      reporter = new jasmineUnderTest.JsApiReporter({});
      specResult1 = {
        id: 1,
        description: 'A spec'
      };
      specResult2 = {
        id: 2,
        description: 'Another spec'
      };

      reporter.specDone(specResult1);
      reporter.specDone(specResult2);
    });

    it('should return a slice of results', function() {
      expect(reporter.specResults(0, 1)).toEqual([specResult1]);
      expect(reporter.specResults(1, 1)).toEqual([specResult2]);
    });

    describe('when the results do not exist', function() {
      it('should return a slice of shorter length', function() {
        expect(reporter.specResults(0, 3)).toEqual([specResult1, specResult2]);
        expect(reporter.specResults(2, 3)).toEqual([]);
      });
    });
  });

  describe('#suiteResults', function() {
    var reporter, suiteStarted1, suiteResult1, suiteResult2;
    beforeEach(function() {
      reporter = new jasmineUnderTest.JsApiReporter({});
      suiteStarted1 = {
        id: 1
      };
      suiteResult1 = {
        id: 1,
        status: 'failed',
        failedExpectations: [{ message: 'My After All Exception' }]
      };
      suiteResult2 = {
        id: 2,
        status: 'passed'
      };

      reporter.suiteStarted(suiteStarted1);
      reporter.suiteDone(suiteResult1);
      reporter.suiteDone(suiteResult2);
    });

    it('should not include suite starts', function() {
      expect(reporter.suiteResults(0, 3).length).toEqual(2);
    });

    it('should return a slice of results', function() {
      expect(reporter.suiteResults(0, 1)).toEqual([suiteResult1]);
      expect(reporter.suiteResults(1, 1)).toEqual([suiteResult2]);
    });

    it('returns nothing for out of bounds indices', function() {
      expect(reporter.suiteResults(0, 3)).toEqual([suiteResult1, suiteResult2]);
      expect(reporter.suiteResults(2, 3)).toEqual([]);
    });
  });

  describe('#executionTime', function() {
    it('should start the timer when jasmine starts', function() {
      var timerSpy = jasmine.createSpyObj('timer', ['start', 'elapsed']),
        reporter = new jasmineUnderTest.JsApiReporter({
          timer: timerSpy
        });

      reporter.jasmineStarted();
      expect(timerSpy.start).toHaveBeenCalled();
    });

    it('should return the time it took the specs to run, in ms', function() {
      var timerSpy = jasmine.createSpyObj('timer', ['start', 'elapsed']),
        reporter = new jasmineUnderTest.JsApiReporter({
          timer: timerSpy
        });

      timerSpy.elapsed.and.returnValue(1000);
      reporter.jasmineDone();
      expect(reporter.executionTime()).toEqual(1000);
    });

    describe("when the specs haven't finished being run", function() {
      it('should return undefined', function() {
        var timerSpy = jasmine.createSpyObj('timer', ['start', 'elapsed']),
          reporter = new jasmineUnderTest.JsApiReporter({
            timer: timerSpy
          });

        expect(reporter.executionTime()).toBeUndefined();
      });
    });
  });

  describe('#runDetails', function() {
    it('should have details about the run', function() {
      var reporter = new jasmineUnderTest.JsApiReporter({});
      reporter.jasmineDone({ some: { run: 'details' } });
      expect(reporter.runDetails).toEqual({ some: { run: 'details' } });
    });
  });
});
