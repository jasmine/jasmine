/*
Copyright (c) 2008-2019 Pivotal Labs
Copyright (c) 2008-2026 The Jasmine developers

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
