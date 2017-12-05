describe("Fuzzy Equalities", function() {
  describe('Truthy/Falsy equalities', function() {
    it('allows the test to pass', function() {
      expect({
        name: "Rex",
        id: null,
        description: undefined,
        age: 42,
        tags: [],
      }).toEqual({
        name: jasmineUnderTest.truthy(),
        id: jasmineUnderTest.falsy(),
        description: jasmineUnderTest.falsy(),
        age: jasmineUnderTest.truthy(),
        tags: jasmineUnderTest.truthy()
      })
    })
  });

  if (typeof Set !== 'undefined') {
    describe('empty/notEmpty equalities', function () {
      it('allows the test to pass', function () {
        var tags = new Set(['blue', 'green']);
        expect({
          name: "Rex",
          description: '',
          age: 42,
          tags: tags,
          gps_coord: []
        }).toEqual({
          name: jasmineUnderTest.notEmpty(),
          description: jasmineUnderTest.empty(),
          age: jasmineUnderTest.truthy(),
          tags: jasmineUnderTest.notEmpty(),
          gps_coord: jasmineUnderTest.empty()
        })
      })
    });
  }
});
