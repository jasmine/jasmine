describe("ConsoleReporter", function() {
  var out;

  beforeEach(function() {
    out = (function() {
      var output = "";
      return {
        print: function(str) {
          output += str;
        },
        getOutput: function() {
          return output.replace('ConsoleReporter is deprecated and will be removed in a future version.', '');
        },
        clear: function() {
          output = "";
        }
      };
    }());
  });

  it("reports that the suite has started to the console", function() {
    var reporter = new j$.ConsoleReporter({
      print: out.print
    });

    reporter.jasmineStarted();

    expect(out.getOutput()).toEqual("Started\n");
  });

  it("starts the provided timer when jasmine starts", function() {
    var timerSpy = jasmine.createSpyObj('timer', ['start']),
        reporter = new j$.ConsoleReporter({
          print: out.print,
          timer: timerSpy
        });

    reporter.jasmineStarted();

    expect(timerSpy.start).toHaveBeenCalled();
  });

  it("reports a passing spec as a dot", function() {
    var reporter = new j$.ConsoleReporter({
      print: out.print
    });

    reporter.specDone({status: "passed"});

    expect(out.getOutput()).toEqual(".");
  });

  it("does not report a disabled spec", function() {
    var reporter = new j$.ConsoleReporter({
      print: out.print
    });

    reporter.specDone({status: "disabled"});

    expect(out.getOutput()).toEqual("");
  });

  it("reports a failing spec as an 'F'", function() {
    var reporter = new j$.ConsoleReporter({
      print: out.print
    });

    reporter.specDone({status: "failed"});

    expect(out.getOutput()).toEqual("F");
  });

  it("reports a pending spec as a '*'", function() {
    var reporter = new j$.ConsoleReporter({
      print: out.print
    });

    reporter.specDone({status: "pending"});

    expect(out.getOutput()).toEqual("*");
  });

  it("alerts user if there are no specs", function(){
    var reporter = new j$.ConsoleReporter({
          print: out.print
        });

    reporter.jasmineStarted();
    out.clear();
    reporter.jasmineDone();

    expect(out.getOutput()).toMatch(/No specs found/);
  });

  it("reports a summary when done (singular spec and time)", function() {
    var timerSpy = jasmine.createSpyObj('timer', ['start', 'elapsed']),
        reporter = new j$.ConsoleReporter({
          print: out.print,
          timer: timerSpy
        });

    reporter.jasmineStarted();
    reporter.specDone({status: "passed"});

    timerSpy.elapsed.and.returnValue(1000);

    out.clear();
    reporter.jasmineDone();

    expect(out.getOutput()).toMatch(/1 spec, 0 failures/);
    expect(out.getOutput()).not.toMatch(/0 pending specs/);
    expect(out.getOutput()).toMatch("Finished in 1 second\n");
  });

  it("reports a summary when done (pluralized specs and seconds)", function() {
    var timerSpy = jasmine.createSpyObj('timer', ['start', 'elapsed']),
        reporter = new j$.ConsoleReporter({
          print: out.print,
          timer: timerSpy
        });

    reporter.jasmineStarted();
    reporter.specDone({status: "passed"});
    reporter.specDone({status: "pending"});
    reporter.specDone({
      status: "failed",
      description: "with a failing spec",
      fullName: "A suite with a failing spec",
      failedExpectations: [
        {
          passed: false,
          message: "Expected true to be false.",
          expected: false,
          actual: true,
          stack: "foo\nbar\nbaz"
        }
      ]
    });

    out.clear();

    timerSpy.elapsed.and.returnValue(100);

    reporter.jasmineDone();

    expect(out.getOutput()).toMatch(/3 specs, 1 failure, 1 pending spec/);
    expect(out.getOutput()).toMatch("Finished in 0.1 seconds\n");
  });

  it("reports a summary when done that includes stack traces for a failing suite", function() {
    var reporter = new j$.ConsoleReporter({
      print: out.print
    });

    reporter.jasmineStarted();
    reporter.specDone({status: "passed"});
    reporter.specDone({
      status: "failed",
      description: "with a failing spec",
      fullName: "A suite with a failing spec",
      failedExpectations: [
        {
          passed: false,
          message: "Expected true to be false.",
          expected: false,
          actual: true,
          stack: "foo bar baz"
        }
      ]
    });

    out.clear();

    reporter.jasmineDone();

    expect(out.getOutput()).toMatch(/true to be false/);
    expect(out.getOutput()).toMatch(/foo bar baz/);
  });

  describe('onComplete callback', function(){
    var onComplete, reporter;

    beforeEach(function() {
      onComplete = jasmine.createSpy('onComplete');
      reporter = new j$.ConsoleReporter({
        print: out.print,
        onComplete: onComplete
      });
      reporter.jasmineStarted();
    });

    it("is called when the suite is done", function() {
      reporter.jasmineDone();
      expect(onComplete).toHaveBeenCalledWith(true);
    });

    it('calls it with false if there are spec failures', function() {
      reporter.specDone({status: "failed", failedExpectations: []});
      reporter.jasmineDone();
      expect(onComplete).toHaveBeenCalledWith(false);
    });

    it('calls it with false if there are suite failures', function() {
      reporter.specDone({status: "passed"});
      reporter.suiteDone({failedExpectations: [{ message: 'bananas' }] });
      reporter.jasmineDone();
      expect(onComplete).toHaveBeenCalledWith(false);
    });
  });

  describe("with color", function() {
    it("reports that the suite has started to the console", function() {
      var reporter = new j$.ConsoleReporter({
        print: out.print,
        showColors: true
      });

      reporter.jasmineStarted();

      expect(out.getOutput()).toEqual("Started\n");
    });

    it("reports a passing spec as a dot", function() {
      var reporter = new j$.ConsoleReporter({
        print: out.print,
        showColors: true
      });

      reporter.specDone({status: "passed"});

      expect(out.getOutput()).toEqual("\x1B[32m.\x1B[0m");
    });

    it("does not report a disabled spec", function() {
      var reporter = new j$.ConsoleReporter({
        print: out.print,
        showColors: true
      });

      reporter.specDone({status: 'disabled'});

      expect(out.getOutput()).toEqual("");
    });

    it("reports a failing spec as an 'F'", function() {
      var reporter = new j$.ConsoleReporter({
        print: out.print,
        showColors: true
      });

      reporter.specDone({status: 'failed'});

      expect(out.getOutput()).toEqual("\x1B[31mF\x1B[0m");
    });

    it("displays all afterAll exceptions", function() {
        var reporter = new j$.ConsoleReporter({
          print: out.print,
          showColors: true
        });

        reporter.suiteDone({ failedExpectations: [{ message: 'After All Exception' }] });
        reporter.suiteDone({ failedExpectations: [{ message: 'Some Other Exception' }] });
        reporter.jasmineDone();

        expect(out.getOutput()).toMatch(/After All Exception/);
        expect(out.getOutput()).toMatch(/Some Other Exception/);
    });
  });
});
