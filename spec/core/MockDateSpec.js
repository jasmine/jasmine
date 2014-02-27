describe("FakeDate", function() {
  it("does not fail if no global date is found", function() {
    var fakeGlobal = {},
      mockDate = new j$.MockDate(fakeGlobal);

    mockDate.install();

    fakeGlobal.Date = jasmine.createSpy("Date");

    mockDate.tick(0);

    expect(fakeGlobal.Date).not.toHaveBeenCalled();
  });

  it("does not replace global Date if it is not installed", function() {
    var fakeDate = jasmine.createSpy("global Date"),
      fakeGlobal = { Date: fakeDate },
      mockDate = new j$.MockDate(fakeGlobal);

    fakeDate.now = function(){};

    expect(fakeDate).toEqual(fakeGlobal.Date);
    mockDate.install();

    expect(fakeDate).not.toEqual(fakeGlobal.Date);
  });

  it("replaces the global Date on uninstall", function() {
    var fakeDate = jasmine.createSpy("global Date"),
      fakeGlobal = { Date: fakeDate },
      mockDate = new j$.MockDate(fakeGlobal);

    fakeDate.now = function(){};

    mockDate.install();
    mockDate.uninstall();

    expect(fakeDate).toEqual(fakeGlobal.Date);

  });

  it("takes the current time as the base when installing without parameters", function() {
    var fakeDate = jasmine.createSpy("global Date"),
      fakeGlobal = { Date: fakeDate },
      mockDate = new j$.MockDate(fakeGlobal);

    fakeGlobal.Date.prototype.getTime = function() {
      return 1000;
    };
    fakeDate.now = function(){ return 1000; };

    mockDate.install();

    expect(new fakeGlobal.Date().getTime()).toEqual(1000);
  });

  it("can accept a date as time base when installing", function() {
    var fakeGlobal = { Date: Date },
      mockDate = new j$.MockDate(fakeGlobal),
      baseDate = new Date(2013, 9, 23);

    mockDate.install(baseDate);

    expect(new fakeGlobal.Date().getTime()).toEqual(baseDate.getTime());
  });


  it("fakes current time when using Date.now()", function() {
    var fakeGlobal = { Date: Date },
      mockDate = new j$.MockDate(fakeGlobal),
      baseDate = new Date(2013, 9, 23);

    mockDate.install(baseDate);

    expect(fakeGlobal.Date.now()).toEqual(baseDate.getTime());
  });

  it("makes time passes using tick", function() {
    var fakeDate = jasmine.createSpy("global Date"),
      fakeGlobal = { Date: fakeDate },
      mockDate = new j$.MockDate(fakeGlobal);

    fakeDate.now = function(){ return 1000; };

    mockDate.install();

    mockDate.tick(100);

    expect(fakeGlobal.Date.now()).toEqual(1100);

    mockDate.tick(1000);

    expect(fakeGlobal.Date.now()).toEqual(2100);
  });

  it("allows to increase 0 milliseconds using tick", function() {
    var fakeDate = jasmine.createSpy("global Date"),
      fakeGlobal = { Date: fakeDate },
      mockDate = new j$.MockDate(fakeGlobal);

    fakeDate.now = function(){ return 1000; };

    mockDate.install();

    mockDate.tick(0);
    expect(fakeGlobal.Date.now()).toEqual(1000);

    mockDate.tick();
    expect(fakeGlobal.Date.now()).toEqual(1000);
  });

  it("allows to create a Date in a different time than now", function() {
    var fakeGlobal = { Date: Date },
      mockDate = new j$.MockDate(fakeGlobal),
      baseDate = new Date(2013, 9, 23, 0, 0, 0, 0);

    mockDate.install(baseDate);

    var otherDate = new fakeGlobal.Date(2013, 9, 23, 0, 0, 1, 0);

    mockDate.tick(1000);

    expect(fakeGlobal.Date.now()).toEqual(otherDate.getTime());
  });

  it("copies all Date properties to the mocked date", function() {
    var fakeGlobal = { Date: Date },
      mockDate = new j$.MockDate(fakeGlobal),
      baseDate = new Date(2013, 9, 23, 0, 0, 0, 0);

    mockDate.install(baseDate);

    var otherDate = new fakeGlobal.Date();

    expect(otherDate).toEqual(jasmine.any(Date));

    expect(fakeGlobal.Date.UTC(2013, 9, 23)).toEqual(Date.UTC(2013, 9, 23));
  });
});
