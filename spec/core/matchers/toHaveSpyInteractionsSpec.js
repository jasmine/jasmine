describe('toHaveSpyInteractions', function() {
  it('detects spy interactions', function() {
    let spyObj = jasmineUnderTest.getEnv().createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();

    expect(spyObj).toHaveSpyInteractions();
  });

  it('detects multiple spy interactions', function() {
    let spyObj = jasmineUnderTest.getEnv().createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.spyA();
    spyObj.spyB();
    spyObj.spyA();

    expect(spyObj).toHaveSpyInteractions();
  });

  it('detects no spy interactions', function() {
    let spyObj = jasmineUnderTest.getEnv().createSpyObj('NewClass', ['spyA', 'spyB']);

    expect(spyObj).not.toHaveSpyInteractions();
  });

  it('ignores non-observed spy object interactions', function() {
    let spyObj = jasmineUnderTest.getEnv().createSpyObj('NewClass', ['spyA', 'spyB']);

    spyObj.otherMethod();

    expect(spyObj).not.toHaveSpyInteractions();
  });

  [true, 123, 'string'].forEach(function(testValue) {
    it(`throws error if a non-object (${testValue}) is passed`, function() {
      let spyObj = jasmineUnderTest.getEnv().createSpyObj('NewClass', ['spyA', 'spyB']);

      expect(function() {
        expect(true).toHaveSpyInteractions();
      }).toThrowError(Error, /Expected a spy object, but got/);
    });
  });

  [['argument'], [false, 0]].forEach(function(testValue) {
    it(`throws error if arguments (${testValue}) are passed`, function() {
      let spyObj = jasmineUnderTest.getEnv().createSpyObj('NewClass', ['spyA', 'spyB']);

      expect(function() {
        expect(spyObj).toHaveSpyInteractions(...testValue);
      }).toThrowError(Error, /Does not take arguments/);
    });
  });

  it('throws error if spy object has no spies', function() {
    const spyObj = jasmineUnderTest.getEnv().createSpyObj('NewClass', ['method']);
    // Removing spy since spy objects cannot be created without spies.
    spyObj.method = function() {};

    expect(function() {
      expect(spyObj).toHaveSpyInteractions();
    }).toThrowError(
      Error,
      /Expected a spy object with spies, but object has no spies/
    );
  });
});
