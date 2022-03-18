getJasmineRequireObj().toHaveSpyInteractions = function(j$) {
  var getErrorMsg = j$.formatErrorMsg(
    '<toHaveSpyInteractions>',
    'expect(<spyObj>).toHaveSpyInteractions()'
  );

  /**
   * {@link expect} the actual (a {@link SpyObj}) spies to have been called.
   * @function
   * @name matchers#toHaveSpyInteractions
   * @example
   * expect(mySpyObj).toHaveSpyInteractions();
   * expect(mySpyObj).not.toHaveSpyInteractions();
   */
  function toHaveSpyInteractions(matchersUtil) {
    return {
      compare: function(actual) {
        var result = {};

        if (!j$.isObject_(actual)) {
          throw new Error(
            getErrorMsg('Expected a spy object, but got ' + typeof actual + '.')
          );
        }

        if (arguments.length > 1) {
          throw new Error(getErrorMsg('Does not take arguments'));
        }

        result.pass = false;
        let hasSpy = false;
        const calledSpies = [];
        for (const spy of Object.values(actual)) {
          if (!j$.isSpy(spy)) continue;
          hasSpy = true;

          if (spy.calls.any()) {
            result.pass = true;
            calledSpies.push([spy.and.identity, spy.calls.count()]);
          }
        }

        if (!hasSpy) {
          throw new Error(
            getErrorMsg(
              'Expected a spy object with spies, but object has no spies.'
            )
          );
        }

        let resultMessage;
        if (result.pass) {
          resultMessage =
            'Expected spy object spies not to have been called, ' +
            'but the following spies were called: ';
          resultMessage += calledSpies
            .map(([spyName, spyCount]) => {
              return `${spyName} called ${spyCount} time(s)`;
            })
            .join(', ');
        } else {
          resultMessage =
            'Expected spy object spies to have been called, ' +
            'but no spies were called.';
        }
        result.message = resultMessage;

        return result;
      }
    };
  }

  return toHaveSpyInteractions;
};
