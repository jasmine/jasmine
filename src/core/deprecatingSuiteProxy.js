/* eslint-disable compat/compat */
// TODO: Remove this in the next major release.
getJasmineRequireObj().deprecatingSuiteProxy = function(j$) {
  var allowedMembers = [
    'children',
    'description',
    'parentSuite',
    'getFullName'
  ];

  function isMember(target, prop) {
    return (
      Object.keys(target).indexOf(prop) !== -1 ||
      Object.keys(j$.Suite.prototype).indexOf(prop) !== -1
    );
  }

  function isAllowedMember(prop) {
    return allowedMembers.indexOf(prop) !== -1;
  }

  function msg(member) {
    var memberName = member.toString().replace(/^Symbol\((.+)\)$/, '$1');
    return (
      'Access to private Suite members (in this case `' +
      memberName +
      '`) via Env#topSuite is not supported and will break in ' +
      'a future release. See <https://jasmine.github.io/api/edge/Suite.html> ' +
      'for correct usage.'
    );
  }
  try {
    new Proxy({}, {});
  } catch (e) {
    // Environment does not support Poxy.
    return function(suite) {
      return suite;
    };
  }

  function DeprecatingSuiteProxyHandler(parentSuite, env) {
    this._parentSuite = parentSuite;
    this._env = env;
  }

  DeprecatingSuiteProxyHandler.prototype.get = function(
    target,
    prop,
    receiver
  ) {
    if (prop === 'children') {
      if (!this._children) {
        this._children = target.children.map(
          this._proxyForChild.bind(this, receiver)
        );
      }

      return this._children;
    } else if (prop === 'parentSuite') {
      return this._parentSuite;
    } else {
      this._maybeDeprecate(target, prop);
      return target[prop];
    }
  };

  DeprecatingSuiteProxyHandler.prototype.set = function(target, prop, value) {
    this._maybeDeprecate(target, prop);
    return (target[prop] = value);
  };

  DeprecatingSuiteProxyHandler.prototype._maybeDeprecate = function(
    target,
    prop
  ) {
    if (isMember(target, prop) && !isAllowedMember(prop)) {
      this._env.deprecated(msg(prop));
    }
  };

  DeprecatingSuiteProxyHandler.prototype._proxyForChild = function(
    ownProxy,
    child
  ) {
    if (child.children) {
      return deprecatingSuiteProxy(child, ownProxy, this._env);
    } else {
      return j$.deprecatingSpecProxy(child, this._env);
    }
  };

  function deprecatingSuiteProxy(suite, parentSuite, env) {
    return new Proxy(suite, new DeprecatingSuiteProxyHandler(parentSuite, env));
  }

  return deprecatingSuiteProxy;
};
