/*
Copyright (c) 2008-2013 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
function getJasmineRequireObj() {
  if (typeof module !== "undefined" && module.exports) {
    return exports;
  } else {
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

getJasmineRequireObj().junit = function(jRequire, j$) {
  j$.JunitReporter = jRequire.JunitReporter(j$);
  j$.JunitResultsNode = jRequire.JunitResultsNode(j$);
};

getJasmineRequireObj().JunitReporter = function(j$) {

  function JunitReporter(options) {
    var output = '',
        topResultsNode = new j$.JunitResultsNode({}, "", null),
        currentParent = topResultsNode,
        path = options.path;

    this.jasmineStarted = function(options) {
      output += '<?xml version="1.0" encoding="UTF-8" ?>\n';
      output += '<testsuites>\n';
    };

    this.suiteStarted = function(result) {
      result.startTime = new Date();
      currentParent.addChild(result, "suite");
      currentParent = currentParent.last();
    };

    this.suiteDone = function(result) {
      result.duration = ( new Date() - result.startTime ) / 1000;

      if (currentParent == topResultsNode) {
        return;
      }
      currentParent = currentParent.parent;
    };

    this.specStarted = function(result) {
      result.startTime = new Date();
      currentParent.addChild(result, "spec");
    };

    this.specDone = function(result) {
      result.duration = ( new Date() - result.startTime ) / 1000;

      if (result.status == "failed" || result.status === "passed") {
        var parentPointer = currentParent;
        while (parentPointer.parent) {
          parentPointer[result.status]++;
          parentPointer = parentPointer.parent;
        }
      }
    };

    this.jasmineDone = function() {
      for (var i = 0; i < topResultsNode.children.length; i++) {
        output += topResultsNode.children[i].getXml(1);
      }
      output += '</testsuites>';

      this.writeToFile(path, output);
    };

    this.writeToFile = function(path, output) {
      function getQualifiedFilename(separator) {
        if (path && path.substr(-1) !== separator && filename.substr(0) !== separator) {
          path += separator;
        }
        return path + 'results.xml';
      }

      // From Larry Myers' Jasmine 1.3.x Junit Reporter
      // Rhino
      try {
        // turn filename into a qualified path
        if (path) {
          filename = getQualifiedFilename(java.lang.System.getProperty("file.separator"));
            // create parent dir and ancestors if necessary
            var file = java.io.File(filename);
            var parentDir = file.getParentFile();
            if (!parentDir.exists()) {
              parentDir.mkdirs();
            }
          }
        // finally write the file
        var out = new java.io.BufferedWriter(new java.io.FileWriter(filename));
        out.write(output);
        out.close();
        return;
      } catch (e) {}
      // PhantomJS, via a method injected by phantomjs-testrunner.js
      try {
        // turn filename into a qualified path
        filename = getQualifiedFilename(window.fs_path_separator);
        __phantom_writeFile(filename, output);
        return;
      } catch (f) {}
      // Node.js
      try {
        var fs = require("fs");
        var nodejs_path = require("path");
        var fd = fs.openSync(nodejs_path.join(path, filename), "w");
        fs.writeSync(fd, output, 0);
        fs.closeSync(fd);
        return;
      } catch (g) {}
    }

    return this;
  };

  return JunitReporter;
};

getJasmineRequireObj().JunitResultsNode = function() {
  function JunitResultsNode(result, type, parent) {
    this.result = result;
    this.passed = 0;
    this.failed = 0;

    this.type = type;
    this.parent = parent;

    this.children = [];

    this.addChild = function(result, type) {
      this.children.push(new JunitResultsNode(result, type, this));
    };

    this.last = function() {
      return this.children[this.children.length - 1];
    };

    this.getXml = function(depth) {
      var xml = "";

      xml += this.getOpeningXml(depth);

      for (var i = 0; i < this.children.length; i++) {
        xml += this.children[i].getXml(depth + 1);
      }
      xml += this.getClosingXml(depth);

      return xml;
    };

    this.getOpeningXml = function(depth) {
      var xml = "";
      if (this.type == 'suite') {
        xml += this.getSuiteOpeningXml(depth);
      } else if (this.type == 'spec') {
        xml += this.getSpecXml(depth);
      }

      return xml;
    };

    this.getClosingXml = function(depth) {
      var xml = "";
      if (this.type == 'suite') {
        xml += this.getSuiteClosingXml(depth);
      }
      return xml;
    };

    this.getSuiteOpeningXml = function(depth) {
      var xml = indent("<testsuite ", depth);

      xml += attributesToString({
        name: this.result.description,
        duration: this.result.duration,
        timestamp: this.result.startTime,
        tests: this.failed + this.passed,
        failures: this.failed
      });
      xml += " />\n";

      return xml;
    };

    this.getSuiteClosingXml = function(depth) {
      return indent("</testsuite>\n", depth);
    };

    this.getSpecXml = function(depth) {
      var xml = indent("<testcase ", depth);

      xml += attributesToString({
        classname: this.result.description,
        duration: this.result.duration,
        result: this.result.status
      });

      if (this.result.status === "failed") {
        xml += ">\n";
        xml += this.getFailureXml(depth + 1);
        xml += indent("</testcase>\n", depth);
      } else {
        xml += " />\n";
      }
      return xml;
    };

    this.getFailureXml = function(depth) {
      var xml = "";

      for (var i = 0; i < this.result.failedExpectations.length; i++) {
        var fe = this.result.failedExpectations[i];

        xml += indent("<failure>\n", depth);
        xml += formatStack(fe.stack, depth + 1);
        xml += indent("</failure>\n", depth);
        return xml;
      }
    };

    return this;

    function indent(text, depth) {
      var tab = "";
      for (var i = 0; i < depth; i++) {
        tab += "  ";
      }
      return tab + text;
    }

    // Stripping out jasmine error lines from stacktrace
    function formatStack(stack, depth) {
      var lines = (stack || '').split('\n'),
          validLines = [];

      for (var i = 0; i < lines.length; i++) {
        if (!new RegExp(/\/jasmine\//).test(lines[i])) {
          validLines.push(indent(lines[i], depth));
        }
      }
      return validLines.join('\n') + '\n';
    }

    function escapeInvalidXmlChars(str) {
      if (typeof str === "string") {
        return str.replace(/\&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/\>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&apos;");
      } else {
        return str;
      }
    }

    function attributesToString(attrs) {
      var res = [];

      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          res.push(key + '="' + escapeInvalidXmlChars(attrs[key]) + '"');
        }
      }
      return res.join(' ');
    }
  }

  return JunitResultsNode;
};
