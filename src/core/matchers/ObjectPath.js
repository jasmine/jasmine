getJasmineRequireObj().ObjectPath = function(j$) {
  function ObjectPath(components) {
    this.components = components || [];
  }

  ObjectPath.prototype.toString = function() {
    if (this.components.length) {
      return '$' + map(this.components, formatPropertyAccess).join('');
    } else {
      return '';
    }
  };

  ObjectPath.prototype.dereference = function(obj) {
    var i;

    for (i = 0; i < this.components.length; i++) {
      obj = obj[this.components[i]];
    }

    return obj;
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
    if (typeof prop === 'number') {
      return '[' + prop + ']';
    }

    if (isValidIdentifier(prop)) {
      return '.' + prop;
    }

    return '[\'' + prop + '\']';
  }

  function map(array, fn) {
    var results = [];
    for (var i = 0; i < array.length; i++) {
      results.push(fn(array[i]));
    }
    return results;
  }

  function isValidIdentifier(string) {
    return /^[A-Za-z\$_][A-Za-z0-9\$_]*$/.test(string);
  }

  return ObjectPath;
};
