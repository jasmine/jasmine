describe('toHaveSpyInteractions', function() {
  it('passes when there are spy interactions', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBe(true);
  });

  it('passes when there are multiple spy interactions', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();
    spyObj.spyB();
    spyObj.spyA();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBe(true);
  });

  it('fails when there are no spy interactions', function() {
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

  it('shows the right message is negated', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBe(true);
    expect(result.message).toContain(
      // Will be shown only on negate.
      'Expected spy object spies not to have been called'
    );
  });

  it('fails when only non-observed spy object interactions are interacted', function() {
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

  it(`throws an error if a non-object is passed`, function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();

    expect(function() {
      matcher.compare(true);
    }).toThrowError(Error, /Expected a spy object, but got/);

    expect(function() {
      matcher.compare(123);
    }).toThrowError(Error, /Expected a spy object, but got/);

    expect(function() {
      matcher.compare('string');
    }).toThrowError(Error, /Expected a spy object, but got/);
  });

  it('throws an error if arguments are passed', function() {
    let matcher = jasmineUnderTest.matchers.toHaveSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    expect(function() {
      matcher.compare(spyObj, 'an argument');
    }).toThrowError(Error, /Does not take arguments/);
  });

  it('throws an error if the spy object has no spies', function() {
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
