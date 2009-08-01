jasmine.Queue = function(onComplete) {
  this.blocks = [];
  this.onComplete = function () {
    onComplete();
  };
  this.index = 0;
};

jasmine.Queue.prototype.add = function(block) {
  this.setNextOnLastInQueue(block);
  this.blocks.push(block);
};

jasmine.Queue.prototype.start = function() {
  if (this.blocks[0]) {
    this.blocks[0].execute();
  } else {
    this.onComplete();
  }
};

jasmine.Queue.prototype._next = function () {
  this.index++;
  if (this.index < this.blocks.length) {
    this.blocks[this.index].execute();
  }
};

/**
 * @private
 */
jasmine.Queue.prototype.setNextOnLastInQueue = function (block) {
  var self = this;
  block._next = function () {
    self.onComplete();
  };
  if (self.blocks.length > 0) {
    var previousBlock = self.blocks[self.blocks.length - 1];
    previousBlock._next = function() {
      block.execute();
    };
  }
};

jasmine.Queue.prototype.isComplete = function () {
  return this.index >= (this.blocks.length - 1);
};

jasmine.Queue.prototype.getResults = function () {
  var results = [];
  for (var i = 0; i < this.blocks.length; i++) {
    results.push(this.blocks[i].getResults());
  }
  return results;
};


