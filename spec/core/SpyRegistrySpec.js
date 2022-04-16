describe('SpyRegistry', function() {
  function createSpy(name, originalFn) {
    return jasmineUnderTest.Spy(name, originalFn);
  }

  describe('#spyOn', function() {
    it('checks for the existence of the object', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
        createSpy: createSpy
      });
      expect(function() {
        spyRegistry.spyOn(void 0, 'pants');
      }).toThrowError(/could not find an object/);
    });

    it('checks that a method name was passed', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      expect(function() {
        spyRegistry.spyOn(subject);
      }).toThrowError(/No method name supplied/);
    });

    it('checks that the object is not `null`', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry();
      expect(function() {
        spyRegistry.spyOn(null, 'pants');
      }).toThrowError(/could not find an object/);
    });

    it('checks that the method name is not `null`', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      expect(function() {
        spyRegistry.spyOn(subject, null);
      }).toThrowError(/No method name supplied/);
    });

    it('checks for the existence of the method', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      expect(function() {
        spyRegistry.spyOn(subject, 'pants');
      }).toThrowError(/method does not exist/);
    });

    it('checks if it has already been spied upon', function() {
      const spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          },
          createSpy: createSpy
        }),
        subject = { spiedFunc: function() {} };

      spyRegistry.spyOn(subject, 'spiedFunc');

      expect(function() {
        spyRegistry.spyOn(subject, 'spiedFunc');
      }).toThrowError(/has already been spied upon/);
    });

    it('checks if it can be spied upon', function() {
      const scope = {};

      function myFunc() {
        return 1;
      }

      Object.defineProperty(scope, 'myFunc', {
        get: function() {
          return myFunc;
        }
      });

      const spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          }
        }),
        subject = { spiedFunc: scope.myFunc };

      expect(function() {
        spyRegistry.spyOn(scope, 'myFunc');
      }).toThrowError(/is not declared writable or has no setter/);

      expect(function() {
        spyRegistry.spyOn(subject, 'spiedFunc');
      }).not.toThrowError(/is not declared writable or has no setter/);
    });

    it('overrides the method on the object and returns the spy', function() {
      const originalFunctionWasCalled = false,
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: createSpy
        }),
        subject = {
          spiedFunc: function() {
            originalFunctionWasCalled = true;
          }
        };

      const spy = spyRegistry.spyOn(subject, 'spiedFunc');

      expect(subject.spiedFunc).toEqual(spy);
      subject.spiedFunc();
      expect(originalFunctionWasCalled).toBe(false);
    });
  });

  describe('#spyOnProperty', function() {
    it('checks for the existence of the object', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry();
      expect(function() {
        spyRegistry.spyOnProperty(void 0, 'pants');
      }).toThrowError(/could not find an object/);
    });

    it('checks that a property name was passed', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      expect(function() {
        spyRegistry.spyOnProperty(subject);
      }).toThrowError(/No property name supplied/);
    });

    it('checks for the existence of the method', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'pants');
      }).toThrowError(/property does not exist/);
    });

    it('checks for the existence of access type', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        subject = {};

      Object.defineProperty(subject, 'pants', {
        get: function() {
          return 1;
        },
        configurable: true
      });

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'pants', 'set');
      }).toThrowError(/does not have access type/);
    });

    it('checks if it can be spied upon', function() {
      const subject = {};

      Object.defineProperty(subject, 'myProp', {
        get: function() {}
      });

      Object.defineProperty(subject, 'spiedProp', {
        get: function() {},
        configurable: true
      });

      const spyRegistry = new jasmineUnderTest.SpyRegistry();

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'myProp');
      }).toThrowError(/is not declared configurable/);

      expect(function() {
        spyRegistry.spyOnProperty(subject, 'spiedProp');
      }).not.toThrowError(/is not declared configurable/);
    });

    it('overrides the property getter on the object and returns the spy', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: createSpy
        }),
        subject = {},
        returnValue = 1;

      Object.defineProperty(subject, 'spiedProperty', {
        get: function() {
          return returnValue;
        },
        configurable: true
      });

      expect(subject.spiedProperty).toEqual(returnValue);

      const spy = spyRegistry.spyOnProperty(subject, 'spiedProperty');
      const getter = Object.getOwnPropertyDescriptor(subject, 'spiedProperty')
        .get;

      expect(getter).toEqual(spy);
      expect(subject.spiedProperty).toBeUndefined();
    });

    it('overrides the property setter on the object and returns the spy', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: createSpy
        }),
        subject = {},
        returnValue = 1;

      Object.defineProperty(subject, 'spiedProperty', {
        get: function() {
          return returnValue;
        },
        set: function() {},
        configurable: true
      });

      const spy = spyRegistry.spyOnProperty(subject, 'spiedProperty', 'set');
      const setter = Object.getOwnPropertyDescriptor(subject, 'spiedProperty')
        .set;

      expect(subject.spiedProperty).toEqual(returnValue);
      expect(setter).toEqual(spy);
    });

    describe('when the property is already spied upon', function() {
      it('throws an error if respy is not allowed', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
            createSpy: createSpy
          }),
          subject = {};

        Object.defineProperty(subject, 'spiedProp', {
          get: function() {
            return 1;
          },
          configurable: true
        });

        spyRegistry.spyOnProperty(subject, 'spiedProp');

        expect(function() {
          spyRegistry.spyOnProperty(subject, 'spiedProp');
        }).toThrowError(/spiedProp#get has already been spied upon/);
      });

      it('returns the original spy if respy is allowed', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
            createSpy: createSpy
          }),
          subject = {};

        spyRegistry.allowRespy(true);

        Object.defineProperty(subject, 'spiedProp', {
          get: function() {
            return 1;
          },
          configurable: true
        });

        const originalSpy = spyRegistry.spyOnProperty(subject, 'spiedProp');

        expect(spyRegistry.spyOnProperty(subject, 'spiedProp')).toBe(
          originalSpy
        );
      });
    });
  });

  describe('#spyOnAllFunctions', function() {
    it('checks for the existence of the object', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry();
      expect(function() {
        spyRegistry.spyOnAllFunctions(void 0);
      }).toThrowError(/spyOnAllFunctions could not find an object to spy upon/);
    });

    it('overrides all writable and configurable functions of the object and its parents', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
        createSpy: function() {
          return 'I am a spy';
        }
      });
      const createNoop = function() {
        return function() {
          /**/
        };
      };
      const noop1 = createNoop();
      const noop2 = createNoop();
      const noop3 = createNoop();
      const noop4 = createNoop();
      const noop5 = createNoop();

      const parent = {
        parentSpied1: noop1
      };
      const subject = Object.create(parent);
      Object.defineProperty(subject, 'spied1', {
        value: noop1,
        writable: true,
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(subject, 'spied2', {
        value: noop2,
        writable: true,
        configurable: true,
        enumerable: true
      });
      let _spied3 = noop3;
      Object.defineProperty(subject, 'spied3', {
        configurable: true,
        set: function(val) {
          _spied3 = val;
        },
        get: function() {
          return _spied3;
        },
        enumerable: true
      });
      subject.spied4 = noop4;
      Object.defineProperty(subject, 'notSpied2', {
        value: noop2,
        writable: false,
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(subject, 'notSpied3', {
        value: noop3,
        writable: true,
        configurable: false,
        enumerable: true
      });
      Object.defineProperty(subject, 'notSpied4', {
        configurable: false,
        set: function() {
          /**/
        },
        get: function() {
          return noop4;
        },
        enumerable: true
      });
      Object.defineProperty(subject, 'notSpied5', {
        value: noop5,
        writable: true,
        configurable: true,
        enumerable: false
      });
      subject.notSpied6 = 6;

      const spiedObject = spyRegistry.spyOnAllFunctions(subject);

      expect(subject.parentSpied1).toBe('I am a spy');
      expect(subject.notSpied2).toBe(noop2);
      expect(subject.notSpied3).toBe(noop3);
      expect(subject.notSpied4).toBe(noop4);
      expect(subject.notSpied5).toBe(noop5);
      expect(subject.notSpied6).toBe(6);
      expect(subject.spied1).toBe('I am a spy');
      expect(subject.spied2).toBe('I am a spy');
      expect(subject.spied3).toBe('I am a spy');
      expect(subject.spied4).toBe('I am a spy');
      expect(spiedObject).toBe(subject);
    });

    it('overrides prototype methods on the object', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
        createSpy: function() {
          return 'I am a spy';
        }
      });

      const noop1 = function() {};
      const noop2 = function() {};

      const MyClass = function() {
        this.spied1 = noop1;
      };
      MyClass.prototype.spied2 = noop2;

      const subject = new MyClass();
      spyRegistry.spyOnAllFunctions(subject);

      expect(subject.spied1).toBe('I am a spy');
      expect(subject.spied2).toBe('I am a spy');
      expect(MyClass.prototype.spied2).toBe(noop2);
    });

    it('does not override non-enumerable properties (like Object.prototype methods)', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
        createSpy: function() {
          return 'I am a spy';
        }
      });
      const subject = {
        spied1: function() {}
      };

      spyRegistry.spyOnAllFunctions(subject);

      expect(subject.spied1).toBe('I am a spy');
      expect(subject.toString).not.toBe('I am a spy');
      expect(subject.hasOwnProperty).not.toBe('I am a spy');
    });
    describe('when includeNonEnumerable is true', function() {
      it('does not override Object.prototype methods', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const subject = {
          spied1: function() {}
        };

        spyRegistry.spyOnAllFunctions(subject, true);

        expect(subject.spied1).toBe('I am a spy');
        expect(subject.toString).not.toBe('I am a spy');
        expect(subject.hasOwnProperty).not.toBe('I am a spy');
      });

      it('overrides non-enumerable properties', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const subject = {
          spied1: function() {},
          spied2: function() {}
        };

        Object.defineProperty(subject, 'spied2', {
          enumerable: false,
          writable: true,
          configurable: true
        });

        spyRegistry.spyOnAllFunctions(subject, true);

        expect(subject.spied1).toBe('I am a spy');
        expect(subject.spied2).toBe('I am a spy');
      });

      it('should not spy on non-enumerable functions named constructor', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const subject = {
          constructor: function() {}
        };

        Object.defineProperty(subject, 'constructor', {
          enumerable: false,
          writable: true,
          configurable: true
        });

        spyRegistry.spyOnAllFunctions(subject, true);

        expect(subject.constructor).not.toBe('I am a spy');
      });

      it('should spy on enumerable functions named constructor', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const subject = {
          constructor: function() {}
        };

        spyRegistry.spyOnAllFunctions(subject, true);

        expect(subject.constructor).toBe('I am a spy');
      });

      it('should not throw an exception if we try and access strict mode restricted properties', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const subject = function() {};
        const fn = function() {
          spyRegistry.spyOnAllFunctions(subject, true);
        };

        expect(fn).not.toThrow();
      });

      it('should not spy on properties which are more permissable further up the prototype chain', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const subjectParent = Object.defineProperty({}, 'sharedProp', {
          value: function() {},
          writable: true,
          configurable: true
        });

        const subject = Object.create(subjectParent);

        Object.defineProperty(subject, 'sharedProp', {
          value: function() {}
        });

        const fn = function() {
          spyRegistry.spyOnAllFunctions(subject, true);
        };

        expect(fn).not.toThrow();
        expect(subject).not.toBe('I am a spy');
      });
    });
  });

  describe('#clearSpies', function() {
    it('restores the original functions on the spied-upon objects', function() {
      const spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          },
          createSpy: createSpy
        }),
        originalFunction = function() {},
        subject = { spiedFunc: originalFunction };

      spyRegistry.spyOn(subject, 'spiedFunc');
      spyRegistry.clearSpies();

      expect(subject.spiedFunc).toBe(originalFunction);
    });

    it('restores the original functions, even when that spy has been replace and re-spied upon', function() {
      const spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          },
          createSpy: createSpy
        }),
        originalFunction = function() {},
        subject = { spiedFunc: originalFunction };

      spyRegistry.spyOn(subject, 'spiedFunc');

      // replace the original spy with some other function
      subject.spiedFunc = function() {};

      // spy on the function in that location again
      spyRegistry.spyOn(subject, 'spiedFunc');

      spyRegistry.clearSpies();

      expect(subject.spiedFunc).toBe(originalFunction);
    });

    it("does not add a property that the spied-upon object didn't originally have", function() {
      const spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          },
          createSpy: createSpy
        }),
        originalFunction = function() {},
        subjectParent = { spiedFunc: originalFunction };

      const subject = Object.create(subjectParent);

      expect(subject.hasOwnProperty('spiedFunc')).toBe(false);

      spyRegistry.spyOn(subject, 'spiedFunc');
      spyRegistry.clearSpies();

      expect(subject.hasOwnProperty('spiedFunc')).toBe(false);
      expect(subject.spiedFunc).toBe(originalFunction);
    });

    it("restores the original function when it's inherited and cannot be deleted", function() {
      const spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          },
          createSpy: createSpy
        }),
        originalFunction = function() {},
        subjectParent = { spiedFunc: originalFunction };

      const subject = Object.create(subjectParent);

      spyRegistry.spyOn(subject, 'spiedFunc');

      // simulate a spy that cannot be deleted
      Object.defineProperty(subject, 'spiedFunc', {
        configurable: false
      });

      spyRegistry.clearSpies();

      expect(jasmineUnderTest.isSpy(subject.spiedFunc)).toBe(false);
    });

    it('restores window.onerror by overwriting, not deleting', function() {
      function FakeWindow() {}
      FakeWindow.prototype.onerror = function() {};

      const spies = [],
        global = new FakeWindow(),
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          },
          createSpy: createSpy,
          global: global
        });

      spyRegistry.spyOn(global, 'onerror');
      spyRegistry.clearSpies();
      expect(global.onerror).toBe(FakeWindow.prototype.onerror);
      expect(global.hasOwnProperty('onerror')).toBe(true);
    });
  });

  describe('spying on properties', function() {
    it('restores the original properties on the spied-upon objects', function() {
      const spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          },
          createSpy: createSpy
        }),
        originalReturn = 1,
        subject = {};

      Object.defineProperty(subject, 'spiedProp', {
        get: function() {
          return originalReturn;
        },
        configurable: true
      });

      spyRegistry.spyOnProperty(subject, 'spiedProp');
      spyRegistry.clearSpies();

      expect(subject.spiedProp).toBe(originalReturn);
    });

    it("does not add a property that the spied-upon object didn't originally have", function() {
      const spies = [],
        spyRegistry = new jasmineUnderTest.SpyRegistry({
          currentSpies: function() {
            return spies;
          },
          createSpy: createSpy
        }),
        originalReturn = 1,
        subjectParent = {};

      Object.defineProperty(subjectParent, 'spiedProp', {
        get: function() {
          return originalReturn;
        },
        configurable: true
      });

      const subject = Object.create(subjectParent);

      expect(subject.hasOwnProperty('spiedProp')).toBe(false);

      spyRegistry.spyOnProperty(subject, 'spiedProp');
      spyRegistry.clearSpies();

      expect(subject.hasOwnProperty('spiedProp')).toBe(false);
      expect(subject.spiedProp).toBe(originalReturn);
    });
  });
});
