// eslint-disable-next-line no-unused-vars
const getJasmineHtmlRequireObj = (function() {
  'use strict';
  const htmlRequire = {};

  function getJasmineHtmlRequire() {
    return htmlRequire;
  }

  htmlRequire.html = function(j$, private$) {
    if (!private$) {
      private$ = {};
    }

    private$.ResultsNode = htmlRequire.ResultsNode();
    private$.ResultsStateBuilder = htmlRequire.ResultsStateBuilder(
      j$,
      private$
    );
    private$.htmlReporterUtils = htmlRequire.htmlReporterUtils(j$, private$);
    private$.AlertsView = htmlRequire.AlertsView(j$, private$);
    private$.OverallStatusBar = htmlRequire.OverallStatusBar(j$, private$);
    private$.Banner = htmlRequire.Banner(j$, private$);
    private$.SummaryTreeView = htmlRequire.SummaryTreeView(j$, private$);
    private$.FailuresView = htmlRequire.FailuresView(j$, private$);
    private$.PerformanceView = htmlRequire.PerformanceView(j$, private$);
    private$.TabBar = htmlRequire.TabBar(j$, private$);
    private$.HtmlSpecFilterV2 = htmlRequire.HtmlSpecFilterV2();

    for (const k of ['HtmlReporterV2Urls', 'HtmlReporterV2', 'QueryString']) {
      Object.defineProperty(j$, k, {
        enumerable: true,
        configurable: false,
        writable: false,
        value: htmlRequire[k](j$, private$)
      });
    }
  };

  return getJasmineHtmlRequire;
})();
