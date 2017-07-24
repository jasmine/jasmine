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
        this.clonned = jasmineUnderTest.UserContext.fromExisting(this.context);
      });

      it('returns a clonned object', function() {
        expect(this.clonned).toEqual(this.context);
      });

      it('does not return the same object', function() {
        expect(this.clonned).not.toBe(this.context);
      });
    });

    describe('when using a regular object as parameter', function() {
      beforeEach(function() {
        this.context = {};
        this.value = 'value'
        this.context.key = this.value;
        this.clonned = jasmineUnderTest.UserContext.fromExisting(this.context);
      });

      it('returns an object with the same attributes', function() {
        expect(this.clonned.key).toEqual(this.value);
      });

      it('does not return the same object', function() {
        expect(this.clonned).not.toBe(this.context);
      });

      it('returns an UserContext', function() {
        expect(this.clonned.constructor).toBe(jasmineUnderTest.UserContext);
      });
    });
  });
});

