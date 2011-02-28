jasmine.TrivialNodeReporter = function(sys) {

  var ansi = {
    green: '\033[32m',
    red: '\033[31m',
    yellow: '\033[33m',
    none: '\033[0m'
  };
  
  function coloredStr(color, str) { return ansi[color] + str + ansi.none; }
  
  function greenStr(str)  { return coloredStr("green", str); }
  function redStr(str)    { return coloredStr("red", str); }
  function yellowStr(str) { return coloredStr("yellow", str); }
  
  function greenDot(str)  { sys.print(greenStr(".")); }
  function redF(str)      { sys.print(redStr("F")); }
  function newline(str)   { sys.print("\n"); }
  
  this.reportSpecResults = function(spec) {
    if (spec.results().passed()) {
      greenDot();
    } else {
      redF();
    }    
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
