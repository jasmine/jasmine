/* eslint-disable compat/compat */
// TODO: Remove this in the next major release.
getJasmineRequireObj().deprecatingThisProxy = function(j$) {
  var msg = "Access to 'this' in describe functions is deprecated.";

  try {
    new Proxy({}, {});
  } catch (e) {
    // Environment does not support Poxy.
    return function(suite) {
      return suite;
    };
  }

  function DeprecatingThisProxyHandler(env) {
    this._env = env;
  }

  DeprecatingThisProxyHandler.prototype.get = function(target, prop, receiver) {
    this._env.deprecated(msg);
    return target[prop];
  };

  DeprecatingThisProxyHandler.prototype.set = function(target, prop, value) {
    this._env.deprecated(msg);
    return (target[prop] = value);
  };

  return function(suite, env) {
    return new Proxy(suite, new DeprecatingThisProxyHandler(env));
  };
};
