describe('base helpers', function() {
  describe('isError', function() {
    it('returns true for an Error subclass', function() {
      function MyError() {}
      MyError.prototype = new Error();
      expect(privateUnderTest.isError(new MyError())).toBe(true);
    });

    it('returns true for an un-thrown Error with no message in this environment', function() {
      expect(privateUnderTest.isError(new Error())).toBe(true);
    });

    it('returns true for an Error that originated from another frame', function() {
      if (typeof window === 'undefined') {
        pending('This test only runs in browsers.');
      }

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      try {
        const error = iframe.contentWindow.eval('new Error()');
        expect(privateUnderTest.isError(error)).toBe(true);
      } finally {
        document.body.removeChild(iframe);
      }
    });

    it('returns false for a falsy value', function() {
      expect(privateUnderTest.isError(undefined)).toBe(false);
    });

    it('returns false for a non-Error object', function() {
      expect(privateUnderTest.isError({})).toBe(false);
    });
  });

  describe('isAsymmetricEqualityTester_', function() {
    it('returns false when the argument is falsy', function() {
      expect(privateUnderTest.isAsymmetricEqualityTester(null)).toBe(false);
    });

    it('returns false when the argument does not have a asymmetricMatch property', function() {
      const obj = {};
      expect(privateUnderTest.isAsymmetricEqualityTester(obj)).toBe(false);
    });

    it("returns false when the argument's asymmetricMatch is not a function", function() {
      const obj = { asymmetricMatch: 'yes' };
      expect(privateUnderTest.isAsymmetricEqualityTester(obj)).toBe(false);
    });

    it("returns true when the argument's asymmetricMatch is a function", function() {
      const obj = { asymmetricMatch: function() {} };
      expect(privateUnderTest.isAsymmetricEqualityTester(obj)).toBe(true);
    });
  });

  describe('isSet', function() {
    it('returns true when the object is a Set', function() {
      expect(privateUnderTest.isSet(new Set())).toBe(true);
    });

    it('returns false when the object is not a Set', function() {
      expect(privateUnderTest.isSet({})).toBe(false);
    });
  });

  describe('isURL', function() {
    it('returns true when the object is a URL', function() {
      expect(privateUnderTest.isURL(new URL('http://localhost/'))).toBe(true);
    });

    it('returns false when the object is not a URL', function() {
      expect(privateUnderTest.isURL({})).toBe(false);
    });
  });

  describe('isIterable', function() {
    it('returns true when the object is an Array', function() {
      expect(privateUnderTest.isIterable([])).toBe(true);
    });

    it('returns true when the object is a Set', function() {
      expect(privateUnderTest.isIterable(new Set())).toBe(true);
    });
    it('returns true when the object is a Map', function() {
      expect(privateUnderTest.isIterable(new Map())).toBe(true);
    });

    it('returns true when the object implements @@iterator', function() {
      const myIterable = { [Symbol.iterator]: function() {} };
      expect(privateUnderTest.isIterable(myIterable)).toBe(true);
    });

    it('returns false when the object does not implement @@iterator', function() {
      expect(privateUnderTest.isIterable({})).toBe(false);
    });
  });

  describe('isPending', function() {
    it('returns a promise that resolves to true when the promise is pending', function() {
      const promise = new Promise(function() {});
      return expectAsync(privateUnderTest.isPending(promise)).toBeResolvedTo(
        true
      );
    });

    it('returns a promise that resolves to false when the promise is resolved', function() {
      const promise = Promise.resolve();
      return expectAsync(privateUnderTest.isPending(promise)).toBeResolvedTo(
        false
      );
    });

    it('returns a promise that resolves to false when the promise is rejected', function() {
      const promise = Promise.reject(new Error('nope'));
      return expectAsync(privateUnderTest.isPending(promise)).toBeResolvedTo(
        false
      );
    });
  });

  describe('DEFAULT_TIMEOUT_INTERVAL setter', function() {
    const max = 2147483647;

    beforeEach(function() {
      this.initialValue = jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL;
    });

    afterEach(function() {
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = this.initialValue;
    });

    it('accepts only values <= ' + max, function() {
      expect(function() {
        jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = max + 1;
      }).toThrowError(
        'jasmine.DEFAULT_TIMEOUT_INTERVAL cannot be greater than ' + max
      );

      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = max;
      expect(jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL).toEqual(max);
    });

    it('is consistent with setTimeout in this environment', function(done) {
      const f1 = jasmine.createSpy('setTimeout callback for ' + max),
        f2 = jasmine.createSpy('setTimeout callback for ' + (max + 1));

      // Suppress printing of TimeoutOverflowWarning in node
      if (typeof process !== 'undefined' && process.emitWarning) {
        spyOn(process, 'emitWarning'); // Node 22
      }
      spyOn(console, 'error'); // Node <22

      let id = setTimeout(f1, max);
      setTimeout(function() {
        clearTimeout(id);
        expect(f1).not.toHaveBeenCalled();

        id = setTimeout(f2, max + 1);
        setTimeout(function() {
          clearTimeout(id);
          expect(f2).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('debugLog', function() {
    it("forwards to the current env's debugLog function", function() {
      spyOn(jasmineUnderTest.getEnv(), 'debugLog');
      jasmineUnderTest.debugLog('a message');
      expect(jasmineUnderTest.getEnv().debugLog).toHaveBeenCalledWith(
        'a message'
      );
    });
  });
});
