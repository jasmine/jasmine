jasmine.Queue = function() {
  this.blocks = [];
  this.running = false;
  this.index = 0;
  this.offset = 0;
};

jasmine.Queue.prototype.addBefore = function (block) {
  this.blocks.unshift(block);
};

jasmine.Queue.prototype.add = function(block) {
  this.blocks.push(block);
};

jasmine.Queue.prototype.insertNext = function (block) {
  this.blocks.splice((this.index + this.offset + 1), 0, block);
  this.offset++;
};

jasmine.Queue.prototype.start = function(onComplete) {
  var self = this;
  self.running = true;
  self.onComplete = onComplete;
  if (self.blocks[0]) {
    self.blocks[0].execute(function () {
      self._next();
    });
  } else {
    self.finish();
  }
};

jasmine.Queue.prototype.isRunning = function () {
  return this.running;
};

jasmine.Queue.prototype._next = function () {
  var self = this;
  self.offset = 0;
  self.index++;
  if (self.index < self.blocks.length) {
    self.blocks[self.index].execute(function () {self._next();});
  } else {
    self.finish();
  }
};

jasmine.Queue.prototype.finish = function () {
  this.running = false;
  if (this.onComplete) {
    this.onComplete();
  }
};

jasmine.Queue.prototype.getResults = function () {
  var results = [];
  for (var i = 0; i < this.blocks.length; i++) {
    results.push(this.blocks[i].getResults());
  }
  return results;
};


