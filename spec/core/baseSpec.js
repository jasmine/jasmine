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

  describe('getPromise', function() {
    it('returns a custom library if configured', function() {
      var myLibrary = { resolve: jasmine.createSpy(), reject: jasmine.createSpy() };
      jasmineUnderTest.getEnv().configure({ promiseLibrary: myLibrary });
      expect(jasmineUnderTest.getPromise()).toBe(myLibrary);
    });

    it('returns global library if not configured', function() {
      var globalLibrary = {};
      var global = { Promise: globalLibrary };
      spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);
      expect(jasmineUnderTest.getPromise()).toBe(globalLibrary);
    });
  });
});
