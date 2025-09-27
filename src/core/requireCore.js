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
    j$.private.basicPrettyPrinter = j$.private.makePrettyPrinter();
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
    j$.private.UserContext = jRequire.UserContext(j$);
    j$.private.Suite = jRequire.Suite(j$);
    j$.private.SuiteBuilder = jRequire.SuiteBuilder(j$);
    j$.Timer = jRequire.Timer();
    j$.private.TreeProcessor = jRequire.TreeProcessor(j$);
    j$.private.TreeRunner = jRequire.TreeRunner(j$);
    j$.version = jRequire.version();
    j$.private.Order = jRequire.Order();
    j$.private.DiffBuilder = jRequire.DiffBuilder(j$);
    j$.private.NullDiffBuilder = jRequire.NullDiffBuilder(j$);
    j$.private.ObjectPath = jRequire.ObjectPath(j$);
    j$.private.MismatchTree = jRequire.MismatchTree(j$);
    jRequire.GlobalErrors(j$);
    j$.private.Truthy = jRequire.Truthy(j$);
    j$.private.Falsy = jRequire.Falsy(j$);
    j$.private.Empty = jRequire.Empty(j$);
    j$.private.NotEmpty = jRequire.NotEmpty(j$);
    j$.private.Is = jRequire.Is(j$);

    j$.private.matchers = jRequire.requireMatchers(jRequire, j$);
    j$.private.asyncMatchers = jRequire.requireAsyncMatchers(jRequire, j$);

    return j$;
  };

  return getJasmineRequire;
})(this);
