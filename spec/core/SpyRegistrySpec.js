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
        target = {};

      expect(function() {
        spyRegistry.spyOn(target);
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
        target = {};

      expect(function() {
        spyRegistry.spyOn(target, null);
      }).toThrowError(/No method name supplied/);
    });

    it('checks for the existence of the method', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        target = {};

      expect(function() {
        spyRegistry.spyOn(target, 'pants');
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
        target = { spiedFunc: function() {} };

      spyRegistry.spyOn(target, 'spiedFunc');

      expect(function() {
        spyRegistry.spyOn(target, 'spiedFunc');
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
        target = { spiedFunc: scope.myFunc };

      expect(function() {
        spyRegistry.spyOn(scope, 'myFunc');
      }).toThrowError(/is not declared writable or has no setter/);

      expect(function() {
        spyRegistry.spyOn(target, 'spiedFunc');
      }).not.toThrowError(/is not declared writable or has no setter/);
    });

    it('throws if assigning to the property is a no-op', function() {
      const scope = {};

      function original() {
        return 1;
      }

      Object.defineProperty(scope, 'myFunc', {
        get() {
          return original;
        },
        set() {}
      });

      const spyRegistry = new jasmineUnderTest.SpyRegistry({
        createSpy: createSpy
      });
      expect(function() {
        spyRegistry.spyOn(scope, 'myFunc');
      }).toThrowError(
        "<spyOn> : Can't spy on myFunc because assigning to it had no effect"
      );
    });

    it('overrides the method on the object and returns the spy', function() {
      let originalFunctionWasCalled = false;
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
        createSpy: createSpy
      });
      const target = {
        spiedFunc: function() {
          originalFunctionWasCalled = true;
        }
      };

      const spy = spyRegistry.spyOn(target, 'spiedFunc');

      expect(target.spiedFunc).toEqual(spy);
      target.spiedFunc();
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
        target = {};

      expect(function() {
        spyRegistry.spyOnProperty(target);
      }).toThrowError(/No property name supplied/);
    });

    it('checks for the existence of the method', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        target = {};

      expect(function() {
        spyRegistry.spyOnProperty(target, 'pants');
      }).toThrowError(/property does not exist/);
    });

    it('checks for the existence of access type', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry(),
        target = {};

      Object.defineProperty(target, 'pants', {
        get: function() {
          return 1;
        },
        configurable: true
      });

      expect(function() {
        spyRegistry.spyOnProperty(target, 'pants', 'set');
      }).toThrowError(/does not have access type/);
    });

    it('checks if it can be spied upon', function() {
      const target = {};

      Object.defineProperty(target, 'myProp', {
        get: function() {}
      });

      Object.defineProperty(target, 'spiedProp', {
        get: function() {},
        configurable: true
      });

      const spyRegistry = new jasmineUnderTest.SpyRegistry();

      expect(function() {
        spyRegistry.spyOnProperty(target, 'myProp');
      }).toThrowError(/is not declared configurable/);

      expect(function() {
        spyRegistry.spyOnProperty(target, 'spiedProp');
      }).not.toThrowError(/is not declared configurable/);
    });

    it('overrides the property getter on the object and returns the spy', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: createSpy
        }),
        target = {},
        returnValue = 1;

      Object.defineProperty(target, 'spiedProperty', {
        get: function() {
          return returnValue;
        },
        configurable: true
      });

      expect(target.spiedProperty).toEqual(returnValue);

      const spy = spyRegistry.spyOnProperty(target, 'spiedProperty');
      const getter = Object.getOwnPropertyDescriptor(target, 'spiedProperty')
        .get;

      expect(getter).toEqual(spy);
      expect(target.spiedProperty).toBeUndefined();
    });

    it('overrides the property setter on the object and returns the spy', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: createSpy
        }),
        target = {},
        returnValue = 1;

      Object.defineProperty(target, 'spiedProperty', {
        get: function() {
          return returnValue;
        },
        set: function() {},
        configurable: true
      });

      const spy = spyRegistry.spyOnProperty(target, 'spiedProperty', 'set');
      const setter = Object.getOwnPropertyDescriptor(target, 'spiedProperty')
        .set;

      expect(target.spiedProperty).toEqual(returnValue);
      expect(setter).toEqual(spy);
    });

    describe('when the property is already spied upon', function() {
      it('throws an error if respy is not allowed', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
            createSpy: createSpy
          }),
          target = {};

        Object.defineProperty(target, 'spiedProp', {
          get: function() {
            return 1;
          },
          configurable: true
        });

        spyRegistry.spyOnProperty(target, 'spiedProp');

        expect(function() {
          spyRegistry.spyOnProperty(target, 'spiedProp');
        }).toThrowError(/spiedProp#get has already been spied upon/);
      });

      it('returns the original spy if respy is allowed', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
            createSpy: createSpy
          }),
          target = {};

        spyRegistry.allowRespy(true);

        Object.defineProperty(target, 'spiedProp', {
          get: function() {
            return 1;
          },
          configurable: true
        });

        const originalSpy = spyRegistry.spyOnProperty(target, 'spiedProp');

        expect(spyRegistry.spyOnProperty(target, 'spiedProp')).toBe(
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
      const target = Object.create(parent);
      Object.defineProperty(target, 'spied1', {
        value: noop1,
        writable: true,
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(target, 'spied2', {
        value: noop2,
        writable: true,
        configurable: true,
        enumerable: true
      });
      let _spied3 = noop3;
      Object.defineProperty(target, 'spied3', {
        configurable: true,
        set: function(val) {
          _spied3 = val;
        },
        get: function() {
          return _spied3;
        },
        enumerable: true
      });
      target.spied4 = noop4;
      Object.defineProperty(target, 'notSpied2', {
        value: noop2,
        writable: false,
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(target, 'notSpied3', {
        value: noop3,
        writable: true,
        configurable: false,
        enumerable: true
      });
      Object.defineProperty(target, 'notSpied4', {
        configurable: false,
        set: function() {
          /**/
        },
        get: function() {
          return noop4;
        },
        enumerable: true
      });
      Object.defineProperty(target, 'notSpied5', {
        value: noop5,
        writable: true,
        configurable: true,
        enumerable: false
      });
      target.notSpied6 = 6;

      const spiedObject = spyRegistry.spyOnAllFunctions(target);

      expect(target.parentSpied1).toBe('I am a spy');
      expect(target.notSpied2).toBe(noop2);
      expect(target.notSpied3).toBe(noop3);
      expect(target.notSpied4).toBe(noop4);
      expect(target.notSpied5).toBe(noop5);
      expect(target.notSpied6).toBe(6);
      expect(target.spied1).toBe('I am a spy');
      expect(target.spied2).toBe('I am a spy');
      expect(target.spied3).toBe('I am a spy');
      expect(target.spied4).toBe('I am a spy');
      expect(spiedObject).toBe(target);
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

      const target = new MyClass();
      spyRegistry.spyOnAllFunctions(target);

      expect(target.spied1).toBe('I am a spy');
      expect(target.spied2).toBe('I am a spy');
      expect(MyClass.prototype.spied2).toBe(noop2);
    });

    it('does not override non-enumerable properties (like Object.prototype methods)', function() {
      const spyRegistry = new jasmineUnderTest.SpyRegistry({
        createSpy: function() {
          return 'I am a spy';
        }
      });
      const target = {
        spied1: function() {}
      };

      spyRegistry.spyOnAllFunctions(target);

      expect(target.spied1).toBe('I am a spy');
      expect(target.toString).not.toBe('I am a spy');
      expect(target.hasOwnProperty).not.toBe('I am a spy');
    });
    describe('when includeNonEnumerable is true', function() {
      it('does not override Object.prototype methods', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const target = {
          spied1: function() {}
        };

        spyRegistry.spyOnAllFunctions(target, true);

        expect(target.spied1).toBe('I am a spy');
        expect(target.toString).not.toBe('I am a spy');
        expect(target.hasOwnProperty).not.toBe('I am a spy');
      });

      it('overrides non-enumerable properties', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const target = {
          spied1: function() {},
          spied2: function() {}
        };

        Object.defineProperty(target, 'spied2', {
          enumerable: false,
          writable: true,
          configurable: true
        });

        spyRegistry.spyOnAllFunctions(target, true);

        expect(target.spied1).toBe('I am a spy');
        expect(target.spied2).toBe('I am a spy');
      });

      it('should not spy on non-enumerable functions named constructor', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const target = {
          constructor: function() {}
        };

        Object.defineProperty(target, 'constructor', {
          enumerable: false,
          writable: true,
          configurable: true
        });

        spyRegistry.spyOnAllFunctions(target, true);

        expect(target.constructor).not.toBe('I am a spy');
      });

      it('should spy on enumerable functions named constructor', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const target = {
          constructor: function() {}
        };

        spyRegistry.spyOnAllFunctions(target, true);

        expect(target.constructor).toBe('I am a spy');
      });

      it('should not throw an exception if we try and access strict mode restricted properties', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const target = function() {};
        const fn = function() {
          spyRegistry.spyOnAllFunctions(target, true);
        };

        expect(fn).not.toThrow();
      });

      it('should not spy on properties which are more permissable further up the prototype chain', function() {
        const spyRegistry = new jasmineUnderTest.SpyRegistry({
          createSpy: function() {
            return 'I am a spy';
          }
        });
        const targetParent = Object.defineProperty({}, 'sharedProp', {
          value: function() {},
          writable: true,
          configurable: true
        });

        const target = Object.create(targetParent);

        Object.defineProperty(target, 'sharedProp', {
          value: function() {}
        });

        const fn = function() {
          spyRegistry.spyOnAllFunctions(target, true);
        };

        expect(fn).not.toThrow();
        expect(target).not.toBe('I am a spy');
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
        target = { spiedFunc: originalFunction };

      spyRegistry.spyOn(target, 'spiedFunc');
      spyRegistry.clearSpies();

      expect(target.spiedFunc).toBe(originalFunction);
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
        target = { spiedFunc: originalFunction };

      spyRegistry.spyOn(target, 'spiedFunc');

      // replace the original spy with some other function
      target.spiedFunc = function() {};

      // spy on the function in that location again
      spyRegistry.spyOn(target, 'spiedFunc');

      spyRegistry.clearSpies();

      expect(target.spiedFunc).toBe(originalFunction);
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
        targetParent = { spiedFunc: originalFunction };

      const target = Object.create(targetParent);

      expect(target.hasOwnProperty('spiedFunc')).toBe(false);

      spyRegistry.spyOn(target, 'spiedFunc');
      spyRegistry.clearSpies();

      expect(target.hasOwnProperty('spiedFunc')).toBe(false);
      expect(target.spiedFunc).toBe(originalFunction);
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
        targetParent = { spiedFunc: originalFunction };

      const target = Object.create(targetParent);

      spyRegistry.spyOn(target, 'spiedFunc');

      // simulate a spy that cannot be deleted
      Object.defineProperty(target, 'spiedFunc', {
        configurable: false
      });

      spyRegistry.clearSpies();

      expect(jasmineUnderTest.isSpy(target.spiedFunc)).toBe(false);
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
        target = {};

      Object.defineProperty(target, 'spiedProp', {
        get: function() {
          return originalReturn;
        },
        configurable: true
      });

      spyRegistry.spyOnProperty(target, 'spiedProp');
      spyRegistry.clearSpies();

      expect(target.spiedProp).toBe(originalReturn);
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
        targetParent = {};

      Object.defineProperty(targetParent, 'spiedProp', {
        get: function() {
          return originalReturn;
        },
        configurable: true
      });

      const target = Object.create(targetParent);

      expect(target.hasOwnProperty('spiedProp')).toBe(false);

      spyRegistry.spyOnProperty(target, 'spiedProp');
      spyRegistry.clearSpies();

      expect(target.hasOwnProperty('spiedProp')).toBe(false);
      expect(target.spiedProp).toBe(originalReturn);
    });
  });
});
