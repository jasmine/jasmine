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
   * Configures Jasmine based on the current set of query parameters. This
   * supports all parameters set by the HTML reporter as well as
   * spec=partialPath, which filters out specs whose paths don't contain the
   * parameter.
   */
  env.configure(urls.configFromCurrentUrl());

  const currentWindowOnload = window.onload;
  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }

    // The HTML reporter needs to be set up here so it can access the DOM. Other
    // reporters can be added at any time before env.execute() is called.
    const htmlReporter = new jasmine.HtmlReporterV2({ env, urls });
    env.addReporter(htmlReporter);
    env.execute();
  };
})();
