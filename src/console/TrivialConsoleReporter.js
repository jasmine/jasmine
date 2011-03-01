jasmine.TrivialConsoleReporter = function(print) {

  var ansi = {
    green: '\033[32m',
    red: '\033[31m',
    yellow: '\033[33m',
    none: '\033[0m'
  };
  
  var defaultColumnsPerLine = 50;
  
  var language = {
    spec:"spec",
    assertion:"assertion",
    failure:"failure"
  };
  
  function coloredStr(color, str) { return ansi[color] + str + ansi.none; }
  
  function greenStr(str)  { return coloredStr("green", str); }
  function redStr(str)    { return coloredStr("red", str); }
  function yellowStr(str) { return coloredStr("yellow", str); }
  
  function newline()         { print("\n"); }
  function started()         { print("Started"); newline(); }

  function greenDot()        { print(greenStr(".")); }
  function redF()            { print(redStr("F")); }
  function yellowStar()      { print(yellowStr("*")); }
  
  function plural(str, count) { return count == 1 ? str : str + "s"; }
  
  function specFailureDetails(suiteDescription, specDescription, stackTraces)  { 
                               newline(); 
                               print(suiteDescription + " " + specDescription); 
                               newline();
                               for(var i=0; i<stackTraces.length; i++) {
                                 print(stackTraces[i]);
                                 newline();
                               }
                             }
  function finished(elapsed)  { newline(); 
                                newline(); 
                                print("Finished in " + elapsed/1000 + " seconds"); }
  function summary(colorF, specs, assertions, failed)  { newline(); 
                                                         print(colorF(specs + " " + plural(language.spec, specs) + ", " +
                                                                      assertions + " " + plural(language.assertion, assertions) + ", " +
                                                                      failed + " " + plural(language.failure, failed))); 
                                                         newline();
                                                         newline(); }
  function greenSummary(specs, assertions, failed){ summary(greenStr, specs, assertions, failed); }
  function redSummary(specs, assertions, failed){ summary(redStr, specs, assertions, failed); }
  
  
  
  
  function lineEnder(columnsPerLine) {
    var columnsSoFar = 0;
    return function() {
      columnsSoFar += 1;
      if (columnsSoFar == columnsPerLine) {
        newline();
        columnsSoFar = 0;
      }
    };
  }

  function fullSuiteDescription(suite) {
    var fullDescription = suite.description;
    if (suite.parentSuite) fullDescription = fullSuiteDescription(suite.parentSuite) + " " + fullDescription ;
    return fullDescription;
  }
  
  var startNewLineIfNecessary = lineEnder(defaultColumnsPerLine);
  
  this.now = function() { return new Date().getTime(); };
  
  this.reportRunnerStarting = function() {
    this.runnerStartTime = this.now();
    started();
  };
  
  this.reportSpecResults = function(spec) {
    var results = spec.results();
    if (results.skipped) {
      yellowStar();
    } else if (results.passed()) {
      greenDot();
    } else {
      redF();
    } 
    startNewLineIfNecessary();   
  };
  
  this.suiteResults = [];
  
  this.reportSuiteResults = function(suite) {
    var suiteResult = {
      description: fullSuiteDescription(suite),
      failedSpecResults: []
    };
    
    suite.results().items_.forEach(function(spec){
      if (spec.failedCount > 0 && spec.description) suiteResult.failedSpecResults.push(spec);
    });
    
    this.suiteResults.push(suiteResult);
  };
  
  function eachSpecFailure(suiteResults, callback) {
    for(var i=0; i<suiteResults.length; i++) {
      var suiteResult = suiteResults[i];
      for(var j=0; j<suiteResult.failedSpecResults.length; j++) {
        var failedSpecResult = suiteResult.failedSpecResults[j];
        var stackTraces = [];
        for(var k=0; k<failedSpecResult.items_.length; k++) stackTraces.push(failedSpecResult.items_[k].trace.stack);
        callback(suiteResult.description, failedSpecResult.description, stackTraces);
      }
    }
  }
  
  this.reportRunnerResults = function(runner) {
    eachSpecFailure(this.suiteResults, function(suiteDescription, specDescription, stackTraces) {
      specFailureDetails(suiteDescription, specDescription, stackTraces);
    });
    
    finished(this.now() - this.runnerStartTime);
    
    var results = runner.results();
    var summaryFunction = results.failedCount === 0 ? greenSummary : redSummary;
    summaryFunction(results.specs().length, results.totalCount, results.failedCount);
  };
};