(function(env) {
  env.registerIntegrationMatchers = function() {
    jasmine.addMatchers({
      toHaveFailedExpectationsForRunnable: function() {
        return {
          compare: function(actual, fullName, expectedFailures) {
            var foundRunnable = false,
              expectations = true,
              foundFailures = [];
            for (var i = 0; i < actual.calls.count(); i++) {
              var args = actual.calls.argsFor(i)[0];

              if (args.fullName === fullName) {
                foundRunnable = true;

                for (var j = 0; j < args.failedExpectations.length; j++) {
                  foundFailures.push(args.failedExpectations[j].message);
                }

                for (var j = 0; j < expectedFailures.length; j++) {
                  var failure = foundFailures[j];
                  var expectedFailure = expectedFailures[j];

                  if (
                    Object.prototype.toString.call(expectedFailure) ===
                    '[object RegExp]'
                  ) {
                    expectations =
                      expectations && expectedFailure.test(failure);
                  } else {
                    expectations = expectations && failure === expectedFailure;
                  }
                }
                break;
              }
            }

            return {
              pass: foundRunnable && expectations,
              message: !foundRunnable
                ? 'The runnable "' + fullName + '" never finished'
                : 'Expected runnable "' +
                  fullName +
                  '" to have failures ' +
                  jasmine.basicPrettyPrinter_(expectedFailures) +
                  ' but it had ' +
                  jasmine.basicPrettyPrinter_(foundFailures)
            };
          }
        };
      }
    });
  };
})(jasmine.getEnv());
