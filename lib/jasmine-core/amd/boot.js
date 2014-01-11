define([
  "amd/jasmine",
  "amd/env",
  "jasmineRequireHtml"
], function (jasmine, env, jasmineRequire) {
  "use strict";

  var boot = {
    /**
     * ## Reporters
     * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
     */
    htmlReporter: null,

    initializeHtmlReporter: function() {
      /**
       * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
       */
      jasmineRequire.html(jasmine);

      /**
       * ## Runner Parameters
       *
       * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
       */
      var queryString = new jasmine.QueryString({
        getWindowLocation: function() { return window.location; }
      });

      var catchingExceptions = queryString.getParam("catch");
      env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

      /**
       * ## Reporters
       * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x"s for specs, as well as all spec names and all failures (if any).
       */
      boot.htmlReporter = new jasmine.HtmlReporter({
        env: env,
        onRaiseExceptionsClick: function() { queryString.setParam("catch", !env.catchingExceptions()); },
        getContainer: function() { return document.body; },
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); },
        timer: new jasmine.Timer()
      });

      /**
       * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results from JavaScript.
       */
      env.addReporter(new jasmine.JsApiReporter({
        timer: new jasmine.Timer()
      }));
      env.addReporter(boot.htmlReporter);

      /**
       * Filter which specs will be run by matching the start of the full name against the `spec` query param.
       */
      var specFilter = new jasmine.HtmlSpecFilter({
        filterString: function() { return queryString.getParam("spec"); }
      });

      env.specFilter = function(spec) {
        return specFilter.matches(spec.getFullName());
      };

      /**
       * Setting up timing functions to be able to be overridden. Certain browsers (Safari, IE 8, phantomjs) require this hack.
       */
      window.setTimeout = window.setTimeout;
      window.setInterval = window.setInterval;
      window.clearTimeout = window.clearTimeout;
      window.clearInterval = window.clearInterval;

      /**
       * Finally, initialize the HTML reporter.
       */
      boot.htmlReporter.initialize();

      return boot.htmlReporter;
    },

    /**
     * Execute the Jasmine environment.
     */
    execute: function() {
      env.execute();
    }
  };

  return boot;
});
