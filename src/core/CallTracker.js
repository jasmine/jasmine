getJasmineRequireObj().CallTracker = function(j$) {

  function CallTracker() {
    var calls = [];
    var opts = {};

    function argCloner(context) {
      var clonedArgs = [];
      var argsAsArray = j$.util.argsToArray(context.args);
      for(var i = 0; i < argsAsArray.length; i++) {
        if(Object.prototype.toString.apply(argsAsArray[i]) === '[object Object]') {
          clonedArgs.push(j$.util.clone(argsAsArray[i]));
        } else {
          clonedArgs.push(argsAsArray[i]);
        }
      }
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
