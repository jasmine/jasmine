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
  console.log(runner);
};

jasmine.TrivialReporter.prototype.reportSuiteResults = function(suite) {
  console.log(suite);
};

jasmine.TrivialReporter.prototype.reportSpecResults = function(spec) {
  var specDiv = this.createDom('div', {
    className: spec.getResults().passed ? 'spec passed' : 'spec failed'
  }, spec.getFullName());

  var resultItems = spec.getResults().getItems();
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

//protect against console.log incidents
if (!("console" in window) || !("firebug" in console)) {
  var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
  window.console = {};
  for (var i = 0, len = names.length; i < len; ++i) {
    window.console[names[i]] = function() {
    };
  }
}
