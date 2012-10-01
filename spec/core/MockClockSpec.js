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

		it('should pass the specified arguments to the callback', function() {
			var aUnicorn = "a unicorn";
			var expectItToBeAUnicorn = function() {
				expect(arguments.length).toEqual(1);
				expect(arguments[0]).toBe(aUnicorn);
			};

			setTimeout(expectItToBeAUnicorn, 0, aUnicorn);
			jasmine.Clock.tick(0);
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

		it('should pass the specified arguments to the callback', function() {
			var aUnicorn = "a unicorn";
			var expectItToBeAUnicorn = function() {
				expect(arguments.length).toEqual(1);
				expect(arguments[0]).toBe(aUnicorn);
			};

			setInterval(expectItToBeAUnicorn, 0, aUnicorn);
			jasmine.Clock.tick(0);
		});
  });

  it("shouldn't complain if you call jasmine.Clock.useMock() more than once", function() {
    jasmine.Clock.useMock();
  });
});
