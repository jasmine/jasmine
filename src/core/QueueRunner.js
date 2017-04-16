getJasmineRequireObj().QueueRunner = function(j$) {

  function once(fn) {
    var called = false;
    return function() {
      if (!called) {
        called = true;
        fn();
      }
      return null;
    };
  }

  function QueueRunner(attrs) {
    this.queueableFns = attrs.queueableFns || [];
    this.onComplete = attrs.onComplete || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
    this.userContext = attrs.userContext || {};
    this.timeout = attrs.timeout || {setTimeout: setTimeout, clearTimeout: clearTimeout};
    this.fail = attrs.fail || function() {};
    this.globalErrors = attrs.globalErrors || { pushListener: function() {}, popListener: function() {} };
  }

  QueueRunner.prototype.execute = function() {
    this.run(this.queueableFns, 0);
  };

  QueueRunner.prototype.run = function(queueableFns, recursiveIndex) {
    var length = queueableFns.length,
      self = this,
      iterativeIndex;


    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var queueableFn = queueableFns[iterativeIndex];
      if (queueableFn.fn.length > 0) {
        attemptAsync(queueableFn);
        return;
      } else {
        attemptSync(queueableFn);
      }
    }

    this.clearStack(this.onComplete);

    function attemptSync(queueableFn) {
      try {
        queueableFn.fn.call(self.userContext);
      } catch (e) {
        handleException(e, queueableFn);
      }
    }
    
    function ensureSynchronousCodeCompletes(beforeEachFunction, existingDoneFunction) {
      var endReached = false;
      var triedToCallDoneEarly = false;

      var patchedDone = function () {
          //this tells you if done has been called before the end of the beforeEach has been hit
          triedToCallDoneEarly = true;

          //if we haven't dropped off the end of the before each method then don't call done yet
          //code further down will do that for us instead at the appropriate point
          if(!endReached)
              return;

          //if the end has already been reached then call the done function to move to the next test
          existingDoneFunction();
      };

      //kick off the before each method with our more cautious version of done
      beforeEachFunction(patchedDone);
      //we've definitely called all of the (none async) code in the beforeEach by this point
      endReached = true;

      //if the done function attempted to proceed too early then trigger the actual done function
      //it turns out it didn't need an async wait after all
      if(triedToCallDoneEarly)
          existingDoneFunction();

      //otherwise do nothing - we need to wait for an async call to done
    }

    function attemptAsync(queueableFn) {
      var clearTimeout = function () {
          Function.prototype.apply.apply(self.timeout.clearTimeout, [j$.getGlobal(), [timeoutId]]);
        },
        handleError = function(error) {
          onException(error);
          next();
        },
        next = once(function () {
          clearTimeout(timeoutId);
          self.globalErrors.popListener(handleError);
          self.run(queueableFns, iterativeIndex + 1);
        }),
        timeoutId;

      next.fail = function() {
        self.fail.apply(null, arguments);
        next();
      };

      self.globalErrors.pushListener(handleError);

      if (queueableFn.timeout) {
        timeoutId = Function.prototype.apply.apply(self.timeout.setTimeout, [j$.getGlobal(), [function() {
          var error = new Error('Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.');
          onException(error);
          next();
        }, queueableFn.timeout()]]);
      }

      try {
        ensureSynchronousCodeCompletes(queueableFn.fn.bind(self.userContext), next);
      } catch (e) {
        handleException(e, queueableFn);
        next();
      }
    }

    function onException(e) {
      self.onException(e);
    }

    function handleException(e, queueableFn) {
      onException(e);
      if (!self.catchException(e)) {
        //TODO: set a var when we catch an exception and
        //use a finally block to close the loop in a nice way..
        throw e;
      }
    }
  };

  return QueueRunner;
};
