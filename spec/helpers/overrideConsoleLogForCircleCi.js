/* eslint no-console: 0 */
(function() {
  function override(fnName) {
    var realFn = console[fnName];
    console[fnName] = function() {
      realFn.call(console, '\n');
      realFn.apply(console, arguments);
    };
  }

  if (process && process.env && process.env.CIRCLE_CI) {
    // The Circle CI "terminal" is infinitely wide, which means log/error
    // output will tend to be lost off to the right of all of the Jasmine
    // reporter's dots. Prepend a newline to the output to ensure that it
    // will be visible.
    override('log');
    override('error');
  }
})();
