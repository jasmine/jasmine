describe("jasmine.Queue", function() {
  it("should not call itself recursively, so we don't get stack overflow errors", function() {
    var queue = new jasmine.Queue(new jasmine.Env());
    queue.add(new jasmine.Block(null, function() {}));
    queue.add(new jasmine.Block(null, function() {}));
    queue.add(new jasmine.Block(null, function() {}));
    queue.add(new jasmine.Block(null, function() {}));

    var nestCount = 0;
    var maxNestCount = 0;
    var nextCallCount = 0;
    queue.next_ = function() {
      nestCount++;
      if (nestCount > maxNestCount) maxNestCount = nestCount;

      jasmine.Queue.prototype.next_.apply(queue, arguments);
      nestCount--;
    };

    queue.start();
    expect(maxNestCount).toEqual(1);
  });
});