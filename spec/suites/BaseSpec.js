describe("base.js", function() {
  describe("jasmine.MessageResult", function() {
    it("#toString should pretty-print and concatenate each part of the message", function() {
      var values = ["log", "message", 123, {key: "value"}, "FTW!"];
      var messageResult = new jasmine.MessageResult(values);
      expect(messageResult.toString()).toEqual("log message 123 { key : 'value' } FTW!");
    });
  });

  describe("jasmine.log", function() {
    it("should accept n arguments", function() {
      spyOn(jasmine.getEnv().currentSpec, 'log');
      jasmine.log(1, 2, 3);
      expect(jasmine.getEnv().currentSpec.log).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe("jasmine.getGlobal", function() {
    it("should return the global object", function() {
      var globalObject = (function() {
        return this;
      })();

      expect(jasmine.getGlobal()).toBe(globalObject);
    });
  });

  describe("helper functions", function() {
    var env, helperFunction;

    beforeEach(function() {
      env = jasmine.getEnv();
      helperFunction = jasmine.createSpy();
    });

    describe("beforeEach", function() {
      beforeEach(function() {
        spyOn(env, "beforeEach");
      });
      it("should call env beforeEach", function() {
        beforeEach(helperFunction);
        expect(env.beforeEach).toHaveBeenCalledWith(helperFunction);
      });
      it("should have alias 'before'", function() {
        before(helperFunction);
        expect(env.beforeEach).toHaveBeenCalledWith(helperFunction);
      });
    });
    describe("afterEach", function() {
      beforeEach(function() {
        spyOn(env, "afterEach");
      });
      it("should call env afterEach", function() {
        afterEach(helperFunction);
        expect(env.afterEach).toHaveBeenCalledWith(helperFunction);
      });
      it("should have alias 'after'", function() {
        after(helperFunction);
        expect(env.afterEach).toHaveBeenCalledWith(helperFunction);
      });
    });

  });

});
