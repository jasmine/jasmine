describe("UserContext", function() {
  it("Behaves just like an plain object", function() {
    var context = new jasmineUnderTest.UserContext(),
        properties = [];

    for (var prop in context) {
      if (obj.hasOwnProperty(prop)) {
        properties.push(prop);
      }
    }

    expect(properties).toEqual([]);
  });

  describe('.fromExisting', function() {
    describe('when using an already built context as model', function() {
      beforeEach(function() {
        this.context = new jasmineUnderTest.UserContext();
        this.context.key = 'value';
        this.cloned = jasmineUnderTest.UserContext.fromExisting(this.context);
      });

      it('returns a cloned object', function() {
        expect(this.cloned).toEqual(this.context);
      });

      it('does not return the same object', function() {
        expect(this.cloned).not.toBe(this.context);
      });
    });

    describe('when using a regular object as parameter', function() {
      beforeEach(function() {
        this.context = {};
        this.value = 'value';
        this.context.key = this.value;
        this.cloned = jasmineUnderTest.UserContext.fromExisting(this.context);
      });

      it('returns an object with the same attributes', function() {
        expect(this.cloned.key).toEqual(this.value);
      });

      it('does not return the same object', function() {
        expect(this.cloned).not.toBe(this.context);
      });

      it('returns an UserContext', function() {
        expect(this.cloned.constructor).toBe(jasmineUnderTest.UserContext);
      });
    });
  });

  describe('context generation', function() {
    beforeAll(function() {
      this.id = 1;
      this.name = 'John';
    });

    describe('when changing the context inside the example', function() {
      it('changing the context', function() {
        this.id = 10;
        expect(this.id).toEqual(10);
      });

      it('runs example with clean context', function() {
        expect(this.id).toEqual(1);
      });
    });

    describe('when running a beforeEach', function() {
      beforeEach(function() {
        this.id = 2;
      });

      describe('when overriding a context property with beforeEach', function() {
        it('override beforeAll context property', function() {
          expect(this.id).toEqual(2);
        });
      });

      describe('when changing the context inside the example', function() {
        it('changing the context', function() {
          this.id = 10;
          expect(this.id).toEqual(10);
        });

        it('runs example with clean context', function() {
          expect(this.id).toEqual(2);
        });
      });

      describe('when not overriding a beforeAll property', function() {
        it('carries properties of the context', function() {
          expect(this.name).toEqual('John');
        });
      });

      describe('when having a context inside a context with beforeAll', function() {
        beforeAll(function() {
          this.id = 3;
          this.name = 'Maria'
        });

        describe('when overriding a context property with beforeEach and beforeAll', function() {
          it('Override the context from beforeAll with beforeEach', function() {
            expect(this.id).toEqual(2);
          });
        });

        describe('when overriding a context property with beforeAll', function() {
          it('Override the context from beforeAll with beforeAll', function() {
            expect(this.name).toEqual('Maria');
          });
        });

        describe('when overriding context with beforeEach', function() {
          beforeEach(function() {
            this.id = 4;
            this.name = 'Robert';
          });

          it('Override the context from beforeEach with beforeEach', function() {
            expect(this.id).toEqual(4);
          });

          it('Override the context from beforeEach with beforeEach', function() {
            expect(this.name).toEqual('Robert');
          });
        });
      });
    });
  });
});
