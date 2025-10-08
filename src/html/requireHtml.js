// eslint-disable-next-line no-var
var jasmineRequire = window.jasmineRequire || require('./jasmine.js');

jasmineRequire.html = function(j$) {
  j$.private.ResultsNode = jasmineRequire.ResultsNode();
  j$.private.ResultsStateBuilder = jasmineRequire.ResultsStateBuilder(j$);
  j$.private.htmlReporterUtils = jasmineRequire.htmlReporterUtils(j$);
  j$.private.AlertsView = jasmineRequire.AlertsView(j$);
  j$.private.Banner = jasmineRequire.Banner(j$);
  j$.private.SymbolsView = jasmineRequire.SymbolsView(j$);
  j$.private.SummaryTreeView = jasmineRequire.SummaryTreeView(j$);
  j$.private.FailuresView = jasmineRequire.FailuresView(j$);
  j$.private.UrlBuilder = jasmineRequire.UrlBuilder();
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter();
};
