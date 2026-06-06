'use strict';

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
