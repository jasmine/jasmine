jasmine.HtmlReporter.SuiteView = function(suite, dom, views, jasmine) {
  this.suite = suite;
  this.dom = dom;
  this.views = views;
  this.jasmine = jasmine || {};

  this.element = this.createDom('div', { className: 'suite' },
    this.createDom('a', { className: 'description', href: this.jasmine.HtmlReporter.sectionLink(this.suite.getFullName(), this.jasmine.CATCH_EXCEPTIONS) }, this.suite.description)
  );

  this.appendToSummary(this.suite, this.element);
};

jasmine.HtmlReporter.SuiteView.prototype.status = function() {
  return this.getSpecStatus(this.suite);
};

jasmine.HtmlReporter.SuiteView.prototype.refresh = function() {
  this.element.className += " " + this.status();
};

jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.SuiteView);

