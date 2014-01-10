describe("ExceptionFormatter", function() {
  describe("#message", function() {
    it('formats Firefox exception messages', function() {
      var sampleFirefoxException = {
          fileName: 'foo.js',
          lineNumber: '1978',
          message: 'you got your foo in my bar',
          name: 'A Classic Mistake'
        },
        exceptionFormatter = new j$.ExceptionFormatter(),
        message = exceptionFormatter.message(sampleFirefoxException);

      expect(message).toEqual('A Classic Mistake: you got your foo in my bar in foo.js (line 1978)');
    });

    it('formats Webkit exception messages', function() {
      var sampleWebkitException = {
          sourceURL: 'foo.js',
          line: '1978',
          message: 'you got your foo in my bar',
          name: 'A Classic Mistake'
        },
        exceptionFormatter = new j$.ExceptionFormatter(),
        message = exceptionFormatter.message(sampleWebkitException);

      expect(message).toEqual('A Classic Mistake: you got your foo in my bar in foo.js (line 1978)');
    });

    it('formats V8 exception messages', function() {
      var sampleV8 = {
          message: 'you got your foo in my bar',
          name: 'A Classic Mistake'
        },
        exceptionFormatter = new j$.ExceptionFormatter(),
        message = exceptionFormatter.message(sampleV8);

      expect(message).toEqual('A Classic Mistake: you got your foo in my bar');
    });

    it("formats thrown exceptions that aren't errors", function() {
      var thrown = "crazy error",
          exceptionFormatter = new j$.ExceptionFormatter(),
          message = exceptionFormatter.message(thrown);

      expect(message).toEqual("crazy error thrown");
    });
  });

  describe("#stack", function() {
    it("formats stack traces from Webkit, Firefox, node.js or IE10+", function() {
      if (jasmine.getEnv().ieVersion < 10 || jasmine.getEnv().safariVersion < 6) { return; }

      var error;
      try { throw new Error("an error") } catch(e) { error = e; }

      expect(new j$.ExceptionFormatter().stack(error)).toMatch(/ExceptionFormatterSpec\.js.*\d+/)
    });

    it("returns null if no Error provided", function() {
      expect(new j$.ExceptionFormatter().stack()).toBeNull();
    });
  });
});
