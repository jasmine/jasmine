jasmine.TrivialNodeReporter = function(sys) {
  this.sys = sys;

  this.ansi = {
    green: '\033[32m',
    red: '\033[31m',
    yellow: '\033[33m',
    none: '\033[0m'
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


jasmine.TrivialNodeReporter.prototype._coloredStr = function(color, str) {
  return this.ansi[color] + str + this.ansi.none;
};

jasmine.TrivialNodeReporter.prototype._greenStr = function(str) { return this._coloredStr("green", str); };
jasmine.TrivialNodeReporter.prototype._redStr = function(str) { return this._coloredStr("red", str); };
jasmine.TrivialNodeReporter.prototype._yellowStr = function(str) { return this._coloredStr("yellow", str); };


jasmine.TrivialNodeReporter.prototype._greenDot = function(str) { return this.sys.print(this._greenStr(".")); };
jasmine.TrivialNodeReporter.prototype._redF = function(str) { return this.sys.print(this._redStr("F")); };
jasmine.TrivialNodeReporter.prototype._newLine = function(str) { return this.sys.print("\n"); };

jasmine.TrivialNodeReporter.prototype.reportSpecResults = function(spec) {
  if (spec.results().passed()) {
    this._greenDot();
  } else {
    this._redF();
  }
};  


