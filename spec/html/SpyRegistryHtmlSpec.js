describe('Spy Registry browser-specific behavior', function() {
  function createSpy(name, originalFn) {
    return jasmineUnderTest.Spy(name, originalFn);
  }

  it('can spy on and unspy window.onerror', function() {
    requireWriteableOnerror();

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

  function requireWriteableOnerror() {
    var descriptor;

    try {
      descriptor = Object.getOwnPropertyDescriptor(window, 'onerror');
    } catch (e) {
      // IE 8 doesn't support `definePropery` on non-DOM nodes
    }

    if (descriptor && !(descriptor.writable || descriptor.set)) {
      pending('Browser declares window.onerror to be readonly');
    }
  }
});
