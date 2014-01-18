// TODO: Fix these unit tests!
describe("Env", function() {
  var env;
  beforeEach(function() {
    env = new j$.Env();
  });

  it('removes all spies when env is executed', function(done) {
    var originalFoo = function() {},
      testObj = {
        foo: originalFoo
      },
      firstSpec = jasmine.createSpy('firstSpec').and.callFake(function() {
        env.spyOn(testObj, 'foo');
      }),
      secondSpec = jasmine.createSpy('secondSpec').and.callFake(function() {
        expect(testObj.foo).toBe(originalFoo);
      });
      env.describe('test suite', function() {
        env.it('spec 0', firstSpec);
        env.it('spec 1', secondSpec);
      });

    var assertions = function() {
      expect(firstSpec).toHaveBeenCalled();
      expect(secondSpec).toHaveBeenCalled();
      done();
    };

    env.addReporter({ jasmineDone: assertions });

    env.execute();
  });

  describe("#spyOn", function() {
    it("checks for the existence of the object", function() {
      expect(function() {
        env.spyOn(void 0, 'pants');
      }).toThrowError(/could not find an object/);
    });

    it("checks for the existence of the method", function() {
      var subject = {};

      expect(function() {
        env.spyOn(subject, 'pants');
      }).toThrowError(/method does not exist/);
    });

    it("checks if it has already been spied upon", function() {
      var subject = { spiedFunc: function() {} };

      env.spyOn(subject, 'spiedFunc');

      expect(function() {
        env.spyOn(subject, 'spiedFunc');
      }).toThrowError(/has already been spied upon/);
    });

    it("overrides the method on the object and returns the spy", function() {
      var originalFunctionWasCalled = false;
      var subject = { spiedFunc: function() { originalFunctionWasCalled = true; } };

      var spy = env.spyOn(subject, 'spiedFunc');

      expect(subject.spiedFunc).toEqual(spy);
    });
  });

  describe("#pending", function() {
    it("throws the Pending Spec exception", function() {
      expect(function() {
        env.pending();
      }).toThrow(j$.Spec.pendingSpecExceptionMessage);
    });
  });

  describe("#topSuite", function() {
    it("returns the Jasmine top suite for users to traverse the spec tree", function() {
      var suite = env.topSuite();
      expect(suite.description).toEqual('Jasmine__TopLevel__Suite');
    });
  });
});

