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

    it('returns true for an Error subclass', function() {
      function MyError() {}
      MyError.prototype = new Error();
      expect(jasmineUnderTest.isError_(new MyError())).toBe(true);
    });

    it('returns true for an un-thrown Error with no message in this environment', function() {
      expect(jasmineUnderTest.isError_(new Error())).toBe(true);
    });

    it('returns true for an Error that originated from another frame', function() {
      var iframe, error;

      if (typeof window === 'undefined') {
        pending('This test only runs in browsers.');
      }

      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      try {
        error = iframe.contentWindow.eval('new Error()');
        expect(jasmineUnderTest.isError_(error)).toBe(true);
      } finally {
        document.body.removeChild(iframe);
      }
    });

    it('returns false for a falsy value', function() {
      expect(jasmineUnderTest.isError_(undefined)).toBe(false);
    });

    it('returns false for a non-Error object', function() {
      expect(jasmineUnderTest.isError_({})).toBe(false);
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
      expect(jasmineUnderTest.isSet(new Set())).toBe(true); // eslint-disable-line compat/compat
    });

    it('returns false when the object is not a Set', function() {
      expect(jasmineUnderTest.isSet({})).toBe(false);
    });
  });

  describe('isURL', function() {
    it('returns true when the object is a URL', function() {
      jasmine.getEnv().requireUrls();
      // eslint-disable-next-line compat/compat
      expect(jasmineUnderTest.isURL(new URL('http://localhost/'))).toBe(true);
    });

    it('returns false when the object is not a URL', function() {
      jasmine.getEnv().requireUrls();
      expect(jasmineUnderTest.isURL({})).toBe(false);
    });
  });

  describe('isPending_', function() {
    it('returns a promise that resolves to true when the promise is pending', function() {
      jasmine.getEnv().requirePromises();
      // eslint-disable-next-line compat/compat
      var promise = new Promise(function() {});
      return expectAsync(jasmineUnderTest.isPending_(promise)).toBeResolvedTo(
        true
      );
    });

    it('returns a promise that resolves to false when the promise is resolved', function() {
      jasmine.getEnv().requirePromises();
      // eslint-disable-next-line compat/compat
      var promise = Promise.resolve();
      return expectAsync(jasmineUnderTest.isPending_(promise)).toBeResolvedTo(
        false
      );
    });

    it('returns a promise that resolves to false when the promise is rejected', function() {
      jasmine.getEnv().requirePromises();
      // eslint-disable-next-line compat/compat
      var promise = Promise.reject();
      return expectAsync(jasmineUnderTest.isPending_(promise)).toBeResolvedTo(
        false
      );
    });
  });
});
