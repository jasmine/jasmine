(function() {
  specHelpers.registerIntegrationMatchers = function() {
    jasmine.addMatchers({
      toHaveFailedExpectationsForRunnable: function() {
        return {
          compare: function(actual, fullName, expectedFailures) {
            let foundRunnable = false,
              expectations = true,
              foundFailures = [];
            for (let i = 0; i < actual.calls.count(); i++) {
              const args = actual.calls.argsFor(i)[0];

              if (args.fullName === fullName) {
                foundRunnable = true;

                for (let j = 0; j < args.failedExpectations.length; j++) {
                  foundFailures.push(args.failedExpectations[j].message);
                }

                for (let j = 0; j < expectedFailures.length; j++) {
                  const failure = foundFailures[j];
                  const expectedFailure = expectedFailures[j];

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
                  jasmine.private.basicPrettyPrinter(expectedFailures) +
                  ' but it had ' +
                  jasmine.private.basicPrettyPrinter(foundFailures)
            };
          }
        };
      }
    });
  };
})();
