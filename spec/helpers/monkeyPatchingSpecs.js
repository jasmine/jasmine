globalThis.isNonMonkeyPatchableClass = function(ctor, makeInstance) {
  describe('Monkey patching prevention', function() {
    it(`prevents overwriting ${ctor.name}.prototype`, function() {
      const existing = ctor.prototype;

      try {
        ctor.prototype = {};
        expect(ctor.prototype).toBe(existing);
      } finally {
        // This will be a no-op if the test passed, but will prevent state
        // leakage if it failed.
        ctor.prototype = existing;
      }
    });

    it("prevents overwriting an instance's prototype", function() {
      const instance = makeInstance();
      let thrown;

      // The message varies from browser to browser, so we can't rely on it
      try {
        instance.__proto__ = {};
      } catch (e) {
        thrown = e;
      }

      expect(thrown).toBeInstanceOf(TypeError);
    });

    it('prevents overwriting prototype properties', function() {
      let any = false;

      for (const k of Object.getOwnPropertyNames(ctor.prototype)) {
        any = true;
        const existingValue = ctor.prototype[k];

        try {
          ctor.prototype[k] = {};
          expect(ctor.prototype[k])
            .withContext(k)
            .toBe(existingValue);
        } finally {
          // This will be a no-op if the test passed, but will prevent state
          // leakage if it failed.
          ctor.prototype[k] = existingValue;
        }
      }

      expect(any).toBe(true);
    });

    it('prevents overriding prototype properties', function() {
      const instance = makeInstance();
      let any = false;

      for (const k of Object.getOwnPropertyNames(ctor.prototype)) {
        any = true;
        instance[k] = {};
        expect(instance[k])
          .withContext(k)
          .toBe(ctor.prototype[k]);
      }

      expect(any).toBe(true);
    });
  });
};
