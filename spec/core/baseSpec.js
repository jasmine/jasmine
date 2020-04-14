describe('base helpers', function() {
  describe('isError_', function() {
    it('correctly handles WebSocket events', function(done) {
      if (typeof jasmine.getGlobal().WebSocket === 'undefined') {
        done();
        return;
      }

      var obj = (function() {
        var sock = new WebSocket('ws://localhost');
        var event;
        sock.onerror = function(e) {
          event = e;
        };
        return function() {
          return event;
        };
      })();
      var left = 20;

      var int = setInterval(function() {
        if (obj() || left === 0) {
          var result = jasmineUnderTest.isError_(obj());
          expect(result).toBe(false);
          clearInterval(int);
          done();
        } else {
          left--;
        }
      }, 100);
    });
  });

  describe('isAsymmetricEqualityTester_', function() {
    it('returns false when the argument is falsy', function() {
      expect(jasmineUnderTest.isAsymmetricEqualityTester_(null)).toBe(false);
    });

    it('returns false when the argument does not have a asymmetricMatch property', function() {
      var obj = {};
      expect(jasmineUnderTest.isAsymmetricEqualityTester_(obj)).toBe(false);
    });

    it("returns false when the argument's asymmetricMatch is not a function", function() {
      var obj = { asymmetricMatch: 'yes' };
      expect(jasmineUnderTest.isAsymmetricEqualityTester_(obj)).toBe(false);
    });

    it("returns true when the argument's asymmetricMatch is a function", function() {
      var obj = { asymmetricMatch: function() {} };
      expect(jasmineUnderTest.isAsymmetricEqualityTester_(obj)).toBe(true);
    });
  });

  describe('isSet', function() {
    it('returns true when the object is a Set', function() {
      jasmine.getEnv().requireFunctioningSets();
      expect(jasmineUnderTest.isSet(new Set())).toBe(true);
    });

    it('returns false when the object is not a Set', function() {
      expect(jasmineUnderTest.isSet({})).toBe(false);
    });
  });
});
