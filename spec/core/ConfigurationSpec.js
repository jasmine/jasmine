describe('Configuration', function() {
  const standardBooleanKeys = [
    'random',
    'stopOnSpecFailure',
    'stopSpecOnExpectationFailure',
    'failSpecWithNoExpectations',
    'hideDisabled',
    'autoCleanClosures',
    'forbidDuplicateNames',
    'detectLateRejectionHandling',
    'verboseDeprecations'
  ];
  const allKeys = [
    ...standardBooleanKeys,
    'seed',
    'specFilter',
    'extraItStackFrames',
    'extraDescribeStackFrames',
    'safariYieldStrategy'
  ];
  Object.freeze(standardBooleanKeys);
  Object.freeze(allKeys);

  it('provides defaults', function() {
    const subject = new privateUnderTest.Configuration();
    expect(subject.random).toEqual(true);
    expect(subject.seed).toBeNull();
    expect(subject.stopOnSpecFailure).toEqual(false);
    expect(subject.stopSpecOnExpectationFailure).toEqual(false);
    expect(subject.failSpecWithNoExpectations).toEqual(false);
    expect(subject.specFilter).toEqual(jasmine.any(Function));
    expect(subject.specFilter()).toEqual(true);
    expect(subject.hideDisabled).toEqual(false);
    expect(subject.autoCleanClosures).toEqual(true);
    expect(subject.forbidDuplicateNames).toEqual(true);
    expect(subject.verboseDeprecations).toEqual(false);
    expect(subject.detectLateRejectionHandling).toEqual(false);
    expect(subject.extraItStackFrames).toEqual(0);
    expect(subject.extraDescribeStackFrames).toEqual(0);
    expect(subject.safariYieldStrategy).toEqual('count');
  });

  describe('copy()', function() {
    it('returns a copy of the configuration as a plain old JS object', function() {
      const subject = new privateUnderTest.Configuration();

      const copy = subject.copy();

      expect(copy.constructor.name).toEqual('Object');

      expect(new Set(Object.keys(copy))).toEqual(new Set(allKeys));
      for (const k of allKeys) {
        expect(copy[k]).toEqual(subject[k]);
      }
    });
  });

  describe('update()', function() {
    it('does not update properties that are absent from the parameter', function() {
      const subject = new privateUnderTest.Configuration();
      const originalValues = subject.copy();

      subject.update({});
      expect(subject.copy()).toEqual(originalValues);
    });

    function booleanPropertyBehavior(key) {
      it('does not update the property if the specified value is undefined', function() {
        const subject = new privateUnderTest.Configuration();
        const orig = subject[key];

        subject.update({ [key]: undefined });

        expect(subject[key]).toEqual(orig);
      });

      it('updates the property if the specified value is not undefined', function() {
        const subject = new privateUnderTest.Configuration();
        const orig = subject[key];

        subject.update({ [key]: !orig });
        expect(subject[key]).toEqual(!orig);

        subject.update({ [key]: orig });
        expect(subject[key]).toEqual(orig);
      });
    }

    for (const k of standardBooleanKeys) {
      describe(k, function() {
        booleanPropertyBehavior(k);
      });
    }

    it('sets specFilter when truthy', function() {
      const subject = new privateUnderTest.Configuration();
      const orig = subject.specFilter;

      subject.update({ specFilter: undefined });
      expect(subject.specFilter).toBe(orig);

      subject.update({ specFilter: false });
      expect(subject.specFilter).toBe(orig);

      function newSpecFilter() {}
      subject.update({ specFilter: newSpecFilter });
      expect(subject.specFilter).toBe(newSpecFilter);
    });

    it('sets seed when not undefined', function() {
      const subject = new privateUnderTest.Configuration();

      subject.update({ seed: undefined });
      expect(subject.seed).toBeNull();

      subject.update({ seed: 1234 });
      expect(subject.seed).toEqual(1234);

      subject.update({ seed: null });
      expect(subject.seed).toBeNull();
    });

    it('sets extraItStackFrames when not undefined', function() {
      const subject = new privateUnderTest.Configuration();

      subject.update({ extraItStackFrames: undefined });
      expect(subject.extraItStackFrames).toEqual(0);

      subject.update({ extraItStackFrames: 100000 });
      expect(subject.extraItStackFrames).toEqual(100000);
    });

    it('sets extraDescribeStackFrames when not undefined', function() {
      const subject = new privateUnderTest.Configuration();

      subject.update({ extraDescribeStackFrames: undefined });
      expect(subject.extraDescribeStackFrames).toEqual(0);

      subject.update({ extraDescribeStackFrames: 100000 });
      expect(subject.extraDescribeStackFrames).toEqual(100000);
    });

    it('sets safariYieldStrategy when valid', function() {
      const subject = new privateUnderTest.Configuration();

      subject.update({ safariYieldStrategy: undefined });
      expect(subject.safariYieldStrategy).toEqual('count');

      subject.update({ safariYieldStrategy: 'time' });
      expect(subject.safariYieldStrategy).toEqual('time');

      subject.update({ safariYieldStrategy: 'count' });
      expect(subject.safariYieldStrategy).toEqual('count');
    });

    it('rejcts invalid safariYieldStrategy values', function() {
      const subject = new privateUnderTest.Configuration();

      expect(function() {
        subject.update({ safariYieldStrategy: 'thyme' });
      }).toThrowError(
        "Invalid safariYieldStrategy value. Valid values are 'count' and 'time'."
      );
    });
  });
});
