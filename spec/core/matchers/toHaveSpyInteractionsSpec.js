describe('toHaveSpyInteractions', function() {
  let spyObj;
  beforeEach(function() {
    spyObj = jasmine.createSpyObj('NewClass', ['spyA', 'spyB']);
    spyObj.otherMethod = function() {};
  });

  it('detects spy interactions', function() {
    spyObj.spyA();
    expect(spyObj).toHaveSpyInteractions();
  });

  it('detects multiple spy interactions', function() {
    spyObj.spyA();
    spyObj.spyB();
    spyObj.spyA();
    expect(spyObj).toHaveSpyInteractions();
  });

  it('detects no spy interactions', function() {
    expect(spyObj).not.toHaveSpyInteractions();
  });

  it('ignores non-observed spy object interactions', function() {
    spyObj.otherMethod();
    expect(spyObj).not.toHaveSpyInteractions();
  });

  [true, 123, 'string'].forEach(function(testValue) {
    it(`throws error if a non-object (${testValue}) is passed`, function() {
      expect(function() {
        expect(true).toHaveSpyInteractions();
      }).toThrowError(Error, /Expected a spy object, but got/);
    });
  });

  [['argument'], [false, 0]].forEach(function(testValue) {
    it(`throws error if arguments (${testValue}) are passed`, function() {
      expect(function() {
        expect(spyObj).toHaveSpyInteractions(...testValue);
      }).toThrowError(Error, /Does not take arguments/);
    });
  });

  it('throws error if spy object has no spies', function() {
    const newSpyObj = jasmine.createSpyObj('OtherClass', ['method']);
    // Removing spy since spy objects cannot be created without spies.
    newSpyObj.method = function() {};

    expect(function() {
      expect(newSpyObj).toHaveSpyInteractions();
    }).toThrowError(
      Error,
      /Expected a spy object with spies, but object has no spies/
    );
  });
});
