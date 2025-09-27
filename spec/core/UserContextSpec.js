describe('UserContext', function() {
  it('Behaves just like an plain object', function() {
    const context = new privateUnderTest.UserContext(),
      properties = [];

    for (const prop in context) {
      if (obj.hasOwnProperty(prop)) {
        properties.push(prop);
      }
    }

    expect(properties).toEqual([]);
  });

  describe('.fromExisting', function() {
    describe('when using an already built context as model', function() {
      beforeEach(function() {
        this.context = new privateUnderTest.UserContext();
        this.context.key = 'value';
        this.cloned = privateUnderTest.UserContext.fromExisting(this.context);
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
        this.cloned = privateUnderTest.UserContext.fromExisting(this.context);
      });

      it('returns an object with the same attributes', function() {
        expect(this.cloned.key).toEqual(this.value);
      });

      it('does not return the same object', function() {
        expect(this.cloned).not.toBe(this.context);
      });

      it('returns an UserContext', function() {
        expect(this.cloned.constructor).toBe(privateUnderTest.UserContext);
      });
    });
  });
});
