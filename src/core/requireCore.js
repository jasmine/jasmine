var getJasmineRequireObj = (function (jasmineGlobal) {
  var jasmineRequire;

  if (typeof module !== 'undefined' && module.exports && typeof exports !== 'undefined') {
    if (typeof global !== 'undefined') {
      jasmineGlobal = global;
    } else {
      jasmineGlobal = {};
    }
    jasmineRequire = exports;
  } else {
    if (typeof window !== 'undefined' && typeof window.toString === 'function' && window.toString() === '[object GjsGlobal]') {
      jasmineGlobal = window;
    }
    jasmineRequire = jasmineGlobal.jasmineRequire = jasmineGlobal.jasmineRequire || {};
  }

  function getJasmineRequire() {
    return jasmineRequire;
  }

  getJasmineRequire().core = function(jRequire) {
    var j$ = {};

    jRequire.base(j$, jasmineGlobal);
    j$.util = jRequire.util();
    j$.errors = jRequire.errors();
    j$.formatErrorMsg = jRequire.formatErrorMsg();
    j$.Any = jRequire.Any(j$);
    j$.Anything = jRequire.Anything(j$);
    j$.CallTracker = jRequire.CallTracker(j$);
    j$.MockDate = jRequire.MockDate();
    j$.getClearStack = jRequire.clearStack(j$);
    j$.Clock = jRequire.Clock();
    j$.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler();
    j$.Env = jRequire.Env(j$);
    j$.ExceptionFormatter = jRequire.ExceptionFormatter();
    j$.Expectation = jRequire.Expectation();
    j$.buildExpectationResult = jRequire.buildExpectationResult();
    j$.JsApiReporter = jRequire.JsApiReporter();
    j$.matchersUtil = jRequire.matchersUtil(j$);
    j$.ObjectContaining = jRequire.ObjectContaining(j$);
    j$.ArrayContaining = jRequire.ArrayContaining(j$);
    j$.pp = jRequire.pp(j$);
    j$.QueueRunner = jRequire.QueueRunner(j$);
    j$.ReportDispatcher = jRequire.ReportDispatcher();
    j$.Spec = jRequire.Spec(j$);
    j$.Spy = jRequire.Spy(j$);
    j$.SpyRegistry = jRequire.SpyRegistry(j$);
    j$.SpyStrategy = jRequire.SpyStrategy(j$);
    j$.StringMatching = jRequire.StringMatching(j$);
    j$.Suite = jRequire.Suite(j$);
    j$.Timer = jRequire.Timer();
    j$.TreeProcessor = jRequire.TreeProcessor();
    j$.version = jRequire.version();
    j$.Order = jRequire.Order();
    j$.DiffBuilder = jRequire.DiffBuilder(j$);
    j$.NullDiffBuilder = jRequire.NullDiffBuilder(j$);
    j$.ObjectPath = jRequire.ObjectPath(j$);

    j$.matchers = jRequire.requireMatchers(jRequire, j$);

    return j$;
  };

  return getJasmineRequire;
})(this);
