getJasmineRequireObj().ObjectPath = function(j$) {
  class ObjectPath {
    constructor(components) {
      this.components = components || [];
    }

    toString() {
      if (this.components.length) {
        return '$' + this.components.map(formatPropertyAccess).join('');
      } else {
        return '';
      }
    }

    add(component) {
      return new ObjectPath(this.components.concat([component]));
    }

    shift() {
      return new ObjectPath(this.components.slice(1));
    }

    depth() {
      return this.components.length;
    }
  }

  function formatPropertyAccess(prop) {
    if (typeof prop === 'number' || typeof prop === 'symbol') {
      return '[' + prop.toString() + ']';
    }

    if (isValidIdentifier(prop)) {
      return '.' + prop;
    }

    return `['${prop}']`;
  }

  function isValidIdentifier(string) {
    return /^[A-Za-z\$_][A-Za-z0-9\$_]*$/.test(string);
  }

  return ObjectPath;
};
