describe('Timer', function() {
  it('reports the time elapsed', function() {
    var fakeNow = jasmine.createSpy('fake Date.now'),
      timer = new jasmineUnderTest.Timer({ now: fakeNow });

    fakeNow.and.returnValue(100);
    timer.start();

    fakeNow.and.returnValue(200);

    expect(timer.elapsed()).toEqual(100);
  });

  describe('when date is stubbed, perhaps by other testing helpers', function() {
    var origDate = Date;
    beforeEach(function() {
      // eslint-disable-next-line no-implicit-globals
      Date = jasmine.createSpy('date spy');
    });

    afterEach(function() {
      // eslint-disable-next-line no-implicit-globals
      Date = origDate;
    });

    it('does not throw even though Date was taken away', function() {
      var timer = new jasmineUnderTest.Timer();

      expect(timer.start).not.toThrow();
      expect(timer.elapsed()).toEqual(jasmine.any(Number));
    });
  });
});
