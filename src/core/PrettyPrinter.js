getJasmineRequireObj().makePrettyPrinter = function(j$, private$) {
  'use strict';

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
        } else if (value === undefined) {
          this.emitScalar('undefined');
        } else if (value === null) {
          this.emitScalar('null');
        } else if (value === 0 && 1 / value === -Infinity) {
          this.emitScalar('-0');
        } else if (value === j$.getGlobal()) {
          this.emitScalar('<global>');
        } else if (value.jasmineToString) {
          this.emitScalar(value.jasmineToString(this.pp_));
        } else if (private$.isString(value)) {
          this.emitString(
            value,
            this.ppNestLevel_ === 1 && customFormatResult === undefined
          );
        } else if (j$.isSpy(value)) {
          this.emitScalar('spy on ' + value.and.identity);
        } else if (j$.isSpy(value.toString)) {
          this.emitScalar('spy on ' + value.toString.and.identity);
        } else if (value instanceof RegExp) {
          this.emitScalar(value.toString());
        } else if (typeof value === 'function') {
          if (value.name) {
            this.emitScalar(`Function '${value.name}'`);
          } else {
            this.emitScalar('Function');
          }
        } else if (private$.isDomNode(value)) {
          if (value.tagName) {
            this.emitDomElement(value);
          } else {
            this.emitScalar('HTMLNode');
          }
        } else if (value instanceof Date) {
          this.emitScalar('Date(' + value + ')');
        } else if (private$.isSet(value)) {
          this.emitSet(value);
        } else if (private$.isMap(value)) {
          this.emitMap(value);
        } else if (private$.isTypedArray(value)) {
          this.emitTypedArray(value);
        } else if (
          value.toString &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          hasCustomToString(value)
        ) {
          try {
            this.emitScalar(value.toString());
            // eslint-disable-next-line no-unused-vars
          } catch (e) {
            this.emitScalar('has-invalid-toString-method');
          }
        } else if (this.seen.includes(value)) {
          this.emitScalar(
            '<circular reference: ' +
              (Array.isArray(value) ? 'Array' : 'Object') +
              '>'
          );
        } else if (isArrayLike(value) || private$.isA('Object', value)) {
          this.seen.push(value);
          const typeName = private$.isA('NodeList', value) ? 'NodeList' : '';
          if (isArrayLike(value)) {
            this.emitArrayLike(value, typeName);
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
      const objKeys = private$.MatchersUtil.keys(obj, isArrayLike(obj));
      const length = Math.min(objKeys.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);

      for (let i = 0; i < length; i++) {
        fn(objKeys[i]);
      }

      return objKeys.length > length;
    }

    emitScalar(value) {
      this.append(value);
    }

    emitString(value, trackString) {
      const text = "'" + value + "'";
      if (trackString) {
        this.stringValue_ =
          typeof value === 'string' ? value : text.slice(1, -1);
      }
      this.append(text);
    }

    emitArrayLike(array, typeName) {
      if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
        this.append(typeName || 'Array');
        return;
      }

      const length = Math.min(array.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
      this.append(typeName + '[ ');

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
          ? private$.fnNameFor(obj.constructor)
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
      const constructorName = private$.fnNameFor(arr.constructor);
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
        private$.isFunction(value.toString) &&
        value.toString !== Object.prototype.toString &&
        value.toString() !== Object.prototype.toString.call(value)
      );
      // eslint-disable-next-line no-unused-vars
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

  function formatStringComparison(actual, expected) {
    const budget = j$.MAX_PRETTY_PRINT_CHARS;
    if (
      typeof actual !== 'string' ||
      typeof expected !== 'string' ||
      actual === expected ||
      !Number.isFinite(budget) ||
      budget < 8 ||
      Math.max(actual.length, expected.length) + 2 <= budget
    ) {
      return;
    }

    const limit = Math.floor(budget);
    const length = Math.min(actual.length, expected.length);
    let difference = 0;
    while (
      difference < length &&
      actual.charCodeAt(difference) === expected.charCodeAt(difference)
    ) {
      difference++;
    }

    // The opening quote and final ' ...' use five characters of the budget.
    if (difference < limit - 5) {
      return;
    }

    const countedPrefix = count => '...(' + count + ' chars omitted)... ';
    const countFits = countedPrefix(difference).length + 8 <= limit;
    const prefixLength = countFits ? countedPrefix(difference).length : 1;
    const context = Math.max(0, Math.floor((limit - prefixLength - 8) / 2));
    let start = difference - context;
    if (
      splitsSurrogatePair(actual, start) ||
      splitsSurrogatePair(expected, start)
    ) {
      start--;
    }
    const prefix = countFits ? countedPrefix(start) : '…';

    function format(value) {
      const text = "'" + prefix + value.substring(start) + "'";
      let valueLimit = limit;
      if (
        text.length > valueLimit &&
        splitsSurrogatePair(text, valueLimit - 4)
      ) {
        valueLimit--;
      }
      return truncate(text, valueLimit).value;
    }

    return { actual: format(actual), expected: format(expected) };
  }

  function splitsSurrogatePair(value, index) {
    const previous = value.charCodeAt(index - 1);
    const current = value.charCodeAt(index);
    return (
      previous >= 0xd800 &&
      previous <= 0xdbff &&
      current >= 0xdc00 &&
      current <= 0xdfff
    );
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

  function isArrayLike(obj) {
    return Array.isArray(obj) || private$.isA('NodeList', obj);
  }

  return function(customObjectFormatters) {
    customObjectFormatters = customObjectFormatters || [];

    const pp = function(value) {
      return prettyPrintRun(value).stringParts.join('');
    };

    function prettyPrintRun(value) {
      const prettyPrinter = new SinglePrettyPrintRun(
        customObjectFormatters,
        pp
      );
      prettyPrinter.format(value);
      return prettyPrinter;
    }

    pp.formatComparison_ = function(actual, expected) {
      const actualRun = prettyPrintRun(actual);
      const expectedRun = prettyPrintRun(expected);
      return (
        formatStringComparison(
          actualRun.stringValue_,
          expectedRun.stringValue_
        ) || {
          actual: actualRun.stringParts.join(''),
          expected: expectedRun.stringParts.join('')
        }
      );
    };

    pp.customFormat_ = function(value) {
      return customFormat(value, customObjectFormatters);
    };

    return pp;
  };
};
