function getJasmineRequireObj() {
  if (typeof module !== "undefined" && module.exports) {
    return exports;
  } else {
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

getJasmineRequireObj().core = function(jRequire) {
  j$ = {};

  jRequire.base(j$);
  j$.util = jRequire.util();
  j$.Any = jRequire.Any();
  j$.Clock = jRequire.Clock();
  j$.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler();
  j$.Env = jRequire.Env(j$);
  j$.ExceptionFormatter = jRequire.ExceptionFormatter();
  j$.Expectation = jRequire.Expectation();
  j$.buildExpectationResult = jRequire.buildExpectationResult();
  j$.JsApiReporter = jRequire.JsApiReporter();
  j$.matchersUtil = jRequire.matchersUtil(j$);
  j$.ObjectContaining = jRequire.ObjectContaining(j$);
  j$.StringPrettyPrinter = jRequire.StringPrettyPrinter(j$);
  j$.QueueRunner = jRequire.QueueRunner();
  j$.ReportDispatcher = jRequire.ReportDispatcher();
  j$.Spec = jRequire.Spec();
  j$.Spy = jRequire.Spy(j$);
  j$.Suite = jRequire.Suite();
  j$.version = jRequire.version();

  j$.matchers = jRequire.requireMatchers(jRequire, j$);

  return j$;
};
