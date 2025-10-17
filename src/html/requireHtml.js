// eslint-disable-next-line no-var
var jasmineRequire = window.jasmineRequire || require('./jasmine.js');

jasmineRequire.html = function(j$) {
  j$.private.ResultsNode = jasmineRequire.ResultsNode();
  j$.private.ResultsStateBuilder = jasmineRequire.ResultsStateBuilder(j$);
  j$.private.htmlReporterUtils = jasmineRequire.htmlReporterUtils(j$);
  j$.private.AlertsView = jasmineRequire.AlertsView(j$);
  j$.private.OverallStatusBar = jasmineRequire.OverallStatusBar(j$);
  j$.private.Banner = jasmineRequire.Banner(j$);
  j$.private.SymbolsView = jasmineRequire.SymbolsView(j$);
  j$.private.SummaryTreeView = jasmineRequire.SummaryTreeView(j$);
  j$.private.FailuresView = jasmineRequire.FailuresView(j$);
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.HtmlReporterV2Urls = jasmineRequire.HtmlReporterV2Urls(j$);
  j$.HtmlReporterV2 = jasmineRequire.HtmlReporterV2(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter(j$);
  j$.private.HtmlSpecFilterV2 = jasmineRequire.HtmlSpecFilterV2();
};
