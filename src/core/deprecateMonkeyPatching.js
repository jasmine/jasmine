getJasmineRequireObj().deprecateMonkeyPatching = function(j$) {
  return function deprecateMonkeyPatching(obj, keysToSkip) {
    for (const key of Object.keys(obj)) {
      if (!keysToSkip?.includes(key)) {
        let value = obj[key];

        Object.defineProperty(obj, key, {
          enumerable: key in obj,
          get() {
            return value;
          },
          set(newValue) {
            j$.getEnv().deprecated(
              'Monkey patching detected. This is not supported and will break in a future jasmine-core release.'
            );
            value = newValue;
          }
        });
      }
    }
  };
};
