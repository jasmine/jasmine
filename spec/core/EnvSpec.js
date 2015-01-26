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

  describe("#topSuite", function() {
    it("returns the Jasmine top suite for users to traverse the spec tree", function() {
      var suite = env.topSuite();
      expect(suite.description).toEqual('Jasmine__TopLevel__Suite');
    });
  });
});
