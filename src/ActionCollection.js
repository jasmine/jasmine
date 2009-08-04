/**
 * base for Runner & Suite: allows for a queue of functions to get executed, allowing for
 *   any one action to complete, including asynchronous calls, before going to the next
 *   action.
 *
 * @constructor
 * @param {jasmine.Env} env
 */
jasmine.ActionCollection = function(env) {
  this.env = env;
  this.actions = [];
  this.index = 0;
  this.finished = false;
};

/**
 * Marks the collection as done & calls the finish callback, if there is one
 */
jasmine.ActionCollection.prototype.finish = function() {
  if (this.finishCallback) {
    this.finishCallback();
  }
  this.finished = true;
};

/**
 * Starts executing the queue of functions/actions.
 */
jasmine.ActionCollection.prototype.execute = function() {
  if (this.actions.length > 0) {
    this.next();
  }
};

/**
 * Gets the current action.
 */
jasmine.ActionCollection.prototype.getCurrentAction = function() {
  return this.actions[this.index];
};

/**
 * Executes the next queued function/action. If there are no more in the queue, calls #finish.
 */
jasmine.ActionCollection.prototype.next = function() {
  if (this.index >= this.actions.length) {
    this.finish();
    return;
  }

  var currentAction = this.getCurrentAction();

  currentAction.execute(this);

  if (currentAction.afterCallbacks) {
    for (var i = 0; i < currentAction.afterCallbacks.length; i++) {
      try {
        currentAction.afterCallbacks[i]();
      } catch (e) {
        alert(e);
      }
    }
  }

  this.waitForDone(currentAction);
};

jasmine.ActionCollection.prototype.waitForDone = function(action) {
  var self = this;
  var afterExecute = function afterExecute() {
    self.index++;
    self.next();
  };

  if (action.finished) {
    var now = new Date().getTime();
    if (this.env.updateInterval && now - this.env.lastUpdate > this.env.updateInterval) {
      this.env.lastUpdate = now;
      this.env.setTimeout(afterExecute, 0);
    } else {
      afterExecute();
    }
    return;
  }

  var id = this.env.setInterval(function() {
    if (action.finished) {
      self.env.clearInterval(id);
      afterExecute();
    }
  }, 150);
};
