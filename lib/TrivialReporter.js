jasmine.TrivialReporter = function() {
};

jasmine.TrivialReporter.prototype.createDom = function(type, attrs, childrenVarArgs) {
  var el = document.createElement(type);

  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];

    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }

  for (var attr in attrs) {
    if (attr == 'className') {
      el.setAttribute('class', attrs[attr]);
    } else {
      el[attr] = attrs[attr];
    }
  }

  return el;
};

jasmine.TrivialReporter.prototype.reportRunnerResults = function(runner) {
};

jasmine.TrivialReporter.prototype.reportSuiteResults = function(suite) {
};

jasmine.TrivialReporter.prototype.reportSpecResults = function(spec) {
  var results = spec.getResults();
  var status = results.passed() ? 'passed' : 'failed';
  if (results.skipped) {
    status = 'skipped';
  }
  var specDiv = this.createDom('div', { className: 'spec '  + status },
      this.createDom('a', { className: 'runSpec', href: '?spec=' + encodeURIComponent(spec.getFullName()) }, "run"),
      spec.getFullName());

  var resultItems = results.getItems();
  for (var i = 0; i < resultItems.length; i++) {
    var result = resultItems[i];
    if (!result.passed) {
      var resultMessageDiv = this.createDom('div', {className: 'resultMessage fail'});
      resultMessageDiv.innerHTML = result.message; // todo: lame; mend
      specDiv.appendChild(resultMessageDiv);
      specDiv.appendChild(this.createDom('div', {className: 'stackTrace'}, result.trace.stack));
    }
  }

  document.body.appendChild(specDiv);
};

jasmine.TrivialReporter.prototype.log = function() {
  console.log.apply(console, arguments);
};

jasmine.TrivialReporter.prototype.getLocation = function() {
  return document.location;
};

jasmine.TrivialReporter.prototype.specFilter = function(spec) {
  var paramMap = {};
  var params = this.getLocation().search.substring(1).split('&');
  for (var i = 0; i < params.length; i++) {
    var p = params[i].split('=');
    paramMap[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
  }

  if (!paramMap["spec"]) return true;
  return spec.getFullName().indexOf(paramMap["spec"]) > -1;
};

//protect against console.log incidents
if (!("console" in window) || !("firebug" in console)) {
  var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
  window.console = {};
  for (var i = 0, len = names.length; i < len; ++i) {
    window.console[names[i]] = function() {
    };
  }
}
