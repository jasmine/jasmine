describe("install jasmine (usually on global or window)", function() {

  it("should install jasmine and the the top-level jasmine functions on the target object", function() {
    var target = {};
    jasmine.install(target);
    
    expect(target.jasmine                     ).toEqual(jasmine);
    
    expect(target.describe.toString()         ).toEqual(describe.toString());
    expect(target.xdescribe.toString()        ).toEqual(xdescribe.toString());
    expect(target.it.toString()               ).toEqual(it.toString());
    expect(target.xit.toString()              ).toEqual(xit.toString());
    expect(target.beforeEach.toString()       ).toEqual(beforeEach.toString());
    expect(target.afterEach.toString()        ).toEqual(afterEach.toString());
    expect(target.expect.toString()           ).toEqual(expect.toString());
    expect(target.spyOn.toString()            ).toEqual(spyOn.toString());
    expect(target.runs.toString()             ).toEqual(runs.toString());
    expect(target.waits.toString()            ).toEqual(waits.toString());
    expect(target.waitsFor.toString()         ).toEqual(waitsFor.toString());
  });
  
});
