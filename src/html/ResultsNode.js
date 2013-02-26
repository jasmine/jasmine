jasmine.ResultsNode = function(result, type, parent) {
  this.result = result;
  this.type = type;
  this.parent = parent;

  this.children = [];

  this.addChild = function(result, type) {
    this.children.push(new jasmine.ResultsNode(result, type, this));
  };

  this.last = function() {
    return this.children[this.children.length-1];
  };
};