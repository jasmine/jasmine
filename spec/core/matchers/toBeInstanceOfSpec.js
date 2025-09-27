describe('toBeInstanceOf', function() {
  describe('when expecting Number', function() {
    it('passes for literal number', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(3, Number);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of Number not to be an instance of Number'
      });
    });

    it('passes for NaN', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf({
        pp: privateUnderTest.makePrettyPrinter()
      });
      const result = matcher.compare(NaN, Number);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of NaN not to be an instance of Number'
      });
    });

    it('passes for Infinity', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(Infinity, Number);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of Number not to be an instance of Number'
      });
    });

    it('fails for a non-number', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare('foo', Number);
      expect(result).toEqual({
        pass: false,
        message: 'Expected instance of String to be an instance of Number'
      });
    });
  });

  describe('when expecting String', function() {
    it('passes for a string', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare('foo', String);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of String not to be an instance of String'
      });
    });

    it('fails for a non-string', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare({}, String);
      expect(result).toEqual({
        pass: false,
        message: 'Expected instance of Object to be an instance of String'
      });
    });
  });

  describe('when expecting Boolean', function() {
    it('passes for a boolean', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(true, Boolean);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of Boolean not to be an instance of Boolean'
      });
    });

    it('fails for a non-boolean', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare('false', Boolean);
      expect(result).toEqual({
        pass: false,
        message: 'Expected instance of String to be an instance of Boolean'
      });
    });
  });

  describe('when expecting RegExp', function() {
    it('passes for a literal regular expression', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(/foo/, RegExp);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of RegExp not to be an instance of RegExp'
      });
    });
  });

  describe('when expecting Function', function() {
    it('passes for a function', function() {
      const fn = function() {};

      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(fn, Function);
      expect(result).toEqual({
        pass: true,
        message:
          'Expected instance of Function not to be an instance of Function'
      });
    });

    it('passes for an async function', function() {
      async function fn() {
        return 'foo';
      }

      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(fn, Function);
      expect(result).toEqual({
        pass: true,
        message:
          'Expected instance of AsyncFunction not to be an instance of Function'
      });
    });
  });

  describe('when expecting Object', function() {
    function Animal() {}

    it('passes for any object', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare({ foo: 'bar' }, Object);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of Object not to be an instance of Object'
      });
    });

    it('passes for an Error object', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(new Error('example'), Object);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of Error not to be an instance of Object'
      });
    });

    it('passes for a user-defined class', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(new Animal(), Object);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of Animal not to be an instance of Object'
      });
    });

    it('fails for a non-object', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare('foo', Object);
      expect(result).toEqual({
        pass: false,
        message: 'Expected instance of String to be an instance of Object'
      });
    });

    it('passes for objects with no constructor', function() {
      const object = Object.create(null);

      const matcher = privateUnderTest.matchers.toBeInstanceOf({
        pp: privateUnderTest.makePrettyPrinter()
      });
      const result = matcher.compare(object, Object);
      expect(result).toEqual({
        pass: true,
        message:
          'Expected instance of null({  }) not to be an instance of Object'
      });
    });
  });

  describe('when expecting a user-defined class', function() {
    // Base class
    function Animal() {}

    // Subclasses, defined using syntax that is as old as possible
    function Dog() {
      Animal.call(this);
    }
    Dog.prototype = new Animal();
    Dog.prototype.constructor = Dog;

    function Cat() {
      Animal.call(this);
    }
    Cat.prototype = new Animal();
    Cat.prototype.constructor = Cat;

    it('passes for instances of that class', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(new Animal(), Animal);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of Animal not to be an instance of Animal'
      });
    });

    it('passes for instances of a subclass', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(new Cat(), Animal);
      expect(result).toEqual({
        pass: true,
        message: 'Expected instance of Cat not to be an instance of Animal'
      });
    });

    it('does not pass for sibling classes', function() {
      const matcher = privateUnderTest.matchers.toBeInstanceOf();
      const result = matcher.compare(new Dog(), Cat);
      expect(result).toEqual({
        pass: false,
        message: 'Expected instance of Dog to be an instance of Cat'
      });
    });
  });

  it('raises an error if passed an invalid expected value', function() {
    const matcher = privateUnderTest.matchers.toBeInstanceOf();
    expect(function() {
      matcher.compare({}, 'Error');
    }).toThrowError(
      '<toBeInstanceOf> : Expected value is not a constructor function\n' +
        'Usage: expect(value).toBeInstanceOf(<ConstructorFunction>)'
    );
  });

  it('raises an error if missing an expected value', function() {
    const matcher = privateUnderTest.matchers.toBeInstanceOf({
      pp: privateUnderTest.makePrettyPrinter()
    });
    expect(function() {
      matcher.compare({}, undefined);
    }).toThrowError(
      '<toBeInstanceOf> : Expected value is not a constructor function\n' +
        'Usage: expect(value).toBeInstanceOf(<ConstructorFunction>)'
    );
  });
});
