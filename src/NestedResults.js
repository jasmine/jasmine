/**
 * Holds results; allows for the results array to hold another jasmine.NestedResults
 *
 * @constructor
 */
jasmine.NestedResults = function() {
  this.totalCount = 0;
  this.passedCount = 0;
  this.failedCount = 0;
  this.skipped = false;
  this.items_ = [];
};

jasmine.NestedResults.prototype.rollupCounts = function(result) {
  this.totalCount += result.totalCount;
  this.passedCount += result.passedCount;
  this.failedCount += result.failedCount;
};

jasmine.NestedResults.prototype.log = function(message) {
  this.items_.push(new jasmine.MessageResult(message));
};

jasmine.NestedResults.prototype.getItems = function() {
  return this.items_;
};

/**
 * @param {jasmine.ExpectationResult|jasmine.NestedResults} result
 */
jasmine.NestedResults.prototype.addResult = function(result) {
  if (result.type != 'MessageResult') {
    if (result.items_) {
      this.rollupCounts(result);
    } else {
      this.totalCount++;
      if (result.passed) {
        this.passedCount++;
      } else {
        this.failedCount++;
      }
    }
  }
  this.items_.push(result);
};

jasmine.NestedResults.prototype.passed = function() {
  return this.passedCount === this.totalCount;
};
