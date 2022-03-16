describe('toHaveSpyInteractions', () => {
  let spyObj;
  beforeEach(() => {
    spyObj = jasmineUnderTest.createSpyObj('NewClass', ['spyA', 'spyB']);
    spyObj.otherMethod = function() {};
  });

  it('detects spy interactions', () => {
    spyObj.spyA();
    expect(spyObj).toHaveSpyInteractions();
  });

  it('detects multiple spy interactions', () => {
    spyObj.spyA();
    spyObj.spyB();
    spyObj.spyA();
    expect(spyObj).toHaveSpyInteractions();
  });

  it('detects no spy interactions', () => {
    expect(spyObj).not.toHaveSpyInteractions();
  });

  it('ignores non-observed spy object interactions', () => {
    spyObj.otherMethod();
    expect(spyObj).not.toHaveSpyInteractions();
  });

  [true, 123, 'string'].forEach(testValue => {
    it(`throws error if a non-object (${testValue}) is passed`, () => {
      expect(() => {
        expect(true).toHaveSpyInteractions();
      }).toThrowError(Error, /Expected a spy object, but got/);
    });
  });

  [['argument'], [false, 0]].forEach(testValue => {
    it(`throws error if arguments (${testValue}) are passed`, () => {
      expect(() => {
        expect(spyObj).toHaveSpyInteractions(...testValue);
      }).toThrowError(Error, /Does not take arguments/);
    });
  });

  it('throws error if spy object has no spies', () => {
    const newSpyObj = jasmine.createSpyObj('OtherClass', ['method']);
    // Removing spy since spy objects cannot be created without spies.
    newSpyObj.method = function() {};

    expect(() => {
      expect(newSpyObj).toHaveSpyInteractions();
    }).toThrowError(
      Error,
      /Expected a spy object with spies, but object has no spies/
    );
  });
});
