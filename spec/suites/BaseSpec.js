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
});
