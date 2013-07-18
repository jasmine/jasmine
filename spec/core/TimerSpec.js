describe("Timer", function() {
  it("reports the time elapsed", function() {
    var fakeNow = jasmine.createSpy('fake Date.now'),
        timer = new j$.Timer({now: fakeNow});

    fakeNow.and.callReturn(100);
    timer.start();

    fakeNow.and.callReturn(200);

    expect(timer.elapsed()).toEqual(100);
  });
});
