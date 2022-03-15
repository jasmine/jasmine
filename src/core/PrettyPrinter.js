getJasmineRequireObj().makePrettyPrinter = function(j$) {
  function SinglePrettyPrintRun(customObjectFormatters, pp) {
    this.customObjectFormatters_ = customObjectFormatters;
    this.ppNestLevel_ = 0;
    this.seen = [];
    this.length = 0;
    this.stringParts = [];
    this.pp_ = pp;
  }

  function hasCustomToString(value) {
    // value.toString !== Object.prototype.toString if value has no custom toString but is from another context (e.g.
    // iframe, web worker)
    try {
      return (
        j$.isFunction_(value.toString) &&
        value.toString !== Object.prototype.toString &&
        value.toString() !== Object.prototype.toString.call(value)
      );
    } catch (e) {
      // The custom toString() threw.
      return true;
    }
  }

  SinglePrettyPrintRun.prototype.format = function(value) {
    this.ppNestLevel_++;
    try {
      var customFormatResult = this.applyCustomFormatters_(value);

      if (customFormatResult) {
        this.emitScalar(customFormatResult);
      } else if (j$.util.isUndefined(value)) {
        this.emitScalar('undefined');
      } else if (value === null) {
        this.emitScalar('null');
      } else if (value === 0 && 1 / value === -Infinity) {
        this.emitScalar('-0');
      } else if (value === j$.getGlobal()) {
        this.emitScalar('<global>');
      } else if (value.jasmineToString) {
        this.emitScalar(value.jasmineToString(this.pp_));
      } else if (j$.isString_(value)) {
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
      } else if (
        value.toString &&
        typeof value === 'object' &&
        !j$.isArray_(value) &&
        hasCustomToString(value)
      ) {
        try {
          this.emitScalar(value.toString());
        } catch (e) {
          this.emitScalar('has-invalid-toString-method');
        }
      } else if (j$.util.arrayContains(this.seen, value)) {
        this.emitScalar(
          '<circular reference: ' +
            (j$.isArray_(value) ? 'Array' : 'Object') +
            '>'
        );
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

  SinglePrettyPrintRun.prototype.applyCustomFormatters_ = function(value) {
    return customFormat(value, this.customObjectFormatters_);
  };

  SinglePrettyPrintRun.prototype.iterateObject = function(obj, fn) {
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

  SinglePrettyPrintRun.prototype.emitScalar = function(value) {
    this.append(value);
  };

  SinglePrettyPrintRun.prototype.emitString = function(value) {
    this.append("'" + value + "'");
  };

  SinglePrettyPrintRun.prototype.emitArray = function(array) {
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
    if (array.length > length) {
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

    if (truncated) {
      this.append(', ...');
    }

    this.append(' ]');
  };

  SinglePrettyPrintRun.prototype.emitSet = function(set) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Set');
      return;
    }
    this.append('Set( ');
    var size = Math.min(set.size, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    var i = 0;
    set.forEach(function(value, key) {
      if (i >= size) {
        return;
      }
      if (i > 0) {
        this.append(', ');
      }
      this.format(value);

      i++;
    }, this);
    if (set.size > size) {
      this.append(', ...');
    }
    this.append(' )');
  };

  SinglePrettyPrintRun.prototype.emitMap = function(map) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Map');
      return;
    }
    this.append('Map( ');
    var size = Math.min(map.size, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    var i = 0;
    map.forEach(function(value, key) {
      if (i >= size) {
        return;
      }
      if (i > 0) {
        this.append(', ');
      }
      this.format([key, value]);

      i++;
    }, this);
    if (map.size > size) {
      this.append(', ...');
    }
    this.append(' )');
  };

  SinglePrettyPrintRun.prototype.emitObject = function(obj) {
    var ctor = obj.constructor,
      constructorName;

    constructorName =
      typeof ctor === 'function' && obj instanceof ctor
        ? j$.fnNameFor(obj.constructor)
        : 'null';

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

    if (truncated) {
      this.append(', ...');
    }

    this.append(' })');
  };

  SinglePrettyPrintRun.prototype.emitTypedArray = function(arr) {
    var constructorName = j$.fnNameFor(arr.constructor),
      limitedArray = Array.prototype.slice.call(
        arr,
        0,
        j$.MAX_PRETTY_PRINT_ARRAY_LENGTH
      ),
      itemsString = Array.prototype.join.call(limitedArray, ', ');

    if (limitedArray.length !== arr.length) {
      itemsString += ', ...';
    }

    this.append(constructorName + ' [ ' + itemsString + ' ]');
  };

  SinglePrettyPrintRun.prototype.emitDomElement = function(el) {
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

  SinglePrettyPrintRun.prototype.formatProperty = function(
    obj,
    property,
    isGetter
  ) {
    this.append(property);
    this.append(': ');
    if (isGetter) {
      this.append('<getter>');
    } else {
      this.format(obj[property]);
    }
  };

  SinglePrettyPrintRun.prototype.append = function(value) {
    // This check protects us from the rare case where an object has overriden
    // `toString()` with an invalid implementation (returning a non-string).
    if (typeof value !== 'string') {
      value = Object.prototype.toString.call(value);
    }

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
    this.message =
      'Exceeded ' +
      j$.MAX_PRETTY_PRINT_CHARS +
      ' characters while pretty-printing a value';
  }

  MaxCharsReachedError.prototype = new Error();

  function keys(obj, isArray) {
    var allKeys = Object.keys
      ? Object.keys(obj)
      : (function(o) {
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

  function customFormat(value, customObjectFormatters) {
    var i, result;

    for (i = 0; i < customObjectFormatters.length; i++) {
      result = customObjectFormatters[i](value);

      if (result !== undefined) {
        return result;
      }
    }
  }

  return function(customObjectFormatters) {
    customObjectFormatters = customObjectFormatters || [];

    var pp = function(value) {
      var prettyPrinter = new SinglePrettyPrintRun(customObjectFormatters, pp);
      prettyPrinter.format(value);
      return prettyPrinter.stringParts.join('');
    };

    pp.customFormat_ = function(value) {
      return customFormat(value, customObjectFormatters);
    };

    return pp;
  };
};
