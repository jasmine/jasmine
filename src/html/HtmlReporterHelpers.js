jasmine.HtmlReporterHelpers = {};

jasmine.HtmlReporterHelpers.createDom = function(type, attrs, childrenVarArgs) {
  var el = document.createElement(type);

  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];

    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      if (child) {
        el.appendChild(child);
      }
    }
  }

  for (var attr in attrs) {
    if (attr == "className") {
      el[attr] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
    }
  }

  return el;
};

jasmine.HtmlReporterHelpers.getSpecStatus = function(child) {
  var results = child.results();
  var status = results.passed() ? 'passed' : 'failed';
  if (results.skipped) {
    status = 'skipped';
  }

  return status;
};

jasmine.HtmlReporterHelpers.appendToSummary = function(child, childElement) {
  var parentDiv = this.dom.summary;
  var parentSuite = (typeof child.parentSuite == 'undefined') ? 'suite' : 'parentSuite';
  var parent = child[parentSuite];

  if (parent) {
    if (typeof this.views.suites[parent.id] == 'undefined') {
      this.views.suites[parent.id] = new jasmine.HtmlReporter.SuiteView(parent, this.dom, this.views);
    }
    parentDiv = this.views.suites[parent.id].element;
  }

  parentDiv.appendChild(childElement);
};


jasmine.HtmlReporterHelpers.addHelpers = function(ctor) {
  for(var fn in jasmine.HtmlReporterHelpers) {
    ctor.prototype[fn] = jasmine.HtmlReporterHelpers[fn];
  }
};

