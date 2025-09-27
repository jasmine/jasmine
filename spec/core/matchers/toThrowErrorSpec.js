describe('toThrowError', function() {
  it('throws an error when the actual is not a function', function() {
    const matcher = privateUnderTest.matchers.toThrowError();

    expect(function() {
      matcher.compare({});
    }).toThrowError(/Actual is not a Function/);
  });

  it('throws an error when the expected is not an Error, string, or RegExp', function() {
    const matcher = privateUnderTest.matchers.toThrowError(),
      fn = function() {
        throw new Error('foo');
      };

    expect(function() {
      matcher.compare(fn, 1);
    }).toThrowError(/Expected is not an Error, string, or RegExp./);
  });

  it('throws an error when the expected error type is not an Error', function() {
    const matcher = privateUnderTest.matchers.toThrowError(),
      fn = function() {
        throw new Error('foo');
      };

    expect(function() {
      matcher.compare(fn, void 0, 'foo');
    }).toThrowError(/Expected error type is not an Error./);
  });

  it('throws an error when the expected error message is not a string or RegExp', function() {
    const matcher = privateUnderTest.matchers.toThrowError(),
      fn = function() {
        throw new Error('foo');
      };

    expect(function() {
      matcher.compare(fn, Error, 1);
    }).toThrowError(/Expected error message is not a string or RegExp./);
  });

  it('fails if actual does not throw at all', function() {
    const matcher = privateUnderTest.matchers.toThrowError(),
      fn = function() {
        return true;
      };

    const result = matcher.compare(fn);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual('Expected function to throw an Error.');
  });

  it('fails if thrown is not an instanceof Error', function() {
    const matcher = privateUnderTest.matchers.toThrowError({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {
        throw 4;
      };

    const result = matcher.compare(fn);
    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      'Expected function to throw an Error, but it threw 4.'
    );
  });

  describe('when error is from another frame', function() {
    function isNotRunningInBrowser() {
      return typeof document === 'undefined';
    }

    let iframe = null;

    afterEach(function() {
      if (iframe !== null) {
        document.body.removeChild(iframe);
      }
    });

    it('passes if thrown is an instanceof Error regardless of global that contains its constructor', function() {
      if (isNotRunningInBrowser()) {
        pending('This test only runs in browsers.');
      }

      const matcher = privateUnderTest.matchers.toThrowError();
      iframe = document.body.appendChild(document.createElement('iframe'));
      iframe.src = 'about:blank';
      const iframeDocument = iframe.contentWindow.document;

      iframeDocument.body.appendChild(
        iframeDocument.createElement('script')
      ).textContent = "function method() { throw new Error('foo'); }";

      const result = matcher.compare(iframe.contentWindow.method);
      expect(result.pass).toBe(true);
      expect(result.message).toEqual(
        'Expected function not to throw an Error, but it threw Error.'
      );
    });
  });

  it('fails with the correct message if thrown is a falsy value', function() {
    const matcher = privateUnderTest.matchers.toThrowError({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {
        throw undefined;
      };

    const result = matcher.compare(fn);
    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      'Expected function to throw an Error, but it threw undefined.'
    );
  });

  it('passes if thrown is a type of Error, but there is no expected error', function() {
    const matcher = privateUnderTest.matchers.toThrowError(),
      fn = function() {
        throw new TypeError();
      };

    const result = matcher.compare(fn);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual(
      'Expected function not to throw an Error, but it threw TypeError.'
    );
  });

  it('passes if thrown is an Error and the expected is the same message', function() {
    const matcher = privateUnderTest.matchers.toThrowError({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {
        throw new Error('foo');
      };

    const result = matcher.compare(fn, 'foo');

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      "Expected function not to throw an exception with message 'foo'."
    );
  });

  it('fails if thrown is an Error and the expected is not the same message', function() {
    const matcher = privateUnderTest.matchers.toThrowError({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {
        throw new Error('foo');
      };

    const result = matcher.compare(fn, 'bar');

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      "Expected function to throw an exception with message 'bar', but it threw an exception with message 'foo'."
    );
  });

  it('passes if thrown is an Error and the expected is a RegExp that matches the message', function() {
    const matcher = privateUnderTest.matchers.toThrowError({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {
        throw new Error('a long message');
      };

    const result = matcher.compare(fn, /long/);

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      'Expected function not to throw an exception with a message matching /long/.'
    );
  });

  it('fails if thrown is an Error and the expected is a RegExp that does not match the message', function() {
    const matcher = privateUnderTest.matchers.toThrowError({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {
        throw new Error('a long message');
      };

    const result = matcher.compare(fn, /foo/);

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      "Expected function to throw an exception with a message matching /foo/, but it threw an exception with message 'a long message'."
    );
  });

  it('passes if thrown is an Error and the expected the same Error', function() {
    const matcher = privateUnderTest.matchers.toThrowError(),
      fn = function() {
        throw new Error();
      };

    const result = matcher.compare(fn, Error);

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual('Expected function not to throw Error.');
  });

  it('passes if thrown is a custom error that takes arguments and the expected is the same error', function() {
    const matcher = privateUnderTest.matchers.toThrowError(),
      CustomError = function CustomError(arg) {
        arg.x;
      },
      fn = function() {
        throw new CustomError({ x: 1 });
      };

    CustomError.prototype = new Error();

    const result = matcher.compare(fn, CustomError);

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      'Expected function not to throw CustomError.'
    );
  });

  it('fails if thrown is an Error and the expected is a different Error', function() {
    const matcher = privateUnderTest.matchers.toThrowError(),
      fn = function() {
        throw new Error();
      };

    const result = matcher.compare(fn, TypeError);

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      'Expected function to throw TypeError, but it threw Error.'
    );
  });

  it('passes if thrown is a type of Error and it is equal to the expected Error and message', function() {
    const matchersUtil = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true),
        pp: privateUnderTest.makePrettyPrinter()
      },
      matcher = privateUnderTest.matchers.toThrowError(matchersUtil),
      fn = function() {
        throw new TypeError('foo');
      };

    const result = matcher.compare(fn, TypeError, 'foo');

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      "Expected function not to throw TypeError with message 'foo'."
    );
  });

  it('passes if thrown is a custom error that takes arguments and it is equal to the expected custom error and message', function() {
    const matchersUtil = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true),
        pp: privateUnderTest.makePrettyPrinter()
      },
      matcher = privateUnderTest.matchers.toThrowError(matchersUtil),
      CustomError = function CustomError(arg) {
        this.message = arg.message;
      },
      fn = function() {
        throw new CustomError({ message: 'foo' });
      };

    CustomError.prototype = new Error();

    const result = matcher.compare(fn, CustomError, 'foo');

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      "Expected function not to throw CustomError with message 'foo'."
    );
  });

  describe('with a string', function() {
    it('fails if thrown is a type of Error and the expected is a different Error', function() {
      const matchersUtil = {
          equals: jasmine.createSpy('delegated-equal').and.returnValue(false),
          pp: privateUnderTest.makePrettyPrinter()
        },
        matcher = privateUnderTest.matchers.toThrowError(matchersUtil),
        fn = function() {
          throw new TypeError('foo');
        };

      const result = matcher.compare(fn, TypeError, 'bar');

      expect(result.pass).toBe(false);
      expect(result.message()).toEqual(
        "Expected function to throw TypeError with message 'bar', but it threw TypeError with message 'foo'."
      );
    });
  });

  describe('with a regex', function() {
    it('fails if thrown is a type of Error and the expected is a different Error', function() {
      const matchersUtil = {
          equals: jasmine.createSpy('delegated-equal').and.returnValue(false),
          pp: privateUnderTest.makePrettyPrinter()
        },
        matcher = privateUnderTest.matchers.toThrowError(matchersUtil),
        fn = function() {
          throw new TypeError('foo');
        };

      const result = matcher.compare(fn, TypeError, /bar/);

      expect(result.pass).toBe(false);
      expect(result.message()).toEqual(
        "Expected function to throw TypeError with a message matching /bar/, but it threw TypeError with message 'foo'."
      );
    });
  });

  it('passes if thrown is a type of Error and has the same type as the expected Error and the message matches the expected message', function() {
    const matchersUtil = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true),
        pp: privateUnderTest.makePrettyPrinter()
      },
      matcher = privateUnderTest.matchers.toThrowError(matchersUtil),
      fn = function() {
        throw new TypeError('foo');
      };

    const result = matcher.compare(fn, TypeError, /foo/);

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual(
      'Expected function not to throw TypeError with a message matching /foo/.'
    );
  });
});
