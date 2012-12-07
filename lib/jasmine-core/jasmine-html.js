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
  if (!child.results) {
    return;
  }
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
      this.views.suites[parent.id] = new this.jasmine.HtmlReporter.SuiteView(parent, this.dom, this.views, this.jasmine);
    }
    parentDiv = this.views.suites[parent.id].element;
  }

  parentDiv.appendChild(childElement);
};


jasmine.HtmlReporterHelpers.addHelpers = function(ctor) {
  //TODO: not really a helper, thus, no this.jasmine
  for(var fn in jasmine.HtmlReporterHelpers) {
    ctor.prototype[fn] = jasmine.HtmlReporterHelpers[fn];
  }
};

jasmine.HtmlReporter = function(_doc, jasmine, yieldForRender) {
  var self = this;
  this.jasmine = jasmine || window.jasmine;
  var doc = _doc || window.document;

  var reporterView;

  var dom = {};

  // Jasmine Reporter Public Interface

  self.reportRunnerStarting = function(runner) {
    var specs = runner.specs() || [];

    if (specs.length == 0) {
      return;
    }

    createReporterDom(runner.env.versionString());
    doc.body.appendChild(dom.reporter);
    setExceptionHandling();

    reporterView = new self.jasmine.HtmlReporter.ReporterView(dom, self.jasmine);
    reporterView.addSpecs(specs, self.specFilter);
  };

  self.reportRunnerResults = function(runner) {
    reporterView && reporterView.complete();
  };

  self.reportSuiteResults = function(suite) {
    reporterView.suiteComplete(suite);
  };

  self.reportSpecStarting = function(spec) {
  };

  var lastYieldForRender = 0;
  var refreshInterval = 250;
  yieldForRender = yieldForRender || function(fn) {
    var now = Date.now();
    var delta = (now - lastYieldForRender);
    if (delta > refreshInterval) {
      lastYieldForRender = now;
      setTimeout(fn, 0);
    } else {
      fn();
    }
  }
  self.reportSpecResults = function(result) {
    yieldForRender(function() {reporterView.specComplete(result) });
  };

  self.log = function() {
    var console = self.jasmine.getGlobal().console;
    if (console && console.log) {
      if (console.log.apply) {
        console.log.apply(console, arguments);
      } else {
        console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
      }
    }
  };

  self.specFilter = function(spec) {
    if (!focusedSpecName()) {
      return true;
    }

    return spec.getFullName().indexOf(focusedSpecName()) === 0;
  };

  return self;

  function focusedSpecName() {
    var specName;

    (function memoizeFocusedSpec() {
      if (specName) {
        return;
      }

      var paramMap = [];
      var params = self.jasmine.HtmlReporter.parameters(doc);

      for (var i = 0; i < params.length; i++) {
        var p = params[i].split('=');
        paramMap[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
      }

      specName = paramMap.spec;
    })();

    return specName;
  }

  function createReporterDom(version) {
    dom.reporter = self.createDom('div', { id: 'HTMLReporter', className: 'jasmine_reporter' },
      dom.banner = self.createDom('div', { className: 'banner' },
        self.createDom('span', { className: 'title' }, "Jasmine "),
        self.createDom('span', { className: 'version' }, version)),

      dom.symbolSummary = self.createDom('ul', {className: 'symbolSummary'}),
      dom.alert = self.createDom('div', {className: 'alert'},
        self.createDom('span', { className: 'exceptions' },
          self.createDom('label', { className: 'label', 'for': 'no_try_catch' }, 'No try/catch'),
          self.createDom('input', { id: 'no_try_catch', type: 'checkbox' }))),
      dom.results = self.createDom('div', {className: 'results'},
        dom.summary = self.createDom('div', { className: 'summary' }),
        dom.details = self.createDom('div', { id: 'details' }))
    );
  }

  function noTryCatch() {
    return window.location.search.match(/catch=false/);
  }

  function searchWithCatch() {
    var params = jasmine.HtmlReporter.parameters(window.document);
    var removed = false;
    var i = 0;

    while (!removed && i < params.length) {
      if (params[i].match(/catch=/)) {
        params.splice(i, 1);
        removed = true;
      }
      i++;
    }
    if (self.jasmine.CATCH_EXCEPTIONS) {
      params.push("catch=false");
    }

    return params.join("&");
  }

  function setExceptionHandling() {
    var chxCatch = document.getElementById('no_try_catch');

    if (noTryCatch()) {
      chxCatch.setAttribute('checked', true);
      self.jasmine.CATCH_EXCEPTIONS = false;
    }
    chxCatch.onclick = function() {
      window.location.search = searchWithCatch();
    };
  }
};
jasmine.HtmlReporter.parameters = function(doc) {
  var paramStr = doc.location.search.substring(1);
  var params = [];

  if (paramStr.length > 0) {
    params = paramStr.split('&');
  }
  return params;
}
jasmine.HtmlReporter.sectionLink = function(sectionName, catchExceptions) {
  var link = '?';
  var params = [];

  if (sectionName) {
    params.push('spec=' + encodeURIComponent(sectionName));
  }
  if (!catchExceptions) {
    params.push("catch=false");
  }
  if (params.length > 0) {
    link += params.join("&");
  }

  return link;
};
jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter);
jasmine.HtmlReporter.ReporterView = function(dom, jasmine) {
  this.startedAt = new Date();
  this.runningSpecCount = 0;
  this.completeSpecCount = 0;
  this.passedCount = 0;
  this.failedCount = 0;
  this.skippedCount = 0;
  this.jasmine = jasmine || {};

  this.createResultsMenu = function() {
    this.resultsMenu = this.createDom('span', {className: 'resultsMenu bar'},
      this.summaryMenuItem = this.createDom('a', {className: 'summaryMenuItem', href: "#"}, '0 specs'),
      ' | ',
      this.detailsMenuItem = this.createDom('a', {className: 'detailsMenuItem', href: "#"}, '0 failing'));

    this.summaryMenuItem.onclick = function() {
      dom.reporter.className = dom.reporter.className.replace(/ showDetails/g, '');
    };

    this.detailsMenuItem.onclick = function() {
      showDetails();
    };
  };

  this.addSpecs = function(specs, specFilter) {
    this.totalSpecCount = specs.length;

    this.views = {
      specs: {},
      suites: {}
    };

    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      this.views.specs[spec.id] = new this.jasmine.HtmlReporter.SpecView(spec, dom, this.views, this.jasmine);
      if (specFilter(spec)) {
        this.runningSpecCount++;
      }
    }
  };

  this.specComplete = function(result) {
    this.completeSpecCount++;

    // if (isUndefined(this.views.specs[result.id])) {
      // this.views.specs[result.id] = new this.jasmine.HtmlReporter.SpecView(result, dom);
    // }

    var specView = this.views.specs[result.id];

    switch (specView.status()) {
      case 'passed':
        this.passedCount++;
        break;

      case 'failed':
        this.failedCount++;
        break;

      case 'disabled':
        this.skippedCount++;
        break;
    }

    specView.refresh();
    this.refresh();
  };

  this.suiteComplete = function(suite) {
    var suiteView = this.views.suites[suite.id];
    if (isUndefined(suiteView)) {
      return;
    }
    suiteView.refresh();
  };

  this.refresh = function() {

    if (isUndefined(this.resultsMenu)) {
      this.createResultsMenu();
    }

    // currently running UI
    if (isUndefined(this.runningAlert)) {
      this.runningAlert = this.createDom('a', { href: this.jasmine.HtmlReporter.sectionLink(null, this.jasmine.CATCH_EXCEPTIONS), className: "runningAlert bar" });
      dom.alert.appendChild(this.runningAlert);
    }
    this.runningAlert.innerHTML = "Running " + this.completeSpecCount + " of " + specPluralizedFor(this.totalSpecCount);

    // skipped specs UI
    if (isUndefined(this.skippedAlert)) {
      this.skippedAlert = this.createDom('a', { href: this.jasmine.HtmlReporter.sectionLink(null, this.jasmine.CATCH_EXCEPTIONS), className: "skippedAlert bar" });
    }

    this.skippedAlert.innerHTML = "Skipping " + this.skippedCount + " of " + specPluralizedFor(this.totalSpecCount) + " - run all";

    if (this.skippedCount === 1 && isDefined(dom.alert)) {
      dom.alert.appendChild(this.skippedAlert);
    }

    // passing specs UI
    if (isUndefined(this.passedAlert)) {
      this.passedAlert = this.createDom('span', { href: this.jasmine.HtmlReporter.sectionLink(null, this.jasmine.CATCH_EXCEPTIONS), className: "passingAlert bar" });
    }
    this.passedAlert.innerHTML = "Passing " + specPluralizedFor(this.passedCount);

    // failing specs UI
    if (isUndefined(this.failedAlert)) {
      this.failedAlert = this.createDom('span', {href: "?", className: "failingAlert bar"});
    }
    this.failedAlert.innerHTML = "Failing " + specPluralizedFor(this.failedCount);

    if (this.failedCount === 1 && isDefined(dom.alert)) {
      dom.alert.appendChild(this.failedAlert);
      dom.alert.appendChild(this.resultsMenu);
    }

    // summary info
    this.summaryMenuItem.innerHTML = "" + specPluralizedFor(this.runningSpecCount);
    this.detailsMenuItem.innerHTML = "" + this.failedCount + " failing";
  };

  this.complete = function() {
    dom.alert.removeChild(this.runningAlert);

    this.skippedAlert.innerHTML = "Ran " + this.runningSpecCount + " of " + specPluralizedFor(this.totalSpecCount) + " - run all";

    if (this.failedCount === 0) {
      dom.alert.appendChild(this.createDom('span', {className: 'passingAlert bar'}, "Passing " + specPluralizedFor(this.passedCount)));
    } else {
      showDetails();
    }

    dom.banner.appendChild(this.createDom('span', {className: 'duration'}, "finished in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + "s"));
  };

  return this;

  function showDetails() {
    if (dom.reporter.className.search(/showDetails/) === -1) {
      dom.reporter.className += " showDetails";
    }
  }

  function isUndefined(obj) {
    return typeof obj === 'undefined';
  }

  function isDefined(obj) {
    return !isUndefined(obj);
  }

  function specPluralizedFor(count) {
    var str = count + " spec";
    if (count > 1) {
      str += "s"
    }
    return str;
  }

};

jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.ReporterView);


