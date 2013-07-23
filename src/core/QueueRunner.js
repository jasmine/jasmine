getJasmineRequireObj().QueueRunner = function() {

  function QueueRunner(attrs) {
    this.fns = attrs.fns || [];
    this.onComplete = attrs.onComplete || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
    
    this.timer = attrs.realTimer;
    this.asyncSpecTimeout = attrs.asyncSpecTimeout || 60000;

    this.leaf = attrs.leaf || false;
  }

  QueueRunner.prototype.execute = function() {
    this.run(this.fns, 0);
  };

  QueueRunner.prototype.run = function(fns, recursiveIndex) {
    var length = fns.length,
        self = this,
        iterativeIndex;
    
    var nextIteration = function(currentIteration) {
      return function() {
        self.run(fns, currentIteration + 1);
      };
    };

    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var fn = fns[iterativeIndex];

      if (fn.length > 0) {
        var attemptSuccessful = attempt(fn, nextIteration(iterativeIndex));

        if(attemptSuccessful) {
          return;
        } else {
          // TODO cleanup the timeout ?
        }
      } else {
        attempt(function() { fn.call(self); });
      }
    }

    var runnerDone = iterativeIndex >= length;

    if (runnerDone) {
      this.clearStack(this.onComplete);
    }

    function attempt(fn, done) {
      var timeout;

      try {
        if (self.leaf) {
          timeout = self.timer.setTimeout(function() { 
            self.onException(new Error("timeout"));
            done();
          }, self.asyncSpecTimeout);
        }

        var next = function() {
          if (self.leaf) { self.timer.clearTimeout(timeout); }
          done();
        };
        
        fn.call(self, next);
        
        return true;
      } catch (e) {
        self.onException(e);
        if (!self.catchException(e)) {
          //TODO: set a var when we catch an exception and
          //use a finally block to close the loop in a nice way..
          throw e;
        }
        return false;
      }
    }
  };

  return QueueRunner;
};
