/**
 This file finishes 'booting' Jasmine, performing all of the necessary
 initialization before executing the loaded environment and all of a project's
 specs. This file should be loaded after `boot0.js` but before any project
 source files or spec files are loaded. Thus this file can also be used to
 customize Jasmine for a project.

 If a project is using Jasmine via the standalone distribution, this file can
 be customized directly. If you only wish to configure the Jasmine env, you
 can load another file that calls `jasmine.getEnv().configure({...})`
 after `boot0.js` is loaded and before this file is loaded.
 */

(function() {
  const env = jasmine.getEnv();

  /**
   * ## Runner Parameters
   *
   * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
   */

  const queryString = new jasmine.QueryString({
    getWindowLocation: function() {
      return window.location;
    }
  });

  const filterSpecs = !!queryString.getParam('spec');

  const config = {
    stopOnSpecFailure: queryString.getParam('stopOnSpecFailure'),
    stopSpecOnExpectationFailure: queryString.getParam(
      'stopSpecOnExpectationFailure'
    ),
    hideDisabled: queryString.getParam('hideDisabled')
  };

  const random = queryString.getParam('random');

  if (random !== undefined && random !== '') {
    config.random = random;
  }

  const seed = queryString.getParam('seed');
  if (seed) {
    config.seed = seed;
  }

  /**
   * ## Reporters
   * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
   */
  const htmlReporter = new jasmine.HtmlReporter({
    env: env,
    navigateWithNewParam: function(key, value) {
      return queryString.navigateWithNewParam(key, value);
    },
    addToExistingQueryString: function(key, value) {
      return queryString.fullStringWithNewParam(key, value);
    },
    getContainer: function() {
      return document.body;
    },
    createElement: function() {
      return document.createElement.apply(document, arguments);
    },
    createTextNode: function() {
      return document.createTextNode.apply(document, arguments);
    },
    timer: new jasmine.Timer(),
    filterSpecs: filterSpecs
  });

  /**
   * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
   */
  env.addReporter(jsApiReporter);
  env.addReporter(htmlReporter);

  /**
   * Filter which specs will be run by matching the start of the full name against the `spec` query param.
   */
  const specFilter = new jasmine.HtmlSpecFilter({
    filterString: function() {
      return queryString.getParam('spec');
    }
  });

  config.specFilter = function(spec) {
    return specFilter.matches(spec.getFullName());
  };

  env.configure(config);

  /**
   * ## Execution
   *
   * Replace the browser window's `onload`, ensure it's called, and then run all of the loaded specs. This includes initializing the `HtmlReporter` instance and then executing the loaded Jasmine environment. All of this will happen after all of the specs are loaded.
   */
  const currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    htmlReporter.initialize();
    env.execute();
  };
})();
