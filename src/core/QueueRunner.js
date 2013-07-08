getJasmineRequireObj().QueueRunner = function() {

  function QueueRunner(attrs) {
    this.fns = attrs.fns || [];
    this.onComplete = attrs.onComplete || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
  }

  QueueRunner.prototype.execute = function() {
    this.run(this.fns, 0);
  };

  QueueRunner.prototype.run = function(fns, recursiveIndex) {
    var length = fns.length,
        self = this,
        iterativeIndex;

    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var fn = fns[iterativeIndex];
      if (fn.length > 0) {
        var attemptSuccessful = attempt(function() {
          fn.call(self, function() { self.run(fns, iterativeIndex + 1); });
        });

        if(attemptSuccessful) {
          return;
        }
      } else {
        attempt(function() { fn.call(self); });
      }
    }

    var runnerDone = iterativeIndex >= length,
        hasBeenAsyncSpec = recursiveIndex > 0;

    if (runnerDone && hasBeenAsyncSpec) {
      this.clearStack(this.onComplete);
    } else if(runnerDone) {
      this.onComplete();
    }

    function attempt(fn) {
      try {
        fn();
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
