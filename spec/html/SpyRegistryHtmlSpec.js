describe('Spy Registry browser-specific behavior', function() {
  function createSpy(name, originalFn) {
    return jasmineUnderTest.Spy(name, originalFn);
  }

  it('can spy on and unspy window.onerror', function() {
    var spies = [],
      spyRegistry = new jasmineUnderTest.SpyRegistry({
        currentSpies: function() {
          return spies;
        },
        createSpy: createSpy,
        global: window
      }),
      originalHandler = window.onerror;

    try {
      spyRegistry.spyOn(window, 'onerror');
      spyRegistry.clearSpies();
      expect(window.onerror).toBe(originalHandler);
    } finally {
      window.onerror = originalHandler;
    }
  });
});
