getJasmineRequireObj().ObjectPath = function(j$) {
  function ObjectPath(components) {
    this.components = components || [];
  }

  ObjectPath.prototype.toString = function() {
    if (this.components.length) {
      return '$' + this.components.map(formatPropertyAccess).join('');
    } else {
      return '';
    }
  };

  ObjectPath.prototype.add = function(component) {
    return new ObjectPath(this.components.concat([component]));
  };

  ObjectPath.prototype.shift = function() {
    return new ObjectPath(this.components.slice(1));
  };

  ObjectPath.prototype.depth = function() {
    return this.components.length;
  };

  function formatPropertyAccess(prop) {
    if (typeof prop === 'number' || typeof prop === 'symbol') {
      return '[' + prop.toString() + ']';
    }

    if (isValidIdentifier(prop)) {
      return '.' + prop;
    }

    return "['" + prop + "']";
  }

  function isValidIdentifier(string) {
    return /^[A-Za-z\$_][A-Za-z0-9\$_]*$/.test(string);
  }

  return ObjectPath;
};
