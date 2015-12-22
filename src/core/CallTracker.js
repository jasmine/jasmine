getJasmineRequireObj().CallTracker = function(j$) {

  function CallTracker() {
    var calls = [];
    var opts = {};

    function argCloner(context) {
      debugger;
      var clonedArgs = [];
      j$.util.argsToArray(context.args).forEach(function(arg) {
        if(Object.prototype.toString.apply(arg) === '[object Object]') {
          clonedArgs.push(j$.util.clone(arg));
        } else {
          clonedArgs.push(arg);
        }
      });
      context.args = clonedArgs;
    }

    this.track = function(context) {
      if(opts.cloneArgs) {
        argCloner(context);
      }
      calls.push(context);
    };

    this.any = function() {
      return !!calls.length;
    };

    this.count = function() {
      return calls.length;
    };

    this.argsFor = function(index) {
      var call = calls[index];
      return call ? call.args : [];
    };

    this.all = function() {
      return calls;
    };

    this.allArgs = function() {
      var callArgs = [];
      for(var i = 0; i < calls.length; i++){
        callArgs.push(calls[i].args);
      }

      return callArgs;
    };

    this.first = function() {
      return calls[0];
    };

    this.mostRecent = function() {
      return calls[calls.length - 1];
    };

    this.reset = function() {
      calls = [];
    };

    this.saveArgumentsByValue = function() {
      opts.cloneArgs = true;
    };

  }

  return CallTracker;
};
