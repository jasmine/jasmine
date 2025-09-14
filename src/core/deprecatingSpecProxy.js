// TODO: Remove this in the next major release.
getJasmineRequireObj().deprecatingSpecProxy = function(j$) {
  const allowedMembers = ['id', 'description', 'getFullName', 'getPath'];

  function isMember(target, prop) {
    return (
      Object.keys(target).indexOf(prop) !== -1 ||
      Object.keys(j$.Spec.prototype).indexOf(prop) !== -1
    );
  }

  function msg(member) {
    const memberName = member.toString().replace(/^Symbol\((.+)\)$/, '$1');
    return (
      'Access to private Spec members (in this case `' +
      memberName +
      '`) via spec filters is not supported and will break in ' +
      'a future release. See <https://jasmine.github.io/api/edge/Spec.html> ' +
      'for correct usage.'
    );
  }

  function deprecatingSpecProxy(spec, deprecated) {
    return new Proxy(spec, {
      get(target, prop, receiver) {
        if (isMember(target, prop) && !allowedMembers.includes(prop)) {
          deprecated(msg(prop));
        }

        return target[prop];
      }
    });
  }

  return deprecatingSpecProxy;
};
