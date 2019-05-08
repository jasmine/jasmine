describe('base helpers', function() {
  describe('isError_', function() {
    it("correctly handles WebSocket events", function(done) {
      if (typeof jasmine.getGlobal().WebSocket === 'undefined') {
        done();
        return;
      }

      var obj = (function() {
        var sock = new WebSocket('ws://localhost');
        var event;
        sock.onerror = function(e) {
          event = e
        };
        return function() { return event };
      })();
      var left = 20;

      var int = setInterval(function() {
        if (obj() || left === 0) {
          var result = jasmineUnderTest.isError_(obj());
          expect(result).toBe(false);
          done();
        } else {
          left--;
        }
      }, 100);
    });
  });
});
