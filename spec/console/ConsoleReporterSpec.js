describe("ConsoleReporter", function() {
  //keep these literal.  otherwise the test loses value as a test.
  function green(str) {
    return '\033[32m' + str + '\033[0m';
  }

  function red(str) {
    return '\033[31m' + str + '\033[0m';
  }

  function yellow(str) {
    return '\033[33m' + str + '\033[0m';
  }

  function prefixGreen(str) {
    return '\033[32m' + str;
  }

  function prefixRed(str) {
    return '\033[31m' + str;
  }

  var newline = "\n";

  var passingSpec = { status: 'passed' },
  failingSpec = { status: 'failed' },
  skippedSpec = { status: 'disabled' },
  passingRun = {
    specs: function() {
      return [null, null, null];
    },
    results: function() {
      return {failedCount: 0, items_: [null, null, null]};
    }
  },
  failingRun = {
    specs: function() {
      return [null, null, null];
    },
    results: function() {
      return {
        failedCount: 7, items_: [null, null, null]};
    }
  };

  function repeatedlyInvoke(f, times) {
    for (var i = 0; i < times; i++) f(times + 1);
  }

  function repeat(thing, times) {
    var arr = [];
    for (var i = 0; i < times; i++) arr.push(thing);
    return arr;
  }

  function simulateRun(reporter, specResults, suiteResults, finalRunner, startTime, endTime) {
    reporter.reportRunnerStarting();
    for (var i = 0; i < specResults.length; i++) {
      reporter.reportSpecResults(specResults[i]);
    }
    for (i = 0; i < suiteResults.length; i++) {
      reporter.reportSuiteResults(suiteResults[i]);
    }
    reporter.runnerStartTime = startTime;
    reporter.now = function() {
      return endTime;
    };
    reporter.reportRunnerResults(finalRunner);
  }

  var reporter, out, done;

  beforeEach(function() {
    out = (function() {
      var output = "";
      return {
        print:function(str) {
          output += str;
        },
        getOutput:function() {
          return output;
        },
        clear: function() {
          output = "";
        }
      };
    })();

    done = false;
    reporter = new jasmine.ConsoleReporter(out.print, function(runner) {
      done = true
    });
  });


  describe('Integration', function() {
    it("prints the proper output under a pass scenario - small numbers.", function() {
      simulateRun(reporter,
        repeat(passingSpec, 3),
        [],
      { },
        1000,
        1777
        );

      var output = out.getOutput();
      expect(output).toMatch(/^Started/);
      expect(output).toMatch(/\.\.\./);
      expect(output).toMatch(/3 specs, 0 failures/);
    });

    it("prints the proper output under a pass scenario.  large numbers.", function() {
      simulateRun(reporter,
        repeat(passingSpec, 57),
        [],
      {},
        1000,
        1777);

      var output = out.getOutput();
      expect(output).toMatch(/^Started/);
      expect(output).toMatch(/\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\./);
      expect(output).toMatch(/57 specs, 0 failures/);
    });

    it("prints the proper output under a failure scenario.", function() {
      var base1 =  extend({}, failingSpec),
      failingSpec1 = extend(base1, {
        fullName: 'The oven heats up',
        failedExpectations: [
          {trace:{stack:"stack trace one\n  second line"}},
          {trace:{stack:"stack trace two"}}
        ]}),
        base2 = extend({}, failingSpec),
        failingSpec2 = extend(base2, {
          fullName: "The washing machine washes clothes",
          failedExpectations: [
            {trace:{stack:"stack trace one"}}
          ]});

      simulateRun(reporter,
        [failingSpec1, passingSpec, failingSpec2],
        [
          {description:"The oven",
            results:function() {
              return {
                items_:[
                  {failedCount:2,
                    description:"heats up",
                    items_:[
                      {trace:{stack:"stack trace one\n  second line"}},
                      {trace:{stack:"stack trace two"}}
                    ]}
                ]
              };
            }},
          {description:"The washing machine",
            results:function() {
              return {
                items_:[
                  {failedCount:2,
                    description:"washes clothes",
                    items_:[
                      {trace:{stack:"stack trace one"}}
                    ]}
                ]
              };
            }}
        ],
      {
        specs: function() {
          return [null, null, null];
        },
        results:function() {
          return {
            items_: [null, null, null],
            totalCount: 7,
            failedCount: 2
          };
        }
      },
        1000,
        1777);

      var output = out.getOutput();
      expect(output).toMatch(/^Started/);
      expect(output).toMatch(/F\.F/);
      expect(output).toMatch(/The oven heats up\n  stack trace one\n    second line\n  stack trace two/);
      expect(output).toMatch(/The washing machine washes clothes\n  stack trace one/);
      expect(output).toMatch(/3 specs, 2 failures/);
    });
  });

  describe('When a Jasmine environment executes', function() {
    beforeEach(function() {
      reporter.reportRunnerStarting();
    });

    it("should print 'Started' to the console", function() {
      expect(out.getOutput()).toEqual("Started" + newline);
    });

    describe('when a spec reports', function() {
      beforeEach(function() {
        out.clear();
      });

      it("prints a green dot if the spec passes", function() {
        reporter.reportSpecResults(passingSpec);

        expect(out.getOutput()).toMatch(/\./);
      });

      it("prints a red dot if the spec fails", function() {
        reporter.reportSpecResults(failingSpec);

        expect(out.getOutput()).toMatch(/F/);
      });

      it("prints a yellow star if the spec was skipped", function() {
        reporter.reportSpecResults(skippedSpec);

        expect(out.getOutput()).toMatch(/\*/);
      });
    });


    describe('and finishes', function() {

      describe('when reporting the execution time', function() {

        it("prints the full finished message", function() {
          reporter.now = function() {
            return 1000;
          };
          reporter.reportRunnerStarting();
          reporter.now = function() {
            return 1777;
          };
          reporter.reportRunnerResults(failingRun);
          expect(out.getOutput()).toContain("Finished in 0.777 seconds");
        });

        it("prints round time numbers correctly", function() {
          function run(startTime, endTime) {
            out.clear();
            reporter.runnerStartTime = startTime;
            reporter.now = function() {
              return endTime;
            };
            reporter.reportRunnerResults(passingRun);
          }

          run(1000, 11000);
          expect(out.getOutput()).toContain("10 seconds");

          run(1000, 2000);
          expect(out.getOutput()).toContain("1 seconds");

          run(1000, 1100);
          expect(out.getOutput()).toContain("0.1 seconds");

          run(1000, 1010);
          expect(out.getOutput()).toContain("0.01 seconds");

          run(1000, 1001);
          expect(out.getOutput()).toContain("0.001 seconds");
        });
      });

      describe("done callback", function() {
        it("calls back when done", function() {
          expect(done).toBeFalsy();
          reporter.reportRunnerResults({
            specs: function() {
              return [null, null, null];
            },
            results:function() {
              return {items_: [null, null, null], totalCount: 7, failedCount: 0};
            }
          });
          expect(done).toBeTruthy();
        });
      });
    });
  });

  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }
});
