describe('FakeDate', function() {
  it('does not fail if no global date is found', function() {
    const fakeGlobal = {},
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    expect(function() {
      mockDate.install();
      mockDate.tick(0);
      mockDate.uninstall();
    }).not.toThrow();
  });

  it('replaces the global Date when it is installed', function() {
    const globalDate = jasmine
        .createSpy('global Date')
        .and.callFake(function() {
          return {
            getTime: function() {}
          };
        }),
      fakeGlobal = { Date: globalDate },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    expect(fakeGlobal.Date).toEqual(globalDate);
    mockDate.install();

    expect(fakeGlobal.Date).not.toEqual(globalDate);
  });

  it('replaces the global Date on uninstall', function() {
    const globalDate = jasmine
        .createSpy('global Date')
        .and.callFake(function() {
          return {
            getTime: function() {}
          };
        }),
      fakeGlobal = { Date: globalDate },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();
    mockDate.uninstall();

    expect(fakeGlobal.Date).toEqual(globalDate);
  });

  it('takes the current time as the base when installing without parameters', function() {
    const globalDate = jasmine
        .createSpy('global Date')
        .and.callFake(function() {
          return {
            getTime: function() {
              return 1000;
            }
          };
        }),
      fakeGlobal = { Date: globalDate },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();

    globalDate.calls.reset();
    new fakeGlobal.Date();
    expect(globalDate).toHaveBeenCalledWith(1000);
  });

  it('can accept a date as time base when installing', function() {
    const fakeGlobal = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal),
      baseDate = new Date();

    spyOn(baseDate, 'getTime').and.returnValue(123);
    mockDate.install(baseDate);

    expect(new fakeGlobal.Date().getTime()).toEqual(123);
  });

  it('makes real dates', function() {
    const fakeGlobal = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();
    expect(new fakeGlobal.Date()).toEqual(jasmine.any(Date));
    expect(new fakeGlobal.Date() instanceof fakeGlobal.Date).toBe(true);
  });

  it('fakes current time when using Date.now()', function() {
    const globalDate = jasmine
        .createSpy('global Date')
        .and.callFake(function() {
          return {
            getTime: function() {
              return 1000;
            }
          };
        }),
      fakeGlobal = { Date: globalDate };

    globalDate.now = function() {};
    const mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();

    expect(fakeGlobal.Date.now()).toEqual(1000);
  });

  it('makes time passes using tick', function() {
    const globalDate = jasmine
        .createSpy('global Date')
        .and.callFake(function() {
          return {
            getTime: function() {
              return 1000;
            }
          };
        }),
      fakeGlobal = { Date: globalDate };

    globalDate.now = function() {};
    const mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();

    mockDate.tick(100);

    expect(fakeGlobal.Date.now()).toEqual(1100);

    mockDate.tick(1000);

    expect(fakeGlobal.Date.now()).toEqual(2100);
  });

  it('allows to increase 0 milliseconds using tick', function() {
    const globalDate = jasmine
        .createSpy('global Date')
        .and.callFake(function() {
          return {
            getTime: function() {
              return 1000;
            }
          };
        }),
      fakeGlobal = { Date: globalDate };

    globalDate.now = function() {};
    const mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();

    mockDate.tick(0);
    expect(fakeGlobal.Date.now()).toEqual(1000);

    mockDate.tick();
    expect(fakeGlobal.Date.now()).toEqual(1000);
  });

  it('allows creation of a Date in a different time than the mocked time', function() {
    const fakeGlobal = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();

    const otherDate = new fakeGlobal.Date(2013, 9, 23, 0, 0, 1, 0);
    expect(otherDate.getTime()).toEqual(
      new Date(2013, 9, 23, 0, 0, 1, 0).getTime()
    );
  });

  it("allows creation of a Date that isn't fully specified", function() {
    const fakeGlobal = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();

    const otherDate = new fakeGlobal.Date(2013, 9, 23);
    expect(otherDate.getTime()).toEqual(new Date(2013, 9, 23).getTime());
  });

  it('allows creation of a Date with millis', function() {
    const fakeGlobal = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal),
      now = new Date(2014, 3, 15).getTime();

    mockDate.install();

    const otherDate = new fakeGlobal.Date(now);
    expect(otherDate.getTime()).toEqual(now);
  });

  it('copies all Date properties to the mocked date', function() {
    const fakeGlobal = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal);

    mockDate.install();

    expect(fakeGlobal.Date.UTC(2013, 9, 23)).toEqual(Date.UTC(2013, 9, 23));
  });

  describe('Intl.DateTimeFormat mocking', function() {
    let fakeGlobal, mockDate, mockEnv;

    beforeEach(function() {
      fakeGlobal = {
        Date: Date,
        Intl: typeof Intl !== 'undefined' ? Intl : null
      };
      mockEnv = {
        configuration: function() {
          return { mockIntlDateTimeFormat: true };
        }
      };
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal, mockEnv);
    });

    it('mocks DateTimeFormat.format() without arguments', function() {
      mockDate.install(new Date(2020, 11, 20, 10, 10));

      const formatter = new fakeGlobal.Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });

      const mockedTime = Date.UTC(2020, 11, 20, 10, 10);
      expect(new fakeGlobal.Date().getTime()).toEqual(mockedTime);
      expect(fakeGlobal.Date.now()).toEqual(mockedTime);

      expect(formatter.format()).toEqual('12/20/2020');
      expect(formatter.format(new fakeGlobal.Date())).toEqual('12/20/2020');
    });

    it('mocks DateTimeFormat.formatToParts() without arguments', function() {
      mockDate.install(new Date(2020, 11, 20, 10, 10));

      const formatter = new fakeGlobal.Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });

      const expected = [
        { type: 'month', value: '12' },
        { type: 'literal', value: '/' },
        { type: 'day', value: '20' },
        { type: 'literal', value: '/' },
        { type: 'year', value: '2020' }
      ];

      expect(formatter.formatToParts()).toEqual(expected);
      expect(formatter.formatToParts(new fakeGlobal.Date())).toEqual(expected);
    });

    it('preserves other DateTimeFormat methods', function() {
      mockDate.install(new Date(2020, 11, 20, 10, 10));

      const formatter = new fakeGlobal.Intl.DateTimeFormat('en-US');

      expect(typeof formatter.resolvedOptions).toEqual('function');
      expect(formatter.resolvedOptions().locale).toEqual('en-US');
    });

    it('restores original Intl on uninstall', function() {
      const originalIntl = fakeGlobal.Intl;
      mockDate.install(new Date(2020, 11, 20, 10, 10));

      const formatter = new fakeGlobal.Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });

      expect(formatter.format()).toEqual('12/20/2020');

      mockDate.uninstall();

      expect(fakeGlobal.Intl).toBe(originalIntl);

      const restoredFormatter = new fakeGlobal.Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });

      expect(restoredFormatter.format()).not.toEqual('12/20/2020');
    });

    it('handles explicit date arguments normally', function() {
      mockDate.install(new Date(2020, 11, 20, 10, 10));

      const formatter = new fakeGlobal.Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });

      const explicitDate = new Date(2019, 0, 15);
      expect(formatter.format(explicitDate)).toEqual('1/15/2019');
    });

    it('does not install Intl mocking when configuration disabled', function() {
      mockEnv.configuration = function() {
        return { mockIntlDateTimeFormat: false };
      };

      const mockDateWithoutIntl = new jasmineUnderTest.MockDate(
        fakeGlobal,
        mockEnv
      );
      mockDateWithoutIntl.install(new Date(2020, 11, 20, 10, 10));

      expect(fakeGlobal.Intl).toBe(Intl);
    });
  });
});
