describe('matchersUtil', function() {
  it('exposes the injected pretty-printer as .pp', function() {
    const pp = function() {},
      matchersUtil = new jasmineUnderTest.MatchersUtil({ pp: pp });

    expect(matchersUtil.pp).toBe(pp);
  });

  describe('equals', function() {
    it('passes for literals that are triple-equal', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(null, null)).toBe(true);
      expect(matchersUtil.equals(void 0, void 0)).toBe(true);
    });

    it('fails for things that are not equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals({ a: 'foo' }, 1)).toBe(false);
    });

    it('passes for Strings that are equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals('foo', 'foo')).toBe(true);
    });

    it('fails for Strings that are not equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals('foo', 'bar')).toBe(false);
    });

    it('passes for Numbers that are equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(123, 123)).toBe(true);
    });

    it('fails for Numbers that are not equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(123, 456)).toBe(false);
    });

    it('fails for a Number and a String that have equivalent values', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(123, '123')).toBe(false);
    });

    it('passes for Dates that are equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(
        matchersUtil.equals(new Date('Jan 1, 1970'), new Date('Jan 1, 1970'))
      ).toBe(true);
    });

    it('fails for Dates that are not equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(
        matchersUtil.equals(new Date('Jan 1, 1970'), new Date('Feb 3, 1991'))
      ).toBe(false);
    });

    it('passes for Booleans that are equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(true, true)).toBe(true);
    });

    it('fails for Booleans that are not equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(true, false)).toBe(false);
    });

    it('passes for RegExps that are equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(/foo/, /foo/)).toBe(true);
    });

    it('fails for RegExps that are not equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(/foo/, /bar/)).toBe(false);
      expect(
        matchersUtil.equals(new RegExp('foo', 'i'), new RegExp('foo'))
      ).toBe(false);
    });

    it('passes for Arrays that are equivalent', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals([1, 2], [1, 2])).toBe(true);
    });

    it('passes for Arrays that are equivalent, with elements added by changing length', function() {
      const foo = [],
        matchersUtil = new jasmineUnderTest.MatchersUtil();
      foo.length = 1;

      expect(matchersUtil.equals(foo, [undefined])).toBe(true);
    });

    it('fails for Arrays that have different lengths', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals([1, 2], [1, 2, 3])).toBe(false);
    });

    it('fails for Arrays that have different elements', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals([1, 2, 3], [1, 5, 3])).toBe(false);
    });

    it('fails for Arrays whose contents are equivalent, but have differing properties', function() {
      const one = [1, 2, 3],
        two = [1, 2, 3],
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      one.foo = 'bar';
      two.foo = 'baz';

      expect(matchersUtil.equals(one, two)).toBe(false);
    });

    it('passes for Arrays with equivalent contents and properties', function() {
      const one = [1, 2, 3],
        two = [1, 2, 3],
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      one.foo = 'bar';
      two.foo = 'bar';

      expect(matchersUtil.equals(one, two)).toBe(true);
    });

    it('handles symbol keys in Arrays', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil(),
        sym = Symbol('foo'),
        arr1 = [];
      let arr2 = [];

      arr1[sym] = 'bar';
      arr2[sym] = 'bar';
      expect(matchersUtil.equals(arr1, arr2)).toBe(true);

      arr2[sym] = 'baz';
      expect(matchersUtil.equals(arr1, arr2)).toBe(false);

      arr2 = [];
      arr2[Symbol('foo')] = 'bar';
      expect(matchersUtil.equals(arr1, arr2)).toBe(false);

      arr2 = [];
      arr2['foo'] = 'bar';
      expect(matchersUtil.equals(arr1, arr2)).toBe(false);
    });

    it('passes for Errors that are the same type and have the same message', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(new Error('foo'), new Error('foo'))).toBe(
        true
      );
    });

    it('fails for Errors that are the same type and have different messages', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(new Error('foo'), new Error('bar'))).toBe(
        false
      );
    });

    it('fails for objects with different constructors', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      function One() {}
      function Two() {}

      expect(matchersUtil.equals(new One(), new Two())).toBe(false);
    });

    it('passes for Objects that are equivalent (simple case)', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals({ a: 'foo' }, { a: 'foo' })).toBe(true);
    });

    it('fails for Objects that are not equivalent (simple case)', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals({ a: 'foo' }, { a: 'bar' })).toBe(false);
    });

    it('passes for Objects that are equivalent (deep case)', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(
        matchersUtil.equals(
          { a: 'foo', b: { c: 'bar' } },
          { a: 'foo', b: { c: 'bar' } }
        )
      ).toBe(true);
    });

    it('fails for Objects that are not equivalent (deep case)', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(
        matchersUtil.equals(
          { a: 'foo', b: { c: 'baz' } },
          { a: 'foo', b: { c: 'bar' } }
        )
      ).toBe(false);
    });

    it('passes for Objects that are equivalent (with cycles)', function() {
      const actual = { a: 'foo' },
        expected = { a: 'foo' },
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      actual.b = actual;
      expected.b = actual;

      expect(matchersUtil.equals(actual, expected)).toBe(true);
    });

    it('fails for Objects that are not equivalent (with cycles)', function() {
      const actual = { a: 'foo' },
        expected = { a: 'bar' },
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      actual.b = actual;
      expected.b = actual;

      expect(matchersUtil.equals(actual, expected)).toBe(false);
    });

    it('fails for Objects that have the same number of keys, but different keys/values', function() {
      const expected = { a: undefined },
        actual = { b: 1 },
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(actual, expected)).toBe(false);
    });

    it('fails when comparing an empty object to an empty array (issue #114)', function() {
      const emptyObject = {},
        emptyArray = [],
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(emptyObject, emptyArray)).toBe(false);
      expect(matchersUtil.equals(emptyArray, emptyObject)).toBe(false);
    });

    it('passes for equivalent frozen objects (GitHub issue #266)', function() {
      const a = { foo: 1 },
        b = { foo: 1 },
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      Object.freeze(a);
      Object.freeze(b);

      expect(matchersUtil.equals(a, b)).toBe(true);
    });

    it('passes for equivalent Promises (GitHub issue #1314)', function() {
      const p1 = new Promise(function() {}),
        p2 = new Promise(function() {}),
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(p1, p1)).toBe(true);
      expect(matchersUtil.equals(p1, p2)).toBe(false);
    });

    describe('when running in a browser', function() {
      beforeEach(function() {
        if (typeof document === 'undefined') {
          pending('This test only runs in browsers');
        }
      });

      it('passes for equivalent DOM nodes', function() {
        const a = document.createElement('div');
        const matchersUtil = new jasmineUnderTest.MatchersUtil();

        a.setAttribute('test-attr', 'attr-value');
        a.appendChild(document.createTextNode('test'));

        const b = document.createElement('div');
        b.setAttribute('test-attr', 'attr-value');
        b.appendChild(document.createTextNode('test'));

        expect(matchersUtil.equals(a, b)).toBe(true);
      });

      it('passes for equivalent objects from different frames', function() {
        const matchersUtil = new jasmineUnderTest.MatchersUtil();
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        iframe.contentWindow.eval('window.testObject = {}');
        expect(matchersUtil.equals({}, iframe.contentWindow.testObject)).toBe(
          true
        );
        document.body.removeChild(iframe);
      });

      it('fails for DOM nodes with different attributes or child nodes', function() {
        const matchersUtil = new jasmineUnderTest.MatchersUtil();
        const a = document.createElement('div');
        a.setAttribute('test-attr', 'attr-value');
        a.appendChild(document.createTextNode('test'));

        const b = document.createElement('div');
        b.setAttribute('test-attr', 'attr-value2');
        b.appendChild(document.createTextNode('test'));

        expect(matchersUtil.equals(a, b)).toBe(false);

        b.setAttribute('test-attr', 'attr-value');
        expect(matchersUtil.equals(a, b)).toBe(true);

        b.appendChild(document.createTextNode('2'));
        expect(matchersUtil.equals(a, b)).toBe(false);

        a.appendChild(document.createTextNode('2'));
        expect(matchersUtil.equals(a, b)).toBe(true);
      });
    });

    describe('when running in Node', function() {
      beforeEach(function() {
        if (typeof require !== 'function') {
          pending('This test only runs in Node');
        }
      });

      it('passes for equivalent objects from different vm contexts', function() {
        const matchersUtil = new jasmineUnderTest.MatchersUtil();
        const vm = require('vm');
        const sandbox = {
          obj: null
        };
        vm.runInNewContext('obj = {a: 1, b: 2}', sandbox);

        expect(matchersUtil.equals(sandbox.obj, { a: 1, b: 2 })).toBe(true);
      });

      it('passes for equivalent arrays from different vm contexts', function() {
        const matchersUtil = new jasmineUnderTest.MatchersUtil();
        const vm = require('vm');
        const sandbox = {
          arr: null
        };
        vm.runInNewContext('arr = [1, 2]', sandbox);

        expect(matchersUtil.equals(sandbox.arr, [1, 2])).toBe(true);
      });
    });

    it('passes when Any is used', function() {
      const number = 3,
        anyNumber = new jasmineUnderTest.Any(Number),
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(number, anyNumber)).toBe(true);
      expect(matchersUtil.equals(anyNumber, number)).toBe(true);
    });

    it('fails when Any is compared to something unexpected', function() {
      const number = 3,
        anyString = new jasmineUnderTest.Any(String),
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(number, anyString)).toBe(false);
      expect(matchersUtil.equals(anyString, number)).toBe(false);
    });

    it('passes when ObjectContaining is used', function() {
      const obj = {
          foo: 3,
          bar: 7
        },
        containing = new jasmineUnderTest.ObjectContaining({ foo: 3 }),
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(obj, containing)).toBe(true);
      expect(matchersUtil.equals(containing, obj)).toBe(true);
    });

    it('passes when MapContaining is used', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const obj = new Map();
      obj.set(1, 2);
      obj.set('foo', 'bar');
      const containing = new jasmineUnderTest.MapContaining(new Map());
      containing.sample.set('foo', 'bar');

      expect(matchersUtil.equals(obj, containing)).toBe(true);
      expect(matchersUtil.equals(containing, obj)).toBe(true);
    });

    it('passes when SetContaining is used', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const obj = new Set();
      obj.add(1);
      obj.add('foo');
      const containing = new jasmineUnderTest.SetContaining(new Set());
      containing.sample.add(1);

      expect(matchersUtil.equals(obj, containing)).toBe(true);
      expect(matchersUtil.equals(containing, obj)).toBe(true);
    });

    it('passes when an asymmetric equality tester returns true', function() {
      const tester = {
          asymmetricMatch: function() {
            return true;
          }
        },
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(false, tester)).toBe(true);
      expect(matchersUtil.equals(tester, false)).toBe(true);
    });

    it('fails when an asymmetric equality tester returns false', function() {
      const tester = {
          asymmetricMatch: function() {
            return false;
          }
        },
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(true, tester)).toBe(false);
      expect(matchersUtil.equals(tester, true)).toBe(false);
    });

    it('passes when ArrayContaining is used', function() {
      const arr = ['foo', 'bar'],
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(
        matchersUtil.equals(arr, new jasmineUnderTest.ArrayContaining(['bar']))
      ).toBe(true);
    });

    it('passes when a custom equality matcher returns true', function() {
      const tester = function() {
          return true;
        },
        matchersUtil = new jasmineUnderTest.MatchersUtil({
          customTesters: [tester],
          pp: function() {}
        });

      expect(matchersUtil.equals(1, 2)).toBe(true);
    });

    it('passes for two empty Objects', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals({}, {})).toBe(true);
    });

    describe("when a custom equality matcher returns 'undefined'", function() {
      const tester = function() {
        return jasmine.undefined;
      };

      it('passes for two empty Objects', function() {
        const matchersUtil = new jasmineUnderTest.MatchersUtil({
          customTesters: [tester],
          pp: function() {}
        });
        expect(matchersUtil.equals({}, {})).toBe(true);
      });
    });

    it('fails for equivalents when a custom equality matcher returns false', function() {
      const tester = function() {
          return false;
        },
        matchersUtil = new jasmineUnderTest.MatchersUtil({
          customTesters: [tester],
          pp: function() {}
        });

      expect(matchersUtil.equals(1, 1)).toBe(false);
    });

    it('passes for an asymmetric equality tester that returns true when a custom equality tester return false', function() {
      const asymmetricTester = {
          asymmetricMatch: function() {
            return true;
          }
        },
        symmetricTester = function() {
          return false;
        },
        matchersUtil = new jasmineUnderTest.MatchersUtil({
          customTesters: [symmetricTester()],
          pp: function() {}
        });

      expect(matchersUtil.equals(asymmetricTester, true)).toBe(true);
      expect(matchersUtil.equals(true, asymmetricTester)).toBe(true);
    });

    it('passes when an Any is compared to an Any that checks for the same type', function() {
      const any1 = new jasmineUnderTest.Any(Function),
        any2 = new jasmineUnderTest.Any(Function),
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.equals(any1, any2)).toBe(true);
    });

    it('passes for null prototype objects with same properties', function() {
      const objA = Object.create(null),
        objB = Object.create(null),
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      objA.name = 'test';
      objB.name = 'test';

      expect(matchersUtil.equals(objA, objB)).toBe(true);
    });

    it('fails for null prototype objects with different properties', function() {
      const objA = Object.create(null),
        objB = Object.create(null),
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      objA.name = 'test';
      objB.test = 'name';

      expect(matchersUtil.equals(objA, objB)).toBe(false);
    });

    it('passes when comparing two empty sets', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(new Set(), new Set())).toBe(true);
    });

    it('passes when comparing identical sets', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const setA = new Set();
      setA.add(6);
      setA.add(5);
      const setB = new Set();
      setB.add(6);
      setB.add(5);

      expect(matchersUtil.equals(setA, setB)).toBe(true);
    });

    it('passes when comparing identical sets with different insertion order and simple elements', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const setA = new Set();
      setA.add(3);
      setA.add(6);
      const setB = new Set();
      setB.add(6);
      setB.add(3);

      expect(matchersUtil.equals(setA, setB)).toBe(true);
    });

    it('passes when comparing identical sets with different insertion order and complex elements 1', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const setA1 = new Set();
      setA1.add(['a', 3]);
      setA1.add([6, 1]);
      const setA2 = new Set();
      setA1.add(['y', 3]);
      setA1.add([6, 1]);
      const setA = new Set();
      setA.add(setA1);
      setA.add(setA2);

      const setB1 = new Set();
      setB1.add([6, 1]);
      setB1.add(['a', 3]);
      const setB2 = new Set();
      setB1.add([6, 1]);
      setB1.add(['y', 3]);
      const setB = new Set();
      setB.add(setB1);
      setB.add(setB2);

      expect(matchersUtil.equals(setA, setB)).toBe(true);
    });

    it('passes when comparing identical sets with different insertion order and complex elements 2', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const setA = new Set();
      setA.add([[1, 2], [3, 4]]);
      setA.add([[5, 6], [7, 8]]);
      const setB = new Set();
      setB.add([[5, 6], [7, 8]]);
      setB.add([[1, 2], [3, 4]]);

      expect(matchersUtil.equals(setA, setB)).toBe(true);
    });

    it('fails for sets with different elements', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const setA = new Set();
      setA.add(6);
      setA.add(3);
      setA.add(5);
      const setB = new Set();
      setB.add(6);
      setB.add(4);
      setB.add(5);

      expect(matchersUtil.equals(setA, setB)).toBe(false);
    });

    it('fails for sets of different size', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const setA = new Set();
      setA.add(6);
      setA.add(3);
      const setB = new Set();
      setB.add(6);
      setB.add(4);
      setB.add(5);

      expect(matchersUtil.equals(setA, setB)).toBe(false);
    });

    it('passes when comparing two empty maps', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(new Map(), new Map())).toBe(true);
    });

    it('passes when comparing identical maps', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const mapA = new Map();
      mapA.set(6, 5);
      const mapB = new Map();
      mapB.set(6, 5);
      expect(matchersUtil.equals(mapA, mapB)).toBe(true);
    });

    it('passes when comparing identical maps with different insertion order', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const mapA = new Map();
      mapA.set('a', 3);
      mapA.set(6, 1);
      const mapB = new Map();
      mapB.set(6, 1);
      mapB.set('a', 3);
      expect(matchersUtil.equals(mapA, mapB)).toBe(true);
    });

    it('fails for maps with different elements', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const mapA = new Map();
      mapA.set(6, 3);
      mapA.set(5, 1);
      const mapB = new Map();
      mapB.set(6, 4);
      mapB.set(5, 1);

      expect(matchersUtil.equals(mapA, mapB)).toBe(false);
    });

    it('fails for maps of different size', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const mapA = new Map();
      mapA.set(6, 3);
      const mapB = new Map();
      mapB.set(6, 4);
      mapB.set(5, 1);
      expect(matchersUtil.equals(mapA, mapB)).toBe(false);
    });

    it('passes when comparing two identical URLs', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(
        matchersUtil.equals(
          new URL('http://localhost/1'),
          new URL('http://localhost/1')
        )
      ).toBe(true);
    });

    it('fails when comparing two different URLs', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil(),
        url1 = new URL('http://localhost/1');

      expect(matchersUtil.equals(url1, new URL('http://localhost/2'))).toBe(
        false
      );
      expect(matchersUtil.equals(url1, new URL('http://localhost/1?foo'))).toBe(
        false
      );
      expect(matchersUtil.equals(url1, new URL('http://localhost/1#foo'))).toBe(
        false
      );
      expect(matchersUtil.equals(url1, new URL('https://localhost/1'))).toBe(
        false
      );
      expect(
        matchersUtil.equals(url1, new URL('http://localhost:8080/1'))
      ).toBe(false);
      expect(matchersUtil.equals(url1, new URL('http://example.com/1'))).toBe(
        false
      );
    });

    it('passes for ArrayBuffers with same length and content', function() {
      const buffer1 = new ArrayBuffer(4);
      const buffer2 = new ArrayBuffer(4);
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(buffer1, buffer2)).toBe(true);
    });

    it('fails for ArrayBuffers with same length but different content', function() {
      const buffer1 = new ArrayBuffer(4);
      const buffer2 = new ArrayBuffer(4);
      const array1 = new Uint8Array(buffer1);
      array1[0] = 1;
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.equals(buffer1, buffer2)).toBe(false);
    });

    describe('Typed arrays', function() {
      it('fails for typed arrays of same length and contents but different types', function() {
        const matchersUtil = new jasmineUnderTest.MatchersUtil();
        const a1 = new Int8Array(1);
        const a2 = new Uint8Array(1);
        a1[0] = a2[0] = 0;
        expect(matchersUtil.equals(a1, a2)).toBe(false);
      });

      [
        'Int8Array',
        'Uint8Array',
        'Uint8ClampedArray',
        'Int16Array',
        'Uint16Array',
        'Int32Array',
        'Uint32Array',
        'Float32Array',
        'Float64Array'
      ].forEach(function(typeName) {
        const TypedArrayCtor = jasmine.getGlobal()[typeName];

        it(
          'passes for ' + typeName + 's with same length and content',
          function() {
            const matchersUtil = new jasmineUnderTest.MatchersUtil();
            const a1 = new TypedArrayCtor(2);
            const a2 = new TypedArrayCtor(2);
            a1[0] = a2[0] = 0;
            a1[1] = a2[1] = 1;
            const diffBuilder = new jasmineUnderTest.DiffBuilder();
            expect(matchersUtil.equals(a1, a2, diffBuilder)).toBe(true);
            jasmine.debugLog('Diff: ' + diffBuilder.getMessage());
          }
        );

        it('fails for ' + typeName + 's with different length', function() {
          const matchersUtil = new jasmineUnderTest.MatchersUtil();
          const a1 = new TypedArrayCtor(2);
          const a2 = new TypedArrayCtor(1);
          a1[0] = a1[1] = a2[0] = 0;
          const diffBuilder = new jasmineUnderTest.DiffBuilder();
          expect(matchersUtil.equals(a1, a2, diffBuilder)).toBe(false);
          jasmine.debugLog('Diff: ' + diffBuilder.getMessage());
        });

        it(
          'fails for ' + typeName + 's with same length but different content',
          function() {
            const matchersUtil = new jasmineUnderTest.MatchersUtil();
            const a1 = new TypedArrayCtor(1);
            const a2 = new TypedArrayCtor(1);
            a1[0] = 0;
            a2[0] = 1;
            const diffBuilder = new jasmineUnderTest.DiffBuilder();
            expect(matchersUtil.equals(a1, a2, diffBuilder)).toBe(false);
            jasmine.debugLog('Diff: ' + diffBuilder.getMessage());
          }
        );

        it('checks nonstandard properties of ' + typeName, function() {
          const matchersUtil = new jasmineUnderTest.MatchersUtil();
          const a1 = new TypedArrayCtor(1);
          const a2 = new TypedArrayCtor(1);
          a1[0] = a2[0] = 0;
          a1.extra = 'yes';
          expect(matchersUtil.equals(a1, a2)).toBe(false);
        });

        it('works with custom equality testers with ' + typeName, function() {
          const a1 = new TypedArrayCtor(1);
          const a2 = new TypedArrayCtor(1);
          const matchersUtil = new jasmineUnderTest.MatchersUtil({
            customTesters: [
              function() {
                return true;
              }
            ]
          });
          a1[0] = 0;
          a2[0] = 1;
          expect(matchersUtil.equals(a1, a2)).toBe(true);
        });
      });

      ['BigInt64Array', 'BigUint64Array'].forEach(function(typeName) {
        function requireType() {
          const TypedArrayCtor = jasmine.getGlobal()[typeName];

          if (!TypedArrayCtor) {
            pending('Browser does not support ' + typeName);
          }

          return TypedArrayCtor;
        }

        it(
          'passes for ' + typeName + 's with same length and content',
          function() {
            const TypedArrayCtor = requireType();
            const matchersUtil = new jasmineUnderTest.MatchersUtil();
            const a1 = new TypedArrayCtor(2);
            const a2 = new TypedArrayCtor(2);
            a1[0] = a2[0] = BigInt(0);
            a1[1] = a2[1] = BigInt(1);
            expect(matchersUtil.equals(a1, a2)).toBe(true);
          }
        );

        it('fails for ' + typeName + 's with different length', function() {
          const TypedArrayCtor = requireType();
          const matchersUtil = new jasmineUnderTest.MatchersUtil();
          const a1 = new TypedArrayCtor(2);
          const a2 = new TypedArrayCtor(1);
          a1[0] = a1[1] = a2[0] = BigInt(0);
          expect(matchersUtil.equals(a1, a2)).toBe(false);
        });

        it(
          'fails for ' + typeName + 's with same length but different content',
          function() {
            const TypedArrayCtor = requireType();
            const matchersUtil = new jasmineUnderTest.MatchersUtil();
            const a1 = new TypedArrayCtor(2);
            const a2 = new TypedArrayCtor(2);
            a1[0] = a1[1] = a2[0] = BigInt(0);
            a2[1] = BigInt(1);
            expect(matchersUtil.equals(a1, a2)).toBe(false);
          }
        );
      });
    });

    describe('when running in an environment with array polyfills', function() {
      const findIndexDescriptor = Object.getOwnPropertyDescriptor(
        Array.prototype,
        'findIndex'
      );

      beforeEach(function() {
        if (!findIndexDescriptor) {
          jasmine
            .getEnv()
            .pending(
              'Environment does not have a property descriptor for Array.prototype.findIndex'
            );
        }

        Object.defineProperty(Array.prototype, 'findIndex', {
          enumerable: true,
          value: function(predicate) {
            if (this === null) {
              throw new TypeError(
                'Array.prototype.findIndex called on null or undefined'
              );
            }

            if (typeof predicate !== 'function') {
              throw new TypeError('predicate must be a function');
            }

            const list = Object(this);
            const length = list.length >>> 0;
            const thisArg = arguments[1];

            for (let i = 0; i < length; i++) {
              const value = list[i];
              if (predicate.call(thisArg, value, i, list)) {
                return i;
              }
            }

            return -1;
          }
        });
      });

      afterEach(function() {
        Object.defineProperty(
          Array.prototype,
          'findIndex',
          findIndexDescriptor
        );
      });

      it("passes when there's an array polyfill", function() {
        expect(['foo']).toEqual(['foo']);
      });
    });

    describe('Building diffs for asymmetric equality testers', function() {
      it('diffs the values returned by valuesForDiff_', function() {
        const tester = {
            asymmetricMatch: function() {
              return false;
            },
            valuesForDiff_: function() {
              return {
                self: 'asymmetric tester value',
                other: 'other value'
              };
            }
          },
          actual = { x: 42 },
          expected = { x: tester },
          diffBuilder = jasmine.createSpyObj('diffBuilder', [
            'recordMismatch',
            'withPath',
            'setRoots'
          ]),
          matchersUtil = new jasmineUnderTest.MatchersUtil();

        diffBuilder.withPath.and.callFake(function(p, block) {
          block();
        });
        matchersUtil.equals(actual, expected, diffBuilder);

        expect(diffBuilder.setRoots).toHaveBeenCalledWith(actual, expected);
        expect(diffBuilder.withPath).toHaveBeenCalledWith(
          'x',
          jasmine.any(Function)
        );
        expect(diffBuilder.recordMismatch).toHaveBeenCalledWith();
      });

      it('records both objects when the tester does not implement valuesForDiff', function() {
        const tester = {
            asymmetricMatch: function() {
              return false;
            }
          },
          actual = { x: 42 },
          expected = { x: tester },
          diffBuilder = jasmine.createSpyObj('diffBuilder', [
            'recordMismatch',
            'withPath',
            'setRoots'
          ]),
          matchersUtil = new jasmineUnderTest.MatchersUtil();

        diffBuilder.withPath.and.callFake(function(p, block) {
          block();
        });
        matchersUtil.equals(actual, expected, diffBuilder);

        expect(diffBuilder.setRoots).toHaveBeenCalledWith(actual, expected);
        expect(diffBuilder.withPath).toHaveBeenCalledWith(
          'x',
          jasmine.any(Function)
        );
        expect(diffBuilder.recordMismatch).toHaveBeenCalledWith();
      });
    });

    it('uses a diffBuilder if one is provided as the third argument', function() {
      const diffBuilder = new jasmineUnderTest.DiffBuilder(),
        matchersUtil = new jasmineUnderTest.MatchersUtil();

      spyOn(diffBuilder, 'recordMismatch');
      spyOn(diffBuilder, 'withPath').and.callThrough();

      matchersUtil.equals([1], [2], diffBuilder);
      expect(diffBuilder.withPath).toHaveBeenCalledWith(
        'length',
        jasmine.any(Function)
      );
      expect(diffBuilder.withPath).toHaveBeenCalledWith(
        0,
        jasmine.any(Function)
      );
      expect(diffBuilder.recordMismatch).toHaveBeenCalled();
    });
  });

  describe('contains', function() {
    it('passes when expected is a substring of actual', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.contains('ABC', 'BC')).toBe(true);
    });

    it('fails when expected is a not substring of actual', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.contains('ABC', 'X')).toBe(false);
    });

    it('passes when expected is an element in an actual array', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.contains(['foo', 'bar'], 'foo')).toBe(true);
    });

    it('fails when expected is not an element in an actual array', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.contains(['foo', 'bar'], 'baz')).toBe(false);
    });

    it('passes with mixed-element arrays', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.contains(['foo', { some: 'bar' }], 'foo')).toBe(true);
      expect(
        matchersUtil.contains(['foo', { some: 'bar' }], { some: 'bar' })
      ).toBe(true);
    });

    it('uses custom equality testers if actual is an Array', function() {
      const customTester = function() {
          return true;
        },
        matchersUtil = new jasmineUnderTest.MatchersUtil({
          customTesters: [customTester],
          pp: function() {}
        });

      expect(matchersUtil.contains([1, 2], 3)).toBe(true);
    });

    it('fails when actual is undefined', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.contains(undefined, 'A')).toBe(false);
    });

    it('fails when actual is null', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      expect(matchersUtil.contains(null, 'A')).toBe(false);
    });

    it('works with array-like objects that implement iterable', function() {
      let capturedArgs = null;
      const matchersUtil = new jasmineUnderTest.MatchersUtil();

      function testFunction() {
        capturedArgs = arguments;
      }

      testFunction('foo', 'bar');
      expect(matchersUtil.contains(capturedArgs, 'bar')).toBe(true);
      expect(matchersUtil.contains(capturedArgs, 'baz')).toBe(false);
    });

    it("passes with array-like objects that don't implement iterable", function() {
      const arrayLike = {
        0: 'a',
        1: 'b',
        length: 2
      };
      const matchersUtil = new jasmineUnderTest.MatchersUtil();

      expect(matchersUtil.contains(arrayLike, 'b')).toBe(true);
      expect(matchersUtil.contains(arrayLike, 'c')).toBe(false);
    });

    it('passes for set members', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const setItem = { foo: 'bar' };
      const set = new Set();
      set.add(setItem);

      expect(matchersUtil.contains(set, setItem)).toBe(true);
    });

    it('passes for objects that equal to a set member', function() {
      const matchersUtil = new jasmineUnderTest.MatchersUtil();
      const set = new Set();
      set.add({ foo: 'bar' });

      expect(matchersUtil.contains(set, { foo: 'bar' })).toBe(true);
    });
  });

  describe('buildFailureMessage', function() {
    it('builds an English sentence for a failure case', function() {
      const actual = 'foo',
        name = 'toBar',
        pp = jasmineUnderTest.makePrettyPrinter(),
        matchersUtil = new jasmineUnderTest.MatchersUtil({ pp: pp }),
        message = matchersUtil.buildFailureMessage(name, false, actual);

      expect(message).toEqual("Expected 'foo' to bar.");
    });

    it("builds an English sentence for a 'not' failure case", function() {
      const actual = 'foo',
        name = 'toBar',
        isNot = true,
        pp = jasmineUnderTest.makePrettyPrinter(),
        matchersUtil = new jasmineUnderTest.MatchersUtil({ pp: pp }),
        message = matchersUtil.buildFailureMessage(name, isNot, actual);

      expect(message).toEqual("Expected 'foo' not to bar.");
    });

    it('builds an English sentence for an arbitrary array of expected arguments', function() {
      const actual = 'foo',
        name = 'toBar',
        pp = jasmineUnderTest.makePrettyPrinter(),
        matchersUtil = new jasmineUnderTest.MatchersUtil({ pp: pp }),
        message = matchersUtil.buildFailureMessage(
          name,
          false,
          actual,
          'quux',
          'corge'
        );

      expect(message).toEqual("Expected 'foo' to bar 'quux', 'corge'.");
    });

    it('uses the injected pretty-printer to format the expecteds and actual', function() {
      const actual = 'foo',
        expected1 = 'qux',
        expected2 = 'grault',
        name = 'toBar',
        isNot = false,
        pp = function(value) {
          return '<' + value + '>';
        },
        matchersUtil = new jasmineUnderTest.MatchersUtil({ pp: pp }),
        message = matchersUtil.buildFailureMessage(
          name,
          isNot,
          actual,
          expected1,
          expected2
        );

      expect(message).toEqual('Expected <foo> to bar <qux>, <grault>.');
    });
  });
});
