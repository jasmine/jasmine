describe('toHaveNoOtherSpyInteractions', function() {
  it('passes when there are no spy interactions', function() {
    let matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    let result = matcher.compare(spyObj);
    expect(result.pass).toBeTrue();
  });

  it('passes when there are multiple spy interactions where checked by toHaveBeenCalled', function() {
    let matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions();
    let toHaveBeenCalledMatcher = jasmineUnderTest.matchers.toHaveBeenCalled();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();
    spyObj.spyB();
    spyObj.spyA();
    toHaveBeenCalledMatcher.compare(spyObj.spyA);
    toHaveBeenCalledMatcher.compare(spyObj.spyB);
    let result = matcher.compare(spyObj);
    expect(result.pass).toBeTrue();
  });

  it('fails when there are spy interactions', function() {
    let matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBeFalse();
    expect(result.message).toContain(
      "Unverified spies' calls have been found in:"
    );
  });

  it('shows the right message is negated', function() {
    let matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();
    spyObj.spyB();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBeFalse(),
      expect(result.message).toContain(
        "Unverified spies' calls have been found in:"
      );
  });

  it('passes when only non-observed spy object interactions are interacted', function() {
    let matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);
    spyObj.otherMethod = function() {};

    spyObj.otherMethod();

    let result = matcher.compare(spyObj);
    expect(result.pass).toBeTrue();
    expect(result.message).toContain("Spies' calls are all verified.");
  });

  it(`throws an error if a non-object is passed`, function() {
    let matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions();

    expect(function() {
      matcher.compare(true);
    }).toThrowError(Error, /Expected an object, but got/);

    expect(function() {
      matcher.compare(123);
    }).toThrowError(Error, /Expected an object, but got/);

    expect(function() {
      matcher.compare('string');
    }).toThrowError(Error, /Expected an object, but got/);
  });

  it('throws an error if arguments are passed', function() {
    let matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions();
    let spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['spyA', 'spyB']);

    expect(function() {
      matcher.compare(spyObj, 'an argument');
    }).toThrowError(Error, /Does not take arguments/);
  });

  it('throws an error if the spy object has no spies', function() {
    let matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions();
    const spyObj = jasmineUnderTest
      .getEnv()
      .createSpyObj('NewClass', ['notSpy']);
    // Removing spy since spy objects cannot be created without spies.
    spyObj.notSpy = function() {};

    expect(function() {
      matcher.compare(spyObj);
    }).toThrowError(
      Error,
      /Expected an object with spies, but object has no spies/
    );
  });

  it('handles multiple interactions with a single spy', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.matchers.toHaveNoOtherSpyInteractions(),
      toHaveBeenCalledWithMatcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(
        matchersUtil
      ),
      spyObj = jasmineUnderTest
        .getEnv()
        .createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA('x');
    spyObj.spyA('y');

    toHaveBeenCalledWithMatcher.compare(spyObj.spyA, 'x');

    let result = matcher.compare(spyObj);

    expect(result.pass).toBeFalse();
  });
});
