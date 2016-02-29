fdescribe('Bluebird Warnings:', function() {
  if (typeof require !== 'function') {
    return;
  }

  var BPromise = require('bluebird');
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  describe("a promise was created in a handler but none were returned from it", function () {
    // http://bluebirdjs.com/docs/warning-explanations.html#warning-a-promise-was-created-in-a-handler-but-none-were-returned-from-it

    it("shouldn't complain about non-returned promises", function (outerDone) {
      spyOn(console, 'warn');

      env.describe('suite for bluebird warnings', function() {
        env.it("create a promise test", function (done) {
          BPromise.resolve()
            .then(function () {})
            .finally(done, done.fail);
        });
        env.it("create another promise test", function (done) {
          BPromise.resolve()
            .then(function () {})
            .finally(done, done.fail);
        });
        env.it("check if console.log was called", function () {
          expect(console.warn).not.toHaveBeenCalled();
          outerDone();
        });
      });
      env.execute();
    });
  });
});
