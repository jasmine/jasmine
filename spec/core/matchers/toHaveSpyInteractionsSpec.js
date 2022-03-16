describe('toHaveSpyInteractions', function() {
  it('detects spy interactions', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBe(true);
    expect(result.message).toContain(
      'Expected spy object spies to have been called'
    );
  });

  it('detects multiple spy interactions', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();
    spyObj.spyB();
    spyObj.spyA();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBe(true);
    expect(result.message).toContain(
      'Expected spy object spies to have been called'
    );
  });

  it('detects no spy interactions', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    let result = matcher.compare(spyObj);
    expect(result.pass).toBe(false);
    expect(result.message).toContain(
      'Expected spy object spies to have been called'
    );
  });

  it('ignores non-observed spy object interactions', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);
    spyObj.otherMethod = function() {};

    spyObj.otherMethod();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBe(false);
    expect(result.message).toContain(
      'Expected spy object spies to have been called'
    );
  });

  [true, 123, 'string'].forEach(function(testValue) {
    it(`throws error if a non-object (${testValue}) is passed`, function() {
      let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();

      expect(function() {
        matcher.compare(testValue);
      }).toThrowError(Error, /Expected a spy object, but got/);
    });
  });

  it('throws error if arguments are passed', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    expect(function() {
      matcher.compare(spyObj, 'an argument');
    }).toThrowError(Error, /Does not take arguments/);
  });

  it('throws error if spy object has no spies', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    const spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['notSpy']);
    // Removing spy since spy objects cannot be created without spies.
    spyObj.notSpy = function() {};

    expect(function() {
      matcher.compare(spyObj);
    }).toThrowError(
      Error,
      /Expected a spy object with spies, but object has no spies/
    );
  });
});