jasmine.HtmlReporter.SpecView = function(spec, dom, views, jasmine) {
  this.spec = spec;
  this.dom = dom;
  this.views = views;
  this.jasmine = jasmine || {};

  this.symbol = this.createDom('li', { className: 'pending' });
  this.dom.symbolSummary.appendChild(this.symbol);

  this.summary = this.createDom('div', { className: 'specSummary' },
    this.createDom('a', {
      className: 'description',
      href: this.jasmine.HtmlReporter.sectionLink(this.spec.getFullName(), this.jasmine.CATCH_EXCEPTIONS),
      title: this.spec.getFullName()
    }, this.spec.description)
  );

  this.detail = this.createDom('div', { className: 'specDetail' },
      this.createDom('a', {
        className: 'description',
        href: '?spec=' + encodeURIComponent(this.spec.getFullName()),
        title: this.spec.getFullName()
      }, this.spec.getFullName())
  );
};

jasmine.HtmlReporter.SpecView.prototype.status = function() {
  return this.spec.status();
};

jasmine.HtmlReporter.SpecView.prototype.refresh = function() {
  this.symbol.className = this.status();

  switch (this.status()) {
    case 'disabled':
      break;
    case 'passed':
      this.appendSummaryToSuiteDiv();
      break;

    case 'failed':
      this.appendSummaryToSuiteDiv();
      this.appendFailureDetail();
      break;
  }
};

jasmine.HtmlReporter.SpecView.prototype.appendSummaryToSuiteDiv = function() {
  this.summary.className += ' ' + this.status();
  this.appendToSummary(this.spec, this.summary);
};

jasmine.HtmlReporter.SpecView.prototype.appendFailureDetail = function() {
  this.detail.className += ' ' + this.status();

  var resultItems = this.spec.failedExpectations;
  var messagesDiv = this.createDom('div', { className: 'messages' });

  for (var i = 0; i < resultItems.length; i++) {
    var result = resultItems[i];

    if (result.type == 'log') {
      messagesDiv.appendChild(this.createDom('div', {className: 'resultMessage log'}, result.toString()));
    } else if (result.type == 'expect' && !result.passed) {
      messagesDiv.appendChild(this.createDom('div', {className: 'resultMessage fail'}, result.message));

      if (result.trace.stack) {
        messagesDiv.appendChild(this.createDom('div', {className: 'stackTrace'}, result.trace.stack));
      }
    }
  }

  if (messagesDiv.childNodes.length > 0) {
    this.detail.appendChild(messagesDiv);
    this.dom.details.appendChild(this.detail);
  }
};

jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.SpecView);
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

