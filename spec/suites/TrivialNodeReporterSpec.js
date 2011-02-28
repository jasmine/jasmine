describe("TrivialNodeReporter", function() {
  

  function green(str) {
    return '\033[32m' + str + '\033[0m';   //keep these literal.  otherwise the test loses value as a test.
  }
  
  function red(str) {
    return '\033[31m' + str + '\033[0m';
  }
  
  var newline = "\n";
  
  var passingSpec = {
    results: function(){
      return {passed:function(){return true;}};
    }
  };
  
  var failingSpec = {
    results: function(){
      return {passed:function(){return false;}};
    }
  };
  
  function repeatedlyInvoke(f, times) {
    for(var i=0; i<times; i++) f(times+1);
  }
  
  function repeat(thing, times) {
    var arr = [];
    for(var i=0; i<times; i++) arr.push(thing);
    return arr;
  }
  
  var fiftyRedFs = repeat(red("F"), 50).join("");
  var fiftyGreenDots = repeat(green("."), 50).join("");
  
  beforeEach(function() {
    this.fakeSys = (function(){
      var output = "";
      return {
        puts:function(str) {output += str + "\n";},
        print:function(str) {output += str;},
        getOutput:function(){return output;}
      };
    })();
    
    this.env = new jasmine.Env();
    this.env.updateInterval = 0;

    this.reporter = new jasmine.TrivialNodeReporter(this.fakeSys);
  });
  
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



  describe('A Test Run', function(){
    
    describe('A spec runs', function(){
      it("prints a green dot if the spec passes", function(){
        this.reporter.reportSpecResults(passingSpec);

        expect(this.fakeSys.getOutput()).toEqual(
          green(".")
        );
      });
    
      it("prints a red dot if the spec fails", function(){
        var failingSpec = {
          results: function(){
            return {passed:function(){return false;}};
          }
        };
        this.reporter.reportSpecResults(failingSpec);

        expect(this.fakeSys.getOutput()).toEqual(
          red("F")
        );
      });
    });
    
    
    describe('many specs run', function(){
      it("starts a new line every 50 specs", function(){
        var self = this;
        repeatedlyInvoke(function(){self.reporter.reportSpecResults(failingSpec);}, 49);

        expect(this.fakeSys.getOutput()).
          toEqual(repeat(red("F"), 49).join(""));
        
        repeatedlyInvoke(function(){self.reporter.reportSpecResults(failingSpec);}, 3);
        
        expect(this.fakeSys.getOutput()).
          toEqual(fiftyRedFs + newline + 
                  red("F") + red("F"));
          
        repeatedlyInvoke(function(){self.reporter.reportSpecResults(failingSpec);}, 48);
        repeatedlyInvoke(function(){self.reporter.reportSpecResults(passingSpec);}, 2);
        expect(this.fakeSys.getOutput()).
          toEqual(fiftyRedFs + newline + 
                  fiftyRedFs + newline + 
                  green(".") + green("."));
      });      
    });

  });
  
});