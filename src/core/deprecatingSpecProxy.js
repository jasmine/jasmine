/* eslint-disable compat/compat */
// TODO: Remove this in the next major release.
getJasmineRequireObj().deprecatingSpecProxy = function(j$) {
  function isMember(target, prop) {
    return (
      Object.keys(target).indexOf(prop) !== -1 ||
      Object.keys(j$.Spec.prototype).indexOf(prop) !== -1
    );
  }

  function isAllowedMember(prop) {
    return prop === 'id' || prop === 'description' || prop === 'getFullName';
  }

  function msg(member) {
    var memberName = member.toString().replace(/^Symbol\((.+)\)$/, '$1');
    return (
      'Access to private Spec members (in this case `' +
      memberName +
      '`) is not supported and will break in ' +
      'a future release. See <https://jasmine.github.io/api/edge/Spec.html> ' +
      'for correct usage.'
    );
  }

  try {
    new Proxy({}, {});
  } catch (e) {
    // Environment does not support Poxy.
    return function(spec) {
      return spec;
    };
  }

  function DeprecatingSpecProxyHandler(env) {
    this._env = env;
  }

  DeprecatingSpecProxyHandler.prototype.get = function(target, prop, receiver) {
    this._maybeDeprecate(target, prop);

    if (prop === 'getFullName') {
      // getFullName calls a private method. Re-bind 'this' to avoid a bogus
      // deprecation warning.
      return target.getFullName.bind(target);
    } else {
      return target[prop];
    }
  };

  DeprecatingSpecProxyHandler.prototype.set = function(target, prop, value) {
    this._maybeDeprecate(target, prop);
    return (target[prop] = value);
  };

  DeprecatingSpecProxyHandler.prototype._maybeDeprecate = function(
    target,
    prop
  ) {
    if (isMember(target, prop) && !isAllowedMember(prop)) {
      this._env.deprecated(msg(prop));
    }
  };

  function deprecatingSpecProxy(spec, env) {
    return new Proxy(spec, new DeprecatingSpecProxyHandler(env));
  }

  return deprecatingSpecProxy;
};
