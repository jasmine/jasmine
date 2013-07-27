getJasmineRequireObj().ConsoleReporter = function() {

  var noopTimer = {
    start: function(){},
    elapsed: function(){ return 0; }
  };

  function ConsoleReporter(options) {
    var print = options.print,
      showColors = options.showColors || false,
      onComplete = options.onComplete || function() {},
      timer = options.timer || noopTimer,
      specCount,
      failureCount,
      failedSpecs = [],
      pendingCount,
      ansi = {
        green: '\033[32m',
        red: '\033[31m',
        yellow: '\033[33m',
        none: '\033[0m'
      };

    this.jasmineStarted = function() {
      specCount = 0;
      failureCount = 0;
      pendingCount = 0;
      print("Started");
      printNewline();
      timer.start();
    };

    this.jasmineDone = function() {
      printNewline();
      for (var i = 0; i < failedSpecs.length; i++) {
        specFailureDetails(failedSpecs[i]);
      }

      printNewline();
      var specCounts = specCount + " " + plural("spec", specCount) + ", " +
        failureCount + " " + plural("failure", failureCount);

      if (pendingCount) {
        specCounts += ", " + pendingCount + " pending " + plural("spec", pendingCount);
      }

      print(specCounts);

      printNewline();
      var seconds = timer.elapsed() / 1000;
      print("Finished in " + seconds + " " + plural("second", seconds));

      printNewline();

      onComplete(failureCount === 0);
    };

    this.specDone = function(result) {
      specCount++;

      if (result.status == "pending") {
        pendingCount++;
        print(colored("yellow", "*"));
        return;
      }

      if (result.status == "passed") {
        print(colored("green", '.'));
        return;
      }

      if (result.status == "failed") {
        failureCount++;
        failedSpecs.push(result);
        print(colored("red", 'F'));
      }
    };

    return this;

    function printNewline() {
      print("\n");
    }

    function colored(color, str) {
      return showColors ? (ansi[color] + str + ansi.none) : str;
    }

    function plural(str, count) {
      return count == 1 ? str : str + "s";
    }

    function repeat(thing, times) {
      var arr = [];
      for (var i = 0; i < times; i++) {
        arr.push(thing);
      }
      return arr;
    }

    function indent(str, spaces) {
      var lines = (str || '').split("\n");
      var newArr = [];
      for (var i = 0; i < lines.length; i++) {
        newArr.push(repeat(" ", spaces).join("") + lines[i]);
      }
      return newArr.join("\n");
    }

    function specFailureDetails(result) {
      printNewline();
      print(result.fullName);

      for (var i = 0; i < result.failedExpectations.length; i++) {
        var failedExpectation = result.failedExpectations[i];
        printNewline();
        print(indent(failedExpectation.stack, 2));
      }

      printNewline();
    }
  }

  return ConsoleReporter;
};
