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
  
  function greenDot()  { sys.print(greenStr(".")); }
  function redF()      { sys.print(redStr("F")); }
  function newline()   { sys.print("\n"); }
  
  
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
  
  var startNewLineIfNecessary = lineEnder(defaultColumnsPerLine);
  
  this.reportSpecResults = function(spec) {
    if (spec.results().passed()) {
      greenDot();
    } else {
      redF();
    } 
    startNewLineIfNecessary();   
  };
};

//     reportSpecResults: function(spec) {
//       var result = spec.results();
//       var msg = '';
//       if (result.passed())
//       {
//         msg = (colors) ? (ansi.green + '.' + ansi.none) : '.';
// //      } else if (result.skipped) {  TODO: Research why "result.skipped" returns false when "xit" is called on a spec?
// //        msg = (colors) ? (ansi.yellow + '*' + ansi.none) : '*';
//       } else {
//         msg = (colors) ? (ansi.red + 'F' + ansi.none) : 'F';
//       }
//       sys.print(msg);
//       if (columnCounter++ < 50) return;
//       columnCounter = 0;
//       sys.print('\n');
//     },
