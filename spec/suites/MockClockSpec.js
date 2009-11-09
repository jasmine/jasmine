describe("MockClock", function () {

  beforeEach(function() {
    jasmine.Clock.useMock();    
  });

  describe("setTimeout", function () {
    it("should mock the clock when useMock is in a beforeEach", function() {
      var expected = false;
      setTimeout(function() {
        expected = true;
      }, 30000);
      expect(expected).toBe(false);
      jasmine.Clock.tick(30001);
      expect(expected).toBe(true);
    });
  });

  describe("setInterval", function () {
    it("should mock the clock when useMock is in a beforeEach", function() {
      var interval = 0;
      setInterval(function() {
        interval++;
      }, 30000);
      expect(interval).toEqual(0);
      jasmine.Clock.tick(30001);
      expect(interval).toEqual(1);
      jasmine.Clock.tick(30001);
      expect(interval).toEqual(2);
      jasmine.Clock.tick(1);
      expect(interval).toEqual(2);
    });
  });
});
