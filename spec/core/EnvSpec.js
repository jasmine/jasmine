// TODO: Fix these unit tests!
describe("Env", function() {
  var env;
  beforeEach(function() {
    env = new j$.Env();
  });

  describe("#pending", function() {
    it("throws the Pending Spec exception", function() {
      expect(function() {
        env.pending();
      }).toThrow(j$.Spec.pendingSpecExceptionMessage);
    });

    it("throws the Pending Spec exception with a custom message", function() {
      expect(function() {
        env.pending('custom message');
      }).toThrow(j$.Spec.pendingSpecExceptionMessage + 'custom message');
    });
  });

  describe('#xit', function() {
    var spyPend, spyIt, pendingReason;
    beforeEach(function() {
      spyPend = jasmine.createSpy('pend');
      spyIt = spyOn(env, 'it').and.returnValue({pend: spyPend});
      pendingReason = 'pending spec reason';
    });

    it('can take a message argument and passes it to spec.pend', function() {
      env.xit('pending spec description', function() {
        expect(true).toEqual(true);
      }, pendingReason);

      expect(spyPend).toHaveBeenCalledWith(pendingReason);
    });

    it('can take a timeout and message', function() {
      var pendingSpecDescription = 'pending spec description';
      var timeout = 1000;
      var specdFunction = function() {
        expect(true).toEqual(true);
      };
      env.xit(pendingSpecDescription, specdFunction, timeout, pendingReason);

      expect(spyIt).toHaveBeenCalledWith(pendingSpecDescription, specdFunction, timeout);
      expect(spyPend).toHaveBeenCalledWith(pendingReason);
    });
  });

  describe("#topSuite", function() {
    it("returns the Jasmine top suite for users to traverse the spec tree", function() {
      var suite = env.topSuite();
      expect(suite.description).toEqual('Jasmine__TopLevel__Suite');
    });
  });

  it('can configure specs to throw errors on expectation failures', function() {
    env.throwOnExpectationFailure(true);

    spyOn(j$, 'Spec');
    env.it('foo', function() {});
    expect(j$.Spec).toHaveBeenCalledWith(jasmine.objectContaining({
      throwOnExpectationFailure: true
    }));
  });

  it('can configure suites to throw errors on expectation failures', function() {
    env.throwOnExpectationFailure(true);

    spyOn(j$, 'Suite');
    env.describe('foo', function() {});
    expect(j$.Suite).toHaveBeenCalledWith(jasmine.objectContaining({
      throwOnExpectationFailure: true
    }));
  });
});
