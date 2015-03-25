// TODO: Fix these unit tests!
describe("Env", function() {
  var env, foo = function() {};
  beforeEach(function() {
    env = new j$.Env();
  });

  afterAll(function(){
    delete foo;
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

  it('can configure specs to throw errors on expectation failures', function() {
    env.throwOnExpectationFailure(true);

    spyOn(j$, 'Spec');
    env.it('foo', foo);
    expect(j$.Spec).toHaveBeenCalledWith(jasmine.objectContaining({
      throwOnExpectationFailure: true
    }));
  });

  it('can configure suites to throw errors on expectation failures', function() {
    env.throwOnExpectationFailure(true);

    spyOn(j$, 'Suite');
    env.describe('foo', foo);
    expect(j$.Suite).toHaveBeenCalledWith(jasmine.objectContaining({
      throwOnExpectationFailure: true
    }));
  });

  describe("context", function(){
    it("is an alias for describe", function(){
      spyOn(env, 'describe');
      env.context("foo", foo);
      expect(env.describe).toHaveBeenCalled();
    });
  });

  describe("xcontext", function(){
    it("is an alias for xdescribe", function(){
      spyOn(env, 'xdescribe');
      env.xcontext("foo", foo);
      expect(env.xdescribe).toHaveBeenCalled();
    });
  });

  describe("fcontext", function(){
    it("is an alias for fdescribe", function(){
      spyOn(env, 'fdescribe');
      env.fcontext("foo", foo);
      expect(env.fdescribe).toHaveBeenCalled();
    });
  });

  describe("with", function(){
    it("is an alias for describe, but adds 'with' to the beginning of the descriptions", function(){
      spyOn(env, 'describe');
      env.with("foo", foo);
      expect(env.describe).toHaveBeenCalledWith("with foo", foo);
    });
  });

  describe("xwith", function(){
    it("is an alias for xdescribe, but adds 'with' to the beginning of the description", function(){
      spyOn(env, 'xdescribe');
      env.xwith("foo", foo);
      expect(env.xdescribe).toHaveBeenCalledWith("with foo", foo);
    });
  });

  describe("fwith", function(){
    it("is an alias for fdescribe, but adds 'with' to the beginning of the description", function(){
      spyOn(env, 'fdescribe');
      env.fwith("foo", foo);
      expect(env.fdescribe).toHaveBeenCalledWith("with foo", foo);
    });
  });

  describe("without", function(){
    it("is an alias for describe, but adds 'without' to the beginning of the description", function(){
      spyOn(env, 'describe');
      env.without("foo", foo);
      expect(env.describe).toHaveBeenCalledWith("without foo", foo);
    });
  });

  describe("xwithout", function(){
    it("is an alias for xdescribe, but adds 'without' to the beginning of the description", function(){
      spyOn(env, 'xdescribe');
      env.xwithout("foo", foo);
      expect(env.xdescribe).toHaveBeenCalledWith("without foo", foo);
    });
  });

  describe("fwithout", function(){
    it("is an alias for fdescribe, but adds 'without' to the beginning of the description", function(){
      spyOn(env, 'fdescribe');
      env.fwithout("foo", foo);
      expect(env.fdescribe).toHaveBeenCalledWith("without foo", foo);
    });
  });
});
