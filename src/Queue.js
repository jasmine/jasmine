jasmine.Queue = function(env) {
  this.env = env;
  this.blocks = [];
  this.running = false;
  this.index = 0;
  this.offset = 0;
};

jasmine.Queue.prototype.addBefore = function(block) {
  this.blocks.unshift(block);
};

jasmine.Queue.prototype.add = function(block) {
  this.blocks.push(block);
};

jasmine.Queue.prototype.insertNext = function(block) {
  this.blocks.splice((this.index + this.offset + 1), 0, block);
  this.offset++;
};

jasmine.Queue.prototype.start = function(onComplete) {
  this.running = true;
  this.onComplete = onComplete;
  this.next_();
};

jasmine.Queue.prototype.isRunning = function() {
  return this.running;
};

var nestLevel = 0;

jasmine.Queue.prototype.next_ = function() {
  var self = this;
  if (self.index < self.blocks.length) {
    self.blocks[self.index].execute(function () {
      self.offset = 0;
      self.index++;

      var now = new Date().getTime();
      if (self.env.updateInterval && now - self.env.lastUpdate > self.env.updateInterval) {
        self.env.lastUpdate = now;
        self.env.setTimeout(function() {
          self.next_();
        }, 0);
      } else {
        self.next_();
      }
    });
  } else {
    self.running = false;
    if (self.onComplete) {
      self.onComplete();
    }
  }
};

jasmine.Queue.prototype.results = function() {
  var results = new jasmine.NestedResults();
  for (var i = 0; i < this.blocks.length; i++) {
    if (this.blocks[i].results) {
      results.addResult(this.blocks[i].results());
    }
  }
  return results;
};


