describe('util', function() {
  describe('isObject', function() {
    it('should return true if the argument is an object', function() {
      expect(privateUnderTest.isObject({})).toBe(true);
      expect(privateUnderTest.isObject({ an: 'object' })).toBe(true);
    });

    it('should return false if the argument is not an object', function() {
      expect(privateUnderTest.isObject(undefined)).toBe(false);
      expect(privateUnderTest.isObject([])).toBe(false);
      expect(privateUnderTest.isObject(function() {})).toBe(false);
      expect(privateUnderTest.isObject('foo')).toBe(false);
      expect(privateUnderTest.isObject(5)).toBe(false);
      expect(privateUnderTest.isObject(null)).toBe(false);
    });
  });

  describe('promise utils', function() {
    let mockNativePromise, mockPromiseLikeObject;

    const mockPromiseLike = function() {
      this.then = function() {};
    };

    beforeEach(function() {
      mockNativePromise = new Promise(function() {});
      mockPromiseLikeObject = new mockPromiseLike();
    });

    describe('isPromise', function() {
      it('should return true when passed a native promise', function() {
        expect(privateUnderTest.isPromise(mockNativePromise)).toBe(true);
      });

      it('should return false for promise like objects', function() {
        expect(privateUnderTest.isPromise(mockPromiseLikeObject)).toBe(false);
      });

      it('should return false for strings', function() {
        expect(privateUnderTest.isPromise('hello')).toBe(false);
      });

      it('should return false for numbers', function() {
        expect(privateUnderTest.isPromise(3)).toBe(false);
      });

      it('should return false for null', function() {
        expect(privateUnderTest.isPromise(null)).toBe(false);
      });

      it('should return false for undefined', function() {
        expect(privateUnderTest.isPromise(undefined)).toBe(false);
      });

      it('should return false for arrays', function() {
        expect(privateUnderTest.isPromise([])).toBe(false);
      });

      it('should return false for objects', function() {
        expect(privateUnderTest.isPromise({})).toBe(false);
      });

      it('should return false for boolean values', function() {
        expect(privateUnderTest.isPromise(true)).toBe(false);
      });
    });

    describe('isPromiseLike', function() {
      it('should return true when passed a native promise', function() {
        expect(privateUnderTest.isPromiseLike(mockNativePromise)).toBe(true);
      });

      it('should return  true for promise like objects', function() {
        expect(privateUnderTest.isPromiseLike(mockPromiseLikeObject)).toBe(
          true
        );
      });

      it('should return false if then is not a function', function() {
        expect(
          privateUnderTest.isPromiseLike({
            then: { its: 'Not a function :O' }
          })
        ).toBe(false);
      });

      it('should return false for strings', function() {
        expect(privateUnderTest.isPromiseLike('hello')).toBe(false);
      });

      it('should return false for numbers', function() {
        expect(privateUnderTest.isPromiseLike(3)).toBe(false);
      });

      it('should return false for null', function() {
        expect(privateUnderTest.isPromiseLike(null)).toBe(false);
      });

      it('should return false for undefined', function() {
        expect(privateUnderTest.isPromiseLike(undefined)).toBe(false);
      });

      it('should return false for arrays', function() {
        expect(privateUnderTest.isPromiseLike([])).toBe(false);
      });

      it('should return false for objects', function() {
        expect(privateUnderTest.isPromiseLike({})).toBe(false);
      });

      it('should return false for boolean values', function() {
        expect(privateUnderTest.isPromiseLike(true)).toBe(false);
      });
    });
  });

  describe('cloneArgs', function() {
    it('clones primitives as-is', function() {
      expect(privateUnderTest.util.cloneArgs([true, false])).toEqual([
        true,
        false
      ]);
      expect(privateUnderTest.util.cloneArgs([0, 1])).toEqual([0, 1]);
      expect(privateUnderTest.util.cloneArgs(['str'])).toEqual(['str']);
    });

    it('clones Regexp objects as-is', function() {
      const regex = /match/;
      expect(privateUnderTest.util.cloneArgs([regex])).toEqual([regex]);
    });

    it('clones Date objects as-is', function() {
      const date = new Date(2022, 1, 1);
      expect(privateUnderTest.util.cloneArgs([date])).toEqual([date]);
    });

    it('clones null and undefined', function() {
      expect(privateUnderTest.util.cloneArgs([null])).toEqual([null]);
      expect(privateUnderTest.util.cloneArgs([undefined])).toEqual([undefined]);
    });
  });

  describe('getPropertyDescriptor', function() {
    it('get property descriptor from object', function() {
      const obj = { prop: 1 },
        actual = privateUnderTest.util.getPropertyDescriptor(obj, 'prop'),
        expected = Object.getOwnPropertyDescriptor(obj, 'prop');

      expect(actual).toEqual(expected);
    });

    it('get property descriptor from object property', function() {
      const proto = { prop: 1 },
        actual = privateUnderTest.util.getPropertyDescriptor(proto, 'prop'),
        expected = Object.getOwnPropertyDescriptor(proto, 'prop');

      expect(actual).toEqual(expected);
    });
  });

  describe('jasmineFile', function() {
    it('returns the file containing jasmine.util', function() {
      // Chrome sometimes reports foo.js as foo.js/, so tolerate
      // a trailing slash if present.
      expect(privateUnderTest.util.jasmineFile()).toMatch(/util.js\/?$/);
      expect(jasmine.private.util.jasmineFile()).toMatch(/jasmine.js\/?$/);
    });
  });
});
