getJasmineRequireObj().pp = function(j$) {

  function PrettyPrinter() {
    this.ppNestLevel_ = 0;
    this.seen = [];
    this.length = 0;
    this.stringParts = [];
  }

  function hasCustomToString(value) {
    // value.toString !== Object.prototype.toString if value has no custom toString but is from another context (e.g.
    // iframe, web worker)
    return j$.isFunction_(value.toString) && value.toString !== Object.prototype.toString && (value.toString() !== Object.prototype.toString.call(value));
  }

  PrettyPrinter.prototype.format = function(value) {
    this.ppNestLevel_++;
    try {
      if (j$.util.isUndefined(value)) {
        this.emitScalar('undefined');
      } else if (value === null) {
        this.emitScalar('null');
      } else if (value === 0 && 1/value === -Infinity) {
        this.emitScalar('-0');
      } else if (value === j$.getGlobal()) {
        this.emitScalar('<global>');
      } else if (value.jasmineToString) {
        this.emitScalar(value.jasmineToString());
      } else if (typeof value === 'string') {
        this.emitString(value);
      } else if (j$.isSpy(value)) {
        this.emitScalar('spy on ' + value.and.identity);
      } else if (j$.isSpy(value.toString)) {
        this.emitScalar('spy on ' + value.toString.and.identity);
      } else if (value instanceof RegExp) {
        this.emitScalar(value.toString());
      } else if (typeof value === 'function') {
        this.emitScalar('Function');
      } else if (j$.isDomNode(value)) {
        if (value.tagName) {
          this.emitDomElement(value);
        } else {
          this.emitScalar('HTMLNode');
        }
      } else if (value instanceof Date) {
        this.emitScalar('Date(' + value + ')');
      } else if (j$.isSet(value)) {
        this.emitSet(value);
      } else if (j$.isMap(value)) {
        this.emitMap(value);
      } else if (j$.isTypedArray_(value)) {
        this.emitTypedArray(value);
      } else if (value.toString && typeof value === 'object' && !j$.isArray_(value) && hasCustomToString(value)) {
        this.emitScalar(value.toString());
      } else if (j$.util.arrayContains(this.seen, value)) {
        this.emitScalar('<circular reference: ' + (j$.isArray_(value) ? 'Array' : 'Object') + '>');
      } else if (j$.isArray_(value) || j$.isA_('Object', value)) {
        this.seen.push(value);
        if (j$.isArray_(value)) {
          this.emitArray(value);
        } else {
          this.emitObject(value);
        }
        this.seen.pop();
      } else {
        this.emitScalar(value.toString());
      }
    } catch (e) {
      if (this.ppNestLevel_ > 1 || !(e instanceof MaxCharsReachedError)) {
        throw e;
      }
    } finally {
      this.ppNestLevel_--;
    }
  };

  PrettyPrinter.prototype.iterateObject = function(obj, fn) {
    var objKeys = keys(obj, j$.isArray_(obj));
    var isGetter = function isGetter(prop) {};

    if (obj.__lookupGetter__) {
      isGetter = function isGetter(prop) {
        var getter = obj.__lookupGetter__(prop);
        return !j$.util.isUndefined(getter) && getter !== null;
      };

    }
    var length = Math.min(objKeys.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    for (var i = 0; i < length; i++) {
      var property = objKeys[i];
      fn(property, isGetter(property));
    }

    return objKeys.length > length;
  };

  PrettyPrinter.prototype.emitScalar = function(value) {
    this.append(value);
  };

  PrettyPrinter.prototype.emitString = function(value) {
    this.append('\'' + value + '\'');
  };

  PrettyPrinter.prototype.emitArray = function(array) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Array');
      return;
    }
    var length = Math.min(array.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    this.append('[ ');
    for (var i = 0; i < length; i++) {
      if (i > 0) {
        this.append(', ');
      }
      this.format(array[i]);
    }
    if(array.length > length){
      this.append(', ...');
    }

    var self = this;
    var first = array.length === 0;
    var truncated = this.iterateObject(array, function(property, isGetter) {
      if (first) {
        first = false;
      } else {
        self.append(', ');
      }

      self.formatProperty(array, property, isGetter);
    });

    if (truncated) { this.append(', ...'); }

    this.append(' ]');
  };

  PrettyPrinter.prototype.emitSet = function(set) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Set');
      return;
    }
    this.append('Set( ');
    var size = Math.min(set.size, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    var i = 0;
    set.forEach( function( value, key ) {
      if (i >= size) {
        return;
      }
      if (i > 0) {
        this.append(', ');
      }
      this.format(value);

      i++;
    }, this );
    if (set.size > size){
      this.append(', ...');
    }
    this.append(' )');
  };

  PrettyPrinter.prototype.emitMap = function(map) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Map');
      return;
    }
    this.append('Map( ');
    var size = Math.min(map.size, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    var i = 0;
    map.forEach( function( value, key ) {
      if (i >= size) {
        return;
      }
      if (i > 0) {
        this.append(', ');
      }
      this.format([key,value]);

      i++;
    }, this );
    if (map.size > size){
      this.append(', ...');
    }
    this.append(' )');
  };

  PrettyPrinter.prototype.emitObject = function(obj) {
    var ctor = obj.constructor,
        constructorName;

    constructorName = typeof ctor === 'function' && obj instanceof ctor ?
      j$.fnNameFor(obj.constructor) :
      'null';

    this.append(constructorName);

    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      return;
    }

    var self = this;
    this.append('({ ');
    var first = true;

    var truncated = this.iterateObject(obj, function(property, isGetter) {
      if (first) {
        first = false;
      } else {
        self.append(', ');
      }

      self.formatProperty(obj, property, isGetter);
    });

    if (truncated) { this.append(', ...'); }

    this.append(' })');
  };

  PrettyPrinter.prototype.emitTypedArray = function(arr) {
    var constructorName = j$.fnNameFor(arr.constructor),
      limitedArray = Array.prototype.slice.call(arr, 0, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH),
      itemsString = Array.prototype.join.call(limitedArray, ', ');

    if (limitedArray.length !== arr.length) {
      itemsString += ', ...';
    }

    this.append(constructorName + ' [ ' + itemsString + ' ]');
  };

  PrettyPrinter.prototype.emitDomElement = function(el) {
    var tagName = el.tagName.toLowerCase(),
      attrs = el.attributes,
      i,
      len = attrs.length,
      out = '<' + tagName,
      attr;

    for (i = 0; i < len; i++) {
      attr = attrs[i];
      out += ' ' + attr.name;

      if (attr.value !== '') {
        out += '="' + attr.value + '"';
      }
    }

    out += '>';

    if (el.childElementCount !== 0 || el.textContent !== '') {
      out += '...</' + tagName + '>';
    }

    this.append(out);
  };

  PrettyPrinter.prototype.formatProperty = function(obj, property, isGetter) {
      this.append(property);
      this.append(': ');
      if (isGetter) {
        this.append('<getter>');
      } else {
        this.format(obj[property]);
      }
  };

  PrettyPrinter.prototype.append = function(value) {
    var result = truncate(value, j$.MAX_PRETTY_PRINT_CHARS - this.length);
    this.length += result.value.length;
    this.stringParts.push(result.value);

    if (result.truncated) {
      throw new MaxCharsReachedError();
    }
  };


  function truncate(s, maxlen) {
    if (s.length <= maxlen) {
      return { value: s, truncated: false };
    }

    s = s.substring(0, maxlen - 4) + ' ...';
    return { value: s, truncated: true };
  }

  function MaxCharsReachedError() {
    this.message = 'Exceeded ' + j$.MAX_PRETTY_PRINT_CHARS +
      ' characters while pretty-printing a value';
  }

  MaxCharsReachedError.prototype = new Error();

  function keys(obj, isArray) {
    var allKeys = Object.keys ? Object.keys(obj) :
      (function(o) {
          var keys = [];
          for (var key in o) {
              if (j$.util.has(o, key)) {
                  keys.push(key);
              }
          }
          return keys;
      })(obj);

    if (!isArray) {
      return allKeys;
    }

    if (allKeys.length === 0) {
        return allKeys;
    }

    var extraKeys = [];
    for (var i = 0; i < allKeys.length; i++) {
      if (!/^[0-9]+$/.test(allKeys[i])) {
        extraKeys.push(allKeys[i]);
      }
    }

    return extraKeys;
  }
  return function(value) {
    var prettyPrinter = new PrettyPrinter();
    prettyPrinter.format(value);
    return prettyPrinter.stringParts.join('');
  };
};
