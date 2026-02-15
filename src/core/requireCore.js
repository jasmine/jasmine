// eslint-disable-next-line no-unused-vars
const getJasmineRequireObj = (function() {
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
    jasmineRequire = {};
  }

  function getJasmineRequire() {
    return jasmineRequire;
  }

  getJasmineRequire().core = function(jRequire) {
    const private$ = {};
    const j$ = {};

    jRequire.base(j$, private$, globalThis);
    private$.util = jRequire.util(j$, private$);
    private$.errors = jRequire.errors();
    private$.formatErrorMsg = jRequire.formatErrorMsg(j$, private$);
    private$.AllOf = jRequire.AllOf(j$, private$);
    private$.Any = jRequire.Any(j$, private$);
    private$.Anything = jRequire.Anything(j$, private$);
    private$.CallTracker = jRequire.CallTracker(j$, private$);
    private$.MockDate = jRequire.MockDate(j$, private$);
    private$.getStackClearer = jRequire.StackClearer(j$, private$);
    private$.Clock = jRequire.Clock(j$, private$);
    private$.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler(
      j$,
      private$
    );
    private$.Deprecator = jRequire.Deprecator(j$, private$);
    private$.Configuration = jRequire.Configuration(j$, private$);
    private$.Env = jRequire.Env(j$, private$);
    private$.StackTrace = jRequire.StackTrace(j$, private$);
    private$.ExceptionFormatter = jRequire.ExceptionFormatter(j$, private$);
    private$.ExpectationFilterChain = jRequire.ExpectationFilterChain();
    private$.Expector = jRequire.Expector(j$, private$);
    private$.Expectation = jRequire.Expectation(j$, private$);
    private$.buildExpectationResult = jRequire.buildExpectationResult(
      j$,
      private$
    );
    private$.makePrettyPrinter = jRequire.makePrettyPrinter(j$, private$);
    private$.basicPrettyPrinter = private$.makePrettyPrinter();
    private$.MatchersUtil = jRequire.MatchersUtil(j$, private$);
    private$.ObjectContaining = jRequire.ObjectContaining(j$, private$);
    private$.ArrayContaining = jRequire.ArrayContaining(j$, private$);
    private$.ArrayWithExactContents = jRequire.ArrayWithExactContents(
      j$,
      private$
    );
    private$.MapContaining = jRequire.MapContaining(j$, private$);
    private$.SetContaining = jRequire.SetContaining(j$, private$);
    private$.QueueRunner = jRequire.QueueRunner(j$, private$);
    private$.NeverSkipPolicy = jRequire.NeverSkipPolicy(j$, private$);
    private$.SkipAfterBeforeAllErrorPolicy = jRequire.SkipAfterBeforeAllErrorPolicy(
      j$
    );
    private$.CompleteOnFirstErrorSkipPolicy = jRequire.CompleteOnFirstErrorSkipPolicy(
      j$
    );
    private$.reporterEvents = jRequire.reporterEvents(j$, private$);
    private$.ReportDispatcher = jRequire.ReportDispatcher(j$, private$);
    j$.ParallelReportDispatcher = jRequire.ParallelReportDispatcher(
      j$,
      private$
    );
    private$.CurrentRunableTracker = jRequire.CurrentRunableTracker();
    private$.RunableResources = jRequire.RunableResources(j$, private$);
    private$.Runner = jRequire.Runner(j$, private$);
    private$.Spec = jRequire.Spec(j$, private$);
    private$.Spy = jRequire.Spy(j$, private$);
    private$.SpyFactory = jRequire.SpyFactory(j$, private$);
    private$.SpyRegistry = jRequire.SpyRegistry(j$, private$);
    private$.SpyStrategy = jRequire.SpyStrategy(j$, private$);
    private$.StringMatching = jRequire.StringMatching(j$, private$);
    private$.StringContaining = jRequire.StringContaining(j$, private$);
    private$.UserContext = jRequire.UserContext(j$, private$);
    private$.Suite = jRequire.Suite(j$, private$);
    private$.SuiteBuilder = jRequire.SuiteBuilder(j$, private$);
    j$.Timer = jRequire.Timer();
    private$.TreeProcessor = jRequire.TreeProcessor(j$, private$);
    private$.TreeRunner = jRequire.TreeRunner(j$, private$);
    j$.version = jRequire.version();
    private$.Order = jRequire.Order();
    private$.DiffBuilder = jRequire.DiffBuilder(j$, private$);
    private$.NullDiffBuilder = jRequire.NullDiffBuilder(j$, private$);
    private$.ObjectPath = jRequire.ObjectPath(j$, private$);
    private$.MismatchTree = jRequire.MismatchTree(j$, private$);
    private$.GlobalErrors = jRequire.GlobalErrors(j$, private$);
    private$.Truthy = jRequire.Truthy(j$, private$);
    private$.Falsy = jRequire.Falsy(j$, private$);
    private$.Empty = jRequire.Empty(j$, private$);
    private$.NotEmpty = jRequire.NotEmpty(j$, private$);
    private$.Is = jRequire.Is(j$, private$);

    private$.matchers = jRequire.requireMatchers(jRequire, j$, private$);
    private$.asyncMatchers = jRequire.requireAsyncMatchers(
      jRequire,
      j$,
      private$
    );

    private$.loadedAsBrowserEsm =
      globalThis.document && !globalThis.document.currentScript;

    return { jasmine: j$, private: private$ };
  };

  return getJasmineRequire;
})(this);
