// eslint-disable-next-line no-unused-vars,no-var
var getJasmineRequireObj = (function() {
  'use strict';
  let jasmineRequire;

  if (
    typeof module !== 'undefined' &&
    module.exports &&
    typeof exports !== 'undefined'
  ) {
    // Node
    jasmineRequire = exports;
  } else {
    // Browser
    jasmineRequire = globalThis.jasmineRequire = {};
  }

  function getJasmineRequire() {
    return jasmineRequire;
  }

  getJasmineRequire().core = function(jRequire) {
    const j$ = { private: {} };

    jRequire.base(j$, globalThis);
    j$.private.util = jRequire.util(j$);
    j$.private.errors = jRequire.errors();
    j$.private.formatErrorMsg = jRequire.formatErrorMsg(j$);
    j$.private.Any = jRequire.Any(j$);
    j$.private.Anything = jRequire.Anything(j$);
    j$.private.CallTracker = jRequire.CallTracker(j$);
    j$.private.MockDate = jRequire.MockDate(j$);
    j$.private.getClearStack = jRequire.clearStack(j$);
    j$.private.Clock = jRequire.Clock();
    j$.private.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler(j$);
    j$.private.Deprecator = jRequire.Deprecator(j$);
    j$.private.Configuration = jRequire.Configuration(j$);
    j$.private.Env = jRequire.Env(j$);
    j$.private.StackTrace = jRequire.StackTrace(j$);
    j$.private.ExceptionFormatter = jRequire.ExceptionFormatter(j$);
    j$.private.ExpectationFilterChain = jRequire.ExpectationFilterChain();
    j$.private.Expector = jRequire.Expector(j$);
    j$.private.Expectation = jRequire.Expectation(j$);
    j$.private.buildExpectationResult = jRequire.buildExpectationResult(j$);
    j$.private.JsApiReporter = jRequire.JsApiReporter(j$);
    j$.private.makePrettyPrinter = jRequire.makePrettyPrinter(j$);
    j$.private.basicPrettyPrinter = j$.private.makePrettyPrinter();
    j$.private.MatchersUtil = jRequire.MatchersUtil(j$);
    j$.private.ObjectContaining = jRequire.ObjectContaining(j$);
    j$.private.ArrayContaining = jRequire.ArrayContaining(j$);
    j$.private.ArrayWithExactContents = jRequire.ArrayWithExactContents(j$);
    j$.private.MapContaining = jRequire.MapContaining(j$);
    j$.private.SetContaining = jRequire.SetContaining(j$);
    j$.private.QueueRunner = jRequire.QueueRunner(j$);
    j$.private.NeverSkipPolicy = jRequire.NeverSkipPolicy(j$);
    j$.private.SkipAfterBeforeAllErrorPolicy = jRequire.SkipAfterBeforeAllErrorPolicy(
      j$
    );
    j$.private.CompleteOnFirstErrorSkipPolicy = jRequire.CompleteOnFirstErrorSkipPolicy(
      j$
    );
    j$.private.reporterEvents = jRequire.reporterEvents(j$);
    j$.private.ReportDispatcher = jRequire.ReportDispatcher(j$);
    j$.ParallelReportDispatcher = jRequire.ParallelReportDispatcher(j$);
    j$.private.CurrentRunableTracker = jRequire.CurrentRunableTracker();
    j$.private.RunableResources = jRequire.RunableResources(j$);
    j$.private.Runner = jRequire.Runner(j$);
    j$.private.Spec = jRequire.Spec(j$);
    j$.private.Spy = jRequire.Spy(j$);
    j$.private.SpyFactory = jRequire.SpyFactory(j$);
    j$.private.SpyRegistry = jRequire.SpyRegistry(j$);
    j$.private.SpyStrategy = jRequire.SpyStrategy(j$);
    j$.private.StringMatching = jRequire.StringMatching(j$);
    j$.private.StringContaining = jRequire.StringContaining(j$);
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
    j$.private.GlobalErrors = jRequire.GlobalErrors(j$);
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
