getJasmineRequireObj().makePrettyPrinter = function(j$) {
  class SinglePrettyPrintRun {
    constructor(customObjectFormatters, pp) {
      this.customObjectFormatters_ = customObjectFormatters;
      this.ppNestLevel_ = 0;
      this.seen = [];
      this.length = 0;
      this.stringParts = [];
      this.pp_ = pp;
    }

    format(value) {
      this.ppNestLevel_++;
      try {
        const customFormatResult = this.applyCustomFormatters_(value);

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
    }

    applyCustomFormatters_(value) {
      return customFormat(value, this.customObjectFormatters_);
    }

    iterateObject(obj, fn) {
      const objKeys = j$.MatchersUtil.keys(obj, j$.isArray_(obj));
      const length = Math.min(objKeys.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);

      for (let i = 0; i < length; i++) {
        fn(objKeys[i]);
      }

      return objKeys.length > length;
    }

    emitScalar(value) {
      this.append(value);
    }

    emitString(value) {
      this.append("'" + value + "'");
    }

    emitArray(array) {
      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        this.append('Array');
        return;
      }

      const length = Math.min(array.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
      this.append('[ ');

      for (let i = 0; i < length; i++) {
        if (i > 0) {
          this.append(', ');
        }
        this.format(array[i]);
      }
      if (array.length > length) {
        this.append(', ...');
      }

      let first = array.length === 0;
      const wasTruncated = this.iterateObject(array, property => {
        if (first) {
          first = false;
        } else {
          this.append(', ');
        }

        this.formatProperty(array, property);
      });

      if (wasTruncated) {
        this.append(', ...');
      }

      this.append(' ]');
    }

    emitSet(set) {
      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        this.append('Set');
        return;
      }
      this.append('Set( ');
      const size = Math.min(set.size, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
      let i = 0;
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
    }

    emitMap(map) {
      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        this.append('Map');
        return;
      }
      this.append('Map( ');
      const size = Math.min(map.size, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
      let i = 0;
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
    }

    emitObject(obj) {
      const ctor = obj.constructor;
      const constructorName =
        typeof ctor === 'function' && obj instanceof ctor
          ? j$.fnNameFor(obj.constructor)
          : 'null';

      this.append(constructorName);

      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        return;
      }

      this.append('({ ');
      let first = true;

      const wasTruncated = this.iterateObject(obj, property => {
        if (first) {
          first = false;
        } else {
          this.append(', ');
        }

        this.formatProperty(obj, property);
      });

      if (wasTruncated) {
        this.append(', ...');
      }

      this.append(' })');
    }

    emitTypedArray(arr) {
      const constructorName = j$.fnNameFor(arr.constructor);
      const limitedArray = Array.prototype.slice.call(
        arr,
        0,
        j$.MAX_PRETTY_PRINT_ARRAY_LENGTH
      );
      let itemsString = Array.prototype.join.call(limitedArray, ', ');

      if (limitedArray.length !== arr.length) {
        itemsString += ', ...';
      }

      this.append(constructorName + ' [ ' + itemsString + ' ]');
    }

    emitDomElement(el) {
      const tagName = el.tagName.toLowerCase();
      let out = '<' + tagName;

      for (const attr of el.attributes) {
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
    }

    formatProperty(obj, property) {
      if (typeof property === 'symbol') {
        this.append(property.toString());
      } else {
        this.append(property);
      }

      this.append(': ');
      this.format(obj[property]);
    }

    append(value) {
      // This check protects us from the rare case where an object has overriden
      // `toString()` with an invalid implementation (returning a non-string).
      if (typeof value !== 'string') {
        value = Object.prototype.toString.call(value);
      }

      const result = truncate(value, j$.MAX_PRETTY_PRINT_CHARS - this.length);
      this.length += result.value.length;
      this.stringParts.push(result.value);

      if (result.truncated) {
        throw new MaxCharsReachedError();
      }
    }
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

  function customFormat(value, customObjectFormatters) {
    for (const formatter of customObjectFormatters) {
      const result = formatter(value);

      if (result !== undefined) {
        return result;
      }
    }
  }

  return function(customObjectFormatters) {
    customObjectFormatters = customObjectFormatters || [];

    const pp = function(value) {
      const prettyPrinter = new SinglePrettyPrintRun(
        customObjectFormatters,
        pp
      );
      prettyPrinter.format(value);
      return prettyPrinter.stringParts.join('');
    };

    pp.customFormat_ = function(value) {
      return customFormat(value, customObjectFormatters);
    };

    return pp;
  };
};
