getJasmineRequireObj().UserContext = function(j$) {
  function UserContext() {}

  UserContext.fromExisting = function(oldContext) {
    var context = new UserContext();

    for (var prop in oldContext) {
      if (oldContext.hasOwnProperty(prop)) {
        context[prop] = oldContext[prop];
      }
    }

    return context;
  };

  return UserContext;
};
