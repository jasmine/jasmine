'use strict';

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
  const urls = new jasmine.HtmlReporterV2Urls();

  /**
   * ## Reporters
   * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
   */
  const htmlReporter = new jasmine.HtmlReporterV2({
    env,
    urls,
    getContainer() {
      return document.body;
    }
  });

  /**
   * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
   */
  env.addReporter(jsApiReporter);
  env.addReporter(htmlReporter);
  /**
   * Configures Jasmine based on the current set of query parameters. This
   * supports all parameters set by the HTML reporter as well as
   * spec=partialPath, which filters out specs whose paths don't contain the
   * parameter.
   */
  env.configure(urls.configFromCurrentUrl());

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
