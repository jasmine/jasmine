jasmine.TrivialNodeReporter = function(sys) {

  var ansi = {
    green: '\033[32m',
    red: '\033[31m',
    yellow: '\033[33m',
    none: '\033[0m'
  };
  
  var defaultColumnsPerLine = 50;
  
  function coloredStr(color, str) { return ansi[color] + str + ansi.none; }
  
  function greenStr(str)  { return coloredStr("green", str); }
  function redStr(str)    { return coloredStr("red", str); }
  function yellowStr(str) { return coloredStr("yellow", str); }
  
  function newline()         { sys.print("\n"); }
  function started()         { sys.print("Started"); newline(); }

  function greenDot()        { sys.print(greenStr(".")); }
  function redF()            { sys.print(redStr("F")); }
  function yellowStar()      { sys.print(yellowStr("*")); }

  function finished(colorF, elapsed)  { newline(); sys.print(colorF("Finished in " + elapsed/1000 + " seconds")); }
  function greenFinished(elapsed)     { finished(greenStr, elapsed); }
  function redFinished(elapsed)       { finished(redStr, elapsed); }
  
  
  
  
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
    var fullDescription = suite.description
    if (suite.parentSuite) fullDescription = fullSuiteDescription(suite.parentSuite) + " " + fullDescription 
    return fullDescription
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
      if (spec.failedCount > 0 && spec.description) suiteResult.failedSpecResults.push(spec)
    });
    
    this.suiteResults.push(suiteResult)
  };
  
  this.reportRunnerResults = function(runner) {
    var elapsed = this.now() - this.runnerStartTime;
    
    if (runner.results().failedCount === 0) {
      greenFinished(elapsed);
    } else {
      redFinished(elapsed);
    }
  };
};