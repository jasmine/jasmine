// TODO: Fix these unit tests!
describe("Env", function() {
  var env;
  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  describe("#pending", function() {
    it("throws the Pending Spec exception", function() {
      expect(function() {
        env.pending();
      }).toThrow(jasmineUnderTest.Spec.pendingSpecExceptionMessage);
    });

    it("throws the Pending Spec exception with a custom message", function() {
      expect(function() {
        env.pending('custom message');
      }).toThrow(jasmineUnderTest.Spec.pendingSpecExceptionMessage + 'custom message');
    });
  });

  describe("#topSuite", function() {
    it("returns the Jasmine top suite for users to traverse the spec tree", function() {
      var suite = env.topSuite();
      expect(suite.description).toEqual('Jasmine__TopLevel__Suite');
    });
  });

  describe('#describe', function () {
    it("when callback takes any arguments throws error", function() {
      var spec = function(done){};
      expect(function() {
        env.describe('done method', spec);
      }).toThrow(new Error('describe does not expect any arguments'));
    });
  });

  it('can configure specs to throw errors on expectation failures', function() {
    env.throwOnExpectationFailure(true);

    spyOn(jasmineUnderTest, 'Spec');
    env.it('foo', function() {});
    expect(jasmineUnderTest.Spec).toHaveBeenCalledWith(jasmine.objectContaining({
      throwOnExpectationFailure: true
    }));
  });

  it('can configure suites to throw errors on expectation failures', function() {
    env.throwOnExpectationFailure(true);

    spyOn(jasmineUnderTest, 'Suite');
    env.describe('foo', function() {});
    expect(jasmineUnderTest.Suite).toHaveBeenCalledWith(jasmine.objectContaining({
      throwOnExpectationFailure: true
    }));
  });

  describe('#xit', function() {
    it('calls spec.pend with "Temporarily disabled with xit"', function() {
      var pendSpy = jasmine.createSpy();
      spyOn(env, 'it').and.returnValue({
        pend: pendSpy
      });
      env.xit();
      expect(pendSpy).toHaveBeenCalledWith('Temporarily disabled with xit');
    });
  });
});
