getJasmineRequireObj().Timer = function() {
  /*
    Timer isn't part of the public interface, but it is used by
    jasmine-npm. -core and -npm version in lockstep at the major and minor
    levels but version independently at the patch level. Any changes that
    would break -npm should be done in a major or minor release, never a
    patch release, and accompanied by a change to -npm that's released in
    the same version.
   */

  const defaultNow = (function(Date) {
    return function() {
      return new Date().getTime();
    };
  })(Date);

  function Timer(options) {
    options = options || {};

    const now = options.now || defaultNow;
    let startTime;

    this.start = function() {
      startTime = now();
    };

    this.elapsed = function() {
      return now() - startTime;
    };
  }

  return Timer;
};
