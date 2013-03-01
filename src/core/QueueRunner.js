jasmine.QueueRunner = function(attrs) {
  this.fns = attrs.fns || [];
  this.onComplete = attrs.onComplete || function() {};
  this.encourageGC = attrs.encourageGC || function(fn) {fn();};
  this.onException = attrs.onException || function() {};
  this.catchException = attrs.catchException || function() { return true; };
};

jasmine.QueueRunner.prototype.execute = function() {
  this.run(this.fns, 0);
};

jasmine.QueueRunner.prototype.run = function(fns, index) {
  if (index >= fns.length) {
    this.encourageGC(this.onComplete);
    return;
  }

  var fn = fns[index];
  var self = this;
  if (fn.length > 0) {
    attempt(function() { fn.call(self, function() {  self.run(fns, index + 1); }); });
  } else {
    attempt(function() { fn.call(self); });
    self.run(fns, index + 1);
  }

  function attempt(fn) {
    try {
      fn();
    } catch (e) {
      self.onException(e);
      if (!self.catchException(e)) {
        //TODO: set a var when we catch an exception and
        //use a finally block to close the loop in a nice way..
        throw e;
      }
    }
  }
};
