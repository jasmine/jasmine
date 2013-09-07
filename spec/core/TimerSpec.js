describe("Timer", function() {
  it("reports the time elapsed", function() {
    var fakeNow = jasmine.createSpy('fake Date.now'),
        timer = new j$.Timer({now: fakeNow});

    fakeNow.and.returnValue(100);
    timer.start();

    fakeNow.and.returnValue(200);

    expect(timer.elapsed()).toEqual(100);
  });
});
