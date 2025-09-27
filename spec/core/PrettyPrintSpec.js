describe('PrettyPrinter', function() {
  it('should wrap strings in single quotes', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp('some string')).toEqual("'some string'");
    expect(pp("som' string")).toEqual("'som' string'");
  });

  it('stringifies empty string primitives and objects recognizably', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp(new String(''))).toEqual(pp(''));
    expect(pp(new String(''))).toEqual("''");
    expect(pp([new String('')])).toEqual(pp(['']));
    expect(pp([new String('')])).toEqual("[ '' ]");
  });

  it('should stringify primitives properly', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp(true)).toEqual('true');
    expect(pp(false)).toEqual('false');
    expect(pp(null)).toEqual('null');
    expect(pp(jasmine.undefined)).toEqual('undefined');
    expect(pp(3)).toEqual('3');
    expect(pp(-3.14)).toEqual('-3.14');
    expect(pp(-0)).toEqual('-0');
  });

  describe('stringify sets', function() {
    it('should stringify sets properly', function() {
      const set = new Set();
      set.add(1);
      set.add(2);
      const pp = privateUnderTest.makePrettyPrinter();
      expect(pp(set)).toEqual('Set( 1, 2 )');
    });

    it('should truncate sets with more elements than jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH', function() {
      const originalMaxSize = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;

      try {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
        const set = new Set();
        set.add('a');
        set.add('b');
        set.add('c');
        const pp = privateUnderTest.makePrettyPrinter();
        expect(pp(set)).toEqual("Set( 'a', 'b', ... )");
      } finally {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxSize;
      }
    });
  });

  describe('stringify maps', function() {
    it('should stringify maps properly', function() {
      const map = new Map();
      map.set(1, 2);
      const pp = privateUnderTest.makePrettyPrinter();
      expect(pp(map)).toEqual('Map( [ 1, 2 ] )');
    });

    it('should truncate maps with more elements than jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH', function() {
      const originalMaxSize = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;

      try {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
        const map = new Map();
        map.set('a', 1);
        map.set('b', 2);
        map.set('c', 3);
        const pp = privateUnderTest.makePrettyPrinter();
        expect(pp(map)).toEqual("Map( [ 'a', 1 ], [ 'b', 2 ], ... )");
      } finally {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxSize;
      }
    });
  });

  describe('stringify arrays', function() {
    it('should stringify arrays properly', function() {
      const pp = privateUnderTest.makePrettyPrinter();
      expect(pp([1, 2])).toEqual('[ 1, 2 ]');
      expect(pp([1, 'foo', {}, jasmine.undefined, null])).toEqual(
        "[ 1, 'foo', Object({  }), undefined, null ]"
      );
    });

    it('includes symbols', function() {
      const pp = privateUnderTest.makePrettyPrinter();
      expect(pp([1, Symbol('foo'), 2])).toEqual('[ 1, Symbol(foo), 2 ]');
    });

    it('should truncate arrays that are longer than jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH', function() {
      const originalMaxLength = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;
      const array = [1, 2, 3];
      const pp = privateUnderTest.makePrettyPrinter();

      try {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
        expect(pp(array)).toEqual('[ 1, 2, ... ]');
      } finally {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxLength;
      }
    });

    it('should stringify arrays with properties properly', function() {
      const pp = privateUnderTest.makePrettyPrinter();
      const arr = [1, 2];
      arr.foo = 'bar';
      arr.baz = {};
      expect(pp(arr)).toEqual("[ 1, 2, foo: 'bar', baz: Object({  }) ]");
    });

    it('should stringify empty arrays with properties properly', function() {
      const pp = privateUnderTest.makePrettyPrinter();
      const empty = [];
      empty.foo = 'bar';
      empty.baz = {};
      expect(pp(empty)).toEqual("[ foo: 'bar', baz: Object({  }) ]");
    });

    it('should stringify long arrays with properties properly', function() {
      const pp = privateUnderTest.makePrettyPrinter();
      const originalMaxLength = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;
      const long = [1, 2, 3];
      long.foo = 'bar';
      long.baz = {};

      try {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
        expect(pp(long)).toEqual(
          "[ 1, 2, ..., foo: 'bar', baz: Object({  }) ]"
        );
      } finally {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxLength;
      }
    });

    it('should indicate circular array references', function() {
      const pp = privateUnderTest.makePrettyPrinter();
      const array1 = [1, 2];
      const array2 = [array1];
      array1.push(array2);
      expect(pp(array1)).toEqual('[ 1, 2, [ <circular reference: Array> ] ]');
    });

    it('should not indicate circular references incorrectly', function() {
      const pp = privateUnderTest.makePrettyPrinter();
      const array = [[1]];
      expect(pp(array)).toEqual('[ [ 1 ] ]');
    });
  });

  it('should stringify objects properly', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp({ foo: 'bar' })).toEqual("Object({ foo: 'bar' })");
    expect(
      pp({
        foo: 'bar',
        baz: 3,
        nullValue: null,
        undefinedValue: jasmine.undefined
      })
    ).toEqual(
      "Object({ foo: 'bar', baz: 3, nullValue: null, undefinedValue: undefined })"
    );
    expect(pp({ foo: function() {}, bar: [1, 2, 3] })).toEqual(
      "Object({ foo: Function 'foo', bar: [ 1, 2, 3 ] })"
    );
  });

  it('includes symbol keys in objects', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const obj = {};
    obj[Symbol('foo')] = 'bar';
    expect(pp(obj)).toEqual("Object({ Symbol(foo): 'bar' })");
  });

  it('stringifies string and symbol keys differently', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const symObj = {};
    const strObj = {};
    const k = 'foo';
    const v = 'bar';
    symObj[Symbol(k)] = v;
    strObj[k] = v;

    expect(pp(symObj)).not.toEqual(pp(strObj));
  });

  it('should stringify objects that almost look like DOM nodes', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp({ nodeType: 1 })).toEqual('Object({ nodeType: 1 })');
  });

  it('should truncate objects with too many keys', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const originalMaxLength = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;
    const long = { a: 1, b: 2, c: 3 };

    try {
      jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
      expect(pp(long)).toEqual('Object({ a: 1, b: 2, ... })');
    } finally {
      jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxLength;
    }
  });

  function withMaxChars(maxChars, fn) {
    const originalMaxChars = jasmineUnderTest.MAX_PRETTY_PRINT_CHARS;

    try {
      jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = maxChars;
      fn();
    } finally {
      jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = originalMaxChars;
    }
  }

  it('should truncate outputs that are too long', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const big = [{ a: 1, b: 'a long string' }, {}];

    withMaxChars(34, function() {
      expect(pp(big)).toEqual("[ Object({ a: 1, b: 'a long st ...");
    });
  });

  it('should not serialize more objects after hitting MAX_PRETTY_PRINT_CHARS', function() {
    const a = {
        jasmineToString: function() {
          return 'object a';
        }
      },
      b = {
        jasmineToString: function() {
          return 'object b';
        }
      },
      c = {
        jasmineToString: jasmine
          .createSpy('c jasmineToString')
          .and.returnValue('')
      },
      d = {
        jasmineToString: jasmine
          .createSpy('d jasmineToString')
          .and.returnValue('')
      },
      pp = privateUnderTest.makePrettyPrinter();

    withMaxChars(30, function() {
      pp([{ a: a, b: b, c: c }, d]);
      expect(c.jasmineToString).not.toHaveBeenCalled();
      expect(d.jasmineToString).not.toHaveBeenCalled();
    });
  });

  it("should print 'null' as the constructor of an object with its own constructor property", function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp({ constructor: function() {} })).toContain('null({');
    expect(pp({ constructor: 'foo' })).toContain('null({');
  });

  it('should not include inherited properties when stringifying an object', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const SomeClass = function SomeClass() {};
    SomeClass.prototype.foo = 'inherited foo';
    const instance = new SomeClass();
    instance.bar = 'my own bar';
    expect(pp(instance)).toEqual("SomeClass({ bar: 'my own bar' })");
  });

  it('should not recurse objects and arrays more deeply than jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const originalMaxDepth = jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH;
    const nestedObject = { level1: { level2: { level3: { level4: 'leaf' } } } };
    const nestedArray = [1, [2, [3, [4, 'leaf']]]];

    try {
      jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH = 2;
      expect(pp(nestedObject)).toEqual(
        'Object({ level1: Object({ level2: Object }) })'
      );
      expect(pp(nestedArray)).toEqual('[ 1, [ 2, Array ] ]');

      jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH = 3;
      expect(pp(nestedObject)).toEqual(
        'Object({ level1: Object({ level2: Object({ level3: Object }) }) })'
      );
      expect(pp(nestedArray)).toEqual('[ 1, [ 2, [ 3, Array ] ] ]');

      jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH = 4;
      expect(pp(nestedObject)).toEqual(
        "Object({ level1: Object({ level2: Object({ level3: Object({ level4: 'leaf' }) }) }) })"
      );
      expect(pp(nestedArray)).toEqual("[ 1, [ 2, [ 3, [ 4, 'leaf' ] ] ] ]");
    } finally {
      jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH = originalMaxDepth;
    }
  });

  it('should stringify immutable circular objects', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    let frozenObject = { foo: { bar: 'baz' } };
    frozenObject.circular = frozenObject;
    frozenObject = Object.freeze(frozenObject);
    expect(pp(frozenObject)).toEqual(
      "Object({ foo: Object({ bar: 'baz' }), circular: <circular reference: Object> })"
    );
  });

  it('should stringify RegExp objects properly', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp(/x|y|z/)).toEqual('/x|y|z/');
  });

  it('should indicate circular object references', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const sampleValue = { foo: 'hello' };
    sampleValue.nested = sampleValue;
    expect(pp(sampleValue)).toEqual(
      "Object({ foo: 'hello', nested: <circular reference: Object> })"
    );
  });

  it('should use the return value of getters', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const sampleValue = {
      id: 1,
      get calculatedValue() {
        return 'the getter return value';
      }
    };
    expect(pp(sampleValue)).toEqual(
      "Object({ id: 1, calculatedValue: 'the getter return value' })"
    );
  });

  it('should not do HTML escaping of strings', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp('some <b>html string</b> &', false)).toEqual(
      "'some <b>html string</b> &'"
    );
  });

  it('should abbreviate the global (usually window) object', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp(jasmine.getGlobal())).toEqual('<global>');
  });

  it('should stringify Date objects properly', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const now = new Date();
    expect(pp(now)).toEqual('Date(' + now.toString() + ')');
  });

  describe('with a spy object', function() {
    let env, pp;

    beforeEach(function() {
      env = new privateUnderTest.Env();
      pp = privateUnderTest.makePrettyPrinter();
    });

    afterEach(function() {
      env.cleanup_();
    });

    it('should stringify spy objects properly', function() {
      const TestObject = {
        someFunction: function() {}
      };

      const spyRegistry = new privateUnderTest.SpyRegistry({
        currentSpies: function() {
          return [];
        },
        createSpy: function(name, originalFn) {
          return privateUnderTest.Spy(name, originalFn);
        }
      });

      spyRegistry.spyOn(TestObject, 'someFunction');
      expect(pp(TestObject.someFunction)).toEqual('spy on someFunction');

      expect(pp(env.createSpy('something'))).toEqual('spy on something');
    });

    it('should stringify spyOn toString properly', function() {
      const TestObject = {
          someFunction: function() {}
        },
        env = new privateUnderTest.Env(),
        pp = privateUnderTest.makePrettyPrinter();

      const spyRegistry = new privateUnderTest.SpyRegistry({
        currentSpies: function() {
          return [];
        },
        createSpy: function(name, originalFn) {
          return privateUnderTest.Spy(name, originalFn);
        }
      });

      spyRegistry.spyOn(TestObject, 'toString');
      const testSpyObj = env.createSpyObj('TheClassName', ['toString']);

      expect(pp(testSpyObj)).toEqual('spy on TheClassName.toString');
    });
  });

  it('should stringify objects that implement jasmineToString', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const obj = {
      jasmineToString: function() {
        return 'strung';
      }
    };

    expect(pp(obj)).toEqual('strung');
  });

  it('should pass itself to jasmineToString', function() {
    const pp = privateUnderTest.makePrettyPrinter([]);
    const obj = {
      jasmineToString: jasmine.createSpy('jasmineToString').and.returnValue('')
    };

    pp(obj);
    expect(obj.jasmineToString).toHaveBeenCalledWith(pp);
  });

  it('should stringify objects that implement custom toString', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const obj = {
      toString: function() {
        return 'my toString';
      }
    };

    expect(pp(obj)).toEqual('my toString');

    // Simulate object from another global context (e.g. an iframe or Web Worker) that does not actually have a custom
    // toString despite obj.toString !== Object.prototype.toString
    const objFromOtherContext = {
      foo: 'bar',
      toString: function() {
        return Object.prototype.toString.call(this);
      }
    };

    expect(pp(objFromOtherContext)).toEqual(
      "Object({ foo: 'bar', toString: Function 'toString' })"
    );
  });

  it("should stringify objects have have a toString that isn't a function", function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const obj = {
      toString: 'foo'
    };

    expect(pp(obj)).toEqual("Object({ toString: 'foo' })");
  });

  it('should stringify objects from anonymous constructors with custom toString', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const MyAnonymousConstructor = (function() {
      return function() {};
    })();
    MyAnonymousConstructor.toString = function() {
      return '';
    };

    const a = new MyAnonymousConstructor();

    expect(pp(a)).toEqual('<anonymous>({  })');
  });

  it('stringifies functions with names', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp(foo)).toEqual("Function 'foo'");
    function foo() {}
  });

  it('stringifies functions without names', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    expect(pp(function() {})).toEqual('Function');
  });

  it('should handle objects with null prototype', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const obj = Object.create(null);
    obj.foo = 'bar';

    expect(pp(obj)).toEqual("null({ foo: 'bar' })");
  });

  it('should gracefully handle objects with invalid toString implementations', function() {
    const pp = privateUnderTest.makePrettyPrinter();
    const obj = {
      foo: {
        toString: function() {
          // Invalid: toString returning a number
          return 3;
        }
      },
      bar: {
        toString: function() {
          // Really invalid: a nested bad toString().
          return {
            toString: function() {
              return new Date();
            }
          };
        }
      },
      // Valid: an actual number
      baz: 3,
      // Valid: an actual Error object
      qux: new Error('bar'),
      //
      baddy: {
        toString: function() {
          throw new Error('I am a bad toString');
        }
      }
    };

    expect(pp(obj)).toEqual(
      'Object({ foo: [object Number], bar: [object Object], baz: 3, qux: Error: bar, baddy: has-invalid-toString-method })'
    );
  });

  describe('Custom object formatters', function() {
    it('should use the first custom object formatter that does not return undefined', function() {
      const customObjectFormatters = [
          function() {
            return undefined;
          },
          function(obj) {
            return '2nd: ' + obj.foo;
          },
          function(obj) {
            return '3rd: ' + obj.foo;
          }
        ],
        pp = privateUnderTest.makePrettyPrinter(customObjectFormatters),
        obj = { foo: 'bar' };

      expect(pp(obj)).toEqual('2nd: bar');
    });

    it('should fall back to built in logic if all custom object formatters return undefined', function() {
      const customObjectFormatters = [
          function() {
            return undefined;
          }
        ],
        pp = privateUnderTest.makePrettyPrinter(customObjectFormatters),
        obj = { foo: 'bar' };

      expect(pp(obj)).toEqual("Object({ foo: 'bar' })");
    });
  });

  describe('#customFormat_', function() {
    it('should use the first custom object formatter that does not return undefined', function() {
      const customObjectFormatters = [
          function() {
            return undefined;
          },
          function(obj) {
            return '2nd: ' + obj.foo;
          },
          function(obj) {
            return '3rd: ' + obj.foo;
          }
        ],
        pp = privateUnderTest.makePrettyPrinter(customObjectFormatters),
        obj = { foo: 'bar' };

      expect(pp.customFormat_(obj)).toEqual('2nd: bar');
    });

    it('should return undefined if all custom object formatters return undefined', function() {
      const customObjectFormatters = [
          function() {
            return undefined;
          }
        ],
        pp = privateUnderTest.makePrettyPrinter(customObjectFormatters),
        obj = { foo: 'bar' };

      expect(pp.customFormat_(obj)).toBeUndefined();
    });
  });
});
