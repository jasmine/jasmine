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

  var passingSpec = {
    results: function() {
      return {
        passed: function() {
          return true;
        }
      };
    }
  },
    failingSpec = {
      results: function() {
        return {
          passed: function() {
            return false;
          }
        };
      }
    },
    skippedSpec = {
      results: function() {
        return {skipped: true};
      }
    },
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
      {
        specs: function() {
          return [null, null, null];
        },
        results:function() {
          return {
            items_: [null, null, null],
            totalCount: 7,
            failedCount: 0
          };
        }
      },
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
      {
        specs: function() {
          return [null, null, null];
        },
        results:function() {
          return {
            items_: [null, null, null],
            totalCount: 7,
            failedCount: 0
          };
        }
      },
        1000,
        1777);

      var output = out.getOutput();
      expect(output).toMatch(/^Started/);
      expect(output).toMatch(/\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\./);
      expect(output).toMatch(/3 specs, 0 failures/);
    });

    it("prints the proper output under a failure scenario.", function() {
      simulateRun(reporter,
        [failingSpec, passingSpec, failingSpec],
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

    describe('when a suite reports', function() {
      var emptyResults;
      beforeEach(function() {
        emptyResults = function() {
          return {
            items_:[]
          };
        };
      });

      it("remembers suite results", function() {
        reporter.reportSuiteResults({description: "Oven", results: emptyResults});
        reporter.reportSuiteResults({description: "Mixer", results: emptyResults});

        expect(reporter.suiteResults[0].description).toEqual('Oven');
        expect(reporter.suiteResults[1].description).toEqual('Mixer');
      });

      it("creates a description out of the current suite and any parent suites", function() {
        var grandparentSuite = {
          description: "My house",
          results: emptyResults
        };
        var parentSuite = {
          description: "kitchen",
          parentSuite: grandparentSuite,
          results: emptyResults
        };
        reporter.reportSuiteResults({ description: "oven", parentSuite: parentSuite, results: emptyResults });

        expect(reporter.suiteResults[0].description).toEqual("My house kitchen oven");
      });

      it("gathers failing spec results from the suite - the spec must have a description.", function() {
        reporter.reportSuiteResults({description:"Oven",
          results: function() {
            return {
              items_:[
                { failedCount: 0, description: "specOne" },
                { failedCount: 99, description: "specTwo" },
                { failedCount: 0, description: "specThree" },
                { failedCount: 88, description: "specFour" },
                { failedCount: 3 }
              ]
            };
          }});

        expect(reporter.suiteResults[0].failedSpecResults).
          toEqual([
          { failedCount: 99, description: "specTwo" },
          { failedCount: 88, description: "specFour" }
        ]);
      });

    });

    describe('and finishes', function() {

      describe('when reporting spec failure information', function() {

        it("prints suite and spec descriptions together as a sentence", function() {
          reporter.suiteResults = [
            {description:"The oven", failedSpecResults:[
              {description:"heats up", items_:[]},
              {description:"cleans itself", items_:[]}
            ]},
            {description:"The mixer", failedSpecResults:[
              {description:"blends things together", items_:[]}
            ]}
          ];

          reporter.reportRunnerResults(failingRun);

          expect(out.getOutput()).toContain("The oven heats up");
          expect(out.getOutput()).toContain("The oven cleans itself");
          expect(out.getOutput()).toContain("The mixer blends things together");
        });

        it("prints stack trace of spec failure", function() {
          reporter.suiteResults = [
            {description:"The oven", failedSpecResults:[
              {description:"heats up",
                items_:[
                  {trace:{stack:"stack trace one"}},
                  {trace:{stack:"stack trace two"}}
                ]}
            ]}
          ];

          reporter.reportRunnerResults(failingRun);

          expect(out.getOutput()).toContain("The oven heats up");
          expect(out.getOutput()).toContain("stack trace one");
          expect(out.getOutput()).toContain("stack trace two");
        });

      });

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

      describe("when reporting the results summary", function() {
        it("prints statistics in green if there were no failures", function() {
          reporter.reportRunnerResults({
            specs: function() {
              return [null, null, null];
            },
            results:function() {
              return {items_: [null, null, null], totalCount: 7, failedCount: 0};
            }
          });
          expect(out.getOutput()).
            toContain("3 specs, 0 failures");
        });

        it("prints statistics in red if there was a failure", function() {
          reporter.reportRunnerResults({
            specs: function() {
              return [null, null, null];
            },
            results:function() {
              return {items_: [null, null, null], totalCount: 7, failedCount: 3};
            }
          });
          expect(out.getOutput()).
            toContain("3 specs, 3 failures");
        });

        it("handles pluralization with 1's ones appropriately", function() {
          reporter.reportRunnerResults({
            specs: function() {
              return [null];
            },
            results:function() {
              return {items_: [null], totalCount: 1, failedCount: 1};
            }
          });
          expect(out.getOutput()).
            toContain("1 spec, 1 failure");
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
});