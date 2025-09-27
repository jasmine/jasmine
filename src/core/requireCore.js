// eslint-disable-next-line no-unused-vars,no-var
var getJasmineRequireObj = (function(jasmineGlobal) {
  let jasmineRequire;

  if (
    typeof module !== 'undefined' &&
    module.exports &&
    typeof exports !== 'undefined'
  ) {
    if (typeof global !== 'undefined') {
      jasmineGlobal = global;
    } else {
      jasmineGlobal = {};
    }
    jasmineRequire = exports;
  } else {
    if (
      typeof window !== 'undefined' &&
      typeof window.toString === 'function' &&
      window.toString() === '[object GjsGlobal]'
    ) {
      jasmineGlobal = window;
    }
    jasmineRequire = jasmineGlobal.jasmineRequire = {};
  }

  function getJasmineRequire() {
    return jasmineRequire;
  }

  getJasmineRequire().core = function(jRequire) {
    const j$ = { private: {} };

    jRequire.base(j$, jasmineGlobal);
    jRequire.util(j$);
    jRequire.errors(j$);
    jRequire.formatErrorMsg(j$);
    jRequire.Any(j$);
    jRequire.Anything(j$);
    jRequire.CallTracker(j$);
    jRequire.MockDate(j$);
    jRequire.clearStack(j$);
    jRequire.Clock(j$);
    jRequire.DelayedFunctionScheduler(j$);
    jRequire.Deprecator(j$);
    jRequire.Configuration(j$);
    jRequire.Env(j$);
    jRequire.StackTrace(j$);
    jRequire.ExceptionFormatter(j$);
    jRequire.ExpectationFilterChain(j$);
    jRequire.Expector(j$);
    jRequire.Expectation(j$);
    jRequire.buildExpectationResult(j$);
    jRequire.JsApiReporter(j$);
    jRequire.makePrettyPrinter(j$);
    // TODO: consider making basicPrettyPrinter_ public. If not, move it to the private namespace.
    j$.basicPrettyPrinter_ = j$.private.makePrettyPrinter();
    jRequire.MatchersUtil(j$);
    jRequire.ObjectContaining(j$);
    jRequire.ArrayContaining(j$);
    jRequire.ArrayWithExactContents(j$);
    jRequire.MapContaining(j$);
    jRequire.SetContaining(j$);
    jRequire.QueueRunner(j$);
    jRequire.NeverSkipPolicy(j$);
    jRequire.SkipAfterBeforeAllErrorPolicy(j$);
    jRequire.CompleteOnFirstErrorSkipPolicy(j$);
    jRequire.reporterEvents(j$);
    jRequire.ReportDispatcher(j$);
    jRequire.ParallelReportDispatcher(j$);
    jRequire.CurrentRunableTracker(j$);
    jRequire.RunableResources(j$);
    jRequire.Runner(j$);
    jRequire.Spec(j$);
    jRequire.Spy(j$);
    jRequire.SpyFactory(j$);
    jRequire.SpyRegistry(j$);
    jRequire.SpyStrategy(j$);
    jRequire.StringMatching(j$);
    jRequire.StringContaining(j$);
    j$.UserContext = jRequire.UserContext(j$);
    j$.Suite = jRequire.Suite(j$);
    j$.SuiteBuilder = jRequire.SuiteBuilder(j$);
    j$.Timer = jRequire.Timer();
    j$.TreeProcessor = jRequire.TreeProcessor(j$);
    j$.TreeRunner = jRequire.TreeRunner(j$);
    j$.version = jRequire.version();
    j$.Order = jRequire.Order();
    j$.DiffBuilder = jRequire.DiffBuilder(j$);
    j$.NullDiffBuilder = jRequire.NullDiffBuilder(j$);
    j$.ObjectPath = jRequire.ObjectPath(j$);
    j$.MismatchTree = jRequire.MismatchTree(j$);
    jRequire.GlobalErrors(j$);
    j$.Truthy = jRequire.Truthy(j$);
    j$.Falsy = jRequire.Falsy(j$);
    j$.Empty = jRequire.Empty(j$);
    j$.NotEmpty = jRequire.NotEmpty(j$);
    j$.Is = jRequire.Is(j$);

    j$.matchers = jRequire.requireMatchers(jRequire, j$);
    j$.asyncMatchers = jRequire.requireAsyncMatchers(jRequire, j$);

    return j$;
  };

  return getJasmineRequire;
})(this);
