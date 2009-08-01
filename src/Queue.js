jasmine.Queue = function() {
  this.blocks = [];
};

jasmine.Queue.prototype.add = function(block) {
  this.setNextOnLastInQueue(block);
  this.blocks.push(block);
};

jasmine.Queue.prototype.start = function(onComplete) {
  if (this.blocks[0]) {
    this.blocks[0].execute();
  } else {
    onComplete();
  }
};

/**
 * @private
 */
jasmine.Queue.prototype.setNextOnLastInQueue = function (block) {
  if (this.blocks.length > 0) {
    var previousBlock = this.blocks[this.blocks.length - 1];
    previousBlock.next = function() {
      block.execute();
    };
  }
};

