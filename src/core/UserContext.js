getJasmineRequireObj().UserContext = function(j$) {
  'use strict';

  function UserContext() {}

  UserContext.fromExisting = function(oldContext) {
    const context = new UserContext();

    for (const prop in oldContext) {
      if (oldContext.hasOwnProperty(prop)) {
        context[prop] = oldContext[prop];
      }
    }

    return context;
  };

  return UserContext;
};
