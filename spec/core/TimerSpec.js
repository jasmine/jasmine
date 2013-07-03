describe("Timer", function() {
  it("reports the time elapsed", function() {
    var fakeNow = jasmine.createSpy('fake Date.now'),
        timer = new j$.Timer({now: fakeNow});

    fakeNow.andReturn(100);
    timer.start();

    fakeNow.andReturn(200);

    expect(timer.elapsed()).toEqual(100);
  });
});
