describe('ExampleSuite', function () {
  it('should have a passing test', function() {
      expect(true).toEqual(true);
  });

  describe('Nested Describe', function () {
     it('should also have a passing test', function () {
        expect(true).toEqual(true);
     });
  });
});