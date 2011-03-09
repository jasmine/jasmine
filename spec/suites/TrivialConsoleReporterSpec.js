describe("TrivialConsoleReporter", function() {
  

  //keep these literal.  otherwise the test loses value as a test.
  function green(str)  { return '\033[32m' + str + '\033[0m'; }
  function red(str)    { return '\033[31m' + str + '\033[0m'; }
  function yellow(str) { return '\033[33m' + str + '\033[0m'; }
  
  function prefixGreen(str)  { return '\033[32m' + str; }
  function prefixRed(str)    { return '\033[31m' + str; }
  
  var newline = "\n";
  
  var passingSpec = { results: function(){ return {passed: function(){return true;}}; } },
      failingSpec = { results: function(){ return {passed: function(){return false;}}; } },
      skippedSpec = { results: function(){ return {skipped: true}; } },
      passingRun =  { results: function(){ return {failedCount: 0, items_: [null, null, null]}; } },
      failingRun =  { results: function(){ return {failedCount: 7, items_: [null, null, null]}; } };
  
  function repeatedlyInvoke(f, times) { for(var i=0; i<times; i++) f(times+1); }
  
  function repeat(thing, times) {
    var arr = [];
    for(var i=0; i<times; i++) arr.push(thing);
    return arr;
  }
  
  var fiftyRedFs = repeat(red("F"), 50).join(""),
      fiftyGreenDots = repeat(green("."), 50).join("");
  
  function simulateRun(reporter, specResults, suiteResults, finalRunner, startTime, endTime) {
    reporter.reportRunnerStarting();
    for(var i=0; i<specResults.length; i++) reporter.reportSpecResults(specResults[i]);
    for(i=0; i<suiteResults.length; i++) reporter.reportSuiteResults(suiteResults[i]);
    reporter.runnerStartTime = startTime;
    reporter.now = function(){return endTime;};
    reporter.reportRunnerResults(finalRunner);
  }
  
  beforeEach(function() {
    this.out = (function(){
      var output = "";
      return {
        print:function(str) {output += str;},
        getOutput:function(){return output;},
        clear: function(){output = "";}
      };
    })();

    this.done = false
    var self = this
    this.reporter = new jasmine.TrivialConsoleReporter(this.out.print, function(runner){
      self.done = true
    });
  });
  
  
  describe('Integration', function(){
    it("prints the proper output under a pass scenario.  small numbers.", function(){
      simulateRun(this.reporter,
                  repeat(passingSpec, 3),
                  [],
                  { 
                    results:function(){
                      return {
                        items_: [null, null, null], 
                        totalCount: 7, 
                        failedCount: 0
                      };
                    }
                  },
                  1000,
                  1777);
                  
      expect(this.out.getOutput()).toEqual(
        [
         "Started",
         green(".") + green(".") + green("."),
         "",
         "Finished in 0.777 seconds",
         green("3 specs, 7 expectations, 0 failures"),
         ""
        ].join("\n") + "\n"
      );      
    });

    it("prints the proper output under a pass scenario.  large numbers.", function(){
      simulateRun(this.reporter,
                  repeat(passingSpec, 57),
                  [],
                  { 
                    results:function(){
                      return {
                        items_: [null, null, null], 
                        totalCount: 7, 
                        failedCount: 0
                      };
                    }
                  },
                  1000,
                  1777);
                       
      expect(this.out.getOutput()).toEqual(
        [
         "Started",
         
         green(".") + green(".") + green(".") + green(".") + green(".") + //50 green dots
         green(".") + green(".") + green(".") + green(".") + green(".") + 
         green(".") + green(".") + green(".") + green(".") + green(".") + 
         green(".") + green(".") + green(".") + green(".") + green(".") + 
         green(".") + green(".") + green(".") + green(".") + green(".") + 
         green(".") + green(".") + green(".") + green(".") + green(".") + 
         green(".") + green(".") + green(".") + green(".") + green(".") + 
         green(".") + green(".") + green(".") + green(".") + green(".") + 
         green(".") + green(".") + green(".") + green(".") + green(".") + 
         green(".") + green(".") + green(".") + green(".") + green(".") + newline +
         
         green(".") + green(".") + green(".") + green(".") + green(".") + //7 green dots
         green(".") + green("."),
         
         "",
         "Finished in 0.777 seconds",
         green("3 specs, 7 expectations, 0 failures"),
         ""
        ].join("\n") + "\n"
      );      
    });
    
    
    it("prints the proper output under a failure scenario.", function(){
      simulateRun(this.reporter,
                  [failingSpec, passingSpec, failingSpec],
                  [{description:"The oven", 
                    results:function(){
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
                     results:function(){
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
                    results:function(){
                      return {
                        items_: [null, null, null], 
                        totalCount: 7, 
                        failedCount: 2
                      };
                    }
                  },
                  1000,
                  1777);

      expect(this.out.getOutput()).toEqual(
        [
         "Started",
         red("F") + green(".") + red("F"),
         "",
         "The oven heats up",
         "  stack trace one",
         "    second line",
         "  stack trace two",
         "",
         "The washing machine washes clothes",
         "  stack trace one",
         "",
         "Finished in 0.777 seconds",
         red("3 specs, 7 expectations, 2 failures"),
         ""
        ].join("\n") + "\n"
      );      
    });
    
    
  });
  
  describe('A Test Run', function(){

    describe('Starts', function(){
      it("prints Started", function(){
        this.reporter.reportRunnerStarting();

        expect(this.out.getOutput()).toEqual(
          "Started" + newline
        );
      });
    });
    
    describe('A spec runs', function(){
      it("prints a green dot if the spec passes", function(){
        this.reporter.reportSpecResults(passingSpec);

        expect(this.out.getOutput()).toEqual(
          green(".")
        );
      });
    
      it("prints a red dot if the spec fails", function(){
        this.reporter.reportSpecResults(failingSpec);

        expect(this.out.getOutput()).toEqual(
          red("F")
        );
      });

      it("prints a yellow star if the spec was skipped", function(){
        this.reporter.reportSpecResults(skippedSpec);

        expect(this.out.getOutput()).toEqual(
          yellow("*")
        );
      });
    });
    
    
    describe('Many specs run', function(){
      it("starts a new line every 50 specs", function(){
        var self = this;
        repeatedlyInvoke(function(){self.reporter.reportSpecResults(failingSpec);}, 49);

        expect(this.out.getOutput()).
          toEqual(repeat(red("F"), 49).join(""));
        
        repeatedlyInvoke(function(){self.reporter.reportSpecResults(failingSpec);}, 3);
        
        expect(this.out.getOutput()).
          toEqual(fiftyRedFs + newline + 
                  red("F") + red("F"));
          
        repeatedlyInvoke(function(){self.reporter.reportSpecResults(failingSpec);}, 48);
        repeatedlyInvoke(function(){self.reporter.reportSpecResults(passingSpec);}, 2);
        
        expect(this.out.getOutput()).
          toEqual(fiftyRedFs + newline + 
                  fiftyRedFs + newline + 
                  green(".") + green("."));
      });      
    });
    
    describe('A suite runs', function(){
      it("remembers suite results", function(){
        var emptyResults = function(){return {items_:[]};};
        this.reporter.reportSuiteResults({description:"Oven", results:emptyResults});
        this.reporter.reportSuiteResults({description:"Mixer", results:emptyResults});
        
        var self = this;
        var descriptions = [];
        for(var i=0; i<self.reporter.suiteResults.length; i++) 
          descriptions.push(self.reporter.suiteResults[i].description);
        
        expect(descriptions).toEqual(["Oven", "Mixer"]);
      });      

      it("creates a description out of the current suite and any parent suites", function(){
        var emptyResults = function(){return {items_:[]};};
        var grandparentSuite = {description:"My house", results:emptyResults};
        var parentSuite = {description:"kitchen", parentSuite: grandparentSuite, results:emptyResults};
        this.reporter.reportSuiteResults({description:"oven", parentSuite: parentSuite, results:emptyResults});
        
        expect(this.reporter.suiteResults[0].description).toEqual("My house kitchen oven");
      });

      it("gathers failing spec results from the suite.  the spec must have a description.", function(){
        this.reporter.reportSuiteResults({description:"Oven", 
                                          results:function(){
                                            return {
                                              items_:[
                                                {failedCount:0, description:"specOne"},
                                                {failedCount:99, description:"specTwo"},
                                                {failedCount:0, description:"specThree"},
                                                {failedCount:88, description:"specFour"},
                                                {failedCount:3}
                                              ]
                                            };
                                          }});

        expect(this.reporter.suiteResults[0].failedSpecResults).
          toEqual([
            {failedCount:99, description:"specTwo"},
            {failedCount:88, description:"specFour"}
          ]);
      });      
      
    });
    
    describe('Finishes', function(){

      describe('Spec failure information', function(){

        it("prints suite and spec descriptions together as a sentence", function(){
          this.reporter.suiteResults = [
            {description:"The oven", failedSpecResults:[
                                       {description:"heats up", items_:[]},
                                       {description:"cleans itself", items_:[]}
                                     ]},
            {description:"The mixer", failedSpecResults:[
                                        {description:"blends things together", items_:[]}
                                      ]}
          ];
          
          this.reporter.reportRunnerResults(failingRun);

          expect(this.out.getOutput()).toContain("The oven heats up");
          expect(this.out.getOutput()).toContain("The oven cleans itself");
          expect(this.out.getOutput()).toContain("The mixer blends things together");
        });

        it("prints stack trace of spec failure", function(){
          this.reporter.suiteResults = [
            {description:"The oven", failedSpecResults:[
                                       {description:"heats up",
                                        items_:[
                                          {trace:{stack:"stack trace one"}},
                                          {trace:{stack:"stack trace two"}}
                                        ]}
                                     ]}
          ];
          
          this.reporter.reportRunnerResults(failingRun);

          expect(this.out.getOutput()).toContain("The oven heats up");
          expect(this.out.getOutput()).toContain("stack trace one");
          expect(this.out.getOutput()).toContain("stack trace two");
        });

      });

      describe('Finished line', function(){
      
        it("prints the elapsed time in the summary message", function(){
          this.reporter.now = function(){return 1000;};
          this.reporter.reportRunnerStarting();
          this.reporter.now = function(){return 1777;};
          this.reporter.reportRunnerResults(passingRun);
          expect(this.out.getOutput()).toContain("0.777 seconds");
        });
      
        it("prints round time numbers correctly", function(){
          var self = this;
          function run(startTime, endTime) {
            self.out.clear();
            self.reporter.runnerStartTime = startTime;
            self.reporter.now = function(){return endTime;};
            self.reporter.reportRunnerResults(passingRun);          
          }
        
          run(1000, 11000);
          expect(this.out.getOutput()).toContain("10 seconds");
        
          run(1000, 2000);
          expect(this.out.getOutput()).toContain("1 seconds");
        
          run(1000, 1100);
          expect(this.out.getOutput()).toContain("0.1 seconds");

          run(1000, 1010);
          expect(this.out.getOutput()).toContain("0.01 seconds");

          run(1000, 1001);        
          expect(this.out.getOutput()).toContain("0.001 seconds");
        });

        it("prints the full finished message", function(){
          this.reporter.now = function(){return 1000;};
          this.reporter.reportRunnerStarting();
          this.reporter.now = function(){return 1777;};
          this.reporter.reportRunnerResults(failingRun);
          expect(this.out.getOutput()).toContain("Finished in 0.777 seconds");
        });
      });

      describe("specs/expectations/failures summary", function(){
        it("prints statistics in green if there were no failures", function() {
          this.reporter.reportRunnerResults({ 
            results:function(){return {items_: [null, null, null], totalCount: 7, failedCount: 0};}
          });
          expect(this.out.getOutput()).
            toContain("3 specs, 7 expectations, 0 failures");
        });

        it("prints statistics in red if there was a failure", function() {
          this.reporter.reportRunnerResults({ 
            results:function(){return {items_: [null, null, null], totalCount: 7, failedCount: 3};}
          });
          expect(this.out.getOutput()).
            toContain("3 specs, 7 expectations, 3 failures");
        });

        it("handles pluralization with 1's ones appropriately", function() {
          this.reporter.reportRunnerResults({ 
            results:function(){return {items_: [null], totalCount: 1, failedCount: 1};}
          });
          expect(this.out.getOutput()).
            toContain("1 spec, 1 expectation, 1 failure");
        });
      });
      
      describe("done callback", function(){
        it("calls back when done", function() {
          expect(this.done).toBeFalsy();
          this.reporter.reportRunnerResults({ 
            results:function(){return {items_: [null, null, null], totalCount: 7, failedCount: 0};}
          });
          expect(this.done).toBeTruthy();
        });        
      });
      
    });

  });
  
});