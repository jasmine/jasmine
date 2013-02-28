jasmine.HtmlReporter = function(options) {
  var env = options.env || {},
    getContainer = options.getContainer,
    now = options.now || function() { return new Date().getTime();},
    createElement = options.createElement,
    createTextNode = options.createTextNode,
    results = [],
    startTime,
    specsExecuted = 0,
    failureCount = 0,
    htmlReporterMain,
    symbols;

  this.initialize = function() {
    htmlReporterMain = createDom("div", {className: "html-reporter"},
      createDom("div", {className: "banner"},
        createDom("span", {className: "title"}, "Jasmine"),
        createDom("span", {className: "version"}, env.versionString())
      ),
      createDom("ul", {className: "symbol-summary"}),
      createDom("div", {className: "alert"}),
      createDom("div", {className: "results"},
        createDom("div", {className: "failures"})
      )
    );
    getContainer().appendChild(htmlReporterMain);

    symbols = find(".symbol-summary")[0];
  };

  var totalSpecsDefined;
  this.jasmineStarted = function(options) {
    totalSpecsDefined = options.totalSpecsDefined || 0;
    startTime = now();
  };

  var summary = createDom("div", {className: "summary"});

  var topResults = new jasmine.ResultsNode({}, "", null),
    currentParent = topResults;

  this.suiteStarted = function(result) {
    currentParent.addChild(result, "suite");
    currentParent = currentParent.last();
  };

  this.suiteDone = function(result) {
    if (currentParent == topResults) {
      return;
    }

    currentParent = currentParent.parent;
  };

  this.specStarted = function(result) {
    currentParent.addChild(result, "spec");
  };

  var failures = [];
  this.specDone = function(result) {
    if (result.status != "disabled") {
      specsExecuted++;
    }

    symbols.appendChild(createDom("li", {
        className: result.status,
        id: "spec_" + result.id}
    ));

    if (result.status == "failed") {
      failureCount++;

      var failure =
        createDom("div", {className: "spec-detail failed"},
          createDom("a", {className: "description", title: result.fullName, href: specHref(result)}, result.fullName),
          createDom("div", {className: "messages"})
        );
      var messages = failure.childNodes[1];

      for (var i = 0; i < result.failedExpectations.length; i++) {
        var expectation = result.failedExpectations[i];
        messages.appendChild(createDom("div", {className: "result-message"}, expectation.message));
        messages.appendChild(createDom("div", {className: "stack-trace"}, expectation.stack));
      }

      failures.push(failure);
    }
  };

  this.jasmineDone = function() {
    var elapsed = now() - startTime;

    var banner = find(".banner")[0];
    banner.appendChild(createDom("span", {className: "duration"}, "finished in " + elapsed / 1000 + "s"));

    var alert = find(".alert")[0];

    alert.appendChild(createDom("span", { className: "exceptions" },
      createDom("label", { className: "label", 'for': "raise-exceptions" }, "raise exceptions"),
      createDom("input", {
        className: "raise",
        id: "raise-exceptions",
        type: "checkbox"
      })
    ));
    var checkbox = find("input")[0];

    checkbox.checked = !env.catchingExceptions();
    checkbox.onclick = options.onRaiseExceptionsClick;

    if (specsExecuted < totalSpecsDefined) {
      var skippedMessage = "Ran " + specsExecuted + " of " + totalSpecsDefined + " specs - run all";
      alert.appendChild(
        createDom("span", {className: "bar skipped"},
          createDom("a", {href: "?", title: "Run all specs"}, skippedMessage)
        )
      );
    }
    var statusBarMessage = "" + pluralize("spec", specsExecuted) + ", " + pluralize("failure", failureCount),
      statusBarClassName = "bar " + ((failureCount > 0) ? "failed" : "passed");
    alert.appendChild(createDom("span", {className: statusBarClassName}, statusBarMessage));

    var results = find(".results")[0];
    results.appendChild(summary);

    summaryList(topResults, summary);

    function summaryList(resultsTree, domParent) {
      var specListNode;
      for (var i = 0; i < resultsTree.children.length; i++) {
        var resultNode = resultsTree.children[i];
        if (resultNode.type == "suite") {
          var suiteListNode = createDom("ul", {className: "suite", id: "suite-" + resultNode.result.id},
            createDom("li", {className: "suite-detail"},
              createDom("a", {href: specHref(resultNode.result)}, resultNode.result.description)
            )
          );

          summaryList(resultNode, suiteListNode);
          domParent.appendChild(suiteListNode);
        }
        if (resultNode.type == "spec") {
          if (domParent.getAttribute("class") != "specs") {
            specListNode = createDom("ul", {className: "specs"});
            domParent.appendChild(specListNode);
          }
          specListNode.appendChild(
            createDom("li", {
                className: resultNode.result.status,
                id: "spec-" + resultNode.result.id
              },
              createDom("a", {href: specHref(resultNode.result)}, resultNode.result.description)
            )
          );
        }
      }
    }

    if (failures.length) {
      alert.appendChild(
        createDom('span', {className: "menu bar spec-list"},
          createDom("span", {}, "Spec List | "),
          createDom('a', {className: "failures-menu", href: "#"}, "Failures")));
      alert.appendChild(
        createDom('span', {className: "menu bar failure-list"},
          createDom('a', {className: "spec-list-menu", href: "#"}, "Spec List"),
          createDom("span", {}, " | Failures ")));

      find(".failures-menu")[0].onclick = function() {
        setMenuModeTo('failure-list');
      };
      find(".spec-list-menu")[0].onclick = function() {
        setMenuModeTo('spec-list');
      };

      setMenuModeTo('failure-list');

      var failureNode = find(".failures")[0];
      for (var i = 0; i < failures.length; i++) {
        failureNode.appendChild(failures[i]);
      }
    }
  };

  return this;

  function find(selector) {
    if (selector.match(/^\./)) {
      var className = selector.substring(1);
      return getContainer().getElementsByClassName(className);
    } else {
      return getContainer().getElementsByTagName(selector);
    }
  }

  function createDom(type, attrs, childrenVarArgs) {
    var el = createElement(type);

    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];

      if (typeof child === 'string') {
        el.appendChild(createTextNode(child));
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
  }

  function pluralize(singular, count) {
    var word = (count == 1 ? singular : singular + "s");

    return "" + count + " " + word;
  }

  function specHref(result) {
    return "?spec=" + encodeURIComponent(result.fullName);
  }

  function setMenuModeTo(mode) {
    htmlReporterMain.setAttribute("class", "html-reporter " + mode);
  }
};