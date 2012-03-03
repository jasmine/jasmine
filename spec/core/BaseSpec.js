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

  describe("jasmine.ExpectationResult", function() {
    var result;

    beforeEach(function() {
      result = new jasmine.ExpectationResult({
        passed: true,
        message: "some message"
      });
    });

    describe("#update", function() {
      it("updates the passing status", function() {
        result.update({ passed: false });
        expect(result.passed()).toBeFalsy();
      });

      describe("when the result is passing", function() {
        it("sets the message to 'Passed.'", function() {
          result.update({
            passed: true,
            message: "some message"
          });

          expect(result.message).toBe("Passed.");
        });
      });

      describe("when the result is failing", function() {
        beforeEach(function() {
          result.update({
            passed: false,
            message: "some message"
          });
        });

        it("updates the message", function() {
          expect(result.message).toBe("some message");
        });

        it("creates a stack trace with the message", function() {
          expect(result.trace instanceof Error).toBeTruthy();
          expect(result.trace.message).toBe("some message");
        });
      });
    });
  });
});
